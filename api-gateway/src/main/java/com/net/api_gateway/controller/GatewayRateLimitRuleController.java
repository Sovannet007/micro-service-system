package com.net.api_gateway.controller;

import com.net.api_gateway.dto.ApiResponse;
import com.net.api_gateway.dto.GatewayRateLimitRuleRequest;
import com.net.api_gateway.dto.GatewayRateLimitRuleResponse;
import com.net.api_gateway.service.ApiResponseService;
import com.net.api_gateway.service.GatewayRateLimitRuleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.List;

@RestController
@RequestMapping("/api/gateway/rate-limit-rules")
@RequiredArgsConstructor
public class GatewayRateLimitRuleController {
    private final GatewayRateLimitRuleService service;
    private final ApiResponseService apiResponseService;

    @PostMapping
    public Mono<ResponseEntity<ApiResponse<GatewayRateLimitRuleResponse>>> save(@RequestBody GatewayRateLimitRuleRequest request, ServerWebExchange exchange) {
        return service.save(request)
                .map(data ->
                        apiResponseService.created(
                                exchange,
                                "Gateway rate limit rule created successfully.",
                                data
                        )
                );
    }

    @GetMapping("/route/{gatewayRouteId}/active")
    public Mono<ResponseEntity<ApiResponse<List<GatewayRateLimitRuleResponse>>>> getActiveRules(@PathVariable Long gatewayRouteId, ServerWebExchange exchange) {
        return service.getActiveRules(gatewayRouteId)
                .collectList()
                .map(data ->
                        apiResponseService.success(
                                exchange,
                                "Active gateway rate limit rules retrieved successfully.",
                                data
                        )
                );
    }

    @GetMapping("/route/{gatewayRouteId}/history")
    public Mono<ResponseEntity<ApiResponse<List<GatewayRateLimitRuleResponse>>>> getHistory(
            @PathVariable Long gatewayRouteId,
            @RequestParam String pathPattern,
            @RequestParam String httpMethod,
            ServerWebExchange exchange
    ) {
        return service.getHistory(
                        gatewayRouteId,
                        pathPattern,
                        httpMethod
                )
                .collectList()
                .map(data ->
                        apiResponseService.success(
                                exchange,
                                "Gateway rate limit rule history retrieved successfully.",
                                data
                        )
                );
    }

    @DeleteMapping("/{id}/active")
    public Mono<ResponseEntity<ApiResponse<Object>>> disable(@PathVariable Long id, ServerWebExchange exchange) {
        return service.disable(id)
                .thenReturn(
                        apiResponseService.success(
                                exchange,
                                "Gateway rate limit rule disabled successfully.",
                                null
                        )
                );
    }
}