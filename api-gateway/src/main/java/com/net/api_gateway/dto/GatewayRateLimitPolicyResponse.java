package com.net.api_gateway.dto;

import java.time.LocalDateTime;

public record GatewayRateLimitPolicyResponse(
        Long id,
        Long gatewayRouteId,
        Integer policyVersion,
        Boolean isActive,
        String keyType,
        Integer replenishRate,
        Integer burstCapacity,
        Integer requestedTokens,
        Boolean tempBlockEnabled,
        Integer blockDurationSeconds,
        String changeNote,
        String createdBy,
        LocalDateTime createdAt
) {
}