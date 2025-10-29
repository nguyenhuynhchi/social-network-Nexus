package com.chi_001.authentication.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.chi_001.authentication.dto.request.RoleRequest;
import com.chi_001.authentication.dto.response.RoleResponse;
import com.chi_001.authentication.entity.Role;

@Mapper(componentModel = "spring")
public interface RoleMapper {
//    @Mapping(target = "permissions", ignore = true)
    Role toRole(RoleRequest request);

    RoleResponse toRoleResponse(Role role);
}
