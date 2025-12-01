package com.chi_001.authentication.dto.request;

import java.util.Set;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RoleRequest {
    String name;
    String description;
<<<<<<< HEAD
=======
//    Set<String> permissions;
>>>>>>> 51aa692d1819e013c437e667ebd6b94ea967037a
}
