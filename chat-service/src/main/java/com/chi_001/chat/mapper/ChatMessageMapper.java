package com.chi_001.chat.mapper;

import com.chi_001.chat.dto.request.ChatMessageRequest;
import com.chi_001.chat.dto.response.ChatMessageResponse;
import com.chi_001.chat.entity.ChatMessage;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ChatMessageMapper {
    ChatMessageResponse toChatMessageResponse(ChatMessage chatMessage);

    ChatMessage toChatMessage(ChatMessageRequest request);

    List<ChatMessageResponse> toChatMessageResponses(List<ChatMessage> chatMessages);
}
