package com.chi_001.post.controller;

import com.chi_001.post.dto.ApiResponse;
import com.chi_001.post.dto.PageResponse;
import com.chi_001.post.dto.request.PostRequest;
import com.chi_001.post.dto.response.PostResponse;
import com.chi_001.post.service.PostService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PostController {
    PostService postService;

//    @PostMapping(value = "/create", consumes = "multipart/form-data")
    @PostMapping("/create")
    ApiResponse<PostResponse> createPost(
        @RequestParam("content") PostRequest request,
        @RequestParam(value = "file",  required = false)MultipartFile file)
    {

        log.info("Content: {}", request.getContent());

        return ApiResponse.<PostResponse>builder()
                .result(postService.createPost(request, file))
                .build();
    }

    @GetMapping("/my-posts")
    ApiResponse<PageResponse<PostResponse>> myPosts(
            @RequestParam(value = "page", required = false, defaultValue = "1") int page,
            @RequestParam(value = "size", required = false, defaultValue = "10") int size
            ){
        return ApiResponse.<PageResponse<PostResponse>>builder()
                .result(postService.getMyPosts(page, size))
                .build();
    }

    @GetMapping("/friend-posts")
    ApiResponse<PageResponse<PostResponse>> friendsPosts(
            @RequestParam(value = "page", required = false, defaultValue = "1") int page,
            @RequestParam(value = "size", required = false, defaultValue = "10") int size
    ){
        return ApiResponse.<PageResponse<PostResponse>>builder()
                .result(postService.getPostsOfFriends(page, size))
                .build();
    }
}