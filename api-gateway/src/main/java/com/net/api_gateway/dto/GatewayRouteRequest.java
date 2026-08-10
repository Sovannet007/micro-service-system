package com.net.api_gateway.dto;

public record GatewayRouteRequest(
        Long id,
        String routeId,
        String uri,
        String pathPattern,
        Integer stripPrefix,
        Integer routeOrder,
        Boolean enabled
) {
}