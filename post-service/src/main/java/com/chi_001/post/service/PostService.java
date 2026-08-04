package com.chi_001.post.service;

import com.chi_001.post.dto.PageResponse;
import com.chi_001.post.dto.request.PostRequest;
import com.chi_001.post.dto.response.PostResponse;
import com.chi_001.post.dto.response.ReactionUserResponse;
import com.chi_001.post.dto.response.UploadFileResponse;
import com.chi_001.post.dto.response.UserProfileResponse;
import com.chi_001.post.entity.Post;
import com.chi_001.post.entity.PostReaction;
import com.chi_001.post.enums.ReactionType;
import com.chi_001.post.exception.AppException;
import com.chi_001.post.exception.ErrorCode;
import com.chi_001.post.mapper.PostMapper;
import com.chi_001.post.repository.PostReactionRepository;
import com.chi_001.post.repository.PostRepository;
import com.chi_001.post.repository.httpclient.CloudinaryClient;
import com.chi_001.post.repository.httpclient.ProfileClient;
import java.util.ArrayList;
import java.util.Collections;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.NonFinal;
import org.springframework.beans.factory.annotation.Value;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PostService {

    DateTimeFormatter dateTimeFormatter;
    PostRepository postRepository;
    PostMapper postMapper;
    ProfileClient profileClient;
    CloudinaryClient cloudinaryClient;
    PostReactionRepository postReactionRepository;

    @NonFinal
    @Value("${file.max-size-mb}")
    long fileSizeLimitMB;

    public PostResponse createPost(PostRequest request, MultipartFile file) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        String fileUrl = null;

        try {
            if (file != null && !file.isEmpty()) {
                long sizeInBytes = file.getSize();
                double sizeInMB = (sizeInBytes / 1024.0) / 1024.0; // bytes to MB
                log.info("File size: {} MB", sizeInMB);

                if (sizeInMB > fileSizeLimitMB) {
                    throw new AppException(ErrorCode.FILE_LIMIT_EXCEEDED);
                }

                UploadFileResponse uploadFileResponse = cloudinaryClient.uploadFile(file)
                    .getResult();
                fileUrl = uploadFileResponse.getFileUrl();

                log.info("File uploaded successfully: {}", fileUrl);
            } else {
                log.info("File is empty, skipping upload.");
            }
        } catch (Exception e) {
            log.error("Error uploading file: {}", e.getMessage());
        }

        Post post = Post.builder()
            .content(request.getContent())
            .fileUrl(fileUrl)
            .userId(authentication.getName())
            .reactionCounts(
                Map.of(
                    ReactionType.LIKE, 0L,
                    ReactionType.HAHA, 0L,
                    ReactionType.WOW, 0L,
                    ReactionType.SAD, 0L,
                    ReactionType.ANGRY, 0L
                )
            )
            .createdDate(Instant.now())
            .modifiedDate(Instant.now())
            .build();

        post = postRepository.save(post);
        return postMapper.toPostResponse(post);
    }

    public PostResponse handlePostReaction(String postId, ReactionType newType) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userId = authentication.getName();

        Post post = postRepository.findById(postId)
            .orElseThrow(() -> new AppException(ErrorCode.POST_NOT_FOUND));

        if (post.getReactionCounts() == null) {
            // Khởi tạo Map với giá trị mặc định (0L) cho tất cả ReactionType
            post.setReactionCounts(
                new EnumMap<>(ReactionType.class) // Sử dụng EnumMap để tối ưu hóa hiệu năng
            );
            // Khởi tạo tất cả các loại Reaction về 0 (tuỳ chọn)
            for (ReactionType type : ReactionType.values()) {
                post.getReactionCounts().put(type, 0L);
            }
        }

        // 1. Kiểm tra Reaction hiện tại của người dùng
        Optional<PostReaction> existingReactionOpt = postReactionRepository.findByPostIdAndUserId(postId, userId);

        if (existingReactionOpt.isEmpty()) {
            // 2. Chưa có reaction → Tạo mới
            PostReaction newReaction = PostReaction.builder()
                .postId(postId)
                .userId(userId)
                .type(newType)
                .createdDate(Instant.now())
                .build();
            postReactionRepository.save(newReaction);

            // Cập nhật reactionCounts
            post.getReactionCounts().merge(newType, 1L, Long::sum);

        } else {
            // 3. Đã có reaction
            PostReaction existingReaction = existingReactionOpt.get();
            ReactionType oldType = existingReaction.getType();

            if (newType.equals(oldType)) {
                // 3a. Reaction cũ == Reaction mới → Xóa reaction (bỏ thả cảm xúc)
                postReactionRepository.delete(existingReaction);

                // Giảm reactionCounts cũ
                post.getReactionCounts().merge(oldType, -1L, Long::sum);

            } else {
                // 3b. Reaction cũ != Reaction mới → Cập nhật reaction
                existingReaction.setType(newType);
                existingReaction.setCreatedDate(Instant.now()); // Cập nhật thời gian
                postReactionRepository.save(existingReaction);

                // Giảm reactionCounts cũ và Tăng reactionCounts mới
                post.getReactionCounts().merge(oldType, -1L, Long::sum);
                post.getReactionCounts().merge(newType, 1L, Long::sum);
            }
        }

        // Đảm bảo không có count âm
        post.getReactionCounts().replaceAll(
            (type, count) -> Math.max(0L, count)
        );

        post.setModifiedDate(Instant.now());
        post = postRepository.save(post);

        return postMapper.toPostResponse(post);
    }

    public PageResponse<PostResponse> getMyPosts(int page, int size) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userId = authentication.getName();

        UserProfileResponse userProfile = null;

        try {
            userProfile = profileClient.getProfile(userId).getResult();
            log.info(" - Username: {}\t - Fullname: {}", userProfile.getUsername(),
                userProfile.getFullname());
        } catch (Exception e) {
            log.error("Error while getting user profile", e);
        }
        Sort sort = Sort.by("createdDate").descending();

        Pageable pageable = PageRequest.of(page - 1, size, sort);
        var pageData = postRepository.findAllByUserId(userId, pageable);

        String username = userProfile != null ? userProfile.getUsername() : null;
        String fullname = userProfile != null ? userProfile.getFullname() : null;
        String avatar = userProfile != null ? userProfile.getAvatarUrl() : null;
        var postList = pageData.getContent().stream().map(post -> {
            var postResponse = postMapper.toPostResponse(post);
            postResponse.setCreated(dateTimeFormatter.format(post.getCreatedDate()));
            postResponse.setUsername(username);
            postResponse.setFullname(fullname);
            postResponse.setAvatarUrl(avatar);
            return postResponse;
        }).toList();

        return PageResponse.<PostResponse>builder()
            .currentPage(page)
            .pageSize(pageData.getSize())
            .totalPages(pageData.getTotalPages())
            .totalElements(pageData.getTotalElements())
            .data(postList)
            .build();
    }

    public PageResponse<PostResponse> getPostOfOne(String userId, int page, int size) {

        UserProfileResponse userProfile = null;

        try {
            userProfile = profileClient.getProfile(userId).getResult();
        } catch (Exception e) {
            log.error("Error while getting user profile", e);
        }
        Sort sort = Sort.by("createdDate").descending();

        Pageable pageable = PageRequest.of(page - 1, size, sort);
        var pageData = postRepository.findAllByUserId(userId, pageable);

        String username = userProfile != null ? userProfile.getUsername() : null;
        String fullname = userProfile != null ? userProfile.getFullname() : null;
        String avatar = userProfile != null ? userProfile.getAvatarUrl() : null;
        var postList = pageData.getContent().stream().map(post -> {
            var postResponse = postMapper.toPostResponse(post);
            postResponse.setCreated(dateTimeFormatter.format(post.getCreatedDate()));
            postResponse.setUsername(username);
            postResponse.setFullname(fullname);
            postResponse.setAvatarUrl(avatar);
            return postResponse;
        }).toList();

        return PageResponse.<PostResponse>builder()
            .currentPage(page)
            .pageSize(pageData.getSize())
            .totalPages(pageData.getTotalPages())
            .totalElements(pageData.getTotalElements())
            .data(postList)
            .build();
    }

    public PageResponse<PostResponse> getPostsOfFriends(int page, int size) {

        // 1. Lấy userId hiện tại
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUserId = authentication.getName();

        // 2. Gọi profile-service lấy danh sách bạn bè
        List<UserProfileResponse> friends;

        try {
            friends = profileClient.getFriendList().getResult();
        } catch (Exception e) {
            log.error("Error while getting friend list", e);
            friends = Collections.emptyList();
        }

        // 3. Lấy danh sách userId của bạn bè
        List<String> friendUserIds = friends.stream()
            .map(UserProfileResponse::getUserId)
            .toList();

        // Nếu không có bạn bè → trả về page rỗng
        if (friendUserIds.isEmpty()) {
            return PageResponse.<PostResponse>builder()
                .currentPage(page)
                .pageSize(size)
                .totalPages(0)
                .totalElements(0)
                .data(Collections.emptyList())
                .build();
        }

        // 4. Sort + Pageable
        Sort sort = Sort.by("createdDate").descending();
        Pageable pageable = PageRequest.of(page - 1, size, sort);

        // 5. Query DB lấy bài viết của bạn bè
        var pageData = postRepository.findAllByUserIdIn(friendUserIds, pageable);

        // 6. Map profile theo userId để map nhanh hơn
        Map<String, UserProfileResponse> profileMap = friends.stream()
            .collect(Collectors.toMap(UserProfileResponse::getUserId, f -> f));

        // 7. Map sang PostResponse
        var postList = pageData.getContent().stream().map(post -> {
            var postResponse = postMapper.toPostResponse(post);
            postResponse.setCreated(dateTimeFormatter.format(post.getCreatedDate()));

            UserProfileResponse profile = profileMap.get(post.getUserId());
            if (profile != null) {
                postResponse.setUsername(profile.getUsername());
                postResponse.setFullname(profile.getFullname());
                postResponse.setAvatarUrl(profile.getAvatarUrl());
            }

            return postResponse;
        }).toList();

        // 8. Build PageResponse
        return PageResponse.<PostResponse>builder()
            .currentPage(page)
            .pageSize(pageData.getSize())
            .totalPages(pageData.getTotalPages())
            .totalElements(pageData.getTotalElements())
            .data(postList)
            .build();
    }


    public List<ReactionUserResponse> getPostReactions(String postId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUserId = authentication.getName();

        List<PostReaction> reactions = postReactionRepository.findAllByPostIdOrderByCreatedDateDesc(postId);

        if (reactions.isEmpty()) {
            return Collections.emptyList();
        }

        // 2. Lấy danh sách userId duy nhất
        Set<String> userIdsSet = reactions.stream()
            .map(PostReaction::getUserId)
            .collect(Collectors.toSet());

        List<String> userIds = new ArrayList<>(userIdsSet);

        // 3. Gọi ProfileClient để lấy thông tin UserProfile
        List<UserProfileResponse> profiles;
        try {
            // Giả sử ProfileClient có một endpoint để lấy danh sách profiles theo danh sách userIds
            profiles = new ArrayList<>(profileClient.getProfilesByUserIds(userIds).getResult());
        } catch (Exception e) {
            log.error("Error while getting user profiles for reactions", e);
            profiles = Collections.emptyList();
        }

        // 4. Map Profile theo userId để lookup nhanh
        Map<String, UserProfileResponse> profileMap = profiles.stream()
            .collect(Collectors.toMap(UserProfileResponse::getUserId, p -> p));



        // 5. Map sang ReactionUserResponse
        return reactions.stream()
            .map(reaction -> {
                UserProfileResponse profile = profileMap.get(reaction.getUserId());
                // Trả về thông tin người dùng nếu có, nếu không thì dùng placeholder/null
                String username = profile != null ? profile.getUsername() : "Unknown";
                String fullname = profile != null ? profile.getFullname() : "Unknown User";
                String avatarUrl = profile != null ? profile.getAvatarUrl() : null;

                boolean isCurrentUser = currentUserId.equals(reaction.getUserId());

                return ReactionUserResponse.builder()
                    .type(reaction.getType())
                    .userId(reaction.getUserId())
                    .username(username)
                    .fullname(fullname)
                    .avatarUrl(avatarUrl)
                    .me(isCurrentUser)
                    .reactedAt(reaction.getCreatedDate())
                    .build();
            })
            .toList();
    }
}
