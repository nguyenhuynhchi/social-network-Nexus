package com.chi_001.authentication.repository.httpclient;

import com.chi_001.authentication.configuration.AuthenticationRequestInterceptor;
import com.chi_001.authentication.dto.ApiResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import com.chi_001.authentication.dto.request.ProfileCreationRequest;
import com.chi_001.authentication.dto.response.UserProfileResponse;

@FeignClient(name = "profile-service", url = "${app.services.profile}",
        configuration = { AuthenticationRequestInterceptor.class })
public interface ProfileClient {
    @PostMapping(value = "/internal/users", produces = MediaType.APPLICATION_JSON_VALUE)
    ApiResponse<UserProfileResponse> createProfile(@RequestBody ProfileCreationRequest request);
}
