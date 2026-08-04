package com.chi_001.notification.service;

import com.chi_001.notification.dto.request.EmailRequest;
import com.chi_001.notification.dto.request.SendEmailRequest;
import com.chi_001.notification.dto.request.Sender;
import com.chi_001.notification.dto.response.EmailResponse;
import com.chi_001.notification.exception.AppException;
import com.chi_001.notification.exception.ErrorCode;
import com.chi_001.notification.repository.httpclient.EmailClient;
import feign.FeignException;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class EmailService {
    EmailClient emailClient;

    @Value("${notification.email.brevo-apikey}")
    @NonFinal
    String apiKey;

    public EmailResponse sendEmail(SendEmailRequest request) {
        EmailRequest emailRequest = EmailRequest.builder()
                .sender(Sender.builder()
                        .name("Nexus Community")
                        .email("huynhchi0904@gmail.com")
                        .build())
                .to(List.of(request.getTo()))
                .subject(request.getSubject())
                .htmlContent(request.getHtmlContent())
                .build();
        try {
            return emailClient.sendEmail(apiKey, emailRequest);
        } catch (FeignException e){
            System.err.println("Feign Error Body: " + e.contentUTF8()); 
            System.err.println("Feign Status: " + e.status());
            throw new AppException(ErrorCode.CANNOT_SEND_EMAIL);
        }
    }
}
