package com.chi_001.cloudinary.service;

import com.chi_001.cloudinary.dto.response.UploadFileResponse;
import com.chi_001.cloudinary.exception.AppException;
import com.chi_001.cloudinary.exception.ErrorCode;
import com.cloudinary.Cloudinary;
import java.util.HashMap;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class CloudinaryService {
    Cloudinary cloudinary;

    public UploadFileResponse uploadFile(MultipartFile file) throws IOException {



        String contentType = file.getContentType();
        String folder;
        log.info("File content type: {}", contentType);

        // Xác định thư mục theo loại file
        if (contentType != null) {
            if (contentType.startsWith("image/")) {
                folder = "images";
            } else if (contentType.startsWith("video/")) {
                folder = "videos";
            } else {
                folder = "others";
            }
        } else {
            folder = "others";
        }

        // "resource_type", "auto" sẽ tự động xác định file là ảnh, video, hay file thô
        Map<String, Object> options = new HashMap<>();
        options.put("resource_type", "auto");
        options.put("folder", folder);      // Chỉ định thư mục lưu trữ

        Map<?, ?> uploadResult = cloudinary.uploader().upload(file.getBytes(), options);

        return UploadFileResponse.builder()
                .fileUrl(uploadResult.get("url").toString())
                .build();
    }
}
