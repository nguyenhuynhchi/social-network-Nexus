package com.chi_001.post.dto.response;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserProfileResponse {
<<<<<<< HEAD

    String id;
    String username;
    String email;
    String fullname;
    LocalDate dob;
    String city;
    String avatarUrl;
=======
    String id;
    String username;
    String email;
    String firstName;
    String lastName;
    LocalDate dob;
    String city;
>>>>>>> 51aa692d1819e013c437e667ebd6b94ea967037a
}
