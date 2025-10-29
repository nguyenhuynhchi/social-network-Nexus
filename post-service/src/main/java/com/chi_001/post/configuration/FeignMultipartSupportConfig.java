package com.chi_001.post.configuration;

import feign.form.spring.SpringFormEncoder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class FeignMultipartSupportConfig {

    @Bean
    public SpringFormEncoder feignFormEncoder() {
        return new SpringFormEncoder();
    }
}
