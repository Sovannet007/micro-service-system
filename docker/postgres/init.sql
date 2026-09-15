CREATE TABLE gateway_routes (
    id           BIGSERIAL     PRIMARY KEY,
    route_id     VARCHAR (100) NOT NULL UNIQUE,
    uri          VARCHAR (500) NOT NULL,
    path_pattern VARCHAR (500) NOT NULL,
    strip_prefix INT           DEFAULT 0 NOT NULL,
    route_order  INT           DEFAULT 0 NOT NULL,
    enabled      BOOLEAN       DEFAULT TRUE NOT NULL,
    created_at   TIMESTAMP     DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at   TIMESTAMP     DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE gateway_rate_limit_rules (
    id                     BIGSERIAL     PRIMARY KEY,
    gateway_route_id       BIGINT        NOT NULL,
    rule_name              VARCHAR (100) NOT NULL,
    path_pattern           VARCHAR (500) NOT NULL,
    http_method            VARCHAR (10)  NOT NULL,
    rule_version           INT           DEFAULT 1 NOT NULL,
    is_active              BOOLEAN       DEFAULT TRUE NOT NULL,
    key_type               VARCHAR (30)  DEFAULT 'IP' NOT NULL,
    replenish_rate         INT           NOT NULL,
    burst_capacity         INT           NOT NULL,
    requested_tokens       INT           DEFAULT 1 NOT NULL,
    temp_block_enabled     BOOLEAN       DEFAULT FALSE NOT NULL,
    block_duration_seconds INT           DEFAULT 60 NOT NULL,
    rule_order             INT           DEFAULT -100 NOT NULL,
    change_note            VARCHAR (500),
    created_by             VARCHAR (100),
    created_at             TIMESTAMP     DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE gateway_security_events (
    id                     BIGSERIAL     PRIMARY KEY,
    event_type             VARCHAR (50)  NOT NULL,
    runtime_route_id       VARCHAR (200),
    gateway_route_id       VARCHAR (100),
    rate_limit_rule_id     BIGINT       ,
    http_method            VARCHAR (10) ,
    path                   VARCHAR (500),
    client_ip              VARCHAR (100),
    http_status            INT          ,
    block_duration_seconds INT          ,
    remaining_seconds      BIGINT       ,
    created_at             TIMESTAMP     DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_gateway_security_events_created_at
    ON gateway_security_events(created_at DESC);

CREATE INDEX idx_gateway_security_events_rule
    ON gateway_security_events(rate_limit_rule_id);

CREATE INDEX idx_gateway_security_events_ip
    ON gateway_security_events(client_ip);

CREATE TABLE user_session_devices (
    id                  BIGSERIAL     PRIMARY KEY,
    keycloak_session_id VARCHAR (255) NOT NULL,
    user_id             VARCHAR (255) NOT NULL,
    username            VARCHAR (255),
    ip_address          VARCHAR (100),
    user_agent          TEXT         ,
    device_type         VARCHAR (50) ,
    platform            VARCHAR (100),
    browser             VARCHAR (100),
    created_at          TIMESTAMP     DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_seen_at        TIMESTAMP     DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT uk_user_session_device UNIQUE (keycloak_session_id)
);

CREATE INDEX idx_user_session_devices_user_id
    ON user_session_devices(user_id);