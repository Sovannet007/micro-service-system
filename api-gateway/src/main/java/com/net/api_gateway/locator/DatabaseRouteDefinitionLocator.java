package com.net.api_gateway.locator;

import com.net.api_gateway.entity.GatewayRateLimitRule;
import com.net.api_gateway.entity.GatewayRoute;
import com.net.api_gateway.repository.GatewayRateLimitRuleRepository;
import com.net.api_gateway.repository.GatewayRouteRepository;
import org.springframework.cloud.gateway.filter.FilterDefinition;
import org.springframework.cloud.gateway.handler.predicate.PredicateDefinition;
import org.springframework.cloud.gateway.route.RouteDefinition;
import org.springframework.cloud.gateway.route.RouteDefinitionLocator;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.net.URI;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
public class DatabaseRouteDefinitionLocator
        implements RouteDefinitionLocator {

    private final GatewayRouteRepository routeRepository;

    private final GatewayRateLimitRuleRepository
            rateLimitRuleRepository;

    public DatabaseRouteDefinitionLocator(
            GatewayRouteRepository routeRepository,
            GatewayRateLimitRuleRepository rateLimitRuleRepository) {

        this.routeRepository = routeRepository;
        this.rateLimitRuleRepository = rateLimitRuleRepository;
    }

    @Override
    public Flux<RouteDefinition> getRouteDefinitions() {

        return routeRepository
                .findByEnabledTrueOrderByRouteOrderAsc()
                .concatMap(route -> {

                    Flux<RouteDefinition> rateLimitedRoutes =
                            rateLimitRuleRepository
                                    .findByGatewayRouteIdAndIsActiveTrueOrderByRuleOrderAsc(
                                            route.getId()
                                    )
                                    .map(rule ->
                                            toRateLimitedRouteDefinition(
                                                    route,
                                                    rule
                                            )
                                    );

                    Mono<RouteDefinition> fallbackRoute =
                            Mono.fromSupplier(() ->
                                    toFallbackRouteDefinition(route)
                            );

                    return rateLimitedRoutes
                            .concatWith(fallbackRoute);
                });
    }

    private RouteDefinition toRateLimitedRouteDefinition(
            GatewayRoute route,
            GatewayRateLimitRule rule) {

        RouteDefinition definition =
                new RouteDefinition();

        /*
         * IMPORTANT:
         *
         * Each endpoint rule gets its own runtime route ID.
         *
         * Example:
         *
         * piisiit-api::rl::15
         *
         * Redis therefore tracks:
         *
         * route + IP
         *
         * separately for each endpoint.
         */
        definition.setId(
                route.getRouteId()
                        + "::rl::"
                        + rule.getId()
        );

        definition.setUri(
                URI.create(route.getUri())
        );

        definition.setOrder(
                rule.getRuleOrder() == null
                        ? -100
                        : rule.getRuleOrder()
        );

        /*
         * Predicate #1:
         *
         * Path must match the endpoint.
         */
        PredicateDefinition pathPredicate =
                new PredicateDefinition();

        pathPredicate.setName("Path");

        pathPredicate.addArg(
                "_genkey_0",
                rule.getPathPattern()
        );

        /*
         * Predicate #2:
         *
         * HTTP method must also match.
         *
         * Example:
         *
         * POST + /piisit/api/v2/user/login
         */
        PredicateDefinition methodPredicate =
                new PredicateDefinition();

        methodPredicate.setName("Method");

        methodPredicate.addArg(
                "_genkey_0",
                rule.getHttpMethod()
        );

        definition.setPredicates(
                List.of(
                        pathPredicate,
                        methodPredicate
                )
        );

        List<FilterDefinition> filters =
                new ArrayList<>();

        addStripPrefixFilter(
                route,
                filters
        );

        /*
         * Spring Redis RequestRateLimiter
         */
        FilterDefinition rateLimiter =
                new FilterDefinition();

        rateLimiter.setName(
                "RequestRateLimiter"
        );

        rateLimiter.addArg(
                "key-resolver",
                "#{@ipKeyResolver}"
        );

        rateLimiter.addArg(
                "redis-rate-limiter.replenishRate",
                String.valueOf(
                        rule.getReplenishRate()
                )
        );

        rateLimiter.addArg(
                "redis-rate-limiter.burstCapacity",
                String.valueOf(
                        rule.getBurstCapacity()
                )
        );

        rateLimiter.addArg(
                "redis-rate-limiter.requestedTokens",
                String.valueOf(
                        rule.getRequestedTokens()
                )
        );

        filters.add(rateLimiter);

        /*
         * Marker used by TemporaryBlockFilter
         * to know that the Spring limiter allowed
         * the request.
         */
        FilterDefinition passedFilter =
                new FilterDefinition();

        passedFilter.setName(
                "RateLimitPassed"
        );

        filters.add(passedFilter);

        definition.setFilters(filters);

        /*
         * Metadata consumed by TemporaryBlockFilter.
         */
        Map<String, Object> metadata =
                new HashMap<>();

        metadata.put(
                "rateLimitRuleId",
                rule.getId()
        );

        metadata.put(
                "rateLimitRuleVersion",
                rule.getRuleVersion()
        );

        metadata.put(
                "rateLimitRuleName",
                rule.getRuleName()
        );

        metadata.put(
                "rateLimitPath",
                rule.getPathPattern()
        );

        metadata.put(
                "rateLimitMethod",
                rule.getHttpMethod()
        );

        metadata.put(
                "parentRouteId",
                route.getRouteId()
        );

        metadata.put(
                "tempBlockEnabled",
                Boolean.TRUE.equals(
                        rule.getTempBlockEnabled()
                )
        );

        metadata.put(
                "blockDurationSeconds",
                rule.getBlockDurationSeconds()
        );

        definition.setMetadata(metadata);

        return definition;
    }

    /*
     * Normal service route.
     *
     * IMPORTANT:
     *
     * This route has NO RequestRateLimiter.
     *
     * It catches requests that do not match
     * an endpoint-specific rate-limit rule.
     */
    private RouteDefinition toFallbackRouteDefinition(
            GatewayRoute route) {

        RouteDefinition definition =
                new RouteDefinition();

        definition.setId(
                route.getRouteId()
        );

        definition.setUri(
                URI.create(route.getUri())
        );

        definition.setOrder(
                route.getRouteOrder()
        );

        PredicateDefinition predicate =
                new PredicateDefinition();

        predicate.setName("Path");

        predicate.addArg(
                "_genkey_0",
                route.getPathPattern()
        );

        definition.setPredicates(
                List.of(predicate)
        );

        List<FilterDefinition> filters =
                new ArrayList<>();

        addStripPrefixFilter(
                route,
                filters
        );

        definition.setFilters(filters);

        return definition;
    }

    private void addStripPrefixFilter(
            GatewayRoute route,
            List<FilterDefinition> filters) {

        if (route.getStripPrefix() == null ||
                route.getStripPrefix() <= 0) {

            return;
        }

        FilterDefinition stripPrefix =
                new FilterDefinition();

        stripPrefix.setName(
                "StripPrefix"
        );

        stripPrefix.addArg(
                "_genkey_0",
                String.valueOf(
                        route.getStripPrefix()
                )
        );

        filters.add(stripPrefix);
    }
}