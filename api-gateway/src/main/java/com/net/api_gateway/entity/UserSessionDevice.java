package com.net.api_gateway.entity;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

import java.time.Instant;

@Getter
@Setter
@Table("user_session_devices")
public class UserSessionDevice {

    @Id
    private Long id;

    private String keycloakSessionId;

    private String userId;

    private String username;

    private String ipAddress;

    private String userAgent;

    private String deviceType;

    private String platform;

    private String browser;

    private Instant createdAt;

    private Instant lastSeenAt;
}