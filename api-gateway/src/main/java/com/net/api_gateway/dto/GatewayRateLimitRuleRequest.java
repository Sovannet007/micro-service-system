package com.net.api_gateway.dto;

public record GatewayRateLimitRuleRequest(

        Long gatewayRouteId,

        String ruleName,

        String pathPattern,

        String httpMethod,

        Integer replenishRate,

        Integer burstCapacity,

        Integer requestedTokens,

        Boolean tempBlockEnabled,

        Integer blockDurationSeconds,

        Integer ruleOrder,

        String changeNote,

        String createdBy
) {
}