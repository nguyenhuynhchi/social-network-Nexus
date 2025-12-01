package com.chi_001.post.dto.response;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PostResponse {
    String id;
    String content;
    String fileUrl;
    String userId;
    String username;
<<<<<<< HEAD
    String fullname;
    String avatarUrl;
=======
>>>>>>> 51aa692d1819e013c437e667ebd6b94ea967037a
    String created;
    Instant createdDate;
    Instant modifiedDate;
}
