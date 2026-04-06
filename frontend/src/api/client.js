import axios from "axios";
import { supabase } from "../lib/supabase";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// ✅ Intercepteur qui récupère TOUJOURS le token frais avant chaque requête
// Élimine la race condition + garantit qu'un token expiré est refreshé automatiquement
api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// ✅ Intercepteur de réponse — gestion globale des erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status  = error.response?.status;
    const message = error.response?.data?.message || error.message || "Erreur réseau";

    // ✅ Session expirée → déconnexion propre
    if (status === 401) {
      supabase.auth.signOut();
      window.location.href = "/login";
      return Promise.reject(new Error("Session expirée, veuillez vous reconnecter"));
    }

    // ✅ Trop de requêtes → message clair
    if (status === 429) {
      return Promise.reject(new Error("Trop de requêtes. Veuillez patienter."));
    }

    return Promise.reject(new Error(message));
  }
);

export default api;