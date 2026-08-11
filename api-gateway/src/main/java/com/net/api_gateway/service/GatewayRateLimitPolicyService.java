package com.net.api_gateway.service;

import com.net.api_gateway.dto.GatewayRateLimitPolicyRequest;
import com.net.api_gateway.dto.GatewayRateLimitPolicyResponse;
import com.net.api_gateway.entity.GatewayRateLimitPolicy;
import com.net.api_gateway.repository.GatewayRateLimitPolicyRepository;
import com.net.api_gateway.repository.GatewayRouteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cloud.gateway.event.RefreshRoutesEvent;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class GatewayRateLimitPolicyService {

    private final GatewayRateLimitPolicyRepository repository;
    private final GatewayRouteRepository routeRepository;
    private final ApplicationEventPublisher publisher;

    @Transactional
    public Mono<GatewayRateLimitPolicyResponse> save(Long gatewayRouteId, GatewayRateLimitPolicyRequest req) {
        return routeRepository.existsById(gatewayRouteId).flatMap(exists -> {
            if (!exists) return Mono.error(new RuntimeException("Gateway route not found"));

            return repository.findTopByGatewayRouteIdOrderByPolicyVersionDesc(gatewayRouteId)
                    .map(x -> x.getPolicyVersion() + 1)
                    .defaultIfEmpty(1)
                    .flatMap(version -> repository.deactivateActivePolicy(gatewayRouteId)
                            .then(Mono.defer(() -> {
                                GatewayRateLimitPolicy policy = new GatewayRateLimitPolicy();
                                policy.setGatewayRouteId(gatewayRouteId);
                                policy.setPolicyVersion(version);
                                policy.setIsActive(true);
                                policy.setKeyType("IP");
                                policy.setReplenishRate(req.replenishRate());
                                policy.setBurstCapacity(req.burstCapacity());
                                policy.setRequestedTokens(req.requestedTokens());
                                policy.setTempBlockEnabled(req.tempBlockEnabled());
                                policy.setBlockDurationSeconds(req.blockDurationSeconds());
                                policy.setChangeNote(req.changeNote());
                                policy.setCreatedBy(req.createdBy());
                                policy.setCreatedAt(LocalDateTime.now());

                                return repository.save(policy);
                            })));
        }).map(this::toResponse).doOnSuccess(x -> publisher.publishEvent(new RefreshRoutesEvent(this)));
    }

    public Mono<GatewayRateLimitPolicyResponse> getActive(Long gatewayRouteId) {
        return repository.findByGatewayRouteIdAndIsActiveTrue(gatewayRouteId).map(this::toResponse);
    }

    public Flux<GatewayRateLimitPolicyResponse> getVersions(Long gatewayRouteId) {
        return repository.findByGatewayRouteIdOrderByPolicyVersionDesc(gatewayRouteId).map(this::toResponse);
    }

    @Transactional
    public Mono<Void> disable(Long gatewayRouteId) {
        return repository.deactivateActivePolicy(gatewayRouteId).doOnSuccess(x ->
                publisher.publishEvent(new RefreshRoutesEvent(this))
        ).then();
    }

    private GatewayRateLimitPolicyResponse toResponse(GatewayRateLimitPolicy x) {
        return new GatewayRateLimitPolicyResponse(
                x.getId(),
                x.getGatewayRouteId(),
                x.getPolicyVersion(),
                x.getIsActive(),
                x.getKeyType(),
                x.getReplenishRate(),
                x.getBurstCapacity(),
                x.getRequestedTokens(),
                x.getTempBlockEnabled(),
                x.getBlockDurationSeconds(),
                x.getChangeNote(),
                x.getCreatedBy(),
                x.getCreatedAt()
        );
    }
}