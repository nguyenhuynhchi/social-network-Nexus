package com.chi_001.post.repository.httpclient;

import com.chi_001.post.configuration.FeignMultipartSupportConfig;
import com.chi_001.post.dto.ApiResponse;
import com.chi_001.post.dto.response.UploadFileResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.multipart.MultipartFile;

@FeignClient(
    name = "cloudinary-upload",
    url = "${app.services.cloudinary.url}",
    configuration = FeignMultipartSupportConfig.class
)
public interface CloudinaryClient {

    @PostMapping(value = "/upload", consumes = "multipart/form-data")
    ApiResponse<UploadFileResponse> uploadFile(@RequestPart("file") MultipartFile file);
}
