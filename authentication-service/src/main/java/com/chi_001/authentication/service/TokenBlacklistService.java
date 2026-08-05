package com.chi_001.authentication.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.Date;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class TokenBlacklistService {
    private static final String KEY_PREFIX = "auth:blacklist:";
    private static final String GATEWAY_INTROSPECTION_KEY_PREFIX = "gateway:introspect:";

    StringRedisTemplate redisTemplate;

    public void blacklist(String jwtId, String token, Date expiryTime) {
        Duration ttl = Duration.between(Instant.now(), expiryTime.toInstant());

        if (ttl.isPositive()) {
            redisTemplate.opsForValue().set(KEY_PREFIX + jwtId, "1", ttl);
            redisTemplate.opsForValue().set(GATEWAY_INTROSPECTION_KEY_PREFIX + hashToken(token), "false", ttl);
        }
    }

    public boolean contains(String jwtId) {
        return Boolean.TRUE.equals(redisTemplate.hasKey(KEY_PREFIX + jwtId));
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
