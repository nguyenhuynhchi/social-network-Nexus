package com.chi_001.cloudinary.controller;

import com.chi_001.cloudinary.dto.ApiResponse;
import com.chi_001.cloudinary.dto.response.UploadFileResponse;
import com.chi_001.cloudinary.exception.AppException;
import com.chi_001.cloudinary.exception.ErrorCode;
import com.chi_001.cloudinary.service.CloudinaryService;
import java.io.IOException;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/upload")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UploadController {

    CloudinaryService cloudinaryService;

    @PostMapping
    public ApiResponse<UploadFileResponse> uploadFile(@RequestParam("file") MultipartFile file)
        throws IOException {
        if (file.isEmpty()) {
            throw new AppException(ErrorCode.FILE_IS_EMPTY);
        } else {
            return ApiResponse.<UploadFileResponse>builder()
                .result(cloudinaryService.uploadFile(file))
                .build();
        }

    }
}
