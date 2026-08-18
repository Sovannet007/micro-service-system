package com.net.api_gateway.controller;

import com.net.api_gateway.dto.GatewayRateLimitRuleRequest;
import com.net.api_gateway.dto.GatewayRateLimitRuleResponse;
import com.net.api_gateway.service.GatewayRateLimitRuleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/gateway/rate-limit-rules")
@RequiredArgsConstructor
public class GatewayRateLimitRuleController {

    private final GatewayRateLimitRuleService service;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Mono<GatewayRateLimitRuleResponse> save(
            @RequestBody GatewayRateLimitRuleRequest request) {

        return service.save(request);
    }

    @GetMapping("/route/{gatewayRouteId}/active")
    public Flux<GatewayRateLimitRuleResponse> getActiveRules(
            @PathVariable Long gatewayRouteId) {

        return service.getActiveRules(gatewayRouteId);
    }

    @GetMapping("/route/{gatewayRouteId}/history")
    public Flux<GatewayRateLimitRuleResponse> getHistory(
            @PathVariable Long gatewayRouteId,
            @RequestParam String pathPattern,
            @RequestParam String httpMethod) {

        return service.getHistory(
                gatewayRouteId,
                pathPattern,
                httpMethod
        );
    }

    @DeleteMapping("/{id}/active")
    public Mono<ResponseEntity<Void>> disable(
            @PathVariable Long id) {

        return service
                .disable(id)
                .thenReturn(
                        ResponseEntity.noContent().build()
                );
    }
}