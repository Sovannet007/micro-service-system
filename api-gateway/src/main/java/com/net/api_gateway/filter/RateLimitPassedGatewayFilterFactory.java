package com.net.api_gateway.filter;

import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.stereotype.Component;

@Component
public class RateLimitPassedGatewayFilterFactory extends AbstractGatewayFilterFactory<RateLimitPassedGatewayFilterFactory.Config> {

    public static final String RATE_LIMIT_PASSED_ATTR = "gatewayRateLimitPassed";

    public RateLimitPassedGatewayFilterFactory() {
        super(Config.class);
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            exchange.getAttributes().put(
                    RATE_LIMIT_PASSED_ATTR,
                    true
            );
            return chain.filter(exchange);
        };
    }

    public static class Config {}
}