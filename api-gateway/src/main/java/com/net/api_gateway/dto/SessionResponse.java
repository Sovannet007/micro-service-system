package com.net.api_gateway.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SessionResponse {

    private String id;

    private String ipAddress;

    private long lastAccess;

    private long started;

    private String userId;

    private String username;

    private String deviceType;

    private String platform;

    private String browser;
}