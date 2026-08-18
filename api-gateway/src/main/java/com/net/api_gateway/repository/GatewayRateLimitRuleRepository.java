package com.net.api_gateway.repository;

import com.net.api_gateway.entity.GatewayRateLimitRule;
import org.springframework.data.r2dbc.repository.Modifying;
import org.springframework.data.r2dbc.repository.Query;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface GatewayRateLimitRuleRepository
        extends ReactiveCrudRepository<GatewayRateLimitRule, Long> {

    Flux<GatewayRateLimitRule>
    findByGatewayRouteIdAndIsActiveTrueOrderByRuleOrderAsc(
            Long gatewayRouteId
    );

    Flux<GatewayRateLimitRule>
    findByGatewayRouteIdAndPathPatternAndHttpMethodOrderByRuleVersionDesc(
            Long gatewayRouteId,
            String pathPattern,
            String httpMethod
    );

    Mono<GatewayRateLimitRule>
    findFirstByGatewayRouteIdAndPathPatternAndHttpMethodOrderByRuleVersionDesc(
            Long gatewayRouteId,
            String pathPattern,
            String httpMethod
    );

    @Modifying
    @Query("""
        UPDATE gateway_rate_limit_rules
        SET is_active = FALSE
        WHERE gateway_route_id = :gatewayRouteId
          AND path_pattern = :pathPattern
          AND http_method = :httpMethod
          AND is_active = TRUE
    """)
    Mono<Integer> deactivateActiveRule(
            Long gatewayRouteId,
            String pathPattern,
            String httpMethod
    );

    @Modifying
    @Query("""
        UPDATE gateway_rate_limit_rules
        SET is_active = FALSE
        WHERE id = :id
          AND is_active = TRUE
    """)
    Mono<Integer> deactivateById(Long id);
}