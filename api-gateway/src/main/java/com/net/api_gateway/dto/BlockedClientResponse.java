package com.net.api_gateway.dto;

public record BlockedClientResponse(
        String routeId,
        String ipAddress,
        Long remainingSeconds
) {
}