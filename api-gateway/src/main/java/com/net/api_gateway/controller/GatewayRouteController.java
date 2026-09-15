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
    public Mono<ResponseEntity<ApiResponse<GatewayRouteResponse>>> getById(@PathVariable Long id, ServerWebExchange exchange) {
        return service.getById(id)
                .map(data ->
                        apiResponseService.success(
                                exchange,
                                "Gateway route retrieved successfully.",
                                data
                        )
                );
    }

    @PostMapping
    public Mono<ResponseEntity<ApiResponse<GatewayRouteResponse>>> save(@RequestBody GatewayRouteRequest req, ServerWebExchange exchange) {
        Mono<GatewayRouteResponse> operation =
                req.id() == null
                        ? service.create(req)
                        : service.update(req.id(), req);

        return operation.map(data ->
                apiResponseService.success(
                        exchange,
                        req.id() == null
                                ? "Gateway route created successfully."
                                : "Gateway route updated successfully.",
                        data
                )
        );
    }

    @DeleteMapping("/{id}")
    public Mono<ResponseEntity<ApiResponse<Object>>> delete(@PathVariable Long id, ServerWebExchange exchange) {
        return service.delete(id)
                .thenReturn(
                        apiResponseService.success(
                                exchange,
                                "Gateway route deleted successfully.",
                                null
                        )
                );
    }
}