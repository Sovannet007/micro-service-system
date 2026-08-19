package com.net.api_gateway.service;

import com.net.api_gateway.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;
import tools.jackson.databind.ObjectMapper;

import java.time.Instant;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ApiResponseService {
    private final ObjectMapper objectMapper;
    public <T> ResponseEntity<ApiResponse<T>> success(ServerWebExchange exchange,T data) {
        return success(
                exchange,
                "Request completed successfully.",
                data
        );
    }

    public <T> ResponseEntity<ApiResponse<T>> success(ServerWebExchange exchange,String message,T data) {
        ApiResponse<T> response = build(
                        exchange,
                        true,
                        HttpStatus.OK,
                        "SUCCESS",
                        message,
                        data,
                        null
                );
        return ResponseEntity.ok(response);
    }

    public <T> ResponseEntity<ApiResponse<T>> created(ServerWebExchange exchange,T data) {
        return created(
                exchange,
                "Resource created successfully.",
                data
        );
    }

    public <T> ResponseEntity<ApiResponse<T>> created(ServerWebExchange exchange,String message,T data) {
        ApiResponse<T> response = build(
                        exchange,
                        true,
                        HttpStatus.CREATED,
                        "CREATED",
                        message,
                        data,
                        null
                );
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }


    public ResponseEntity<ApiResponse<Void>> validationError(ServerWebExchange exchange,Map<String, Object> details) {
        return error(
                exchange,
                HttpStatus.BAD_REQUEST,
                "VALIDATION_ERROR",
                "Request validation failed.",
                details
        );
    }

    public ResponseEntity<ApiResponse<Void>> badRequest(ServerWebExchange exchange,String message) {
        return error(
                exchange,
                HttpStatus.BAD_REQUEST,
                "BAD_REQUEST",
                message,
                null
        );
    }

    public ResponseEntity<ApiResponse<Void>> unauthorized(ServerWebExchange exchange,String message) {
        return error(
                exchange,
                HttpStatus.UNAUTHORIZED,
                "UNAUTHORIZED",
                message,
                null
        );
    }

    public ResponseEntity<ApiResponse<Void>> notFound(ServerWebExchange exchange,String message) {
        return error(
                exchange,
                HttpStatus.NOT_FOUND,
                "NOT_FOUND",
                message,
                null
        );
    }

    public ResponseEntity<ApiResponse<Void>> conflict(ServerWebExchange exchange, String message) {
        return error(
                exchange,
                HttpStatus.CONFLICT,
                "CONFLICT",
                message,
                null
        );
    }

    public ResponseEntity<ApiResponse<Void>> rateLimitExceeded(ServerWebExchange exchange, long retryAfterSeconds) {
        return error(
                exchange,
                HttpStatus.TOO_MANY_REQUESTS,
                "RATE_LIMIT_EXCEEDED",
                "Too many requests. Please try again later.",
                Map.of(
                        "retryAfterSeconds",
                        retryAfterSeconds
                )
        );
    }

    public ResponseEntity<ApiResponse<Void>> temporarilyBlocked(ServerWebExchange exchange, long retryAfterSeconds) {
        return error(
                exchange,
                HttpStatus.TOO_MANY_REQUESTS,
                "TEMPORARILY_BLOCKED",
                "You are temporarily blocked. Please try again later.",
                Map.of(
                        "retryAfterSeconds",
                        retryAfterSeconds
                )
        );
    }

    public ResponseEntity<ApiResponse<Void>> internalError(ServerWebExchange exchange) {
        return error(
                exchange,
                HttpStatus.INTERNAL_SERVER_ERROR,
                "INTERNAL_SERVER_ERROR",
                "An unexpected gateway error occurred.",
                null
        );
    }

    public ResponseEntity<ApiResponse<Void>> error(
            ServerWebExchange exchange,
            HttpStatus status,
            String code,
            String message,
            Map<String, Object> details) {
        ApiResponse<Void> response =
                build(
                        exchange,
                        false,
                        status,
                        code,
                        message,
                        null,
                        details
                );
        return ResponseEntity
                .status(status)
                .body(response);
    }

    public Mono<Void> writeError(
            ServerWebExchange exchange,
            HttpStatus status,
            String code,
            String message,
            Map<String, Object> details) {

        ApiResponse<Void> body =
                new ApiResponse<>(
                        false,
                        status.value(),
                        code,
                        message,
                        null,
                        details,
                        exchange.getRequest()
                                .getURI()
                                .getPath(),
                        exchange.getRequest()
                                .getId(),
                        Instant.now()
                );

        try {

            byte[] bytes =
                    objectMapper.writeValueAsBytes(body);

            exchange.getResponse()
                    .setStatusCode(status);

            exchange.getResponse()
                    .getHeaders()
                    .setContentType(
                                MediaType.APPLICATION_JSON
                    );

            DataBuffer buffer =
                    exchange.getResponse()
                            .bufferFactory()
                            .wrap(bytes);

            return exchange
                    .getResponse()
                    .writeWith(
                            Mono.just(buffer)
                    );

        } catch (Exception exception) {

            return Mono.error(exception);
        }
    }

    private <T> ApiResponse<T> build(
            ServerWebExchange exchange,
            boolean success,
            HttpStatus status,
            String code,
            String message,
            T data,
            Map<String, Object> details) {
        return new ApiResponse<>(
                success,
                status.value(),
                code,
                message,
                data,
                details,
                exchange.getRequest()
                        .getURI()
                        .getPath(),
                exchange.getRequest()
                        .getId(),
                Instant.now()
        );
    }
}