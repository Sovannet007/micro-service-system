package com.net.api_gateway.service;

import com.net.api_gateway.config.KeycloakConfig;
import com.net.api_gateway.dto.SessionResponse;
import com.net.api_gateway.repository.UserSessionDeviceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class KeycloakAdminService {

    private final KeycloakConfig config;
    private final UserSessionDeviceRepository sessionDeviceRepository;

    private final WebClient webClient = WebClient.builder().build();


    /**
     * ============================================================
     * ADMIN
     * Get all active sessions from all users.
     * ============================================================
     */
    public Mono<List<SessionResponse>> getAllSessions() {

        return getAdminToken()

                .flatMapMany(token ->

                        webClient.get()
                                .uri(
                                        config.getServerUrl()
                                                + "/admin/realms/"
                                                + config.getRealm()
                                                + "/users"
                                )
                                .headers(h ->
                                        h.setBearerAuth(token)
                                )
                                .retrieve()

                                .bodyToFlux(Map.class)

                                .flatMap(user -> {

                                    String userId =
                                            getString(
                                                    user,
                                                    "id"
                                            );

                                    String username =
                                            getString(
                                                    user,
                                                    "username"
                                            );

                                    if (userId == null) {
                                        return Flux.empty();
                                    }

                                    return getUserSessionsWithToken(
                                            token,
                                            userId,
                                            username
                                    );
                                })
                )

                .collectList();
    }


    /**
     * ============================================================
     * Get all sessions for one user.
     *
     * This is used by both:
     *
     * 1. Normal user
     * 2. Gateway admin
     *
     * Authorization is handled by the controller/service layer.
     * ============================================================
     */
    public Mono<List<SessionResponse>> getUserSessions(
            String userId
    ) {

        return getAdminToken()

                .flatMapMany(token ->
                        getUserSessionsWithToken(
                                token,
                                userId,
                                null
                        )
                )

                .collectList();
    }


    /**
     * ============================================================
     * Get sessions using an existing Keycloak admin token.
     * ============================================================
     */
    private Flux<SessionResponse> getUserSessionsWithToken(
            String token,
            String userId,
            String username
    ) {

        return webClient.get()
                .uri(
                        config.getServerUrl()
                                + "/admin/realms/"
                                + config.getRealm()
                                + "/users/"
                                + userId
                                + "/sessions"
                )
                .headers(h ->
                        h.setBearerAuth(token)
                )
                .retrieve()
                .bodyToFlux(Map.class)

                .map(json -> {

                    SessionResponse session =
                            new SessionResponse();

                    session.setId(
                            getString(json, "id")
                    );

                    session.setIpAddress(
                            getString(json, "ipAddress")
                    );

                    session.setStarted(
                            getLong(json, "start")
                    );

                    session.setLastAccess(
                            getLong(json, "lastAccess")
                    );

                    session.setUserId(userId);

                    session.setUsername(username);

                    return session;
                })

                .flatMap(
                        this::enrichSession
                );
    }
    private Mono<SessionResponse> enrichSession(
            SessionResponse session
    ) {

        return sessionDeviceRepository
                .findByKeycloakSessionId(
                        session.getId()
                )
                .map(device -> {

                    session.setDeviceType(
                            device.getDeviceType()
                    );

                    session.setPlatform(
                            device.getPlatform()
                    );

                    session.setBrowser(
                            device.getBrowser()
                    );

                    return session;
                })
                .defaultIfEmpty(session);
    }


    /**
     * ============================================================
     * ADMIN
     * Logout one session.
     * ============================================================
     */
    public Mono<Void> logoutSession(
            String sessionId
    ) {

        return getAdminToken()

                .flatMap(token ->

                        webClient.delete()

                                .uri(
                                        config.getServerUrl()
                                                + "/admin/realms/"
                                                + config.getRealm()
                                                + "/sessions/"
                                                + sessionId
                                )

                                .headers(h ->
                                        h.setBearerAuth(token)
                                )

                                .retrieve()

                                .toBodilessEntity()

                                .then()
                );
    }


    /**
     * ============================================================
     * ADMIN
     * Logout all sessions/devices of a user.
     * ============================================================
     */
    public Mono<Void> logoutAll(
            String userId
    ) {

        return getAdminToken()

                .flatMap(token ->

                        webClient.post()

                                .uri(
                                        config.getServerUrl()
                                                + "/admin/realms/"
                                                + config.getRealm()
                                                + "/users/"
                                                + userId
                                                + "/logout"
                                )

                                .headers(h ->
                                        h.setBearerAuth(token)
                                )

                                .retrieve()

                                .toBodilessEntity()

                                .then()
                );
    }

    public Mono<Void> logoutUserSession(
            String userId,
            String sessionId
    ) {
        return getUserSessions(userId)
                .flatMap(sessions -> {

                    boolean ownsSession = sessions.stream()
                            .anyMatch(session ->
                                    sessionId.equals(session.getId())
                            );

                    if (!ownsSession) {
                        return Mono.error(
                                new SecurityException(
                                        "You do not have permission to logout this session."
                                )
                        );
                    }

                    return logoutSession(sessionId);
                });
    }
    /**
     * ============================================================
     * Get Keycloak service-account token.
     * ============================================================
     */
    private Mono<String> getAdminToken() {

        MultiValueMap<String, String> body =
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
                                + "/realms/"
                                + config.getRealm()
                                + "/protocol/openid-connect/token"
                )

                .contentType(
                        MediaType.APPLICATION_FORM_URLENCODED
                )

                .body(
                        BodyInserters.fromFormData(body)
                )

                .retrieve()

                .bodyToMono(Map.class)

                .map(json -> {

                    Object accessToken =
                            json.get("access_token");

                    if (accessToken == null) {

                        throw new IllegalStateException(
                                "Keycloak admin token was not returned."
                        );
                    }

                    return accessToken.toString();
                });
    }


    /**
     * Safely read String from Keycloak response.
     */
    private String getString(
            Map<String, Object> json,
            String key
    ) {

        Object value =
                json.get(key);

        return value != null
                ? value.toString()
                : null;
    }


    /**
     * Safely read Long from Keycloak response.
     */
    private long getLong(
            Map<String, Object> json,
            String key
    ) {

        Object value =
                json.get(key);

        if (value instanceof Number number) {
            return number.longValue();
        }

        if (value != null) {

            try {

                return Long.parseLong(
                        value.toString()
                );

            } catch (NumberFormatException ignored) {
            }
        }

        return 0L;
    }
}