package com.chi_001.relationship.service;

import com.chi_001.event.dto.NotificationEvent;
import com.chi_001.profile.dto.response.UserProfileResponse;
import com.chi_001.profile.entity.UserProfile;
import com.chi_001.profile.exception.AppException;
import com.chi_001.profile.exception.ErrorCode;
import com.chi_001.profile.mapper.UserProfileMapper;
import com.chi_001.profile.repository.UserProfileRepository;
import com.chi_001.relationship.dto.FriendSuggestion;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
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
    KafkaTemplate<String, Object> kafkaTemplate;

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

        String friendRequestTemplate = """
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eeeeee; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
                <div style="background-color: #007bff; padding: 20px; text-align: center;">
                    <h2 style="color: #ffffff; margin: 0; font-size: 22px;">Lời mời kết bạn mới</h2>
                </div>
            
                <div style="padding: 30px; color: #444444; line-height: 1.6;">
                    <p style="font-size: 16px;">Xin chào <strong>%s</strong>,</p>
            
                    <p>Bạn vừa nhận được một lời mời kết bạn từ một người dùng <strong>Nexus</strong>:</p>
            
                    <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center; border: 1px dashed #007bff;">
                        <p style="margin: 0; font-size: 18px; color: #007bff;"><strong>%s</strong></p>
                    </div>
            
                    <p>Hãy kết nối với họ để cùng chia sẻ và thảo luận nhiều hơn nhé!</p>
            
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="http://localhost:5173/login" 
                           style="background-color: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block; transition: background 0.3s;">
                           Vào hệ thống để xem và phản hồi lời mời
                        </a>
                    </div>
            
                    <p style="font-size: 14px; color: #888888;">Nếu bạn không biết người này, bạn có thể bỏ qua email này.</p>
            
                    <hr style="border: none; border-top: 1px solid #eeeeee; margin: 20px 0;">
                    <p style="font-size: 14px; color: #777777;">Thân ái,<br><strong>Nexus</strong></p>
                </div>
            
                <div style="background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #999999;">
                    © 2025 Nexus Community. Make by Nguyen Huynh Chi.
                </div>
            </div>
            """;
        String htmlBody = String.format(friendRequestTemplate,
            receiverProfile.getFullname(),
            requesterProfile.getFullname()
        );

        NotificationEvent notificationEvent = NotificationEvent.builder()
            .channel("EMAIL")
            .recipient(receiverProfile.getEmail())
            .subject("Bạn có một lời mời kết bạn mới từ " + requesterProfile.getFullname() + "!")
            .body(htmlBody)
            .build();

        // Publish message to kafka
        kafkaTemplate.send("notification-delivery", notificationEvent);

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
            throw new AppException(ErrorCode.UNKNOWN_RELATIONSHIP);
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
            , requesterProfile.getUsername(), requesterUserId.substring(24));

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

    public List<UserProfileResponse> getSuggestedFriends(int limit) {
        String currentUserId = getCurrentUserId();

        // Gọi repository lấy danh sách kèm số lượng bạn chung
        List<FriendSuggestion> suggestions =
            userProfileRepository.suggestFriends(currentUserId, limit);

        return suggestions.stream()
            .map(suggestion -> {
                UserProfileResponse response = userProfileMapper.toUserProfileResponse(
                    suggestion.getFoaf());

                if (response != null) {
                    response.setCommonFriendsCount(suggestion.getCommonFriends().intValue());

                    String status = userProfileRepository
                        .findRelationshipType(currentUserId, response.getUserId())
                        .orElse("NONE");
                    response.setRelationshipStatus(status);
                }

                return response;
            })
            .filter(Objects::nonNull)
            .toList();
    }

    public List<UserProfileResponse> getFriendsList() {
        String currentUserId = getCurrentUserId();

        List<UserProfile> friends = userProfileRepository.findAllFriendsByUserId(currentUserId);

        return friends.stream()
            .map(friend -> {
                UserProfileResponse response = userProfileMapper.toUserProfileResponse(friend);
                String status = userProfileRepository
                    .findRelationshipType(currentUserId, response.getUserId())
                    .orElseThrow(() -> new AppException(ErrorCode.UNKNOWN_RELATIONSHIP));
                response.setRelationshipStatus(status);
                return response;
            })
            .toList();
    }

    public List<UserProfileResponse> getPendingRequests() {
        String currentUserId = getCurrentUserId();

        List<UserProfile> requesters = userProfileRepository.findPendingRequestsByUserId(currentUserId);

        return requesters.stream()
            .map(requester -> {
                UserProfileResponse response = userProfileMapper.toUserProfileResponse(requester);
                String status = userProfileRepository
                    .findRelationshipType(response.getUserId(), currentUserId)
                    .orElseThrow(() -> new AppException(ErrorCode.UNKNOWN_RELATIONSHIP));
                response.setRelationshipStatus(status);
                return response;
            })
            .toList();
    }
}
