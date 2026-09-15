package com.net.api_gateway.service;

import com.net.api_gateway.dto.SessionDeviceInfo;
import com.net.api_gateway.entity.UserSessionDevice;
import com.net.api_gateway.repository.UserSessionDeviceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class DeviceTrackingService {

    private final UserSessionDeviceRepository repository;


    public SessionDeviceInfo extract(
            ServerWebExchange exchange
    ) {

        String userAgent =
                exchange.getRequest()
                        .getHeaders()
                        .getFirst("User-Agent");

        String ipAddress =
                getClientIp(exchange);

        SessionDeviceInfo info =
                new SessionDeviceInfo();

        info.setIpAddress(ipAddress);
        info.setUserAgent(userAgent);

        info.setPlatform(
                detectPlatform(userAgent)
        );

        info.setBrowser(
                detectBrowser(userAgent)
        );

        info.setDeviceType(
                detectDeviceType(userAgent)
        );

        return info;
    }


    public Mono<UserSessionDevice> saveSessionDevice(
            String sessionId,
            String userId,
            String username,
            SessionDeviceInfo info
    ) {

        return repository
                .findByKeycloakSessionId(sessionId)
                .flatMap(existing -> {

                    existing.setIpAddress(
                            info.getIpAddress()
                    );

                    existing.setUserAgent(
                            info.getUserAgent()
                    );

                    existing.setDeviceType(
                            info.getDeviceType()
                    );

                    existing.setPlatform(
                            info.getPlatform()
                    );

                    existing.setBrowser(
                            info.getBrowser()
                    );

                    existing.setLastSeenAt(
                            Instant.now()
                    );

                    return repository.save(existing);
                })
                .switchIfEmpty(
                        Mono.defer(() -> {

                            UserSessionDevice device =
                                    new UserSessionDevice();

                            device.setKeycloakSessionId(
                                    sessionId
                            );

                            device.setUserId(userId);

                            device.setUsername(username);

                            device.setIpAddress(
                                    info.getIpAddress()
                            );

                            device.setUserAgent(
                                    info.getUserAgent()
                            );

                            device.setDeviceType(
                                    info.getDeviceType()
                            );

                            device.setPlatform(
                                    info.getPlatform()
                            );

                            device.setBrowser(
                                    info.getBrowser()
                            );

                            device.setCreatedAt(
                                    Instant.now()
                            );

                            device.setLastSeenAt(
                                    Instant.now()
                            );

                            return repository.save(device);
                        })
                );
    }


    private String getClientIp(
            ServerWebExchange exchange
    ) {

        String forwardedFor =
                exchange.getRequest()
                        .getHeaders()
                        .getFirst("X-Forwarded-For");

        if (forwardedFor != null &&
                !forwardedFor.isBlank()) {

            return forwardedFor
                    .split(",")[0]
                    .trim();
        }

        String realIp =
                exchange.getRequest()
                        .getHeaders()
                        .getFirst("X-Real-IP");

        if (realIp != null &&
                !realIp.isBlank()) {

            return realIp;
        }

        if (exchange.getRequest()
                .getRemoteAddress() != null) {

            return exchange.getRequest()
                    .getRemoteAddress()
                    .getAddress()
                    .getHostAddress();
        }

        return "unknown";
    }


    private String detectPlatform(
            String userAgent
    ) {

        if (userAgent == null) {
            return "Unknown";
        }

        String ua =
                userAgent.toLowerCase();

        if (ua.contains("windows")) {
            return "Windows";
        }

        if (ua.contains("android")) {
            return "Android";
        }

        if (ua.contains("iphone") ||
                ua.contains("ipad") ||
                ua.contains("ios")) {

            return "iOS";
        }

        if (ua.contains("mac os")) {
            return "macOS";
        }

        if (ua.contains("linux")) {
            return "Linux";
        }

        return "Unknown";
    }


    private String detectBrowser(
            String userAgent
    ) {

        if (userAgent == null) {
            return "Unknown";
        }

        String ua =
                userAgent.toLowerCase();

        if (ua.contains("edg/")) {
            return "Edge";
        }

        if (ua.contains("chrome/") &&
                !ua.contains("edg/")) {

            return "Chrome";
        }

        if (ua.contains("firefox/")) {
            return "Firefox";
        }

        if (ua.contains("safari/") &&
                !ua.contains("chrome/")) {

            return "Safari";
        }

        return "Unknown";
    }


    private String detectDeviceType(
            String userAgent
    ) {

        if (userAgent == null) {
            return "Unknown";
        }

        String ua =
                userAgent.toLowerCase();

        if (ua.contains("ipad") ||
                ua.contains("tablet")) {

            return "Tablet";
        }

        if (ua.contains("mobile") ||
                ua.contains("iphone") ||
                ua.contains("android")) {

            return "Mobile";
        }

        return "Desktop";
    }
}