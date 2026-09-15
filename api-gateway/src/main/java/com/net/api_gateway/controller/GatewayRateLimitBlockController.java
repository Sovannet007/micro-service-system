package com.net.api_gateway.controller;

import com.net.api_gateway.dto.BlockedClientResponse;
import com.net.api_gateway.service.RedisBlockService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/gateway/rate-limit-blocks")
@RequiredArgsConstructor
public class GatewayRateLimitBlockController {

    private final RedisBlockService service;

    @GetMapping
    public Flux<BlockedClientResponse> getBlockedClients() {
        return service.getBlockedClients();
    }

    @DeleteMapping
    public Mono<ResponseEntity<Void>> unblock(@RequestParam String routeId, @RequestParam String ip) {
        return service.unblock(routeId, ip)
                .thenReturn(ResponseEntity.noContent().build());
    }
}