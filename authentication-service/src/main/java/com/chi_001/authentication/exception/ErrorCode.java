package com.chi_001.authentication.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

import lombok.Getter;

@Getter
public enum ErrorCode {
    // Dịch tiếng việt giúp tôi trong message bên dưới
    UNCATEGORIZED_EXCEPTION(9999, "Uncategorized error", HttpStatus.INTERNAL_SERVER_ERROR),
    INVALID_KEY(1001, "Uncategorized error", HttpStatus.BAD_REQUEST),
    USER_EXISTED(1002, "Email đã được sử dụng", HttpStatus.BAD_REQUEST),
//    INVALID_USERNAME(1003, "Username must be at least {min} characters", HttpStatus.BAD_REQUEST),
//    INVALID_PASSWORD(1004, "Password must be at least {min} characters", HttpStatus.BAD_REQUEST),
    USER_NOT_EXISTED(1005, "Người dùng không tồn tại", HttpStatus.NOT_FOUND),
    UNAUTHENTICATED(1006, "Chưa xác thực", HttpStatus.UNAUTHORIZED),
    UNAUTHORIZED(1007, "Bạn không có quyền", HttpStatus.FORBIDDEN),
    INVALID_DOB(1008, "Tuổi của bạn phải ít nhất {min}", HttpStatus.BAD_REQUEST),
    INVALID_EMAIL(1009, "Địa chỉ Email không hợp lệ", HttpStatus.BAD_REQUEST),
    EMAIL_IS_REQUIRED(1009, "Email là bắt buộc", HttpStatus.BAD_REQUEST),
    FULLNAME_IS_REQUIRED(1010, "Họ tên là bắt buộc", HttpStatus.BAD_REQUEST),
    INVALID_FULLNAME(1011, "Họ tên phải ít nhất 3 ký tự và chỉ chứa chữ cái", HttpStatus.BAD_REQUEST)
    ;

    ErrorCode(int code, String message, HttpStatusCode statusCode) {
        this.code = code;
        this.message = message;
        this.statusCode = statusCode;
    }

    private final int code;
    private final String message;
    private final HttpStatusCode statusCode;
}
