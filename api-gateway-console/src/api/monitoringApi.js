import axiosClient, { USE_MOCK_DATA, wrapMockResponse } from "./axiosClient";

export const monitoringApi = {
  getPrometheusStatus: async () => {
    if (USE_MOCK_DATA) {
      return wrapMockResponse({
        target: "api-gateway",
        status: "UP",
        instance: "host.docker.internal:8080",
        job: "api-gateway",
        lastScrape: "2 seconds ago",
        scrapeDurationMs: 42,
        metricsAvailable: 1420,
      });
    }
    return axiosClient.get("/actuator/health");
  },
};
