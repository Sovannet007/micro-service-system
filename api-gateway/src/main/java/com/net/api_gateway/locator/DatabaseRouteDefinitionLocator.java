package com.net.api_gateway.locator;

import com.net.api_gateway.entity.GatewayRoute;
import com.net.api_gateway.entity.GatewayRateLimitPolicy;
import com.net.api_gateway.repository.GatewayRateLimitPolicyRepository;
import com.net.api_gateway.repository.GatewayRouteRepository;
import org.springframework.cloud.gateway.filter.FilterDefinition;
import org.springframework.cloud.gateway.handler.predicate.PredicateDefinition;
import org.springframework.cloud.gateway.route.RouteDefinition;
import org.springframework.cloud.gateway.route.RouteDefinitionLocator;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Flux;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.net.URI;

@Component
public class DatabaseRouteDefinitionLocator implements RouteDefinitionLocator {

    private final GatewayRouteRepository repository;
    private final GatewayRateLimitPolicyRepository rateLimitRepository;

    public DatabaseRouteDefinitionLocator(GatewayRouteRepository repository,GatewayRateLimitPolicyRepository rateLimitRepository)
    {
        this.repository = repository;
        this.rateLimitRepository = rateLimitRepository;
    }

    @Override
    public Flux<RouteDefinition> getRouteDefinitions() {
        return repository.findByEnabledTrueOrderByRouteOrderAsc()
                .flatMap(route ->
                        rateLimitRepository.findByGatewayRouteIdAndIsActiveTrue(route.getId())
                                .map(policy -> toRouteDefinition(route, policy))
                                .defaultIfEmpty(toRouteDefinition(route,null))
                );
    }

    private RouteDefinition toRouteDefinition(GatewayRoute route, GatewayRateLimitPolicy policy) {

        RouteDefinition definition = new RouteDefinition();

        definition.setId(route.getRouteId());
        definition.setUri(URI.create(route.getUri()));
        definition.setOrder(route.getRouteOrder());

        PredicateDefinition predicate = new PredicateDefinition();
        predicate.setName("Path");
        predicate.addArg("_genkey_0", route.getPathPattern());

        definition.setPredicates(List.of(predicate));

        List<FilterDefinition> filters = new ArrayList<>();

        if (route.getStripPrefix() != null && route.getStripPrefix() > 0) {
            FilterDefinition stripPrefix = new FilterDefinition();
            stripPrefix.setName("StripPrefix");
            stripPrefix.addArg("_genkey_0", String.valueOf(route.getStripPrefix()));
            filters.add(stripPrefix);
        }

        Map<String, Object> metadata = new HashMap<>();

        if (policy != null) {

            FilterDefinition rateLimiter = new FilterDefinition();
            rateLimiter.setName("RequestRateLimiter");

            rateLimiter.addArg("key-resolver", "#{@ipKeyResolver}");
            rateLimiter.addArg(
                    "redis-rate-limiter.replenishRate",
                    String.valueOf(policy.getReplenishRate())
            );
            rateLimiter.addArg(
                    "redis-rate-limiter.burstCapacity",
                    String.valueOf(policy.getBurstCapacity())
            );
            rateLimiter.addArg(
                    "redis-rate-limiter.requestedTokens",
                    String.valueOf(policy.getRequestedTokens())
            );

            filters.add(rateLimiter);

            FilterDefinition passedFilter = new FilterDefinition();
            passedFilter.setName("RateLimitPassed");
            filters.add(passedFilter);

            metadata.put("rateLimitPolicyVersion", policy.getPolicyVersion());
            metadata.put(
                    "tempBlockEnabled",
                    Boolean.TRUE.equals(policy.getTempBlockEnabled())
            );
            metadata.put(
                    "blockDurationSeconds",
                    policy.getBlockDurationSeconds()
            );
        }

        definition.setFilters(filters);
        definition.setMetadata(metadata);

        return definition;
    }
}