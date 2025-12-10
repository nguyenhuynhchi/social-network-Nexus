package com.chi_001.profile.service;

import com.chi_001.profile.dto.request.ProfileUpdateRequest;
import com.chi_001.profile.dto.request.SearchUserRequest;
import com.chi_001.profile.dto.response.UploadFileResponse;
import com.chi_001.profile.exception.AppException;
import com.chi_001.profile.exception.ErrorCode;
import com.chi_001.profile.repository.httpclient.CloudinaryClient;
import org.springframework.beans.factory.annotation.Value;
import lombok.experimental.NonFinal;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.chi_001.profile.dto.request.ProfileCreationRequest;
import com.chi_001.profile.dto.response.UserProfileResponse;
import com.chi_001.profile.entity.UserProfile;
import com.chi_001.profile.mapper.UserProfileMapper;
import com.chi_001.profile.repository.UserProfileRepository;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

import java.util.List;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class UserProfileService {

    UserProfileRepository userProfileRepository;
    UserProfileMapper userProfileMapper;
    CloudinaryClient cloudinaryClient;

    @NonFinal
    @Value("${file.max-size-mb}")
    long fileSizeLimitMB;

    public UserProfileResponse createProfile(ProfileCreationRequest request) {
        UserProfile userProfile = userProfileMapper.toUserProfile(request);
        userProfile = userProfileRepository.save(userProfile);

        return userProfileMapper.toUserProfileResponse(userProfile);
    }

    public String setAvatarUrl(MultipartFile file) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        UserProfile userProfile = userProfileRepository.findByUserId(authentication.getName())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        String avatarUrl = null;

        try {
            if (file != null && !file.isEmpty()) {
                long sizeInBytes = file.getSize();
                double sizeInMB = (sizeInBytes / 1024.0) / 1024.0; // bytes to MB
                log.info("File size: {} MB", sizeInMB);

                if (sizeInMB > fileSizeLimitMB) {
                    throw new AppException(ErrorCode.FILE_SIZE_EXCEEDED);
                }

                UploadFileResponse uploadFileResponse = cloudinaryClient.uploadFile(file).getResult();
                avatarUrl = uploadFileResponse.getFileUrl();

                log.info("File uploaded successfully: {}", avatarUrl);
            } else {
                log.info("File is empty, skipping upload.");
            }
        } catch (Exception e) {
            log.error("Error uploading file: {}", e.getMessage());
        }

        userProfile.setAvatarUrl(avatarUrl);
        userProfileRepository.save(userProfile);
        return avatarUrl;
    }

    public UserProfileResponse getByUserId(String userId) {
        UserProfile userProfile =
            userProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        return userProfileMapper.toUserProfileResponse(userProfile);
    }

    public UserProfileResponse getProfile(String id) {
        UserProfile userProfile =
            userProfileRepository.findById(id).orElseThrow(
                () -> new AppException(ErrorCode.USER_NOT_EXISTED));

        return userProfileMapper.toUserProfileResponse(userProfile);
    }

    @PreAuthorize("hasRole('ADMIN')")
    public List<UserProfileResponse> getAllProfiles() {
        var profiles = userProfileRepository.findAll();

        return profiles.stream().map(userProfileMapper::toUserProfileResponse).toList();
    }

    public UserProfileResponse getMyProfile() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        String userId = authentication.getName();

        var profile = userProfileRepository.findByUserId(userId)
            .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        return userProfileMapper.toUserProfileResponse(profile);
    }

    public UserProfileResponse updateProfile(ProfileUpdateRequest request) {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        String userId = authentication.getName();

        var profile = userProfileRepository.findByUserId(userId)
            .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        userProfileMapper.updateUserProfile(profile, request);

        return userProfileMapper.toUserProfileResponse(userProfileRepository.save(profile));
    }

    public List<UserProfileResponse> search(SearchUserRequest request) {
        var userId = SecurityContextHolder.getContext().getAuthentication().getName();
        List<UserProfile> userProfiles = userProfileRepository.findAllByFullnameLike(request.getKeyword());
        return userProfiles.stream()
            .filter(userProfile -> !userId.equals(userProfile.getUserId()))
            .map(userProfileMapper::toUserProfileResponse)
            .toList();
    }
}
