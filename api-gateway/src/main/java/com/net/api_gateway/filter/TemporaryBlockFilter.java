package com.net.api_gateway.filter;

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
public class TemporaryBlockFilter implements GlobalFilter, Ordered {

    private final RedisBlockService redisBlockService;
    private final ClientIpResolver clientIpResolver;

    @Override
    public Mono<Void> filter(ServerWebExchange exchange,GatewayFilterChain chain) {
        Route route = exchange.getAttribute(GATEWAY_ROUTE_ATTR);
        if (route == null) return chain.filter(exchange);

        Boolean tempBlockEnabled = (Boolean) route.getMetadata().get("tempBlockEnabled");
        Number durationValue = (Number) route.getMetadata().get("blockDurationSeconds");
        int blockDuration = durationValue == null ? 60 : durationValue.intValue();

        if (!Boolean.TRUE.equals(tempBlockEnabled)) return chain.filter(exchange);

        String routeId = route.getId();
        String ip = clientIpResolver.resolve(exchange);
        return redisBlockService
                .getRemainingSeconds(routeId, ip)
                .flatMap(remainingSeconds -> {
                    if (remainingSeconds > 0) {
                        exchange.getResponse()
                                .setStatusCode(HttpStatus.TOO_MANY_REQUESTS);
                        exchange.getResponse()
                                .getHeaders()
                                .set("Retry-After",
                                        String.valueOf(remainingSeconds));
                        return exchange.getResponse().setComplete();
                    }

                    return chain.filter(exchange)
                            .then(Mono.defer(() -> {
                                boolean rateLimitPassed =
                                        Boolean.TRUE.equals(
                                                exchange.getAttribute(
                                                        RateLimitPassedGatewayFilterFactory
                                                                .RATE_LIMIT_PASSED_ATTR
                                                )
                                        );
                                var status = exchange.getResponse().getStatusCode();
                                boolean rateLimiterRejected = status != null && status.value() == 429 && !rateLimitPassed;

                                if (!rateLimiterRejected) return Mono.empty();
                                return redisBlockService
                                        .block(routeId,ip,blockDuration)
                                        .then();
                            }));
                });
    }

    @Override
    public int getOrder() {
        return -100;
    }
}