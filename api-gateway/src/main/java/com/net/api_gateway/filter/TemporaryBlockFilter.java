package com.net.api_gateway.filter;

import com.net.api_gateway.service.GatewaySecurityEventService;
import com.net.api_gateway.service.RedisBlockService;
import com.net.api_gateway.util.ClientIpResolver;
import lombok.RequiredArgsConstructor;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.cloud.gateway.route.Route;
import org.springframework.core.Ordered;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import static org.springframework.cloud.gateway.support.ServerWebExchangeUtils.GATEWAY_ROUTE_ATTR;

@Component
@RequiredArgsConstructor
public class TemporaryBlockFilter
        implements GlobalFilter, Ordered {

    private final RedisBlockService redisBlockService;

    private final ClientIpResolver clientIpResolver;

    // ADD THIS
    private final GatewaySecurityEventService securityEventService;

    @Override
    public Mono<Void> filter(
            ServerWebExchange exchange,
            GatewayFilterChain chain) {

        Route route =
                exchange.getAttribute(
                        GATEWAY_ROUTE_ATTR
                );

        if (route == null) {
            return chain.filter(exchange);
        }

        Object enabledValue =
                route.getMetadata()
                        .get("tempBlockEnabled");

        if (!Boolean.TRUE.equals(enabledValue)) {
            return chain.filter(exchange);
        }

        Object durationValue =
                route.getMetadata()
                        .get("blockDurationSeconds");

        int blockDuration = 60;

        if (durationValue instanceof Number number) {
            blockDuration = number.intValue();
        }

        String routeId =
                route.getId();

        String ip =
                clientIpResolver.resolve(exchange);

        int finalBlockDuration =
                blockDuration;

        return redisBlockService
                .getRemainingSeconds(
                        routeId,
                        ip
                )
                .flatMap(remainingSeconds -> {

                    /*
                     * ==================================
                     * ALREADY TEMPORARILY BLOCKED
                     * ==================================
                     */
                    if (remainingSeconds > 0) {

                        exchange
                                .getResponse()
                                .setStatusCode(
                                        HttpStatus.TOO_MANY_REQUESTS
                                );

                        exchange
                                .getResponse()
                                .getHeaders()
                                .set(
                                        "Retry-After",
                                        String.valueOf(
                                                remainingSeconds
                                        )
                                );

                        /*
                         * SAVE TEMP_BLOCK_HIT
                         * TO POSTGRESQL
                         */
                        return securityEventService
                                .recordTemporaryBlockHit(
                                        exchange,
                                        route,
                                        ip,
                                        remainingSeconds
                                )
                                .onErrorResume(error -> {

                                    /*
                                     * Database logging must not
                                     * stop rate-limit protection.
                                     */
                                    System.err.println(
                                            "Could not save TEMP_BLOCK_HIT: "
                                                    + error.getMessage()
                                    );

                                    return Mono.empty();
                                })
                                .then(
                                        exchange
                                                .getResponse()
                                                .setComplete()
                                );
                    }

                    /*
                     * ==================================
                     * NOT BLOCKED YET
                     * ==================================
                     */
                    return chain
                            .filter(exchange)
                            .then(
                                    Mono.defer(() -> {

                                        boolean rateLimitPassed =
                                                Boolean.TRUE.equals(
                                                        exchange.getAttribute(
                                                                RateLimitPassedGatewayFilterFactory
                                                                        .RATE_LIMIT_PASSED_ATTR
                                                        )
                                                );

                                        var status =
                                                exchange
                                                        .getResponse()
                                                        .getStatusCode();

                                        /*
                                         * RequestRateLimiter rejected:
                                         *
                                         * status = 429
                                         * AND
                                         * RateLimitPassed was not executed.
                                         */
                                        boolean rateLimiterRejected =
                                                status != null
                                                        && status.value() == 429
                                                        && !rateLimitPassed;

                                        if (!rateLimiterRejected) {
                                            return Mono.empty();
                                        }

                                        System.out.println(
                                                "RATE LIMIT EXCEEDED"
                                                        + " route="
                                                        + routeId
                                                        + " ip="
                                                        + ip
                                        );

                                        /*
                                         * ==================================
                                         * STEP 1
                                         * SAVE RATE_LIMIT_EXCEEDED
                                         * ==================================
                                         */
                                        Mono<Void> saveExceeded =
                                                securityEventService
                                                        .recordRateLimitExceeded(
                                                                exchange,
                                                                route,
                                                                ip
                                                        )
                                                        .onErrorResume(error -> {

                                                            System.err.println(
                                                                    "Could not save RATE_LIMIT_EXCEEDED: "
                                                                            + error.getMessage()
                                                            );

                                                            return Mono.empty();
                                                        });

                                        /*
                                         * ==================================
                                         * STEP 2
                                         * CREATE REDIS TEMP BLOCK
                                         * ==================================
                                         */
                                        Mono<Void> createBlock =
                                                redisBlockService
                                                        .block(
                                                                routeId,
                                                                ip,
                                                                finalBlockDuration
                                                        )
                                                        .flatMap(created -> {

                                                            if (!Boolean.TRUE.equals(
                                                                    created)) {

                                                                return Mono.<Void>empty();
                                                            }

                                                            /*
                                                             * ==================================
                                                             * STEP 3
                                                             * SAVE TEMP_BLOCK_CREATED
                                                             * ==================================
                                                             */
                                                            return securityEventService
                                                                    .recordTemporaryBlockCreated(
                                                                            exchange,
                                                                            route,
                                                                            ip,
                                                                            finalBlockDuration
                                                                    )
                                                                    .onErrorResume(error -> {

                                                                        System.err.println(
                                                                                "Could not save TEMP_BLOCK_CREATED: "
                                                                                        + error.getMessage()
                                                                        );

                                                                        return Mono.empty();
                                                                    });
                                                        });

                                        /*
                                         * IMPORTANT:
                                         *
                                         * These Monos must be part of
                                         * the reactive chain.
                                         *
                                         * Otherwise repository.save()
                                         * will never execute.
                                         */
                                        return saveExceeded
                                                .then(createBlock);
                                    })
                            );
                });
    }

    @Override
    public int getOrder() {
        return -100;
    }
}