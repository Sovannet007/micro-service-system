package com.net.api_gateway.entity;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import java.time.LocalDateTime;

@Getter
@Setter
@Table("gateway_rate_limit_policies")
public class GatewayRateLimitPolicy {

    @Id
    private Long id;

    @Column("gateway_route_id")
    private Long gatewayRouteId;

    @Column("policy_version")
    private Integer policyVersion;

    @Column("is_active")
    private Boolean isActive;

    @Column("key_type")
    private String keyType;

    @Column("replenish_rate")
    private Integer replenishRate;

    @Column("burst_capacity")
    private Integer burstCapacity;

    @Column("requested_tokens")
    private Integer requestedTokens;

    @Column("temp_block_enabled")
    private Boolean tempBlockEnabled;

    @Column("block_duration_seconds")
    private Integer blockDurationSeconds;

    @Column("change_note")
    private String changeNote;

    @Column("created_by")
    private String createdBy;

    @Column("created_at")
    private LocalDateTime createdAt;
}