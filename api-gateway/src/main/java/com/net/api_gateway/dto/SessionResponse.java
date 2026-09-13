package com.net.api_gateway.dto;


import lombok.Data;


@Data
public class SessionResponse {


    private String id;


    private String ipAddress;


    private String userAgent;


    private Long started;


    private Long lastAccess;

}