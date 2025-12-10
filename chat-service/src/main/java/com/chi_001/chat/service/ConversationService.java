package com.chi_001.chat.service;

import com.chi_001.chat.dto.request.ConversationRequest;
import com.chi_001.chat.dto.response.ConversationResponse;
import com.chi_001.chat.dto.response.UserProfileResponse;
import com.chi_001.chat.entity.Conversation;
import com.chi_001.chat.entity.ParticipantInfo;
import com.chi_001.chat.exception.AppException;
import com.chi_001.chat.exception.ErrorCode;
import com.chi_001.chat.mapper.ConversationMapper;
import com.chi_001.chat.repository.ConversationRepository;
import com.chi_001.chat.repository.httpclient.ProfileClient;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
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
        List<Conversation> conversations = conversationRepository.findAllByParticipantsHashContains(userId);


        return conversations.stream().map(this::toConversationResponse).toList();
    }

    public ConversationResponse create(ConversationRequest request) {
        // Fetch user infos
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        var userInfoResponse = profileClient.getProfile(userId);

        var participantInfoResponse = profileClient.getProfile(
            request.getParticipantIds().getFirst());

        if (Objects.isNull(userInfoResponse) || Objects.isNull(participantInfoResponse)) {
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
        }

        var userInfo = userInfoResponse.getResult();
        var participantInfo = participantInfoResponse.getResult();

        List<String> userIds = new ArrayList<>();
        userIds.add(userId);
        userIds.add(participantInfo.getUserId());

        var sortedIds = userIds.stream().sorted().toList();
        String userIdHash = generateParticipantHash(sortedIds);

        var conversation = conversationRepository.findByParticipantsHash(userIdHash)
            .orElseGet(() -> {
                List<ParticipantInfo> participantInfos = List.of(
                    ParticipantInfo.builder()
                        .userId(userInfo.getUserId())
                        .username(userInfo.getUsername())
                        .fullname(userInfo.getFullname())
                        .email(userInfo.getEmail())
                        .dob(userInfo.getDob())
                        .city(userInfo.getCity())
                        .avatarUrl(userInfo.getAvatarUrl())
                        .build(),
                    ParticipantInfo.builder()
                        .userId(participantInfo.getUserId())
                        .username(participantInfo.getUsername())
                        .fullname(participantInfo.getFullname())
                        .email(participantInfo.getEmail())
                        .dob(participantInfo.getDob())
                        .city(participantInfo.getCity())
                        .avatarUrl(participantInfo.getAvatarUrl())
                        .build()
                );

                // Build conversation info
                Conversation newConversation = Conversation.builder()
                    .type(request.getType())
                    .participantsHash(userIdHash)
                    .createdDate(Instant.now())
                    .modifiedDate(Instant.now())
                    .participants(participantInfos)
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

    private ConversationResponse toConversationResponse(Conversation conversation) {
        String currentUserId = SecurityContextHolder.getContext().getAuthentication().getName();

        ConversationResponse conversationResponse = conversationMapper.toConversationResponse(
            conversation);

        conversation.getParticipants().stream()
            // Lọc participantInfo để lấy thông tin của người dùng kia trong conversation
            .filter(participantInfo -> !participantInfo.getUserId().equals(currentUserId))
            .findFirst().ifPresent(participantInfo -> {
                conversationResponse.setConversationName(participantInfo.getFullname());
                conversationResponse.setConversationAvatar(participantInfo.getAvatarUrl());
            });

        return conversationResponse;
    }
}
