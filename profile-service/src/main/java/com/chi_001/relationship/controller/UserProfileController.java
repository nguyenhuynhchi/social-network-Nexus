package com.chi_001.relationship.controller;

<<<<<<< HEAD:profile-service/src/main/java/com/chi_001/profile/controller/UserProfileController.java
import com.chi_001.profile.dto.ApiResponse;
import com.chi_001.profile.dto.request.ProfileUpdateRequest;
import com.chi_001.profile.dto.response.UserProfileResponse;
import com.chi_001.profile.service.UserProfileService;
=======
import com.chi_001.relationship.dto.ApiResponse;
import com.chi_001.relationship.dto.response.UserProfileResponse;
import com.chi_001.relationship.service.UserProfileService;
>>>>>>> 51aa692d1819e013c437e667ebd6b94ea967037a:profile-service/src/main/java/com/chi_001/relationship/controller/UserProfileController.java

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequiredArgsConstructor
@RequestMapping("/users")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserProfileController {
    UserProfileService userProfileService;

    @GetMapping("/{profileId}")
    ApiResponse<UserProfileResponse> getProfile(@PathVariable String profileId) {
        return ApiResponse.<UserProfileResponse>builder()
                .result(userProfileService.getProfile(profileId))
                .build();
    }

    @PostMapping("/set-avatar")
    ApiResponse<String> setAvatar(@RequestParam("file")MultipartFile file) {
        return ApiResponse.<String>builder()
                .result(userProfileService.setAvatarUrl(file))
                .build();
    }

    @GetMapping
    ApiResponse<List<UserProfileResponse>> getAllProfiles() {
        return ApiResponse.<List<UserProfileResponse>>builder()
                .result(userProfileService.getAllProfiles())
                .build();
    }

    @GetMapping("/my-profile")
    ApiResponse<UserProfileResponse> getMyProfile() {
        return ApiResponse.<UserProfileResponse>builder()
                .result(userProfileService.getMyProfile())
                .build();
    }

    @PutMapping("/update-profile")
    ApiResponse<UserProfileResponse> updateProfile(@RequestBody ProfileUpdateRequest request) {
        return ApiResponse.<UserProfileResponse>builder()
                .result(userProfileService.updateProfile(request))
                .build();
    }
}
