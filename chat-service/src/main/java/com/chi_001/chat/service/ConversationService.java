package com.chi_001.chat.service;

import com.chi_001.chat.dto.request.ConversationRequest;
import com.chi_001.chat.dto.response.ConversationResponse;
import com.chi_001.chat.entity.Conversation;
import com.chi_001.chat.entity.ParticipantInfo;
import com.chi_001.chat.exception.AppException;
import com.chi_001.chat.exception.ErrorCode;
import com.chi_001.chat.mapper.ConversationMapper;
import com.chi_001.chat.repository.ConversationRepository;
import com.chi_001.chat.repository.httpclient.ProfileClient;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.StringJoiner;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ConversationService {

    ConversationRepository conversationRepository;
    ProfileClient profileClient;

    ConversationMapper conversationMapper;

    public List<ConversationResponse> myConversations() {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        log.info("GetConversations of UserID : {}", userId);
        List<Conversation> conversations = conversationRepository.findAllByParticipantsHashContains(
            userId);

        return conversations.stream().map(this::toConversationResponse).toList();
    }

//    public ConversationResponse create(ConversationRequest request) {
//        // Fetch user infos
//        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
//        var userInfoResponse = profileClient.getProfile(userId);
//
//        var participantInfoResponse = profileClient.getProfile(
//            request.getParticipantIds().getFirst());
//
//        if (Objects.isNull(userInfoResponse) || Objects.isNull(participantInfoResponse)) {
//            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
//        }
//
//        var userInfo = userInfoResponse.getResult();
//        var participantInfo = participantInfoResponse.getResult();
//
//        List<String> userIds = new ArrayList<>();
//        userIds.add(userId);
//        userIds.add(participantInfo.getUserId());
//
//        var sortedIds = userIds.stream().sorted().toList();
//        String userIdHash = generateParticipantHash(sortedIds);
//
//        var conversation = conversationRepository.findByParticipantsHash(userIdHash)
//            .orElseGet(() -> {
//                List<ParticipantInfo> participantInfos = List.of(
//                    ParticipantInfo.builder()
//                        .userId(userInfo.getUserId())
//                        .username(userInfo.getUsername())
//                        .fullname(userInfo.getFullname())
//                        .email(userInfo.getEmail())
//                        .dob(userInfo.getDob())
//                        .city(userInfo.getCity())
//                        .avatarUrl(userInfo.getAvatarUrl())
//                        .build(),
//                    ParticipantInfo.builder()
//                        .userId(participantInfo.getUserId())
//                        .username(participantInfo.getUsername())
//                        .fullname(participantInfo.getFullname())
//                        .email(participantInfo.getEmail())
//                        .dob(participantInfo.getDob())
//                        .city(participantInfo.getCity())
//                        .avatarUrl(participantInfo.getAvatarUrl())
//                        .build()
//                );
//
//                // Build conversation info
//                Conversation newConversation = Conversation.builder()
//                    .type(request.getType())
//                    .participantsHash(userIdHash)
//                    .createdDate(Instant.now())
//                    .modifiedDate(Instant.now())
//                    .participants(participantInfos)
//                    .build();
//
//                return conversationRepository.save(newConversation);
//            });
//
//        return toConversationResponse(conversation);
//    }

    public ConversationResponse create(ConversationRequest request) {

        String creatorId = SecurityContextHolder.getContext().getAuthentication().getName();

        // Tập hợp tất cả userId
        Set<String> allUserIds = new HashSet<>();
        allUserIds.add(creatorId);

        if (request.getParticipantIds() != null) {
            allUserIds.addAll(request.getParticipantIds());
        }

        // Lấy thông tin profile của tất cả users
        List<ParticipantInfo> participants = new ArrayList<>();

        for (String uid : allUserIds) {
            var profileResponse = profileClient.getProfile(uid);
            if (profileResponse == null || profileResponse.getResult() == null) {
                throw new AppException(ErrorCode.USER_NOT_EXISTED);
            }

            var info = profileResponse.getResult();

            participants.add(ParticipantInfo.builder()
                .userId(info.getUserId())
                .username(info.getUsername())
                .fullname(info.getFullname())
                .email(info.getEmail())
                .dob(info.getDob())
                .city(info.getCity())
                .avatarUrl(info.getAvatarUrl())
                .build());
        }

        // Sort userIds để tạo hash ổn định
        List<String> sortedIds = allUserIds.stream()
            .sorted()
            .toList();

        String participantsHash = generateParticipantHash(sortedIds);

        // Tìm conversation đã tồn tại
        var conversation = conversationRepository
            .findByParticipantsHash(participantsHash)
            .orElseGet(() -> {
                String type = participants.size() == 2 ? "DIRECT" : "GROUP";
                String conversationName = null; // Khởi tạo null
                log.info("ConversationName from request: {}", request.getConversationName());

                if ("GROUP".equals(type)) {
                    if (request.getConversationName() != null && !request.getConversationName().trim().isEmpty()) {
                        // Nếu là GROUP và request có conversationName
                        conversationName = request.getConversationName().trim();
                        log.info("Set conversationName from request: {}", conversationName);
                    } else {
                        // Nếu là GROUP và request không có conversationName, tạo tên từ fullname
                        conversationName = participants.stream()
                            .map(ParticipantInfo::getFullname)
                            .collect(Collectors.joining(", "));
                    }
                }

                Conversation newConversation = Conversation.builder()
                    .type(type)
                    .conversationName(conversationName)
                    .participantsHash(participantsHash)
                    .participants(participants)
                    .createdDate(Instant.now())
                    .modifiedDate(Instant.now())
                    .build();

                return conversationRepository.save(newConversation);
            });

        return toConversationResponse(conversation);
    }

    private String generateParticipantHash(List<String> ids) {
        StringJoiner stringJoiner = new StringJoiner("_");
        ids.forEach(stringJoiner::add);

        return stringJoiner.toString();
    }

//    private ConversationResponse toConversationResponse(Conversation conversation) {
//        String currentUserId = SecurityContextHolder.getContext().getAuthentication().getName();
//
//        ConversationResponse conversationResponse = conversationMapper.toConversationResponse(
//            conversation);
//
//        conversation.getParticipants().stream()
//            // Lọc participantInfo để lấy thông tin của người dùng kia trong conversation
//            .filter(participantInfo -> !participantInfo.getUserId().equals(currentUserId))
//            .findFirst().ifPresent(participantInfo -> {
//                conversationResponse.setConversationName(participantInfo.getFullname());
//                conversationResponse.setConversationAvatar(participantInfo.getAvatarUrl());
//            });
//
//        return conversationResponse;
//    }

    private ConversationResponse toConversationResponse(Conversation conversation) {
        String currentUserId = SecurityContextHolder.getContext().getAuthentication().getName();

        ConversationResponse conversationResponse = conversationMapper.toConversationResponse(
            conversation);

        // 1. Mặc định set tên từ entity (sẽ là null cho DIRECT, hoặc tên đã set cho GROUP)
        conversationResponse.setConversationName(conversation.getConversationName());

        // 2. Nếu là DIRECT, GHI ĐÈ tên bằng tên người đối diện
        if ("DIRECT".equals(conversation.getType())) {
            conversation.getParticipants().stream()
                // Lọc participantInfo để lấy thông tin của người dùng kia trong conversation
                .filter(participantInfo -> !participantInfo.getUserId().equals(currentUserId))
                .findFirst().ifPresent(participantInfo -> {
                    conversationResponse.setConversationName(participantInfo.getFullname());
                    conversationResponse.setConversationAvatar(participantInfo.getAvatarUrl());
                });
        } else if ("GROUP".equals(conversation.getType())) {
            // Tùy chọn: Set avatar cho GROUP nếu cần (ví dụ: một avatar mặc định)
            // Hiện tại, avatar sẽ là null trừ khi bạn có logic set riêng
            log.info("GROUP Conversation Name for response: {}", conversationResponse.getConversationName());
            if (conversation.getConversationName() == null) {
                // Trường hợp không nên xảy ra với logic mới, nhưng là một biện pháp an toàn.
                // Nếu tên GROUP vẫn là null, hãy set tên dựa trên danh sách người tham gia
                String groupName = conversation.getParticipants().stream()
                    .map(ParticipantInfo::getFullname)
                    .collect(Collectors.joining(", "));
                conversationResponse.setConversationName(groupName);
            }
            // Giữ nguyên logic set avatar nếu có. Nếu không, avatar sẽ là null
            //conversationResponse.setConversationAvatar(conversation.getAvatarUrl()); // Giả sử entity có field này
        }

        return conversationResponse;
    }
}
