package com.net.api_gateway.repository;

import com.net.api_gateway.entity.GatewaySecurityEvent;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Flux;

public interface GatewaySecurityEventRepository
        extends ReactiveCrudRepository<GatewaySecurityEvent, Long> {

    Flux<GatewaySecurityEvent>
    findTop100ByOrderByCreatedAtDesc();
}