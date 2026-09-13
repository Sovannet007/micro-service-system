package com.net.api_gateway.dto;

import java.util.Set;

public record AuthMeResponse(
        String userId,
        String username,
        String email,
        Set<String> roles
) {
}