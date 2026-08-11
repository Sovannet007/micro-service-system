package com.net.api_gateway.dto;

public record GatewayRateLimitPolicyRequest(
        Integer replenishRate,
        Integer burstCapacity,
        Integer requestedTokens,
        Boolean tempBlockEnabled,
        Integer blockDurationSeconds,
        String changeNote,
        String createdBy
) {
}