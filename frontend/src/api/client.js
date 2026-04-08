import axios from "axios";
import { supabase } from "../lib/supabase";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use(async (config) => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const token = session?.access_token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const message =
      error.response?.data?.message || error.message || "Erreur réseau";

    if (status === 401) {
      await supabase.auth.signOut();
      window.location.href = "/login";
      return Promise.reject(error);
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