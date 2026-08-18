package com.net.api_gateway.service;

import com.net.api_gateway.dto.GatewayRateLimitRuleRequest;
import com.net.api_gateway.dto.GatewayRateLimitRuleResponse;
import com.net.api_gateway.entity.GatewayRateLimitRule;
import com.net.api_gateway.repository.GatewayRateLimitRuleRepository;
import com.net.api_gateway.repository.GatewayRouteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cloud.gateway.event.RefreshRoutesEvent;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;
import java.util.Locale;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class GatewayRateLimitRuleService {

    private static final Set<String> ALLOWED_METHODS = Set.of(
            "GET",
            "POST",
            "PUT",
            "PATCH",
            "DELETE",
            "HEAD",
            "OPTIONS"
    );

    private final GatewayRateLimitRuleRepository repository;
    private final GatewayRouteRepository routeRepository;
    private final ApplicationEventPublisher publisher;

    @Transactional
    public Mono<GatewayRateLimitRuleResponse> save(GatewayRateLimitRuleRequest request) {
        validate(request);
        String method = request.httpMethod().trim().toUpperCase(Locale.ROOT);
        String path = request.pathPattern().trim();
        return routeRepository
                .existsById(request.gatewayRouteId())
                .flatMap(routeExists -> {
                    if (!routeExists) {
                        return Mono.error(
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "Gateway route not found"
                                )
                        );
                    }
                    return repository
                            .findFirstByGatewayRouteIdAndPathPatternAndHttpMethodOrderByRuleVersionDesc(request.gatewayRouteId(), path, method)
                            .map(existing -> existing.getRuleVersion() + 1)
                            .defaultIfEmpty(1)
                            .flatMap(nextVersion ->
                                    repository
                                            .deactivateActiveRule(request.gatewayRouteId(), path, method)
                                            .then(
                                                    Mono.defer(() -> {
                                                        GatewayRateLimitRule rule = new GatewayRateLimitRule();
                                                        rule.setGatewayRouteId(request.gatewayRouteId());
                                                        rule.setRuleName(request.ruleName().trim());
                                                        rule.setPathPattern(path);
                                                        rule.setHttpMethod(method);
                                                        rule.setRuleVersion(nextVersion);
                                                        rule.setIsActive(true);
                                                        rule.setKeyType("IP");
                                                        rule.setReplenishRate(request.replenishRate());
                                                        rule.setBurstCapacity(request.burstCapacity());
                                                        rule.setRequestedTokens(
                                                                request.requestedTokens() == null ? 1 : request.requestedTokens()
                                                        );
                                                        rule.setTempBlockEnabled(
                                                                Boolean.TRUE.equals(request.tempBlockEnabled())
                                                        );
                                                        rule.setBlockDurationSeconds(
                                                                request.blockDurationSeconds() == null ? 60 : request.blockDurationSeconds()
                                                        );
                                                        rule.setRuleOrder(
                                                                request.ruleOrder() == null ? -100 : request.ruleOrder()
                                                        );
                                                        rule.setChangeNote(request.changeNote());
                                                        rule.setCreatedBy(request.createdBy());
                                                        rule.setCreatedAt(LocalDateTime.now());
                                                        return repository.save(rule);
                                                    })
                                            )
                            );
                })
                .map(this::toResponse)
                .doOnSuccess(result ->
                        publisher.publishEvent(
                                new RefreshRoutesEvent(this)
                        )
                );
    }

    public Flux<GatewayRateLimitRuleResponse> getActiveRules(Long gatewayRouteId) {
        return repository
                .findByGatewayRouteIdAndIsActiveTrueOrderByRuleOrderAsc(gatewayRouteId)
                .map(this::toResponse);
    }

    public Flux<GatewayRateLimitRuleResponse> getHistory(Long gatewayRouteId, String pathPattern, String httpMethod) {
        String method = httpMethod.trim().toUpperCase(Locale.ROOT);
        return repository
                .findByGatewayRouteIdAndPathPatternAndHttpMethodOrderByRuleVersionDesc(gatewayRouteId, pathPattern, method)
                .map(this::toResponse);
    }

    @Transactional
    public Mono<Void> disable(Long id) {
        return repository
                .deactivateById(id)
                .flatMap(updated -> {
                    if (updated == 0) {
                        return Mono.<Void>error(
                                new ResponseStatusException(HttpStatus.NOT_FOUND, "Active rate limit rule not found")
                        );
                    }
                    return Mono.<Void>empty();
                })
                .doOnSuccess(ignored ->
                        publisher.publishEvent(
                                new RefreshRoutesEvent(this)
                        )
                );
    }

    private void validate(GatewayRateLimitRuleRequest request) {
        if (request.gatewayRouteId() == null) {
            badRequest("gatewayRouteId is required");
        }

        if (request.ruleName() == null ||
                request.ruleName().isBlank()) {
            badRequest("ruleName is required");
        }

        if (request.pathPattern() == null ||
                request.pathPattern().isBlank()) {

            badRequest("pathPattern is required");
        }

        if (!request.pathPattern().startsWith("/")) {
            badRequest("pathPattern must start with /");
        }

        if (request.httpMethod() == null ||
                request.httpMethod().isBlank()) {

            badRequest("httpMethod is required");
        }

        String method =
                request.httpMethod()
                        .trim()
                        .toUpperCase(Locale.ROOT);

        if (!ALLOWED_METHODS.contains(method)) {
            badRequest("Unsupported HTTP method");
        }

        if (request.replenishRate() == null ||
                request.replenishRate() <= 0) {

            badRequest("replenishRate must be greater than 0");
        }

        if (request.burstCapacity() == null ||
                request.burstCapacity() <= 0) {

            badRequest("burstCapacity must be greater than 0");
        }

        int requestedTokens =
                request.requestedTokens() == null
                        ? 1
                        : request.requestedTokens();

        if (requestedTokens <= 0) {
            badRequest("requestedTokens must be greater than 0");
        }

        if (request.burstCapacity() < requestedTokens) {
            badRequest(
                    "burstCapacity must be >= requestedTokens"
            );
        }

        if (Boolean.TRUE.equals(request.tempBlockEnabled())) {

            if (request.blockDurationSeconds() == null ||
                    request.blockDurationSeconds() <= 0) {

                badRequest(
                        "blockDurationSeconds must be greater than 0"
                );
            }
        }
    }

    private void badRequest(String message) {
        throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                message
        );
    }

    private GatewayRateLimitRuleResponse toResponse(
            GatewayRateLimitRule rule) {

        return new GatewayRateLimitRuleResponse(
                rule.getId(),
                rule.getGatewayRouteId(),
                rule.getRuleName(),
                rule.getPathPattern(),
                rule.getHttpMethod(),
                rule.getRuleVersion(),
                rule.getIsActive(),
                rule.getKeyType(),
                rule.getReplenishRate(),
                rule.getBurstCapacity(),
                rule.getRequestedTokens(),
                rule.getTempBlockEnabled(),
                rule.getBlockDurationSeconds(),
                rule.getRuleOrder(),
                rule.getChangeNote(),
                rule.getCreatedBy(),
                rule.getCreatedAt()
        );
    }
}