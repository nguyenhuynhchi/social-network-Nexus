package com.chi_001.post.dto.response;

import com.chi_001.post.enums.ReactionType;
import java.util.Map;
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
    String fullname;
    String avatarUrl;

    String created;
    Instant createdDate;
    Instant modifiedDate;

    Map<ReactionType, Long> reactionCounts;
}
