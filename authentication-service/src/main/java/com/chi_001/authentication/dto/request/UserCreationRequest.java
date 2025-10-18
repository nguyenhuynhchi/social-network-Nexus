package com.chi_001.authentication.dto.request;

import jakarta.validation.constraints.Pattern;
import java.time.LocalDate;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import com.chi_001.authentication.validator.DobConstraint;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserCreationRequest {
    @Size(min = 4, message = "USERNAME_INVALID")
    String username;

    @Size(min = 6, message = "INVALID_PASSWORD")
    @Pattern(regexp = "^(?=.*[a-zA-Z])(?=.*\\d).*$", message = "INVALID_PASSWORD")
    String password;

    @Email(message = "INVALID_EMAIL")
    @NotBlank(message = "EMAIL_IS_REQUIRED")
    String email;

    @NotBlank(message = "FULLNAME_IS_REQUIRED")
    @Size(min = 5, message = "INVALID_FULLNAME")
    @Pattern(regexp = "^(\\p{L}+\\s*)+$", message = "INVALID_FULLNAME")
    String fullname;

    @DobConstraint(min = 10, message = "INVALID_DOB")
    LocalDate dob;

    String city;
}
