package com.net.api_gateway.dto;

import java.time.Instant;
import java.util.Map;

public record ApiResponse<T>(
        boolean success,
        int status,
        String code,
        String message,
        T data,
        Map<String, Object> details,
        String path,
        String requestId,
        Instant timestamp
) {
}