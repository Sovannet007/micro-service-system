package com.net.api_gateway.dto;

import java.time.LocalDateTime;

public record GatewayRateLimitRuleResponse(

        Long id,

        Long gatewayRouteId,

        String ruleName,

        String pathPattern,

        String httpMethod,

        Integer ruleVersion,

        Boolean isActive,

        String keyType,

        Integer replenishRate,

        Integer burstCapacity,

        Integer requestedTokens,

        Boolean tempBlockEnabled,

        Integer blockDurationSeconds,

        Integer ruleOrder,

        String changeNote,

        String createdBy,

        LocalDateTime createdAt
) {
}