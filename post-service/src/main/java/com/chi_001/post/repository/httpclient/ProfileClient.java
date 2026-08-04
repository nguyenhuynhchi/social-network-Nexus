package com.chi_001.post.repository.httpclient;

import com.chi_001.post.configuration.FeignMultipartSupportConfig;
import com.chi_001.post.dto.ApiResponse;
import com.chi_001.post.dto.response.UserProfileResponse;
import java.util.List;
import java.util.Set;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(
    name = "profile-service",
    url = "${app.services.profile.url}",
    configuration = FeignMultipartSupportConfig.class
)
public interface ProfileClient {
    @GetMapping("/internal/users/{userId}")
    ApiResponse<UserProfileResponse> getProfile(@PathVariable String userId);

    @PostMapping("/users/by-userIds")
    ApiResponse<Set<UserProfileResponse>> getProfilesByUserIds(@RequestBody List<String> userIds);

    @GetMapping("/friends")
    ApiResponse<List<UserProfileResponse>> getFriendList();
}
