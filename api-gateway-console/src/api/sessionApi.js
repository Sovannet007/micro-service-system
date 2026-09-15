import apiClient from "./axiosClient";
import { initialSessions } from "../mock/mockData";

let mockSessions = [...initialSessions];

export const sessionApi = {
  getSessions: async () => {
    return apiClient.get("/api/admin/sessions");
  },

  revokeSession: async (sessionId) => {
    return apiClient.delete(`/api/admin/sessions/${sessionId}`);
  },

  logoutAll: async (userId) => {
    if (import.meta.env.VITE_USE_MOCK !== "false") {
      mockSessions = [];
      return { success: true, status: 200, code: "SUCCESS", data: null };
    }
    return apiClient.post(`/auth/logout-all/${userId}`);
  },
};
