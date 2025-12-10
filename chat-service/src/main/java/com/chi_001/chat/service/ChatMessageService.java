package com.chi_001.chat.service;

import com.corundumstudio.socketio.SocketIOServer;
import com.chi_001.chat.dto.request.ChatMessageRequest;
import com.chi_001.chat.dto.response.ChatMessageResponse;
import com.chi_001.chat.entity.ChatMessage;
import com.chi_001.chat.entity.ParticipantInfo;
import com.chi_001.chat.entity.WebSocketSession;
import com.chi_001.chat.exception.AppException;
import com.chi_001.chat.exception.ErrorCode;
import com.chi_001.chat.mapper.ChatMessageMapper;
import com.chi_001.chat.repository.ChatMessageRepository;
import com.chi_001.chat.repository.ConversationRepository;
import com.chi_001.chat.repository.WebSocketSessionRepository;
import com.chi_001.chat.repository.httpclient.ProfileClient;
import com.corundumstudio.socketio.annotation.OnEvent;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ChatMessageService {

    SocketIOServer socketIOServer;

    ChatMessageRepository chatMessageRepository;
    ConversationRepository conversationRepository;
    WebSocketSessionRepository webSocketSessionRepository;
    ProfileClient profileClient;

    ObjectMapper objectMapper;
    ChatMessageMapper chatMessageMapper;

    public List<ChatMessageResponse> getMessages(String conversationId) {
        // Validate conversationId
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        conversationRepository.findById(conversationId)
            .orElseThrow(() -> new AppException(ErrorCode.CONVERSATION_NOT_FOUND))
            .getParticipants()
            .stream()
            .filter(participantInfo -> userId.equals(participantInfo.getUserId()))
            .findAny()
            .orElseThrow(() -> new AppException(ErrorCode.CONVERSATION_NOT_FOUND));

        var messages = chatMessageRepository.findAllByConversationIdOrderByCreatedDateDesc(conversationId);

        return messages.stream().map(this::toChatMessageResponse).toList();
    }

    @OnEvent("message")
    public ChatMessageResponse create(ChatMessageRequest request) throws JsonProcessingException {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        // Validate conversationId
        var conversation = conversationRepository.findById(request.getConversationId())
            .orElseThrow(() -> new AppException(ErrorCode.CONVERSATION_NOT_FOUND));

        conversation.getParticipants()
            .stream()
            .filter(participantInfo -> userId.equals(participantInfo.getUserId()))
            .findAny()
            .orElseThrow(() -> new AppException(ErrorCode.CONVERSATION_NOT_FOUND));

        // Get UserInfo from ProfileService
        var userResponse = profileClient.getProfile(userId);
        if (Objects.isNull(userResponse)) {
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
        }
        var userInfo = userResponse.getResult();

        // Build Chat message Info
        ChatMessage chatMessage = chatMessageMapper.toChatMessage(request);
        chatMessage.setSender(ParticipantInfo.builder()
                .userId(userInfo.getUserId())
                .username(userInfo.getUsername())
                .email(userInfo.getEmail())
                .fullname(userInfo.getFullname())
                .city(userInfo.getCity())
                .dob(userInfo.getDob())
                .avatarUrl(userInfo.getAvatarUrl())
            .build());
        chatMessage.setCreatedDate(Instant.now());

        // Create chat message
        chatMessage = chatMessageRepository.save(chatMessage);

        // Publish socket event to clients is conversation
        // Get participants userIds;
        List<String> userIds = conversation.getParticipants().stream()
            .map(ParticipantInfo::getUserId).toList();

        Map<String, WebSocketSession> webSocketSessions =
            webSocketSessionRepository
                .findAllByUserIdIn(userIds).stream()
                .collect(Collectors.toMap(
                    WebSocketSession::getSocketSessionId,
                    Function.identity()));

        ChatMessageResponse chatMessageResponse = chatMessageMapper.toChatMessageResponse(chatMessage);
        socketIOServer.getAllClients().forEach(client -> {
            var webSocketSession = webSocketSessions.get(client.getSessionId().toString());

            if (Objects.nonNull(webSocketSession)) {
                String message = null;
                try {
                    chatMessageResponse.setMe(webSocketSession.getUserId().equals(userId));
                    message = objectMapper.writeValueAsString(chatMessageResponse);
                    client.sendEvent("message", message);
                } catch (JsonProcessingException e) {
                    throw new RuntimeException(e);
                }
            }
        });

        // convert to Response
        return toChatMessageResponse(chatMessage);
    }

    private ChatMessageResponse toChatMessageResponse(ChatMessage chatMessage) {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        var chatMessageResponse = chatMessageMapper.toChatMessageResponse(chatMessage);

        chatMessageResponse.setMe(userId.equals(chatMessage.getSender().getUserId()));

        return chatMessageResponse;
    }
}
