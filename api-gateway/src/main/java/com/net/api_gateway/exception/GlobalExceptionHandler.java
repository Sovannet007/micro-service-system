package com.net.api_gateway.exception;


import com.net.api_gateway.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebExceptionHandler;

import reactor.core.publisher.Mono;

import tools.jackson.databind.ObjectMapper;

import java.time.Instant;
import java.util.UUID;


@Slf4j
@Component
@RequiredArgsConstructor
public class GlobalExceptionHandler
        implements WebExceptionHandler {


    private final ObjectMapper objectMapper;



    @Override
    public Mono<Void> handle(
            ServerWebExchange exchange,
            Throwable ex
    ) {


        log.error(
                "Unhandled exception. Path: {}, Error: {}",
                exchange.getRequest()
                        .getURI()
                        .getPath(),
                ex.getMessage(),
                ex
        );


        ApiResponse<Void> response =
                new ApiResponse<>(
                        false,
                        500,
                        "INTERNAL_SERVER_ERROR",
                        "An unexpected server error occurred.",
                        null,
                        null,
                        exchange.getRequest()
                                .getURI()
                                .getPath(),

                        exchange.getRequest()
                                .getId(),

                        Instant.now()
                );


        try {


            byte[] bytes =
                    objectMapper.writeValueAsBytes(response);


            exchange.getResponse()
                    .setStatusCode(
                            HttpStatus.INTERNAL_SERVER_ERROR
                    );


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


        } catch(Exception error){


            log.error(
                    "Failed to write exception response",
                    error
            );


            return Mono.error(error);
        }

    }
}