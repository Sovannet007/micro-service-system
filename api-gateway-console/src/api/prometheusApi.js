import axios from "axios";

const prometheusApi = axios.create({
  baseURL: "http://localhost:9090",
  headers: {
    Accept: "application/json",
  },
});

export const getTargets = async () => {
  const response = await prometheusApi.get("/api/v1/targets");
  return response.data.data.activeTargets;
};
