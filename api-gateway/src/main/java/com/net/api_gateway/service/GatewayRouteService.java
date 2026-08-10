package com.net.api_gateway.service;

import com.net.api_gateway.dto.GatewayRouteRequest;
import com.net.api_gateway.dto.GatewayRouteResponse;
import com.net.api_gateway.entity.GatewayRoute;
import com.net.api_gateway.monitoring.GatewayMetrics;
import com.net.api_gateway.repository.GatewayRouteRepository;
import org.springframework.cloud.gateway.event.RefreshRoutesEvent;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.net.URI;
import java.time.LocalDateTime;

@Service
public class GatewayRouteService {

    private final GatewayRouteRepository repository;
    private final ApplicationEventPublisher publisher;
    private final GatewayMetrics metrics;
    public GatewayRouteService(GatewayRouteRepository repository, ApplicationEventPublisher publisher, GatewayMetrics metrics) {
        this.repository = repository;
        this.publisher = publisher;
        this.metrics = metrics;
    }

    public Flux<GatewayRouteResponse> getAll() {
        return repository.findAll().map(this::toResponse);
    }

    public Mono<GatewayRouteResponse> getById(Long id) {
        return repository.findById(id)
                .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.NOT_FOUND, "Route not found")))
                .map(this::toResponse);
    }

    public Mono<GatewayRouteResponse> create(GatewayRouteRequest request) {
        validateRequest(request);

        return repository.existsByRouteId(request.routeId())
                .flatMap(exists -> {
                    if (exists) {
                        return Mono.error(new ResponseStatusException(HttpStatus.CONFLICT, "Route ID already exists"));
                    }

                    GatewayRoute route = new GatewayRoute();
                    route.setRouteId(request.routeId());
                    route.setUri(request.uri());
                    route.setPathPattern(request.pathPattern());
                    route.setStripPrefix(request.stripPrefix() == null ? 0 : request.stripPrefix());
                    route.setRouteOrder(request.routeOrder() == null ? 0 : request.routeOrder());
                    route.setEnabled(request.enabled() == null || request.enabled());
                    route.setCreatedAt(LocalDateTime.now());
                    route.setUpdatedAt(LocalDateTime.now());

                    return repository.save(route);
                })
                .doOnSuccess(route -> refreshRoutes())
                .map(this::toResponse);
    }

    public Mono<GatewayRouteResponse> update(Long id, GatewayRouteRequest request) {
        validateRequest(request);

        return repository.findById(id)
                .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.NOT_FOUND, "Route not found")))
                .flatMap(route -> {
                    route.setRouteId(request.routeId());
                    route.setUri(request.uri());
                    route.setPathPattern(request.pathPattern());
                    route.setStripPrefix(request.stripPrefix() == null ? 0 : request.stripPrefix());
                    route.setRouteOrder(request.routeOrder() == null ? 0 : request.routeOrder());
                    route.setEnabled(request.enabled() == null || request.enabled());
                    route.setUpdatedAt(LocalDateTime.now());

                    return repository.save(route);
                })
                .doOnSuccess(route -> refreshRoutes())
                .map(this::toResponse);
    }

    public Mono<Void> delete(Long id) {
        return repository.findById(id)
                .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.NOT_FOUND, "Route not found")))
                .flatMap(repository::delete)
                .doOnSuccess(result -> refreshRoutes());
    }

    private void refreshRoutes() {
        publisher.publishEvent(new RefreshRoutesEvent(this));
    }

    private void validateRequest(GatewayRouteRequest request) {
        if (request.routeId() == null || request.routeId().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "routeId is required");
        }

        if (request.uri() == null || request.uri().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "uri is required");
        }

        if (request.pathPattern() == null || request.pathPattern().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "pathPattern is required");
        }

        try {
            URI.create(request.uri());
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid URI");
        }

        if (!request.pathPattern().startsWith("/")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "pathPattern must start with /");
        }

        if (request.stripPrefix() != null && request.stripPrefix() < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "stripPrefix cannot be negative");
        }
    }

    private GatewayRouteResponse toResponse(GatewayRoute route) {
        return new GatewayRouteResponse(
                route.getId(),
                route.getRouteId(),
                route.getUri(),
                route.getPathPattern(),
                route.getStripPrefix(),
                route.getRouteOrder(),
                route.getEnabled(),
                route.getCreatedAt(),
                route.getUpdatedAt()
        );
    }
}