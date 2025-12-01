package com.chi_001.authentication.dto.response;

import java.util.Set;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RoleResponse {
    String name;
    String description;
<<<<<<< HEAD
=======
//    Set<PermissionResponse> permissions;
>>>>>>> 51aa692d1819e013c437e667ebd6b94ea967037a
}
