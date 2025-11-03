package com.chi_001.relationship.mapper;

import org.mapstruct.Mapper;

import com.chi_001.relationship.dto.request.ProfileCreationRequest;
import com.chi_001.relationship.dto.response.UserProfileResponse;
import com.chi_001.relationship.entity.UserProfile;

@Mapper(componentModel = "spring")
public interface UserProfileMapper {
    UserProfile toUserProfile(ProfileCreationRequest request);

    UserProfileResponse toUserProfileResponse(UserProfile entity);
}
