package com.chi_001.post.service;

import com.chi_001.post.dto.PageResponse;
import com.chi_001.post.dto.request.PostRequest;
import com.chi_001.post.dto.response.PostResponse;
import com.chi_001.post.dto.response.UploadFileResponse;
import com.chi_001.post.dto.response.UserProfileResponse;
import com.chi_001.post.entity.Post;
import com.chi_001.post.exception.AppException;
import com.chi_001.post.exception.ErrorCode;
import com.chi_001.post.mapper.PostMapper;
import com.chi_001.post.repository.PostRepository;
import com.chi_001.post.repository.httpclient.CloudinaryClient;
import com.chi_001.post.repository.httpclient.ProfileClient;
import java.util.Collections;
import java.util.List;
import java.util.Map;
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
            .createdDate(Instant.now())
            .modifiedDate(Instant.now())
            .build();

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
}
