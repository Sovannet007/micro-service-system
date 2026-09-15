import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Main API client
const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Separate client for refresh.
// IMPORTANT: This client has NO auth/refresh interceptor.
const refreshClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// =====================================================
// REQUEST INTERCEPTOR
// =====================================================

axiosClient.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("access_token");

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// =====================================================
// REFRESH STATE
// =====================================================

let isRefreshing = false;

let refreshSubscribers = [];

const subscribeTokenRefresh = (callback) => {
  refreshSubscribers.push(callback);
};

const onRefreshed = (newToken) => {
  refreshSubscribers.forEach((callback) => {
    callback(newToken);
  });

  refreshSubscribers = [];
};

const onRefreshFailed = (error) => {
  refreshSubscribers.forEach((callback) => {
    callback(null, error);
  });

  refreshSubscribers = [];
};

// =====================================================
// RESPONSE INTERCEPTOR
// =====================================================

axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },

  async (error) => {
    const originalRequest = error.config;

    // Not a 401
    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }

    // Don't retry the same request forever
    if (originalRequest?._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    const refreshToken = localStorage.getItem("refresh_token");

    // No refresh token -> logout
    if (!refreshToken) {
      clearAuthentication();
      return Promise.reject(error);
    }

    // =================================================
    // Another request is already refreshing
    // =================================================

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        subscribeTokenRefresh((newToken, refreshError) => {
          if (refreshError || !newToken) {
            reject(refreshError || error);
            return;
          }

          originalRequest.headers.Authorization = `Bearer ${newToken}`;

          resolve(axiosClient(originalRequest));
        });
      });
    }

    // =================================================
    // Start refresh
    // =================================================

    isRefreshing = true;
    try {
      console.log("[AUTH] Access token expired. Refreshing...");

      const response = await refreshClient.post("/api/auth/refresh", {
        refreshToken: refreshToken,
      });
      const result = response.data;
      if (!result.success || !result.data?.access_token) {
        throw new Error(result.message || "Token refresh failed");
      }
      const newAccessToken = result.data.access_token;
      const newRefreshToken = result.data.refresh_token;
      localStorage.setItem("access_token", newAccessToken);

      if (newRefreshToken) {
        localStorage.setItem("refresh_token", newRefreshToken);
      }

      // Update Authorization header
      axiosClient.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;

      console.log("[AUTH] Token refreshed successfully.");

      // Tell waiting requests
      onRefreshed(newAccessToken);

      // Retry original request
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

      return axiosClient(originalRequest);
    } catch (refreshError) {
      console.error("[AUTH] Refresh token failed.", refreshError);
      onRefreshFailed(refreshError);
      clearAuthentication();
      // Redirect to login
      window.location.href = "/login";
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

// =====================================================
// CLEAR AUTHENTICATION
// =====================================================

function clearAuthentication() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user_info");

  delete axiosClient.defaults.headers.common.Authorization;
}

export default axiosClient;
