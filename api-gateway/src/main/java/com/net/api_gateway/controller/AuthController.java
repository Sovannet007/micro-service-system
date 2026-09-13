package com.net.api_gateway.controller;

import com.net.api_gateway.dto.*;
import com.net.api_gateway.service.ApiResponseService;
import com.net.api_gateway.service.KeycloakAuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final KeycloakAuthService authService;
    private final ApiResponseService apiResponseService;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserInfoResponse>> me(
            ServerWebExchange exchange,
            Authentication authentication
    ){
        Jwt jwt = (Jwt) authentication.getPrincipal();
        UserInfoResponse response = new UserInfoResponse();
        response.setId(jwt.getSubject());
        response.setUsername(jwt.getClaimAsString("preferred_username"));
        response.setEmail(jwt.getClaimAsString("email"));
        response.setName(jwt.getClaimAsString("name"));
        response.setRoles(
                jwt.getClaimAsMap("realm_access").get("roles")
                        instanceof List<?> roles
                        ? roles.stream()
                          .map(Object::toString)
                          .toList()
                        : List.of()
        );
        return apiResponseService.success(
                exchange,
                "Get user information successfully.",
                response
        );
    }


    @PostMapping("/login")
    public Mono<ResponseEntity<ApiResponse<LoginResponse>>> login(ServerWebExchange exchange, @RequestBody LoginRequest request){
        return authService
                .login(request.getUsername(), request.getPassword())
                .map(data ->
                        apiResponseService.success(
                                exchange,
                                "Login successfully.",
                                data
                        )
                );
    }


    @PostMapping("/refresh")
    public Mono<ResponseEntity<ApiResponse<LoginResponse>>> refresh(ServerWebExchange exchange,@RequestBody RefreshTokenRequest request){
        return authService
                .refresh(request.getRefreshToken())
                .map(data ->
                        apiResponseService.success(
                                exchange,
                                "Token refreshed successfully.",
                                data
                        )
                );
    }

    @PostMapping("/logout")
    public Mono<ResponseEntity<ApiResponse<Void>>> logout(ServerWebExchange exchange, @RequestBody LogoutRequest request){
        return authService
                .logout(request.getRefreshToken())
                .thenReturn(

                        apiResponseService.success(
                                exchange,
                                "Logout successfully.",
                                null
                        )

                );
    }
}