import { createClient } from "@supabase/supabase-js";

// ✅ dotenv déjà chargé dans server.js — pas besoin de le rappeler
const supabaseUrl            = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error(
    "[CONFIG] Variables d'environnement Supabase manquantes — vérifiez SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY"
  );
}

export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false, // ✅ correct — le backend ne gère pas les sessions
    persistSession:   false, // ✅ correct — pas de stockage côté serveur
  },
});