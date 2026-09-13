package com.net.api_gateway.dto;

import lombok.Data;

import java.util.List;

@Data
public class UserInfoResponse {

    private String id;

    private String username;

    private String email;

    private String name;

    private List<String> roles;
}