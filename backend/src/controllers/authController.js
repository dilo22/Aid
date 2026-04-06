import { supabase } from "../config/supabase.js";
import { ApiError } from "../utils/apiError.js";

// ✅ Helpers de validation
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const isValidUUID = (id) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

const validatePassword = (password) => {
  if (!password || password.length < 8) {
    throw new ApiError(400, "Le mot de passe doit contenir au moins 8 caractères");
  }
  if (!/[A-Z]/.test(password)) {
    throw new ApiError(400, "Le mot de passe doit contenir au moins une majuscule");
  }
  if (!/[0-9]/.test(password)) {
    throw new ApiError(400, "Le mot de passe doit contenir au moins un chiffre");
  }
};

export const register = async (req, res, next) => {
  try {
    const { first_name, last_name, phone, email, password, organization_id } = req.body;

    const cleanFirstName = first_name?.trim() || "";
    const cleanLastName  = last_name?.trim()  || "";
    const cleanPhone     = phone?.trim()       || null;
    const cleanEmail     = email?.trim().toLowerCase() || "";

    // ✅ Validations
    if (!cleanFirstName) throw new ApiError(400, "Le prénom est obligatoire");
    if (!cleanLastName)  throw new ApiError(400, "Le nom est obligatoire");
    if (!cleanEmail)     throw new ApiError(400, "L'email est obligatoire");

    // ✅ Validation format email
    if (!isValidEmail(cleanEmail)) {
      throw new ApiError(400, "Format d'email invalide");
    }

    // ✅ Validation mot de passe renforcée
    validatePassword(password);

    // ✅ Validation UUID organization_id
    if (organization_id && !isValidUUID(organization_id)) {
      throw new ApiError(400, "Identifiant d'organisation invalide");
    }

    if (organization_id) {
      const { data: organization, error: orgError } = await supabase
        .from("organizations")
        .select("id, is_active, deleted_at")
        .eq("id", organization_id)
        .single();

      if (orgError || !organization) {
        throw new ApiError(400, "Organisation invalide");
      }
      if (!organization.is_active || organization.deleted_at) {
        throw new ApiError(400, "Cette organisation n'est pas disponible");
      }
    }

    // ✅ Vérification email existant — message neutre (anti-énumération)
    const { data: existingProfile, error: existingError } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", cleanEmail)
      .maybeSingle();

    if (existingError) {
      // Ne pas exposer le message Supabase
      console.error("[REGISTER] existingProfile check error:", existingError);
      throw new ApiError(500, "Erreur serveur");
    }

    if (existingProfile) {
      // ✅ Message neutre — ne pas confirmer si l'email existe
      throw new ApiError(409, "Impossible de créer ce compte");
    }

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: cleanEmail,
      password,
      email_confirm: true,
      user_metadata: { first_name: cleanFirstName, last_name: cleanLastName },
    });

    if (authError || !authData?.user) {
      console.error("[REGISTER] createUser error:", authError);
      throw new ApiError(400, "Erreur lors de la création du compte");
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
      // ✅ Rollback propre si le profil échoue
      await supabase.auth.admin.deleteUser(userId);
      console.error("[REGISTER] profile insert error:", profileError);
      throw new ApiError(500, "Erreur lors de la création du profil");
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

    const { password, current_password } = req.body;

    // ✅ Vérification de l'ancien mot de passe
    if (!current_password) {
      throw new ApiError(400, "Le mot de passe actuel est requis");
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: req.user.email,
      password: current_password,
    });

    if (signInError) {
      throw new ApiError(403, "Mot de passe actuel incorrect");
    }

    // ✅ Validation du nouveau mot de passe
    validatePassword(password);

    if (password === current_password) {
      throw new ApiError(400, "Le nouveau mot de passe doit être différent de l'ancien");
    }

    const { error: passwordError } = await supabase.auth.admin.updateUserById(
      req.user.id,
      { password }
    );

    if (passwordError) {
      console.error("[CHANGE_PASSWORD] updateUserById error:", passwordError);
      throw new ApiError(500, "Erreur lors de la mise à jour du mot de passe");
    }

    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        must_change_password: false,
        updated_at: new Date().toISOString(),
        updated_by: req.user.id,
      })
      .eq("id", req.user.id);

    if (profileError) {
      console.error("[CHANGE_PASSWORD] profile update error:", profileError);
      throw new ApiError(500, "Erreur lors de la mise à jour du profil");
    }

    res.json({ message: "Mot de passe mis à jour avec succès" });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    if (!req.user || !req.profile) {
      throw new ApiError(401, "Utilisateur non authentifié");
    }

    const firstName   = req.profile.first_name?.trim() || "";
    const lastName    = req.profile.last_name?.trim()  || "";
    const displayName = `${firstName} ${lastName}`.trim();

    res.json({
      id:                   req.user.id,
      email:                req.profile.email || req.user.email || null,
      first_name:           firstName  || null,
      last_name:            lastName   || null,
      display_name:         displayName || null,
      phone:                req.profile.phone || null,
      role:                 req.profile.role,
      status:               req.profile.status,
      organization_id:      req.profile.organization_id || null,
      organization:         req.profile.organization    || null,
      must_change_password: req.profile.must_change_password ?? false,
      created_at:           req.profile.created_at,
      updated_at:           req.profile.updated_at || null,
    });
  } catch (error) {
    next(error);
  }
};