export const API_ENDPOINTS = {
  // Authentication & Session
  AUTH_REFRESH: "/api/auth/refresh",
  AUTH_LOGOUT: "/api/auth/logout",
  AUTH_LOGOUT_ALL: (userId) => `/api/auth/logout-all/${userId}`,
  SESSIONS: "/api/auth/session",
  SESSION_DETAIL: (sessionId) => `/api/auth/session/${sessionId}`,

  // Routes Management
  ROUTES: "/api/gateway/routes",
  ROUTE_DETAIL: (routeId) => `/api/gateway/routes/${routeId}`,
  ROUTE_DELETE: (routeId) => `/api/gateway/routes/${routeId}/delete`,

  // Rate Limiting
  RATE_LIMIT: (routeId) => `/api/gateway/routes/${routeId}/rate-limit`,
  RATE_LIMIT_ACTIVE: (routeId) =>
    `/api/gateway/routes/${routeId}/rate-limit/active`,
  RATE_LIMIT_VERSIONS: (routeId) =>
    `/api/gateway/routes/${routeId}/rate-limit/versions`,

  // Blocked Clients
  BLOCKED_CLIENTS: "/api/gateway/block",
  UNBLOCK_CLIENT: (clientId) => `/api/gateway/block/${clientId}`,

  // Monitoring
  PROMETHEUS_HEALTH: "/actuator/health/prometheus",
  GRAFANA_METRICS: "/actuator/prometheus",
};
