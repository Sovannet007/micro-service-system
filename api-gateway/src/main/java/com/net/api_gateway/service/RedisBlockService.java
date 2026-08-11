package com.net.api_gateway.service;

import com.net.api_gateway.dto.BlockedClientResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.ReactiveStringRedisTemplate;
import org.springframework.data.redis.core.ScanOptions;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Base64;

@Service
@RequiredArgsConstructor
public class RedisBlockService {

    private static final String PREFIX = "gateway:block:";

    private final ReactiveStringRedisTemplate redisTemplate;

    public Mono<Boolean> block(
            String routeId,
            String ip,
            int seconds) {

        return redisTemplate.opsForValue().set(
                buildKey(routeId, ip),
                "1",
                Duration.ofSeconds(seconds)
        );
    }

    public Mono<Boolean> isBlocked(String routeId, String ip) {
        return redisTemplate.hasKey(buildKey(routeId, ip));
    }

    public Mono<Long> getRemainingSeconds(String routeId, String ip) {
        return redisTemplate
                .getExpire(buildKey(routeId, ip))
                .map(Duration::getSeconds)
                .defaultIfEmpty(-1L);
    }

    public Mono<Long> unblock(String routeId, String ip) {
        return redisTemplate.delete(buildKey(routeId, ip));
    }

    public Flux<BlockedClientResponse> getBlockedClients() {

        ScanOptions options = ScanOptions.scanOptions()
                .match(PREFIX + "*")
                .count(100)
                .build();

        return redisTemplate.scan(options)
                .flatMap(key -> redisTemplate.getExpire(key)
                        .map(ttl -> {
                            String[] values = parseKey(key);

                            return new BlockedClientResponse(
                                    values[0],
                                    values[1],
                                    ttl.getSeconds()
                            );
                        }));
    }

    private String buildKey(String routeId, String ip) {
        return PREFIX + encode(routeId) + ":" + encode(ip);
    }

    private String[] parseKey(String key) {

        String data = key.substring(PREFIX.length());

        String[] parts = data.split(":", 2);

        return new String[]{
                decode(parts[0]),
                decode(parts[1])
        };
    }

    private String encode(String value) {
        return Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(value.getBytes(StandardCharsets.UTF_8));
    }

    private String decode(String value) {
        return new String(
                Base64.getUrlDecoder().decode(value),
                StandardCharsets.UTF_8
        );
    }
}