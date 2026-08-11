package com.net.api_gateway.repository;

import com.net.api_gateway.entity.GatewayRateLimitPolicy;
import org.springframework.data.r2dbc.repository.Modifying;
import org.springframework.data.r2dbc.repository.Query;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface GatewayRateLimitPolicyRepository extends ReactiveCrudRepository<GatewayRateLimitPolicy, Long> {

    Mono<GatewayRateLimitPolicy> findByGatewayRouteIdAndIsActiveTrue(Long gatewayRouteId);

    Flux<GatewayRateLimitPolicy> findByGatewayRouteIdOrderByPolicyVersionDesc(Long gatewayRouteId);

    Mono<GatewayRateLimitPolicy> findTopByGatewayRouteIdOrderByPolicyVersionDesc(Long gatewayRouteId);

    @Modifying
    @Query("""
        UPDATE gateway_rate_limit_policies
        SET is_active = FALSE
        WHERE gateway_route_id = :gatewayRouteId
        AND is_active = TRUE
    """)
    Mono<Integer> deactivateActivePolicy(Long gatewayRouteId);
}