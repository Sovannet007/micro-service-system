package com.net.api_gateway.controller;

import com.net.api_gateway.dto.ApiResponse;
import com.net.api_gateway.dto.SessionResponse;
import com.net.api_gateway.service.ApiResponseService;
import com.net.api_gateway.service.UserSessionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/user/sessions")
@RequiredArgsConstructor
public class UserSessionController {
    private final UserSessionService userSessionService;
    private final ApiResponseService apiResponseService;

    @GetMapping
    public Mono<ResponseEntity<ApiResponse<List<SessionResponse>>>> getMySessions(
            ServerWebExchange exchange,
            JwtAuthenticationToken authentication
    ) {
        String userId = authentication.getToken().getSubject();
        return userSessionService
                .getMySessions(userId)
                .map(data ->
                        apiResponseService.success(
                                exchange,
                                "Sessions retrieved successfully.",
                                data
                        )
                );
    }

    @DeleteMapping("/{sessionId}")
    public Mono<ResponseEntity<ApiResponse<Void>>> logoutMySession(
            ServerWebExchange exchange,
            JwtAuthenticationToken authentication,
            @PathVariable String sessionId
    ) {
        String userId = authentication.getToken().getSubject();
        return userSessionService
                .logoutMySession(userId, sessionId)
                .thenReturn(
                        apiResponseService.success(
                                exchange,
                                "Session logged out successfully.",
                                null
                        )
                );
    }

    @PostMapping("/logout-all")
    public Mono<ResponseEntity<ApiResponse<Void>>> logoutAllMySessions(
            ServerWebExchange exchange,
            JwtAuthenticationToken authentication
    ) {
        String userId = authentication.getToken().getSubject();
        return userSessionService
                .logoutAllMySessions(userId)
                .thenReturn(
                        apiResponseService.success(
                                exchange,
                                "All sessions logged out successfully.",
                                null
                        )
                );
    }
}