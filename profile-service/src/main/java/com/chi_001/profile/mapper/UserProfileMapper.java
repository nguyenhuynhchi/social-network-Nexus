package com.chi_001.profile.mapper;

import com.chi_001.profile.dto.request.ProfileUpdateRequest;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.chi_001.profile.dto.request.ProfileCreationRequest;
import com.chi_001.profile.dto.response.UserProfileResponse;
import com.chi_001.profile.entity.UserProfile;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring")
public interface UserProfileMapper {

    @Mapping(target = "avatarUrl", ignore = true)
    UserProfile toUserProfile(ProfileCreationRequest request);

    UserProfileResponse toUserProfileResponse(UserProfile entity);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateUserProfile(@MappingTarget UserProfile profile, ProfileUpdateRequest request);
}
