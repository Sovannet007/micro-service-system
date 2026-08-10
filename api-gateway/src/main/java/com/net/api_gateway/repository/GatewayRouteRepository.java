package com.net.api_gateway.repository;

import com.net.api_gateway.entity.GatewayRoute;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface GatewayRouteRepository extends ReactiveCrudRepository<GatewayRoute, Long> {

    Flux<GatewayRoute> findByEnabledTrueOrderByRouteOrderAsc();

    Mono<Boolean> existsByRouteId(String routeId);
}