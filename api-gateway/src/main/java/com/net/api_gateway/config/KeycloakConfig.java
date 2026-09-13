package com.net.api_gateway.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;


@Data
@Configuration
@ConfigurationProperties(prefix = "keycloak")
public class KeycloakConfig {
    private String serverUrl;
    private String realm;

    // login client
    private String clientId;
    private String clientSecret;

    // admin service client
    private String adminClientId;
    private String adminClientSecret;
}