package com.net.api_gateway.service;

import com.net.api_gateway.dto.SessionResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Mono;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserSessionService {

    private final KeycloakAdminService keycloakAdminService;

    /**
     * Get sessions belonging to the current user.
     */
    public Mono<List<SessionResponse>> getMySessions(
            String currentUserId
    ) {
        return keycloakAdminService
                .getUserSessions(currentUserId);
    }

    /**
     * Logout one session belonging to the current user.
     */
    public Mono<Void> logoutMySession(
            String currentUserId,
            String sessionId
    ) {

        return keycloakAdminService
                .getUserSessions(currentUserId)
                .flatMap(sessions -> {

                    boolean ownsSession =
                            sessions.stream()
                                    .anyMatch(session ->
                                            sessionId.equals(session.getId())
                                    );

                    if (!ownsSession) {
                        return Mono.error(
                                new ResponseStatusException(
                                        HttpStatus.FORBIDDEN,
                                        "You do not have permission to logout this session."
                                )
                        );
                    }

                    return keycloakAdminService
                            .logoutSession(sessionId);
                });
    }

    /**
     * Logout all sessions belonging to the current user.
     */
    public Mono<Void> logoutAllMySessions(
            String currentUserId
    ) {
        return keycloakAdminService
                .logoutAll(currentUserId);
    }
}