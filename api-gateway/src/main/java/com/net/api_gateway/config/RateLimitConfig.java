package com.net.api_gateway.config;

import com.net.api_gateway.util.ClientIpResolver;
import org.springframework.cloud.gateway.filter.ratelimit.KeyResolver;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import reactor.core.publisher.Mono;

@Configuration
public class RateLimitConfig {

    @Bean
    public KeyResolver ipKeyResolver(ClientIpResolver clientIpResolver) {
        return exchange -> Mono.just(clientIpResolver.resolve(exchange));
    }
}