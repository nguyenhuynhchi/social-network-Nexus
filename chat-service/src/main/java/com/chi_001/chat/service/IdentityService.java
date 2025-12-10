package com.chi_001.chat.service;

import com.chi_001.chat.dto.request.IntrospectRequest;
import com.chi_001.chat.dto.response.IntrospectResponse;
import com.chi_001.chat.repository.httpclient.AuthenticationClient;
import feign.FeignException;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Objects;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class IdentityService {
    AuthenticationClient identityClient;

    public IntrospectResponse introspect(IntrospectRequest request) {
        try {
            var result =  identityClient.introspect(request).getResult();
            if (Objects.isNull(result)) {
                return IntrospectResponse.builder()
                    .valid(false)
                    .build();
            }
            return result;
        } catch (FeignException e) {
            log.error("Introspect failed: {}", e.getMessage(), e);
            return IntrospectResponse.builder()
                .valid(false)
                .build();
        }
    }
}
