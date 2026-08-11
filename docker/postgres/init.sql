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


CREATE TABLE gateway_rate_limit_policies
(
    id BIGSERIAL PRIMARY KEY,
    gateway_route_id BIGINT NOT NULL REFERENCES gateway_routes(id),
    policy_version INT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT FALSE,
    key_type VARCHAR(30) NOT NULL DEFAULT 'IP',
    replenish_rate INT NOT NULL DEFAULT 10,
    burst_capacity INT NOT NULL DEFAULT 20,
    requested_tokens INT NOT NULL DEFAULT 1,
    temp_block_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    block_duration_seconds INT NOT NULL DEFAULT 60,
    change_note VARCHAR(500),
    created_by VARCHAR(100),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE gateway_rate_limit_policies
ADD CONSTRAINT fk_rate_limit_route
FOREIGN KEY (gateway_route_id)
REFERENCES gateway_routes(id)
ON DELETE CASCADE;