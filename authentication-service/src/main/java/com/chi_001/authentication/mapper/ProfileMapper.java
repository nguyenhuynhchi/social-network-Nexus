package com.chi_001.authentication.mapper;

import org.mapstruct.Mapper;

import com.chi_001.authentication.dto.request.ProfileCreationRequest;
import com.chi_001.authentication.dto.request.UserCreationRequest;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ProfileMapper {

//    @Mapping(target = "username", ignore = true)
    ProfileCreationRequest toProfileCreationRequest(UserCreationRequest request);
}
