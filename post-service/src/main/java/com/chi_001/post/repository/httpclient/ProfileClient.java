package com.chi_001.post.repository.httpclient;

import com.chi_001.post.dto.ApiResponse;
import com.chi_001.post.dto.response.UserProfileResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

<<<<<<< HEAD
@FeignClient(
    name = "profile-service",
    url = "${app.services.profile.url}"
)
=======
@FeignClient(name = "profile-service", url = "${app.services.profile.url}")
>>>>>>> 51aa692d1819e013c437e667ebd6b94ea967037a
public interface ProfileClient {
    @GetMapping("/internal/users/{userId}")
    ApiResponse<UserProfileResponse> getProfile(@PathVariable String userId);
}
