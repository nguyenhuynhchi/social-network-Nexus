package com.chi_001.profile.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
public class UserProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    String userId;

    String username;
    String email;

    String fullname;
    LocalDate dob;
    String city;
}
