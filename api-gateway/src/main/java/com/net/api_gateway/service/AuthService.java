package com.net.api_gateway.service;

import com.net.api_gateway.config.KeycloakConfig;
import com.net.api_gateway.dto.LoginResponse;
import com.net.api_gateway.dto.SessionDeviceInfo;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final KeycloakConfig config;

    private final DeviceTrackingService deviceTrackingService;

    private final UserSessionDeviceService userSessionDeviceService;

    private final JwtDecoder jwtDecoder;

    private final WebClient webClient =
            WebClient.builder().build();


    /**
     * Login through Keycloak and register the session/device.
     */
    public Mono<LoginResponse> login(
            String username,
            String password,
            ServerWebExchange exchange
    ) {

        // Get device information from the request.
        // React does NOT need to send this.
        SessionDeviceInfo deviceInfo =
                deviceTrackingService.extract(exchange);

        String url =
                config.getServerUrl()
                        + "/realms/"
                        + config.getRealm()
                        + "/protocol/openid-connect/token";


        MultiValueMap<String, String> body =
                new LinkedMultiValueMap<>();

        body.add("grant_type", "password");
        body.add("client_id", config.getClientId());
        body.add("client_secret", config.getClientSecret());
        body.add("username", username);
        body.add("password", password);


        return webClient.post()

                .uri(url)

                .contentType(
                        MediaType.APPLICATION_FORM_URLENCODED
                )

                .body(
                        BodyInserters.fromFormData(body)
                )

                .retrieve()

                .bodyToMono(LoginResponse.class)

                // Keycloak login succeeded
                .flatMap(loginResponse -> {

                    String sessionId =
                            loginResponse.getSessionState();

                    if (sessionId == null ||
                            sessionId.isBlank()) {

                        return Mono.error(
                                new IllegalStateException(
                                        "Keycloak session_state was not returned."
                                )
                        );
                    }


                    String accessToken =
                            loginResponse.getAccessToken();


                    if (accessToken == null ||
                            accessToken.isBlank()) {

                        return Mono.error(
                                new IllegalStateException(
                                        "Keycloak access token was not returned."
                                )
                        );
                    }


                    // Decode the Keycloak JWT
                    return Mono.fromCallable(() ->
                                    jwtDecoder.decode(accessToken)
                            )

                            .flatMap(jwt -> {

                                String userId =
                                        jwt.getSubject();

                                String tokenUsername =
                                        jwt.getClaimAsString(
                                                "preferred_username"
                                        );


                                if (userId == null ||
                                        userId.isBlank()) {

                                    return Mono.error(
                                            new IllegalStateException(
                                                    "User ID was not found in Keycloak token."
                                            )
                                    );
                                }


                                // Save session + device information
                                return userSessionDeviceService

                                        .save(
                                                sessionId,
                                                userId,
                                                tokenUsername,
                                                deviceInfo
                                        )

                                        .thenReturn(loginResponse);
                            });
                });
    }


    /**
     * Refresh Keycloak access token.
     */
    public Mono<LoginResponse> refresh(
            String refreshToken
    ) {

        String url =
                config.getServerUrl()
                        + "/realms/"
                        + config.getRealm()
                        + "/protocol/openid-connect/token";


        MultiValueMap<String, String> body =
                new LinkedMultiValueMap<>();

        body.add(
                "grant_type",
                "refresh_token"
        );

        body.add(
                "client_id",
                config.getClientId()
        );

        body.add(
                "client_secret",
                config.getClientSecret()
        );

        body.add(
                "refresh_token",
                refreshToken
        );


        return webClient.post()

                .uri(url)

                .contentType(
                        MediaType.APPLICATION_FORM_URLENCODED
                )

                .body(
                        BodyInserters.fromFormData(body)
                )

                .retrieve()

                .bodyToMono(LoginResponse.class);
    }


    /**
     * Logout from Keycloak.
     */
    public Mono<Void> logout(
            String refreshToken
    ) {

        String url =
                config.getServerUrl()
                        + "/realms/"
                        + config.getRealm()
                        + "/protocol/openid-connect/logout";


        MultiValueMap<String, String> body =
                new LinkedMultiValueMap<>();

        body.add(
                "client_id",
                config.getClientId()
        );

        body.add(
                "client_secret",
                config.getClientSecret()
        );

        body.add(
                "refresh_token",
                refreshToken
        );


        return webClient.post()

                .uri(url)

                .contentType(
                        MediaType.APPLICATION_FORM_URLENCODED
                )

                .body(
                        BodyInserters.fromFormData(body)
                )

                .retrieve()

                .toBodilessEntity()

                .then();
    }
}