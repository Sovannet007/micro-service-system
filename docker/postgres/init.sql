CREATE TABLE gateway_routes
(
    id BIGSERIAL PRIMARY KEY,
    route_id VARCHAR(100) NOT NULL UNIQUE,
    uri VARCHAR(500) NOT NULL,
    path_pattern VARCHAR(500) NOT NULL,
    strip_prefix INTEGER NOT NULL DEFAULT 0,
    route_order INTEGER NOT NULL DEFAULT 0,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE gateway_rate_limit_rules
(
    id BIGSERIAL PRIMARY KEY,
    gateway_route_id BIGINT NOT NULL,
    rule_name VARCHAR(100) NOT NULL,
    path_pattern VARCHAR(500) NOT NULL,
    http_method VARCHAR(10) NOT NULL,
    rule_version INTEGER NOT NULL DEFAULT 1,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    key_type VARCHAR(30) NOT NULL DEFAULT 'IP',
    replenish_rate INTEGER NOT NULL,
    burst_capacity INTEGER NOT NULL,
    requested_tokens INTEGER NOT NULL DEFAULT 1,
    temp_block_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    block_duration_seconds INTEGER NOT NULL DEFAULT 60,
    rule_order INTEGER NOT NULL DEFAULT -100,
    change_note VARCHAR(500),
    created_by VARCHAR(100),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE gateway_security_events
(
    id BIGSERIAL PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL,
    runtime_route_id VARCHAR(200),
    gateway_route_id VARCHAR(100),
    rate_limit_rule_id BIGINT,
    http_method VARCHAR(10),
    path VARCHAR(500),
    client_ip VARCHAR(100),
    http_status INTEGER,
    block_duration_seconds INTEGER,
    remaining_seconds BIGINT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_gateway_security_events_created_at
ON gateway_security_events(created_at DESC);

CREATE INDEX idx_gateway_security_events_rule
ON gateway_security_events(rate_limit_rule_id);

CREATE INDEX idx_gateway_security_events_ip
ON gateway_security_events(client_ip);