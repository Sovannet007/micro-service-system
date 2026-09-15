package com.net.api_gateway.controller;

import com.net.api_gateway.dto.ApiResponse;
import com.net.api_gateway.dto.SessionResponse;
import com.net.api_gateway.service.ApiResponseService;
import com.net.api_gateway.service.KeycloakAdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.List;
@RestController
@RequestMapping("/api/admin/sessions")
@RequiredArgsConstructor
public class AdminSessionController {
    private final KeycloakAdminService keycloakAdminService;
    private final ApiResponseService apiResponseService;

    @GetMapping
    public Mono<ResponseEntity<ApiResponse<List<SessionResponse>>>> getAllSessions(ServerWebExchange exchange) {
        return keycloakAdminService
                .getAllSessions()
                .map(data ->
                        apiResponseService.success(
                                exchange,
                                "All sessions retrieved successfully.",
                                data
                        )
                );
    }

    @GetMapping("/user/{userId}")
    public Mono<ResponseEntity<ApiResponse<List<SessionResponse>>>> getUserSessions(ServerWebExchange exchange, @PathVariable String userId) {
        return keycloakAdminService
                .getUserSessions(userId)
                .map(data ->
                        apiResponseService.success(
                                exchange,
                                "User sessions retrieved successfully.",
                                data
                        )
                );
    }

    @DeleteMapping("/{sessionId}")
    public Mono<ResponseEntity<ApiResponse<Void>>> logoutSession(ServerWebExchange exchange, @PathVariable String sessionId) {
        return keycloakAdminService
                .logoutSession(sessionId)
                .thenReturn(
                        apiResponseService.success(
                                exchange,
                                "Session logged out successfully.",
                                null
                        )
                );
    }

    @PostMapping("/user/{userId}/logout-all")
    public Mono<ResponseEntity<ApiResponse<Void>>> logoutAll(ServerWebExchange exchange, @PathVariable String userId) {
        return keycloakAdminService
                .logoutAll(userId)
                .thenReturn(
                        apiResponseService.success(
                                exchange,
                                "All user sessions logged out successfully.",
                                null
                        )
                );
    }
}