package com.chi_001.authentication.mapper;

import org.mapstruct.Mapper;

import com.chi_001.authentication.dto.request.PermissionRequest;
import com.chi_001.authentication.dto.response.PermissionResponse;
import com.chi_001.authentication.entity.Permission;

@Mapper(componentModel = "spring")
public interface PermissionMapper {
    Permission toPermission(PermissionRequest request);

    PermissionResponse toPermissionResponse(Permission permission);
}
