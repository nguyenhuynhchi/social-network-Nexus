package com.chi_001.relationship.dto;

import com.chi_001.profile.entity.UserProfile;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class FriendSuggestion {

    UserProfile foaf;
    Long commonFriends;
}
