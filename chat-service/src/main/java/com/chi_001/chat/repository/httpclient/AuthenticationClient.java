package com.chi_001.chat.repository.httpclient;

import com.chi_001.chat.dto.ApiResponse;
import com.chi_001.chat.dto.request.IntrospectRequest;
import com.chi_001.chat.dto.response.IntrospectResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "authentication-service", url = "${app.services.authentication.url}")
public interface AuthenticationClient {
    @PostMapping("/auth/introspect")
    ApiResponse<IntrospectResponse> introspect(@RequestBody IntrospectRequest request);
}
