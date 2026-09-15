import apiClient from "./axiosClient";

export const authApi = {
  login: async (username, password) => {
    try {
      const response = await apiClient.post("/api/auth/login", {
        username,
        password,
      });

      const result = response.data;

      if (!result.success) {
        throw new Error(result.message || "Authentication failed");
      }

      const authData = result.data;

      if (!authData?.access_token) {
        throw new Error("Access token was not returned by server.");
      }

      const user = {
        username,
        access_token: authData.access_token,
        refresh_token: authData.refresh_token,
        expires_in: authData.expires_in,
        refresh_expires_in: authData.refresh_expires_in,
        scope: authData.scope,
        token_type: authData.token_type,
        roles: ["GATEWAY_ADMIN"],
      };

      localStorage.setItem("access_token", authData.access_token);

      if (authData.refresh_token) {
        localStorage.setItem("refresh_token", authData.refresh_token);
      }

      localStorage.setItem("user_info", JSON.stringify(user));

      return {
        success: true,
        status: result.status,
        data: user,
      };
    } catch (error) {
      const backendError = error.response?.data;

      throw new Error(
        backendError?.message || error.message || "Authentication failed",
        { cause: error },
      );
    }
  },

  logout: async () => {
    try {
      await apiClient.post("/api/auth/logout");
    } finally {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user_info");
    }

    return {
      success: true,
    };
  },

  refreshToken: async () => {
    const refreshToken = localStorage.getItem("refresh_token");

    if (!refreshToken) {
      throw new Error("No refresh token available.");
    }

    try {
      const response = await apiClient.post("/api/auth/refresh", {
        refresh_token: refreshToken,
      });

      const result = response.data;

      if (!result.success) {
        throw new Error(result.message || "Token refresh failed");
      }

      const authData = result.data;

      localStorage.setItem("access_token", authData.access_token);

      if (authData.refresh_token) {
        localStorage.setItem("refresh_token", authData.refresh_token);
      }

      return authData;
    } catch (error) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user_info");

      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Token refresh failed",
        { cause: error },
      );
    }
  },
};
