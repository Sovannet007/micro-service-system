package com.net.api_gateway.service;
import tools.jackson.databind.JsonNode;
import com.net.api_gateway.config.KeycloakConfig;

import com.net.api_gateway.dto.SessionResponse;
import lombok.RequiredArgsConstructor;

import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;

import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;

import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;

import reactor.core.publisher.Mono;

import java.util.List;


@Service
@RequiredArgsConstructor
public class KeycloakAdminService {


    private final KeycloakConfig config;


    private final WebClient webClient =
            WebClient.builder().build();



    public Mono<List<SessionResponse>> getUserSessions(
            String userId
    ){

        return getAdminToken()

                .flatMapMany(token ->

                        webClient.get()

                                .uri(
                                        config.getServerUrl()
                                                +"/admin/realms/"
                                                +config.getRealm()
                                                +"/users/"
                                                +userId
                                                +"/sessions"
                                )

                                .headers(h ->
                                        h.setBearerAuth(token)
                                )

                                .retrieve()

                                .bodyToFlux(JsonNode.class)

                )

                .map(json -> {


                    SessionResponse session =
                            new SessionResponse();


                    session.setId(
                            json.get("id").asText()
                    );


                    session.setIpAddress(
                            json.get("ipAddress").asText()
                    );


                    session.setStarted(
                            json.get("start").asLong()
                    );


                    session.setLastAccess(
                            json.get("lastAccess").asLong()
                    );


                    return session;

                })

                .collectList();

    }

    public Mono<Void> logoutSession(
            String sessionId
    ){

        return getAdminToken()

                .flatMap(token ->


                        webClient.delete()

                                .uri(
                                        config.getServerUrl()
                                                +"/admin/realms/"
                                                +config.getRealm()
                                                +"/sessions/"
                                                +sessionId
                                )

                                .headers(h ->
                                        h.setBearerAuth(token)
                                )

                                .retrieve()

                                .bodyToMono(Void.class)

                );

    }

    public Mono<Void> logoutAll(
            String userId
    ){

        return getAdminToken()

                .flatMap(token ->


                        webClient.post()

                                .uri(
                                        config.getServerUrl()
                                                +"/admin/realms/"
                                                +config.getRealm()
                                                +"/users/"
                                                +userId
                                                +"/logout"
                                )

                                .headers(h ->
                                        h.setBearerAuth(token)
                                )

                                .retrieve()

                                .bodyToMono(Void.class)

                );

    }


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