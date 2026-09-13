package com.net.api_gateway.config;

import com.net.api_gateway.security.KeycloakClientRoleConverter;
import com.net.api_gateway.service.ApiResponseService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.oauth2.server.resource.authentication.ReactiveJwtAuthenticationConverter;
import org.springframework.security.web.server.SecurityWebFilterChain;
@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {
    @Bean
    @Order(1)
    public SecurityWebFilterChain apiSecurity(
            ServerHttpSecurity http,
            KeycloakClientRoleConverter roleConverter,
            ApiResponseService apiResponseService)
    {
        ReactiveJwtAuthenticationConverter jwtConverter = new ReactiveJwtAuthenticationConverter();
        jwtConverter.setJwtGrantedAuthoritiesConverter(roleConverter);
        jwtConverter.setPrincipalClaimName("preferred_username");
        return http
                .csrf(ServerHttpSecurity.CsrfSpec::disable)
                .httpBasic(ServerHttpSecurity.HttpBasicSpec::disable)
                .formLogin(ServerHttpSecurity.FormLoginSpec::disable)
                .authorizeExchange(auth -> auth
                        // Public endpoints
                        .pathMatchers(
                                "/api/auth/login",
                                "/api/auth/register",
                                "/api/auth/refresh"
                        )
                        .permitAll()
                        // User logout
                        .pathMatchers("/api/auth/logout")
                        .authenticated()
                        // Admin session management
                        .pathMatchers(
                                "/api/auth/sessions/**",
                                "/api/auth/logout-all/**"
                        )
                        .hasRole("GATEWAY_ADMIN")
                        // Gateway admin
                        .pathMatchers("/api/gateway/**")
                        .hasRole("GATEWAY_ADMIN")
                        .pathMatchers("/actuator/gateway/**")
                        .hasRole("GATEWAY_ADMIN")
                        // Current user
                        .pathMatchers("/api/auth/me")
                        .authenticated()
                        // Everything else
                        .anyExchange()
                        .authenticated()
                )
                .exceptionHandling(errors -> errors
                        .authenticationEntryPoint(
                                (exchange, exception) ->
                                        apiResponseService.writeError(
                                                exchange,
                                                HttpStatus.UNAUTHORIZED,
                                                "UNAUTHORIZED",
                                                "Authentication is required.",
                                                null
                                        )
                        )
                        .accessDeniedHandler(
                                (exchange, exception) ->
                                        apiResponseService.writeError(
                                                exchange,
                                                HttpStatus.FORBIDDEN,
                                                "FORBIDDEN",
                                                "You do not have permission to access this resource.",
                                                null
                                        )
                        )
                )
                .oauth2ResourceServer(oauth ->
                        oauth.jwt(jwt -> jwt.jwtAuthenticationConverter(jwtConverter))
                )
                .build();
    }
}