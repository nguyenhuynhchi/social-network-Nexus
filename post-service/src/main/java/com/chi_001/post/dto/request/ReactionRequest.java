package com.chi_001.post.dto.request;

import com.chi_001.post.enums.ReactionType;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ReactionRequest {
    ReactionType type;
}
