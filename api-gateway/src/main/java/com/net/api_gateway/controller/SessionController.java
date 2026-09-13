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
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class SessionController {


    private final KeycloakAdminService service;
    private final ApiResponseService apiResponseService;


    @GetMapping("/sessions/{userId}")
    public Mono<ResponseEntity<ApiResponse<List<SessionResponse>>>> sessions(
            ServerWebExchange exchange,
            @PathVariable String userId
    ){

        return service
                .getUserSessions(userId)
                .map(data ->
                        apiResponseService.success(
                                exchange,
                                "Sessions retrieved successfully.",
                                data
                        )
                );

    }

    @DeleteMapping("/sessions/{sessionId}")
    public Mono<ResponseEntity<ApiResponse<Void>>> logoutSession(
            ServerWebExchange exchange,
            @PathVariable String sessionId
    ){

        return service
                .logoutSession(sessionId)
                .thenReturn(

                        apiResponseService.success(
                                exchange,
                                "Session logged out successfully.",
                                null
                        )

                );

    }



    @PostMapping("/logout-all/{userId}")
    public Mono<ResponseEntity<ApiResponse<Void>>> logoutAll(
            ServerWebExchange exchange,
            @PathVariable String userId
    ){

        return service
                .logoutAll(userId)
                .thenReturn(

                        apiResponseService.success(
                                exchange,
                                "All sessions logged out successfully.",
                                null
                        )

                );

    }

}
