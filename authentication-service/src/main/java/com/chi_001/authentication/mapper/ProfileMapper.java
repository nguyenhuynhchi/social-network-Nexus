package com.chi_001.authentication.mapper;

import org.mapstruct.Mapper;

import com.chi_001.authentication.dto.request.ProfileCreationRequest;
import com.chi_001.authentication.dto.request.UserCreationRequest;

@Mapper(componentModel = "spring")
public interface ProfileMapper {
    ProfileCreationRequest toProfileCreationRequest(UserCreationRequest request);
}
