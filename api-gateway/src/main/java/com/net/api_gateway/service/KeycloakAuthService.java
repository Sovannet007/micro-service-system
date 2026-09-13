package com.net.api_gateway.service;

import com.net.api_gateway.config.KeycloakConfig;
import com.net.api_gateway.dto.LoginResponse;
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
public class KeycloakAuthService {
    private final KeycloakConfig config;

    private final WebClient webClient = WebClient.builder().build();

    public Mono<LoginResponse> login(String username, String password){
        String url = config.getServerUrl() +"/realms/" +config.getRealm() +"/protocol/openid-connect/token";
        MultiValueMap<String,String> body = new LinkedMultiValueMap<>();
        body.add("grant_type", "password");
        body.add("client_id", config.getClientId());
        body.add("client_secret", config.getClientSecret());
        body.add("username", username);
        body.add("password", password);
        return webClient.post()
                .uri(url)
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body(BodyInserters.fromFormData(body))
                .retrieve()
                .bodyToMono(LoginResponse.class);
    }

    public Mono<LoginResponse> refresh(String refreshToken){
        String url = config.getServerUrl() + "/realms/" + config.getRealm() + "/protocol/openid-connect/token";
        MultiValueMap<String,String> body = new LinkedMultiValueMap<>();
        body.add("grant_type", "refresh_token");
        body.add("client_id", config.getClientId());
        body.add("client_secret", config.getClientSecret());
        body.add("refresh_token", refreshToken);

        return webClient.post()
                .uri(url)
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body(BodyInserters.fromFormData(body))
                .retrieve()
                .bodyToMono(LoginResponse.class);
    }

    public Mono<Void> logout(String refreshToken) {
        String url = config.getServerUrl() + "/realms/" + config.getRealm() + "/protocol/openid-connect/logout";
        MultiValueMap<String,String> body = new LinkedMultiValueMap<>();
        body.add("client_id", config.getClientId());
        body.add("client_secret", config.getClientSecret());
        body.add("refresh_token", refreshToken);
        return webClient.post()
                .uri(url)
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body(BodyInserters.fromFormData(body))
                .retrieve()
                .bodyToMono(Void.class);
    }
}