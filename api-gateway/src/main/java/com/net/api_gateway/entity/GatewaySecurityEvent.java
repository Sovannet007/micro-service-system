package com.net.api_gateway.entity;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import java.time.LocalDateTime;

@Getter
@Setter
@Table("gateway_security_events")
public class GatewaySecurityEvent {

    @Id
    private Long id;

    @Column("event_type")
    private String eventType;

    @Column("runtime_route_id")
    private String runtimeRouteId;

    @Column("gateway_route_id")
    private String gatewayRouteId;

    @Column("rate_limit_rule_id")
    private Long rateLimitRuleId;

    @Column("http_method")
    private String httpMethod;

    @Column("path")
    private String path;

    @Column("client_ip")
    private String clientIp;

    @Column("http_status")
    private Integer httpStatus;

    @Column("block_duration_seconds")
    private Integer blockDurationSeconds;

    @Column("remaining_seconds")
    private Long remainingSeconds;

    @Column("created_at")
    private LocalDateTime createdAt;
}