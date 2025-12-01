package com.chi_001.relationship.service;

<<<<<<< HEAD
import com.chi_001.profile.dto.response.UserProfileResponse;
import com.chi_001.profile.entity.UserProfile;
import com.chi_001.profile.exception.AppException;
import com.chi_001.profile.exception.ErrorCode;
import com.chi_001.profile.mapper.UserProfileMapper;
import com.chi_001.profile.repository.UserProfileRepository;
=======
import com.chi_001.relationship.dto.response.UserProfileResponse;
import com.chi_001.relationship.entity.UserProfile;
import com.chi_001.relationship.exception.AppException;
import com.chi_001.relationship.exception.ErrorCode;
import com.chi_001.relationship.mapper.UserProfileMapper;
import com.chi_001.relationship.repository.UserProfileRepository;
>>>>>>> 51aa692d1819e013c437e667ebd6b94ea967037a
import java.util.List;
import java.util.Optional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
<<<<<<< HEAD
=======
import org.apache.catalina.User;
>>>>>>> 51aa692d1819e013c437e667ebd6b94ea967037a
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class FriendshipService {

    UserProfileRepository userProfileRepository;
    UserProfileMapper userProfileMapper;

    private String getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication.getName();
    }

    private UserProfile getUserProfile(String profileId) {
        return userProfileRepository.findById(profileId)
            .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
    }


    @Transactional("transactionManager")
    public UserProfile sendFriendRequest(String receiverProfileId) {
        String requesterUserId = getCurrentUserId();

        UserProfile receiverProfile = getUserProfile(receiverProfileId);

        UserProfile requesterProfile = userProfileRepository.findByUserId(requesterUserId).
            orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        String receiverUserId = receiverProfile.getUserId();

        userProfileRepository.createFriendRequest(requesterUserId, receiverUserId);

        log.info(" - User {} -{} sent friend request to {} -{}",
            requesterProfile.getUsername(), requesterUserId.substring(24),
            receiverProfile.getUsername(), receiverUserId.substring(24)
        );

        return receiverProfile;
    }


    @Transactional("transactionManager")
    public UserProfile cancelFriendRequest(String receiverProfileId) {
        String requesterUserId = getCurrentUserId();
        UserProfile requesterProfile = userProfileRepository.findByUserId(requesterUserId).
            orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        UserProfile receiverProfile = getUserProfile(receiverProfileId);
        String receiverUserId = receiverProfile.getUserId();

        userProfileRepository.cancelFriendRequest(requesterUserId, receiverUserId);
        log.info(" - User {} -{} cancel friend request to {} -{}",
            requesterProfile.getUsername(), requesterUserId.substring(24),
            receiverProfile.getUsername(), receiverUserId.substring(24));

        return receiverProfile;
    }


    @Transactional("transactionManager")
    public UserProfile acceptFriendRequest(String requesterProfileId) {
        String receiverUserId = getCurrentUserId(); // Chính user này
        UserProfile receiverProfile = userProfileRepository.findByUserId(receiverUserId)
            .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        UserProfile requesterProfile = getUserProfile(requesterProfileId);
        String requesterUserId = requesterProfile.getUserId();

        // kiểm tra xem có quan hệ SENT_REQUEST_TO không trước khi chấp nhận
        Optional<String> relationshipType = userProfileRepository
            .findRelationshipType(requesterUserId, receiverUserId);

        if (relationshipType.isEmpty()) {
            throw new AppException(ErrorCode.FRIEND_REQUEST_NOT_EXISTED);
        } else if (relationshipType.get().equals("IS_FRIENDS_WITH")) {
            throw new AppException(ErrorCode.ALREADY_FRIENDS);
        } else if (!relationshipType.get().equals("SENT_REQUEST_TO")) {
            log.warn(" - Invalid relationship type: {}", relationshipType.get());
<<<<<<< HEAD
            throw new AppException(ErrorCode.UNKNOWN_RELATIONSHIP);
=======
            throw new AppException(ErrorCode.UNKNOW_RELATIONSHIP);
>>>>>>> 51aa692d1819e013c437e667ebd6b94ea967037a
        }

        userProfileRepository.acceptFriendRequest(requesterUserId, receiverUserId);
        log.info(" - User {} -{} accepted friend request from {} -{}"
            , receiverProfile.getUsername(), receiverUserId.substring(24)
            , requesterProfile.getUsername(), requesterUserId.substring(24));

        return requesterProfile;
    }


    @Transactional("transactionManager")
    public UserProfile declineFriendRequest(String requesterProfileId) {
        String receiverUserId = getCurrentUserId(); // Chính user này
        UserProfile receiverProfile = userProfileRepository.findByUserId(receiverUserId)
            .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        UserProfile requesterProfile = getUserProfile(requesterProfileId);
        String requesterUserId = requesterProfile.getUserId();

        userProfileRepository.declineFriendRequest(requesterUserId, receiverUserId);
        log.info(" - User {} -{} declined friend request from {} -{}"
            , receiverProfile.getUsername(), receiverUserId.substring(24)
            , requesterProfile.getUsername() , requesterUserId.substring(24));

        return requesterProfile;
    }


    @Transactional("transactionManager")
    public UserProfile unfriend(String friendProfileId) {
        String userId = getCurrentUserId();

        UserProfile userProfile = userProfileRepository.findByUserId(userId)
            .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        UserProfile friendProfile = getUserProfile(friendProfileId);
        String friendUserId = friendProfile.getUserId();

        userProfileRepository.removeFriendship(userId, friendUserId);
        log.info(" - User {} -{} unfriended with {} -{}"
            , userProfile.getUsername(), userId.substring(24)
            , friendProfile.getUsername(), friendUserId.substring(24));

        return friendProfile;
    }

    public List<UserProfileResponse> getFriendsList() {
        String UserId = getCurrentUserId();

        List<UserProfile> friends = userProfileRepository.findAllFriendsByUserId(UserId);

        return friends.stream()
            .map(userProfileMapper::toUserProfileResponse)
            .toList();
    }

    public List<UserProfileResponse> getPendingRequests() {
        String UserId = getCurrentUserId();

        List<UserProfile> requesters = userProfileRepository.findPendingRequestsByUserId(UserId);

        return requesters.stream()
            .map(userProfileMapper::toUserProfileResponse)
            .toList();
    }
}
