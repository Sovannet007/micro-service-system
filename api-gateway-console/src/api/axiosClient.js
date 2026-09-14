import axios from "axios";

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== "false"; // Default to true for demo

export const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

axiosClient.interceptors.response.use(
  (response) => {
    // Return backend standard wrapper payload (or response.data)
    return response.data;
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      if (status === 401) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user_info");
        window.location.href = "/login?expired=true";
      }
      return Promise.reject(
        data || {
          success: false,
          status,
          code: status === 403 ? "FORBIDDEN" : "ERROR",
          message: data?.message || "An unexpected server error occurred.",
        },
      );
    }
    return Promise.reject({
      success: false,
      status: 500,
      code: "NETWORK_ERROR",
      message: "Network error or Gateway unreachable.",
    });
  },
);
