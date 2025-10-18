package com.chi_001.authentication.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import com.chi_001.authentication.dto.request.UserCreationRequest;
import com.chi_001.authentication.dto.request.UserUpdateRequest;
import com.chi_001.authentication.dto.response.UserResponse;
import com.chi_001.authentication.entity.User;

@Mapper(componentModel = "spring")
public interface UserMapper {
    User toUser(UserCreationRequest request);

    UserResponse toUserResponse(User user);

    @Mapping(target = "roles", ignore = true)
    void updateUser(@MappingTarget User user, UserUpdateRequest request);
}
