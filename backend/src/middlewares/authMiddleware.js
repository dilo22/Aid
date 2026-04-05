import { supabase } from "../config/supabase.js";
import { ApiError } from "../utils/apiError.js";

export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new ApiError(401, "Token manquant");
    }

    const token = authHeader.split(" ")[1];

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      throw new ApiError(401, "Utilisateur non authentifié");
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select(`
        *,
        organization:organizations!profiles_organization_id_fkey(
          id,
          name,
          type,
          is_active,
          deleted_at
        )
      `)
      .eq("id", user.id)
      .is("deleted_at", null)
      .single();

    if (profileError || !profile) {
      throw new ApiError(404, "Profil introuvable");
    }

    if (profile.role === "organization" && profile.organization_id) {
      if (!profile.organization) {
        throw new ApiError(403, "Organisation introuvable");
      }

      if (!profile.organization.is_active || profile.organization.deleted_at) {
        throw new ApiError(403, "Organisation désactivée");
      }
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: profile.role,
      organization_id: profile.organization_id,
      status: profile.status,
      must_change_password: profile.must_change_password ?? false,
    };

    req.profile = profile;

    next();
  } catch (error) {
    next(error);
  }
};