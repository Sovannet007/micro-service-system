package com.net.api_gateway.repository;

import com.net.api_gateway.entity.UserSessionDevice;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Mono;

public interface UserSessionDeviceRepository
        extends ReactiveCrudRepository<UserSessionDevice, Long> {

    Mono<UserSessionDevice> findByKeycloakSessionId(
            String sessionId
    );

    Mono<Void> deleteByKeycloakSessionId(
            String sessionId
    );
}