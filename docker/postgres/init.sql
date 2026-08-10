CREATE TABLE IF NOT EXISTS gateway_routes
(
    id              BIGSERIAL PRIMARY KEY,
    route_id        VARCHAR(100) NOT NULL UNIQUE,
    uri             VARCHAR(500) NOT NULL,
    path_pattern    VARCHAR(500) NOT NULL,
    strip_prefix    INTEGER NOT NULL DEFAULT 0,
    route_order     INTEGER NOT NULL DEFAULT 0,
    enabled         BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);