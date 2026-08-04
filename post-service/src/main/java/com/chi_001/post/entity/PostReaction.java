package com.chi_001.post.entity;

import com.chi_001.post.enums.ReactionType;
import java.time.Instant;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.MongoId;

@Document("post_reaction")
@Getter
@Setter
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PostReaction {

    @MongoId
    String id;

    String postId;
    String userId;

    ReactionType type;

    Instant createdDate;
}
