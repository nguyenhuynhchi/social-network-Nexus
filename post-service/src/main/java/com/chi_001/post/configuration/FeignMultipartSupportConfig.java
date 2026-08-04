package com.chi_001.post.configuration;

import feign.RequestInterceptor;
import feign.RequestTemplate;
import feign.codec.Encoder;
import jakarta.servlet.http.HttpServletRequest;
import feign.form.spring.SpringFormEncoder;
import org.springframework.beans.factory.ObjectFactory;
import org.springframework.boot.autoconfigure.http.HttpMessageConverters;
import org.springframework.cloud.openfeign.support.SpringEncoder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Configuration
public class FeignMultipartSupportConfig {

//    @Bean
//    public SpringFormEncoder feignFormEncoder() {
//        return new SpringFormEncoder();
//    }

    @Bean
    public Encoder feignEncoder(ObjectFactory<HttpMessageConverters> converters) {
        return new SpringEncoder(converters);
    }

    @Bean
    public RequestInterceptor requestInterceptor() {
        return new RequestInterceptor() {
            @Override
            public void apply(RequestTemplate template) {
                ServletRequestAttributes attributes =
                    (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();

                if (attributes != null) {
                    HttpServletRequest request = attributes.getRequest();
                    String authHeader = request.getHeader("Authorization");

                    if (authHeader != null && !authHeader.isBlank()) {
                        template.header("Authorization", authHeader);
                    }
                }
            }
        };
    }
}
