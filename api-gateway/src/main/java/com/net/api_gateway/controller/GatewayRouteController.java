package com.net.api_gateway.controller;

import com.net.api_gateway.dto.GatewayRouteRequest;
import com.net.api_gateway.dto.GatewayRouteResponse;
import com.net.api_gateway.monitoring.GatewayMetrics;
import com.net.api_gateway.service.GatewayRouteService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/gateway/routes")
public class GatewayRouteController {

    private final GatewayRouteService service;
    private final GatewayMetrics metrics;

    public GatewayRouteController(GatewayRouteService service, GatewayMetrics metrics) {
        this.service = service;
        this.metrics = metrics;
    }

    @GetMapping
    public Flux<GatewayRouteResponse> getAll() {
        metrics.incrementGetAll();
        return service.getAll();
    }

    @GetMapping("/{id}")
    public Mono<GatewayRouteResponse> getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.OK)
    public Mono<GatewayRouteResponse> save(@RequestBody GatewayRouteRequest req) {
        return req.id() == null ? service.create(req) : service.update(req.id(), req);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public Mono<Void> delete(@PathVariable Long id) {
        return service.delete(id);
    }
}