import apiClient from "./axiosClient";
import { initialRoutes } from "../mock/mockData";

let mockRoutes = [...initialRoutes];

export const routeApi = {
  getRoutes: async () => {
    if (import.meta.env.VITE_USE_MOCK !== "false") {
      return { success: true, status: 200, code: "SUCCESS", data: mockRoutes };
    }
    return apiClient.get("/api/gateway/routes");
  },

  getRouteById: async (id) => {
    if (import.meta.env.VITE_USE_MOCK !== "false") {
      const route = mockRoutes.find((r) => r.routeId === id);
      return { success: true, status: 200, code: "SUCCESS", data: route };
    }
    return apiClient.get(`/api/gateway/routes/${id}`);
  },

  saveRoute: async (routeData) => {
    if (import.meta.env.VITE_USE_MOCK !== "false") {
      const idx = mockRoutes.findIndex((r) => r.routeId === routeData.routeId);
      const now = new Date().toISOString();
      if (idx >= 0) {
        mockRoutes[idx] = { ...mockRoutes[idx], ...routeData, updatedAt: now };
      } else {
        mockRoutes.push({ ...routeData, createdAt: now, updatedAt: now });
      }
      return { success: true, status: 200, code: "SUCCESS", data: routeData };
    }
    return apiClient.post("/gateway/routes", routeData);
  },

  deleteRoute: async (routeId) => {
    if (import.meta.env.VITE_USE_MOCK !== "false") {
      mockRoutes = mockRoutes.filter((r) => r.routeId !== routeId);
      return { success: true, status: 200, code: "SUCCESS", data: null };
    }
    return apiClient.post(`/gateway/routes/${routeId}/delete`);
  },
};
