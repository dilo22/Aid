import api from "./client";

export const getMe = async () => {
  const { data } = await api.get("/auth/me");
  return data;
};

// ✅ Envoi du mot de passe actuel requis par le backend
export const changePassword = async ({ current_password, password }) => {
  const { data } = await api.post("/auth/change-password", {
    current_password,
    password,
  });
  return data;
};