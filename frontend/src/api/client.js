import axios from "axios";
import { supabase } from "../lib/supabase";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

let accessToken = null;

// ⚠️ PAS d'await ici
const initToken = async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  accessToken = session?.access_token ?? null;
};

// appelle sans bloquer
initToken();

supabase.auth.onAuthStateChange((_event, session) => {
  accessToken = session?.access_token ?? null;
});

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

export default api;