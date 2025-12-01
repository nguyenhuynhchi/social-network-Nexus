<<<<<<<< HEAD:profile-service/src/main/java/com/chi_001/ProfileServiceApplication.java
package com.chi_001;
========
package com.chi_001.relationship;
>>>>>>>> 51aa692d1819e013c437e667ebd6b94ea967037a:profile-service/src/main/java/com/chi_001/relationship/ProfileServiceApplication.java

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients
public class ProfileServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(ProfileServiceApplication.class, args);
    }
}
