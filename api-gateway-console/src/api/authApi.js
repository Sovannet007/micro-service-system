export const authApi = {
  login: async (username, password) => {
    // Simulated Keycloak auth response token
    if (
      username === "admin" ||
      username === "gateway-admin" ||
      password === "password"
    ) {
      const user = {
        username: "gateway-admin",
        email: "novsovannet6@gmail.com",
        roles: ["GATEWAY_ADMIN"],
        token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock_token",
      };
      localStorage.setItem("access_token", user.token);
      localStorage.setItem("user_info", JSON.stringify(user));
      return { success: true, status: 200, data: user };
    } else {
      throw {
        success: false,
        status: 403,
        code: "FORBIDDEN",
        message: "User does not possess GATEWAY_ADMIN role.",
      };
    }
  },
  logout: async () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_info");
    return { success: true };
  },
};
