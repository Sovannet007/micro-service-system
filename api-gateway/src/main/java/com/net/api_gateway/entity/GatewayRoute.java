package com.net.api_gateway.entity;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import java.time.LocalDateTime;

@Getter
@Setter
@Table("gateway_routes")
public class GatewayRoute {

    @Id
    private Long id;

    @Column("route_id")
    private String routeId;

    @Column("uri")
    private String uri;

    @Column("path_pattern")
    private String pathPattern;

    @Column("strip_prefix")
    private Integer stripPrefix;

    @Column("route_order")
    private Integer routeOrder;

    @Column("enabled")
    private Boolean enabled;

    @Column("created_at")
    private LocalDateTime createdAt;

    @Column("updated_at")
    private LocalDateTime updatedAt;
}