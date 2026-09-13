package com.net.api_gateway.dto;

import lombok.Data;

@Data
public class LogoutRequest {

    private String refreshToken;

}