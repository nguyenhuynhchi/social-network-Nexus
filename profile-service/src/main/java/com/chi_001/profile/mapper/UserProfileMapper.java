package com.chi_001.profile.mapper;

import org.mapstruct.Mapper;

import com.chi_001.profile.dto.request.ProfileCreationRequest;
import com.chi_001.profile.dto.response.UserProfileResponse;
import com.chi_001.profile.entity.UserProfile;

@Mapper(componentModel = "spring")
public interface UserProfileMapper {
    UserProfile toUserProfile(ProfileCreationRequest request);

    UserProfileResponse toUserProfileResponse(UserProfile entity);
}
