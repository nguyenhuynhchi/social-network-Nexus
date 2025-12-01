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

                UploadFileResponse uploadFileResponse = cloudinaryClient.uploadFile(file).getResult();
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
<<<<<<< HEAD
            log.info(" - Username: {}\t - Fullname: {}", userProfile.getUsername(), userProfile.getFullname());
=======
            log.info("Username: {}", userProfile.getUsername());
>>>>>>> 51aa692d1819e013c437e667ebd6b94ea967037a
        } catch (Exception e) {
            log.error("Error while getting user profile", e);
        }
        Sort sort = Sort.by("createdDate").descending();

        Pageable pageable = PageRequest.of(page - 1, size, sort);
        var pageData = postRepository.findAllByUserId(userId, pageable);

        String username = userProfile != null ? userProfile.getUsername() : null;
<<<<<<< HEAD
        String fullname = userProfile != null ? userProfile.getFullname() : null;
        String avatar = userProfile != null ? userProfile.getAvatarUrl() : null;
=======
        log.info("Username_2: {}", username);
>>>>>>> 51aa692d1819e013c437e667ebd6b94ea967037a
        var postList = pageData.getContent().stream().map(post -> {
            var postResponse = postMapper.toPostResponse(post);
            postResponse.setCreated(dateTimeFormatter.format(post.getCreatedDate()));
            postResponse.setUsername(username);
<<<<<<< HEAD
            postResponse.setFullname(fullname);
            postResponse.setAvatarUrl(avatar);
=======
>>>>>>> 51aa692d1819e013c437e667ebd6b94ea967037a
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
}
