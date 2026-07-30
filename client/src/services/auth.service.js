import api from "../api/axios.js";

export const login = async (credentials) => {
  const { data } = await api.post("/auth/login", credentials);
  return data;
};

export const register = async (userData) => {
  const { data } = await api.post("/auth/register", userData);
  return data;
};

export const getMe = async () => {
  const { data } = await api.get("/auth/me");
  return data;
};