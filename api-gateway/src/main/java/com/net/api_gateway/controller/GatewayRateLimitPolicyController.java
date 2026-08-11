package com.net.api_gateway.controller;

import com.net.api_gateway.dto.GatewayRateLimitPolicyRequest;
import com.net.api_gateway.dto.GatewayRateLimitPolicyResponse;
import com.net.api_gateway.service.GatewayRateLimitPolicyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/gateway/rate-limit-policies")
@RequiredArgsConstructor
public class GatewayRateLimitPolicyController {

    private final GatewayRateLimitPolicyService service;

    @PostMapping("/{gatewayRouteId}")
    public Mono<GatewayRateLimitPolicyResponse> save(
            @PathVariable Long gatewayRouteId,
            @RequestBody GatewayRateLimitPolicyRequest req) {
        return service.save(gatewayRouteId, req);
    }

    @GetMapping("/{gatewayRouteId}/active")
    public Mono<GatewayRateLimitPolicyResponse> getActive(@PathVariable Long gatewayRouteId) {
        return service.getActive(gatewayRouteId);
    }

    @GetMapping("/{gatewayRouteId}/versions")
    public Flux<GatewayRateLimitPolicyResponse> getVersions(@PathVariable Long gatewayRouteId) {
        return service.getVersions(gatewayRouteId);
    }

    @DeleteMapping("/{gatewayRouteId}/active")
    public Mono<ResponseEntity<Void>> disable(@PathVariable Long gatewayRouteId) {
        return service.disable(gatewayRouteId)
                .thenReturn(ResponseEntity.noContent().build());
    }
}