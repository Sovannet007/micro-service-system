import apiClient from "./axiosClient";
import { initialSessions } from "../mock/mockData";

let mockSessions = [...initialSessions];

export const sessionApi = {
  getSessions: async () => {
    if (import.meta.env.VITE_USE_MOCK !== "false") {
      return {
        success: true,
        status: 200,
        code: "SUCCESS",
        data: mockSessions,
      };
    }
    return apiClient.get("/auth/session");
  },

  revokeSession: async (sessionId) => {
    if (import.meta.env.VITE_USE_MOCK !== "false") {
      mockSessions = mockSessions.filter((s) => s.sessionId !== sessionId);
      return { success: true, status: 200, code: "SUCCESS", data: null };
    }
    return apiClient.delete(`/auth/session/${sessionId}`);
  },

  logoutAll: async (userId) => {
    if (import.meta.env.VITE_USE_MOCK !== "false") {
      mockSessions = [];
      return { success: true, status: 200, code: "SUCCESS", data: null };
    }
    return apiClient.post(`/auth/logout-all/${userId}`);
  },
};
