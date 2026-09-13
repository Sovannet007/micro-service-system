package com.net.api_gateway.service;


import com.fasterxml.jackson.databind.JsonNode;
import com.net.api_gateway.config.KeycloakConfig;

import lombok.RequiredArgsConstructor;

import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;

import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;

import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;

import reactor.core.publisher.Mono;



@Service
@RequiredArgsConstructor
public class KeycloakAdminService {


    private final KeycloakConfig config;


    private final WebClient webClient =
            WebClient.builder().build();



    private Mono<String> getAdminToken(){


        MultiValueMap<String,String> body =
                new LinkedMultiValueMap<>();


        body.add(
                "grant_type",
                "client_credentials"
        );


        body.add(
                "client_id",
                config.getAdminClientId()
        );


        body.add(
                "client_secret",
                config.getAdminClientSecret()
        );



        return webClient.post()

                .uri(
                        config.getServerUrl()
                                +"/realms/"
                                +config.getRealm()
                                +"/protocol/openid-connect/token"
                )

                .contentType(
                        MediaType.APPLICATION_FORM_URLENCODED
                )

                .body(
                        BodyInserters.fromFormData(body)
                )

                .retrieve()

                .bodyToMono(JsonNode.class)

                .map(json ->
                        json.get("access_token")
                                .asText()
                );

    }

}