package com.chi_001.chat.entity;

import java.time.LocalDate;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Setter
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ParticipantInfo {
    String userId;
    String username;
    String email;
    String fullname;
    LocalDate dob;
    String city;
    String avatarUrl;
}