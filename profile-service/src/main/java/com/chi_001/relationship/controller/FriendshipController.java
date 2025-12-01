package com.chi_001.relationship.controller;

<<<<<<< HEAD
import com.chi_001.profile.dto.ApiResponse;
import com.chi_001.profile.dto.response.UserProfileResponse;
import com.chi_001.profile.entity.UserProfile;
import com.chi_001.relationship.dto.request.ProfileIdRequest;
=======
import com.chi_001.relationship.dto.ApiResponse;
import com.chi_001.relationship.dto.request.ProfileIdRequest;
import com.chi_001.relationship.dto.response.UserProfileResponse;
import com.chi_001.relationship.entity.UserProfile;
>>>>>>> 51aa692d1819e013c437e667ebd6b94ea967037a
import com.chi_001.relationship.service.FriendshipService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
<<<<<<< HEAD
@RequestMapping("/friends")
=======
>>>>>>> 51aa692d1819e013c437e667ebd6b94ea967037a
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class FriendshipController {

    FriendshipService friendshipService;

    // Gửi yêu cầu kết bạn
<<<<<<< HEAD
    @PostMapping("/request")
=======
    @PostMapping("/friends/request")
>>>>>>> 51aa692d1819e013c437e667ebd6b94ea967037a
    public ApiResponse<String> sendFriendRequest(@RequestBody ProfileIdRequest request) {
        UserProfile receiverProfile = friendshipService.sendFriendRequest(request.getProfileId());
        log.info("Sent friend request to userId: {}", request.getProfileId());
        return ApiResponse.<String>builder()
            .result("You have sent a friend request to " + receiverProfile.getFullname() + "("
                + receiverProfile.getUsername() + ").")
            .build();
    }

    // Hủy yêu cầu kết bạn
<<<<<<< HEAD
    @DeleteMapping("/cancel-request")
    public ApiResponse<String> cancelFriendRequest(@RequestBody ProfileIdRequest request) {
        UserProfile receiverProfile = friendshipService.cancelFriendRequest(request.getProfileId());

        // log.info("canceled friend request to userId: {}", request.getProfileId());
=======
    @DeleteMapping("/friends/cancel-request")
    public ApiResponse<String> cancelFriendRequest(@RequestBody ProfileIdRequest request) {
        UserProfile receiverProfile = friendshipService.cancelFriendRequest(request.getProfileId());
//        log.info("canceled friend request to userId: {}", request.getProfileId());
>>>>>>> 51aa692d1819e013c437e667ebd6b94ea967037a
        return ApiResponse.<String>builder()
            .result("You have canceled a friend request to " + receiverProfile.getFullname() + "("
                + receiverProfile.getUsername() + ").")
            .build();
    }

    // Chấp nhận yêu cầu kết bạn
<<<<<<< HEAD
    @PutMapping("/accept")
=======
    @PutMapping("/friends/accept")
>>>>>>> 51aa692d1819e013c437e667ebd6b94ea967037a
    public ApiResponse<String> acceptFriendRequest(@RequestBody ProfileIdRequest request) {
        UserProfile userProfile = friendshipService.acceptFriendRequest(request.getProfileId());
        return ApiResponse.<String>builder()
            .result("You accepted friend request of " + userProfile.getFullname() + "("
                + userProfile.getUsername() + ").")
            .build();
    }

    // Từ chối yêu cầu kết bạn
<<<<<<< HEAD
    @DeleteMapping("/decline-request")
=======
    @DeleteMapping("/friends/decline")
>>>>>>> 51aa692d1819e013c437e667ebd6b94ea967037a
    public ApiResponse<String> declineFriendRequest(@RequestBody ProfileIdRequest request) {
        UserProfile requesterProfile = friendshipService.declineFriendRequest(request.getProfileId());
        return ApiResponse.<String>builder()
            .result("You declined friend request from " + requesterProfile.getFullname() + "("
                + requesterProfile.getUsername() + ").")
            .build();
    }

    // Hủy kết bạn
<<<<<<< HEAD
    @DeleteMapping("/unfriend")
=======
    @DeleteMapping("/friends/unfriend")
>>>>>>> 51aa692d1819e013c437e667ebd6b94ea967037a
    public ApiResponse<String> unfriend(@RequestBody ProfileIdRequest request) {
        UserProfile friendProfile = friendshipService.unfriend(request.getProfileId());
        return ApiResponse.<String>builder()
            .result("You unfriended with " + friendProfile.getFullname() + "("
                + friendProfile.getUsername() + ").")
            .build();
    }

    // Lấy danh sách bạn bè CỦA TÔI
<<<<<<< HEAD
    @GetMapping
=======
    @GetMapping("/friends")
>>>>>>> 51aa692d1819e013c437e667ebd6b94ea967037a
    public ApiResponse<List<UserProfileResponse>> getMyFriends() {
        return ApiResponse.<List<UserProfileResponse>>builder()
            .result(friendshipService.getFriendsList())
            .build();
    }

    // Lấy danh sách yêu cầu đang chờ (gửi đến TÔI)
<<<<<<< HEAD
    @GetMapping("/pending-requests")
=======
    @GetMapping("/friends/requests/pending")
>>>>>>> 51aa692d1819e013c437e667ebd6b94ea967037a
    public ApiResponse<List<UserProfileResponse>> getPendingRequests() {
        return ApiResponse.<List<UserProfileResponse>>builder()
            .result(friendshipService.getPendingRequests())
            .build();
    }
}
