package com.chi_001.post.dto.response;

import com.chi_001.post.enums.ReactionType;
import java.time.Instant;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ReactionUserResponse {
    ReactionType type;
    String userId;
    String username;
    String fullname;
    String avatarUrl;
    boolean me;
    Instant reactedAt;
}
