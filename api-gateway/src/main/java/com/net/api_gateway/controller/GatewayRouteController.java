package com.net.api_gateway.controller;

import com.net.api_gateway.dto.ApiResponse;
import com.net.api_gateway.dto.GatewayRouteRequest;
import com.net.api_gateway.dto.GatewayRouteResponse;
import com.net.api_gateway.monitoring.GatewayMetrics;
import com.net.api_gateway.service.ApiResponseService;
import com.net.api_gateway.service.GatewayRouteService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.List;

@RestController
@RequestMapping("/api/gateway/routes")
public class GatewayRouteController {

    private final GatewayRouteService service;
    private final GatewayMetrics metrics;
    private final ApiResponseService apiResponseService;

    public GatewayRouteController(GatewayRouteService service, GatewayMetrics metrics,ApiResponseService apiResponseService) {
        this.service = service;
        this.metrics = metrics;
        this.apiResponseService = apiResponseService;
    }

    @GetMapping
    public  Mono<ResponseEntity<ApiResponse<List<GatewayRouteResponse>>>> getAll(ServerWebExchange exchange) {
        metrics.incrementGetAll();
        return service.getAll().collectList()
                .map(data ->
                        apiResponseService.success(
                                exchange,
                                "Gateway routes retrieved successfully.",
                                data
                        )
                );
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