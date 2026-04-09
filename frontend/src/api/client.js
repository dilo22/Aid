import axios from "axios";
import { supabase } from "../lib/supabase";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status  = error.response?.status;
    const message = error.response?.data?.message || error.message || "Erreur réseau";

    if (status === 401) {
      await supabase.auth.signOut();
      window.location.href = "/login";
      return Promise.reject(error);
    }

    if (status === 403) {
      // ✅ Changer mot de passe
      if (message.includes("changer votre mot de passe")) {
        if (!window.location.pathname.includes("/change-password")) {
          window.location.href = "/change-password";
        }
        return Promise.reject(error);
      }

      // ✅ Compte pending — ne pas rediriger, le frontend gère
      if (message.includes("attente de validation")) {
        return Promise.reject(error);
      }

      // ✅ Compte rejeté
      if (message.includes("rejeté")) {
        await supabase.auth.signOut();
        window.location.href = "/login";
        return Promise.reject(error);
      }
    }

    if (status === 429) {
      error.message = "Trop de requêtes. Veuillez patienter.";
      return Promise.reject(error);
    }

    error.message = message;
    return Promise.reject(error);
  }
);

export default api;