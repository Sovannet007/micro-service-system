package com.net.api_gateway.dto;

import java.time.LocalDateTime;

public record GatewayRouteResponse(
        Long id,
        String routeId,
        String uri,
        String pathPattern,
        Integer stripPrefix,
        Integer routeOrder,
        Boolean enabled,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}