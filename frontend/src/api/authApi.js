import api from "./client";

export const getMe = async () => {
  const { data } = await api.get("/auth/me");
  return data;
};

export const changePassword = async (password) => {
  const { data } = await api.post("/auth/change-password", {
    password,
  });
  return data;
};