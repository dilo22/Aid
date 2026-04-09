import { supabase } from "../config/supabase.js";
import { ApiError } from "../utils/apiError.js";

export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      throw new ApiError(401, "Token manquant");
    }

    const token = authHeader.split(" ")[1];

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      throw new ApiError(401, "Token invalide ou expire");
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select(`
        *,
        organization:organizations!profiles_organization_id_fkey(
          id, name, type, is_active, deleted_at
        )
      `)
      .eq("id", user.id)
      .is("deleted_at", null)
      .single();

    if (profileError || !profile) {
      throw new ApiError(404, "Profil introuvable");
    }

    if (profile.status === "rejected") {
      throw new ApiError(403, "Compte rejete");
    }

    // ✅ Les fideles pending peuvent acceder a leur espace
    if (profile.status === "pending" && profile.role !== "fidel") {
      throw new ApiError(403, "Compte en attente de validation");
    }

    const isAllowedRoute =
      req.originalUrl.includes("/auth/change-password") ||
      req.originalUrl.includes("/auth/me");

    if (profile.must_change_password && !isAllowedRoute) {
      throw new ApiError(403, "Vous devez changer votre mot de passe");
    }

    if (profile.role === "organization" && profile.organization_id) {
      if (!profile.organization) {
        throw new ApiError(403, "Organisation introuvable");
      }
      if (!profile.organization.is_active || profile.organization.deleted_at) {
        throw new ApiError(403, "Organisation desactivee");
      }
    }

    req.user = {
      id:                   user.id,
      email:                user.email,
      role:                 profile.role,
      organization_id:      profile.organization_id,
      status:               profile.status,
      must_change_password: profile.must_change_password ?? false,
    };

    req.profile = profile;
    next();
  } catch (error) {
    next(error);
  }
};