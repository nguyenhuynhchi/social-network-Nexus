package com.chi_001.authentication.dto.request;

import java.time.LocalDate;
import java.util.List;

import com.chi_001.authentication.validator.DobConstraint;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserUpdateRequest {

    String fullName;
    @DobConstraint(min = 12, message = "INVALID_DOB")
    LocalDate dob;
    String city;
}
