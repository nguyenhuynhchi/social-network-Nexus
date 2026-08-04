package com.chi_001.chat.configuration;

import com.corundumstudio.socketio.SocketIOServer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SocketIOConfig {
    @Value("${CHAT_WEBSOCKET_PORT:8099}")
    private int websocketPort;

    @Bean
    public SocketIOServer socketIOServer() {
        com.corundumstudio.socketio.Configuration configuration = new com.corundumstudio.socketio.Configuration();
        configuration.setPort(websocketPort);
        configuration.setOrigin("*");

        return new SocketIOServer(configuration);
    }
}
