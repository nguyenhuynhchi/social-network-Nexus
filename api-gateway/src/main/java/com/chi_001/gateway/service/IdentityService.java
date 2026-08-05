package com.chi_001.gateway.service;

import com.chi_001.gateway.dto.ApiResponse;
import com.chi_001.gateway.dto.request.IntrospectRequest;
import com.chi_001.gateway.dto.response.IntrospectResponse;
import com.chi_001.gateway.repository.IdentityClient;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Duration;
import java.util.Base64;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.ReactiveStringRedisTemplate;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class IdentityService {
    private static final String CACHE_KEY_PREFIX = "gateway:introspect:";

    IdentityClient identityClient;
    ReactiveStringRedisTemplate redisTemplate;

    @NonFinal
    @Value("${app.cache.introspection-ttl-seconds:30}")
    long introspectionCacheTtlSeconds;

    public Mono<ApiResponse<IntrospectResponse>> introspect(String token){
        String cacheKey = CACHE_KEY_PREFIX + hashToken(token);

        return redisTemplate.opsForValue()
            .get(cacheKey)
            .map(this::toCachedResponse)
            .onErrorResume(throwable -> Mono.empty())
            .switchIfEmpty(introspectAndCache(token, cacheKey));
    }

    private Mono<ApiResponse<IntrospectResponse>> introspectAndCache(String token, String cacheKey) {
        return introspectFromAuthenticationService(token)
            .flatMap(response -> cacheResponse(cacheKey, response).thenReturn(response));
    }

    private Mono<ApiResponse<IntrospectResponse>> introspectFromAuthenticationService(String token) {
        return identityClient.introspect(
            IntrospectRequest.builder()
                .token(token)
                .build()
        );
    }

    private Mono<Boolean> cacheResponse(String cacheKey, ApiResponse<IntrospectResponse> response) {
        if (response == null || response.getResult() == null) {
            return Mono.just(false);
        }

        String cachedValue = Boolean.toString(response.getResult().isValid());
        Duration ttl = Duration.ofSeconds(introspectionCacheTtlSeconds);

        return redisTemplate.opsForValue()
            .set(cacheKey, cachedValue, ttl)
            .onErrorReturn(false);
    }

    private ApiResponse<IntrospectResponse> toCachedResponse(String cachedValue) {
        return ApiResponse.<IntrospectResponse>builder()
            .result(IntrospectResponse.builder()
                .valid(Boolean.parseBoolean(cachedValue))
                .build())
            .build();
    }

    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 algorithm is not available", e);
        }
    }
}
