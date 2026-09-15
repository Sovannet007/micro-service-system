package com.net.api_gateway.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SessionDeviceInfo {

    private String ipAddress;

    private String userAgent;

    private String deviceType;

    private String platform;

    private String browser;
}