import { supabase } from "../config/supabase.js";
import { ApiError } from "../utils/apiError.js";

export const register = async (req, res, next) => {
  try {
    const {
      first_name,
      last_name,
      phone,
      email,
      password,
      organization_id,
    } = req.body;

    const cleanFirstName = first_name?.trim() || "";
    const cleanLastName = last_name?.trim() || "";
    const cleanPhone = phone?.trim() || null;
    const cleanEmail = email?.trim().toLowerCase() || "";

    if (!cleanFirstName) {
      throw new ApiError(400, "Le prénom est obligatoire");
    }

    if (!cleanLastName) {
      throw new ApiError(400, "Le nom est obligatoire");
    }

    if (!cleanEmail) {
      throw new ApiError(400, "L'email est obligatoire");
    }

    if (!password || password.length < 6) {
      throw new ApiError(
        400,
        "Le mot de passe est obligatoire et doit contenir au moins 6 caractères"
      );
    }

    if (organization_id) {
      const { data: organization, error: organizationError } = await supabase
        .from("organizations")
        .select("id, is_active, deleted_at")
        .eq("id", organization_id)
        .single();

      if (organizationError || !organization) {
        throw new ApiError(400, "Organisation invalide");
      }

      if (!organization.is_active || organization.deleted_at) {
        throw new ApiError(400, "Cette organisation n'est pas disponible");
      }
    }

    const { data: existingProfile, error: existingProfileError } =
      await supabase
        .from("profiles")
        .select("id, email")
        .eq("email", cleanEmail)
        .maybeSingle();

    if (existingProfileError) {
      throw new ApiError(500, existingProfileError.message);
    }

    if (existingProfile) {
      throw new ApiError(409, "Un compte existe déjà avec cette adresse email");
    }

    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email: cleanEmail,
        password,
        email_confirm: true,
        user_metadata: {
          first_name: cleanFirstName,
          last_name: cleanLastName,
        },
      });

    if (authError || !authData?.user) {
      throw new ApiError(400, authError?.message || "Erreur lors de la création du compte");
    }

    const userId = authData.user.id;

    const { error: profileError } = await supabase.from("profiles").insert({
      id: userId,
      email: cleanEmail,
      first_name: cleanFirstName,
      last_name: cleanLastName,
      phone: cleanPhone,
      role: "fidel",
      status: "pending",
      organization_id: organization_id || null,
      must_change_password: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: null,
      updated_by: null,
    });

    if (profileError) {
      await supabase.auth.admin.deleteUser(userId);
      throw new ApiError(400, profileError.message);
    }

    res.status(201).json({
      message: "Inscription envoyée. Votre compte sera validé par un administrateur.",
    });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    if (!req.user || !req.profile) {
      throw new ApiError(401, "Utilisateur non authentifié");
    }

    const { password } = req.body;

    if (!password || password.length < 6) {
      throw new ApiError(
        400,
        "Le nouveau mot de passe doit contenir au moins 6 caractères"
      );
    }

    const { error: passwordError } = await supabase.auth.admin.updateUserById(
      req.user.id,
      { password }
    );

    if (passwordError) {
      throw new ApiError(400, passwordError.message);
    }

    const now = new Date().toISOString();

    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        must_change_password: false,
        updated_at: now,
        updated_by: req.user.id,
      })
      .eq("id", req.user.id);

    if (profileError) {
      throw new ApiError(400, profileError.message);
    }

    res.json({
      message: "Mot de passe mis à jour avec succès",
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    if (!req.user || !req.profile) {
      throw new ApiError(401, "Utilisateur non authentifié");
    }

    const firstName = req.profile.first_name?.trim?.() || "";
    const lastName = req.profile.last_name?.trim?.() || "";
    const displayName = `${firstName} ${lastName}`.trim();

    res.json({
      id: req.user.id,
      email: req.profile.email || req.user.email || null,
      first_name: firstName || null,
      last_name: lastName || null,
      display_name: displayName || null,
      phone: req.profile.phone || null,
      role: req.profile.role,
      status: req.profile.status,
      organization_id: req.profile.organization_id || null,
      organization: req.profile.organization || null,
      must_change_password: req.profile.must_change_password ?? false,
      created_at: req.profile.created_at,
      updated_at: req.profile.updated_at || null,
    });
  } catch (error) {
    next(error);
  }
};