import apiClient from "./axiosClient";
import { initialRateLimits, initialBlockedClients } from "../mock/mockData";

let mockLimits = [...initialRateLimits];
let mockBlocked = [...initialBlockedClients];

export const rateLimitApi = {
  getRateLimits: async () => {
    if (import.meta.env.VITE_USE_MOCK !== "false") {
      return { success: true, status: 200, code: "SUCCESS", data: mockLimits };
    }
    return apiClient.get("/gateway/rate-limits");
  },

  saveRateLimit: async (limitData) => {
    if (import.meta.env.VITE_USE_MOCK !== "false") {
      const idx = mockLimits.findIndex((l) => l.routeId === limitData.routeId);
      if (idx >= 0) {
        mockLimits[idx] = {
          ...mockLimits[idx],
          ...limitData,
          version: `v${parseInt(mockLimits[idx].version.slice(1)) + 1}`,
          updatedAt: new Date().toISOString(),
        };
      } else {
        mockLimits.push({
          ...limitData,
          version: "v1",
          updatedAt: new Date().toISOString(),
        });
      }
      return { success: true, status: 200, code: "SUCCESS", data: limitData };
    }
    return apiClient.post("/gateway/rate-limit", limitData);
  },

  getBlockedClients: async () => {
    if (import.meta.env.VITE_USE_MOCK !== "false") {
      return { success: true, status: 200, code: "SUCCESS", data: mockBlocked };
    }
    return apiClient.get("/gateway/block");
  },

  unblockClient: async (ip, routeId) => {
    if (import.meta.env.VITE_USE_MOCK !== "false") {
      mockBlocked = mockBlocked.filter(
        (b) => !(b.ip === ip && b.routeId === routeId),
      );
      return { success: true, status: 200, code: "SUCCESS", data: null };
    }
    return apiClient.delete("/gateway/block", { data: { ip, routeId } });
  },

  getActiveLimitOnRoute: async (routeId) => {
    if (import.meta.env.VITE_USE_MOCK !== "false") {
      const limit = mockLimits.find((l) => l.routeId === routeId);
      return { success: true, status: 200, code: "SUCCESS", data: limit };
    }
    return apiClient.get(
      `/api/gateway/rate-limit-policies/${routeId}/rate-limit/active`,
    );
  },

  disableLimitOnRoute: async (routeId) => {
    if (import.meta.env.VITE_USE_MOCK !== "false") {
      const limit = mockLimits.find((l) => l.routeId === routeId);
      if (limit) limit.active = false;
      return { success: true, status: 200, code: "SUCCESS", data: null };
    }
    return apiClient.delete(`/gateway/${routeId}/rate-limit/active`);
  },

  getLimitVersions: async (routeId) => {
    if (import.meta.env.VITE_USE_MOCK !== "false") {
      return {
        success: true,
        status: 200,
        code: "SUCCESS",
        data: [
          {
            version: "v3",
            status: "ACTIVE",
            replenishRate: 5,
            burstCapacity: 10,
            requestedTokens: 1,
            createdAt: "2025-02-10 14:00",
            createdBy: "gateway-admin",
          },
          {
            version: "v2",
            status: "INACTIVE",
            replenishRate: 2,
            burstCapacity: 5,
            requestedTokens: 1,
            createdAt: "2025-01-15 09:30",
            createdBy: "devops-lead",
          },
          {
            version: "v1",
            status: "INACTIVE",
            replenishRate: 1,
            burstCapacity: 2,
            requestedTokens: 1,
            createdAt: "2024-12-01 10:00",
            createdBy: "system",
          },
        ],
      };
    }
    return apiClient.get(
      `/api/gateway/rate-limit-policies/${routeId}/versions`,
    );
  },
};
