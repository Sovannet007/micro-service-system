package com.net.api_gateway.locator;

import com.net.api_gateway.entity.GatewayRoute;
import com.net.api_gateway.repository.GatewayRouteRepository;
import org.springframework.cloud.gateway.filter.FilterDefinition;
import org.springframework.cloud.gateway.handler.predicate.PredicateDefinition;
import org.springframework.cloud.gateway.route.RouteDefinition;
import org.springframework.cloud.gateway.route.RouteDefinitionLocator;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Flux;

import java.net.URI;
import java.util.List;

@Component
public class DatabaseRouteDefinitionLocator implements RouteDefinitionLocator {

    private final GatewayRouteRepository repository;

    public DatabaseRouteDefinitionLocator(GatewayRouteRepository repository) {
        this.repository = repository;
    }

    @Override
    public Flux<RouteDefinition> getRouteDefinitions() {
        return repository.findByEnabledTrueOrderByRouteOrderAsc()
                .map(this::toRouteDefinition);
    }

    private RouteDefinition toRouteDefinition(GatewayRoute route) {
        RouteDefinition definition = new RouteDefinition();

        definition.setId(route.getRouteId());
        definition.setUri(URI.create(route.getUri()));
        definition.setOrder(route.getRouteOrder());

        PredicateDefinition predicate = new PredicateDefinition();
        predicate.setName("Path");
        predicate.addArg("_genkey_0", route.getPathPattern());

        definition.setPredicates(List.of(predicate));

        if (route.getStripPrefix() != null && route.getStripPrefix() > 0) {
            FilterDefinition filter = new FilterDefinition();
            filter.setName("StripPrefix");
            filter.addArg("_genkey_0", String.valueOf(route.getStripPrefix()));

            definition.setFilters(List.of(filter));
        }

        return definition;
    }
}