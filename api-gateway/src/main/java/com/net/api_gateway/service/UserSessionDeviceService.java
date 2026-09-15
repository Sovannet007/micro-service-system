package com.net.api_gateway.service;

import com.net.api_gateway.dto.SessionDeviceInfo;
import com.net.api_gateway.entity.UserSessionDevice;
import com.net.api_gateway.repository.UserSessionDeviceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class UserSessionDeviceService {

    private final UserSessionDeviceRepository repository;

    public Mono<UserSessionDevice> save(
            String sessionId,
            String userId,
            String username,
            SessionDeviceInfo deviceInfo
    ) {

        return repository
                .findByKeycloakSessionId(sessionId)
                .flatMap(existing -> {

                    existing.setIpAddress(
                            deviceInfo.getIpAddress()
                    );

                    existing.setUserAgent(
                            deviceInfo.getUserAgent()
                    );

                    existing.setDeviceType(
                            deviceInfo.getDeviceType()
                    );

                    existing.setPlatform(
                            deviceInfo.getPlatform()
                    );

                    existing.setBrowser(
                            deviceInfo.getBrowser()
                    );

                    existing.setLastSeenAt(
                            Instant.now()
                    );

                    return repository.save(existing);
                })
                .switchIfEmpty(
                        Mono.defer(() -> {

                            UserSessionDevice entity =
                                    new UserSessionDevice();

                            entity.setKeycloakSessionId(
                                    sessionId
                            );

                            entity.setUserId(
                                    userId
                            );

                            entity.setUsername(
                                    username
                            );

                            entity.setIpAddress(
                                    deviceInfo.getIpAddress()
                            );

                            entity.setUserAgent(
                                    deviceInfo.getUserAgent()
                            );

                            entity.setDeviceType(
                                    deviceInfo.getDeviceType()
                            );

                            entity.setPlatform(
                                    deviceInfo.getPlatform()
                            );

                            entity.setBrowser(
                                    deviceInfo.getBrowser()
                            );

                            entity.setCreatedAt(
                                    Instant.now()
                            );

                            entity.setLastSeenAt(
                                    Instant.now()
                            );

                            return repository.save(entity);
                        })
                );
    }

    public Mono<Void> deleteBySessionId(
            String sessionId
    ) {

        return repository
                .deleteByKeycloakSessionId(sessionId);
    }
}