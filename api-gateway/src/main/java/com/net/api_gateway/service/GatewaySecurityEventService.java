package com.net.api_gateway.service;

import com.net.api_gateway.entity.GatewaySecurityEvent;
import com.net.api_gateway.repository.GatewaySecurityEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.route.Route;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class GatewaySecurityEventService {

    private static final String RATE_LIMIT_EXCEEDED =
            "RATE_LIMIT_EXCEEDED";

    private static final String TEMP_BLOCK_CREATED =
            "TEMP_BLOCK_CREATED";

    private static final String TEMP_BLOCK_HIT =
            "TEMP_BLOCK_HIT";

    private final GatewaySecurityEventRepository repository;

    public Mono<Void> recordRateLimitExceeded(
            ServerWebExchange exchange,
            Route route,
            String ip) {

        GatewaySecurityEvent event =
                createBaseEvent(
                        RATE_LIMIT_EXCEEDED,
                        exchange,
                        route,
                        ip
                );

        event.setHttpStatus(429);

        return save(event);
    }

    public Mono<Void> recordTemporaryBlockCreated(
            ServerWebExchange exchange,
            Route route,
            String ip,
            int blockDurationSeconds) {

        GatewaySecurityEvent event =
                createBaseEvent(
                        TEMP_BLOCK_CREATED,
                        exchange,
                        route,
                        ip
                );

        event.setHttpStatus(429);
        event.setBlockDurationSeconds(
                blockDurationSeconds
        );

        return save(event);
    }

    public Mono<Void> recordTemporaryBlockHit(
            ServerWebExchange exchange,
            Route route,
            String ip,
            long remainingSeconds) {

        GatewaySecurityEvent event =
                createBaseEvent(
                        TEMP_BLOCK_HIT,
                        exchange,
                        route,
                        ip
                );

        event.setHttpStatus(429);
        event.setRemainingSeconds(
                remainingSeconds
        );

        return save(event);
    }

    private GatewaySecurityEvent createBaseEvent(
            String eventType,
            ServerWebExchange exchange,
            Route route,
            String ip) {

        GatewaySecurityEvent event =
                new GatewaySecurityEvent();

        event.setEventType(eventType);

        event.setRuntimeRouteId(
                route.getId()
        );

        Object parentRouteId =
                route.getMetadata()
                        .get("parentRouteId");

        if (parentRouteId != null) {
            event.setGatewayRouteId(
                    parentRouteId.toString()
            );
        }

        Object ruleId =
                route.getMetadata()
                        .get("rateLimitRuleId");

        if (ruleId instanceof Number number) {
            event.setRateLimitRuleId(
                    number.longValue()
            );
        }

        event.setHttpMethod(
                exchange.getRequest()
                        .getMethod()
                        .name()
        );

        event.setPath(
                exchange.getRequest()
                        .getURI()
                        .getPath()
        );

        event.setClientIp(ip);

        event.setCreatedAt(
                LocalDateTime.now()
        );

        return event;
    }

    private Mono<Void> save(GatewaySecurityEvent event) {

        return repository
                .save(event)
                .doOnError(error ->
                        log.error(
                                "Failed to save gateway security event type={} route={} path={}",
                                event.getEventType(),
                                event.getRuntimeRouteId(),
                                event.getPath(),
                                error
                        )
                )
                .then();
    }
}