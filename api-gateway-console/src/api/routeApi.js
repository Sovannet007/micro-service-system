import { axiosClient } from "./axiosClient";
import { initialRoutes } from "../mock/mockData";

let mockRoutes = [...initialRoutes];

export const routeApi = {
  getRoutes: async () => {
    if (import.meta.env.VITE_USE_MOCK !== "false") {
      return { success: true, status: 200, code: "SUCCESS", data: mockRoutes };
    }
    return axiosClient.get("/gateway/routes");
  },

  getRouteById: async (id) => {
    if (import.meta.env.VITE_USE_MOCK !== "false") {
      const route = mockRoutes.find((r) => r.routeId === id);
      return { success: true, status: 200, code: "SUCCESS", data: route };
    }
    return axiosClient.get(`/gateway/routes/${id}`);
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
    return axiosClient.post("/gateway/routes", routeData);
  },

  deleteRoute: async (routeId) => {
    if (import.meta.env.VITE_USE_MOCK !== "false") {
      mockRoutes = mockRoutes.filter((r) => r.routeId !== routeId);
      return { success: true, status: 200, code: "SUCCESS", data: null };
    }
    return axiosClient.post(`/gateway/routes/${routeId}/delete`);
  },
};
