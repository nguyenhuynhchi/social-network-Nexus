package com.chi_001.chat.controller;

import com.chi_001.chat.dto.ApiResponse;

import com.chi_001.chat.dto.request.ConversationRequest;
import com.chi_001.chat.dto.response.ConversationResponse;
import com.chi_001.chat.service.ConversationService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("conversations")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ConversationController {

    ConversationService conversationService;

    @PostMapping("/create")
    ApiResponse<ConversationResponse> createConversation(
        @RequestBody @Valid ConversationRequest request) {
        return ApiResponse.<ConversationResponse>builder()
            .result(conversationService.create(request))
            .build();
    }

    @GetMapping("/my-conversations")
    ApiResponse<List<ConversationResponse>> myConversations() {
        return ApiResponse.<List<ConversationResponse>>builder()
            .result(conversationService.myConversations())
            .build();
    }
}

