package com.chi_001.authentication.service;

import com.chi_001.authentication.dto.request.ProfileCreationRequest;
import com.chi_001.authentication.dto.response.UserProfileResponse;
import com.chi_001.event.dto.NotificationEvent;
import java.util.HashSet;
import java.util.List;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.chi_001.authentication.constant.PredefinedRole;
import com.chi_001.authentication.dto.request.UserCreationRequest;
import com.chi_001.authentication.dto.request.UserUpdateRequest;
import com.chi_001.authentication.dto.response.UserResponse;
import com.chi_001.authentication.entity.Role;
import com.chi_001.authentication.entity.User;
import com.chi_001.authentication.exception.AppException;
import com.chi_001.authentication.exception.ErrorCode;
import com.chi_001.authentication.mapper.ProfileMapper;
import com.chi_001.authentication.mapper.UserMapper;
import com.chi_001.authentication.repository.RoleRepository;
import com.chi_001.authentication.repository.UserRepository;
import com.chi_001.authentication.repository.httpclient.ProfileClient;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class UserService {

    UserRepository userRepository;
    RoleRepository roleRepository;
    UserMapper userMapper;
    ProfileMapper profileMapper;
    PasswordEncoder passwordEncoder;
    ProfileClient profileClient;
    KafkaTemplate<String, Object> kafkaTemplate;

    public UserProfileResponse createUser(UserCreationRequest request) {

        if(userRepository.existsByEmail(request.getEmail())) {
            throw new AppException(ErrorCode.USER_EXISTED);
        }

        User user = userMapper.toUser(request);
        var username = request.getEmail().split("@")[0];
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        HashSet<Role> roles = new HashSet<>();

        roleRepository.findById(PredefinedRole.USER_ROLE).ifPresent(roles::add);

        user.setRoles(roles);
//        user.setEmailVerified(false);

        try {
            user = userRepository.save(user);
        } catch (DataIntegrityViolationException exception) {
            throw new AppException(ErrorCode.USER_EXISTED);
        }

        ProfileCreationRequest profileRequest = profileMapper.toProfileCreationRequest(request);
        profileRequest.setUserId(user.getId());
        profileRequest.setUsername(username);

        var profile = profileClient.createProfile(profileRequest);
        profile.getResult().setUserId(user.getId());

        String htmlBody = """
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
                <div style="background-color: #007bff; padding: 20px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Chào mừng đến với Nexus</h1>
                </div>
                <div style="padding: 30px; line-height: 1.6; color: #333333;">
                    <p style="font-size: 18px;">Xin chào <strong>%s</strong>!</p>
                    <p>Cảm ơn bạn đã tin tưởng và đăng ký tài khoản tại <strong>Nexus</strong>. Chúng tôi rất hào hứng khi có bạn đồng hành trong cộng đồng này.</p>
            
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="http://localhost:5173/login" 
                           style="background-color: #007bff; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                           Bắt đầu khám phá ngay
                        </a>
                    </div>
            
                    <p>Nếu bạn có bất kỳ câu hỏi nào, đừng ngần ngại phản hồi email này để được hỗ trợ.</p>
                    <hr style="border: none; border-top: 1px solid #eeeeee; margin: 20px 0;">
                    <p style="font-size: 14px; color: #777777;">Trân trọng,<br>Nexus</p>
                </div>
                <div style="background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #999999;">
                    © 2025 Nexus Community. Make by Nguyen Huynh Chi.
                </div>
            </div>
            """.formatted(request.getFullname());

        NotificationEvent notificationEvent = NotificationEvent.builder()
            .channel("EMAIL")
            .recipient(request.getEmail())
            .subject("Chào mừng đến với Nexus")
            .body(htmlBody)
            .build();

        // Publish message to kafka
        kafkaTemplate.send("notification-delivery", notificationEvent);

        return profile.getResult();
    }

    public UserResponse getMyInfo() {
        var context = SecurityContextHolder.getContext();
        String userId = context.getAuthentication().getName();

        log.info("Getting info of userId: {}", userId);

        User user = userRepository.findById(userId)
            .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        return userMapper.toUserResponse(user);
    }

    //    @PreAuthorize("hasRole('ADMIN')")
    public UserResponse updateUser(String userId, UserUpdateRequest request) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        userMapper.updateUser(user, request);
//        user.setPassword(passwordEncoder.encode(request.getPassword()));

//        var roles = roleRepository.findAllById(request.getRoles());
//        user.setRoles(new HashSet<>(roles));

        return userMapper.toUserResponse(userRepository.save(user));
    }

    @PreAuthorize("hasRole('ADMIN')")
    public void deleteUser(String userId) {
        userRepository.deleteById(userId);
    }

    @PreAuthorize("hasRole('ADMIN')")
    public List<UserResponse> getUsers() {
        log.info("In method get Users");
        return userRepository.findAll().stream().map(userMapper::toUserResponse).toList();
    }

    @PreAuthorize("hasRole('ADMIN')")
    public UserResponse getUser(String id) {
        return userMapper.toUserResponse(
            userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED)));
    }
}
