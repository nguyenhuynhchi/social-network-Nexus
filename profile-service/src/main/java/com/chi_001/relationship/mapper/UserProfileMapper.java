package com.chi_001.relationship.mapper;

import com.chi_001.profile.dto.request.ProfileUpdateRequest;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

<<<<<<< HEAD:profile-service/src/main/java/com/chi_001/profile/mapper/UserProfileMapper.java
import com.chi_001.profile.dto.request.ProfileCreationRequest;
import com.chi_001.profile.dto.response.UserProfileResponse;
import com.chi_001.profile.entity.UserProfile;
import org.mapstruct.MappingTarget;
=======
import com.chi_001.relationship.dto.request.ProfileCreationRequest;
import com.chi_001.relationship.dto.response.UserProfileResponse;
import com.chi_001.relationship.entity.UserProfile;
>>>>>>> 51aa692d1819e013c437e667ebd6b94ea967037a:profile-service/src/main/java/com/chi_001/relationship/mapper/UserProfileMapper.java

@Mapper(componentModel = "spring")
public interface UserProfileMapper {

    @Mapping(target = "avatarUrl", ignore = true)
    UserProfile toUserProfile(ProfileCreationRequest request);

    UserProfileResponse toUserProfileResponse(UserProfile entity);

    void updateUserProfile(@MappingTarget UserProfile profile, ProfileUpdateRequest request);
}
