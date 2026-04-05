import crypto from "crypto";
import { supabase } from "../config/supabase.js";
import { ApiError } from "../utils/apiError.js";

const isAdmin = (req) => req.user.role === "admin";

const normalizeEmail = (value) => String(value || "").trim().toLowerCase();

const generateTemporaryPassword = (length = 12) => {
  return crypto
    .randomBytes(18)
    .toString("base64")
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, length);
};

const insertAuditLog = async ({
  table_name,
  record_id,
  action,
  organization_id,
  actor_user_id,
  old_data = null,
  new_data = null,
}) => {
  const { error } = await supabase.from("audit_logs").insert({
    table_name,
    record_id: String(record_id),
    action,
    organization_id,
    actor_user_id,
    old_data,
    new_data,
  });

  if (error) {
    console.error("AUDIT LOG ERROR:", error);
  }
};

export const getPendingUsers = async (req, res, next) => {
  try {
    if (!isAdmin(req)) {
      throw new ApiError(403, "Accès refusé");
    }

    const { data, error } = await supabase
      .from("profiles")
      .select(`
        id,
        email,
        first_name,
        last_name,
        phone,
        role,
        status,
        organization_id,
        must_change_password,
        created_at,
        updated_at,
        deleted_at,
        created_by,
        updated_by,
        deleted_by,
        organization:organizations!profiles_organization_id_fkey(
          id,
          name,
          type,
          is_active
        ),
        created_by_profile:profiles!profiles_created_by_fkey(
          id,
          first_name,
          last_name,
          email,
          role
        ),
        updated_by_profile:profiles!profiles_updated_by_fkey(
          id,
          first_name,
          last_name,
          email,
          role
        ),
        deleted_by_profile:profiles!profiles_deleted_by_fkey(
          id,
          first_name,
          last_name,
          email,
          role
        )
      `)
      .eq("role", "fidel")
      .eq("status", "pending")
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) {
      throw new ApiError(400, error.message);
    }

    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const getApprovedUsers = async (req, res, next) => {
  try {
    if (!isAdmin(req)) {
      throw new ApiError(403, "Accès refusé");
    }

    const { data, error } = await supabase
      .from("profiles")
      .select(`
        id,
        email,
        first_name,
        last_name,
        phone,
        role,
        status,
        organization_id,
        must_change_password,
        created_at,
        updated_at,
        deleted_at,
        created_by,
        updated_by,
        deleted_by,
        organization:organizations!profiles_organization_id_fkey(
          id,
          name,
          type,
          is_active
        ),
        created_by_profile:profiles!profiles_created_by_fkey(
          id,
          first_name,
          last_name,
          email,
          role
        ),
        updated_by_profile:profiles!profiles_updated_by_fkey(
          id,
          first_name,
          last_name,
          email,
          role
        ),
        deleted_by_profile:profiles!profiles_deleted_by_fkey(
          id,
          first_name,
          last_name,
          email,
          role
        )
      `)
      .eq("role", "fidel")
      .eq("status", "approved")
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) {
      throw new ApiError(400, error.message);
    }

    res.json(data);
  } catch (error) {
    next(error);
  }
};


export const approveUser = async (req, res, next) => {
  try {
    if (!isAdmin(req)) {
      throw new ApiError(403, "Accès refusé");
    }

    const { userId } = req.params;

    const { data: target, error: targetError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .is("deleted_at", null)
      .maybeSingle();

    if (targetError || !target) {
      throw new ApiError(404, "Utilisateur introuvable");
    }

    if (target.role !== "fidel") {
      throw new ApiError(400, "Seuls les fidèles peuvent être validés");
    }

    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from("profiles")
      .update({
        status: "approved",
        updated_by: req.user.id,
        updated_at: now,
      })
      .eq("id", userId)
      .select()
      .maybeSingle();

    if (error || !data) {
      throw new ApiError(400, error?.message || "Impossible de valider le fidèle");
    }

    await insertAuditLog({
      table_name: "profiles",
      record_id: userId,
      action: "update",
      organization_id: target.organization_id || null,
      actor_user_id: req.user.id,
      old_data: target,
      new_data: data,
    });

    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const rejectUser = async (req, res, next) => {
  try {
    if (!isAdmin(req)) {
      throw new ApiError(403, "Accès refusé");
    }

    const { userId } = req.params;

    const { data: target, error: targetError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .is("deleted_at", null)
      .maybeSingle();

    if (targetError || !target) {
      throw new ApiError(404, "Utilisateur introuvable");
    }

    if (target.role !== "fidel") {
      throw new ApiError(400, "Seuls les fidèles peuvent être rejetés");
    }

    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from("profiles")
      .update({
        status: "rejected",
        updated_by: req.user.id,
        updated_at: now,
      })
      .eq("id", userId)
      .select()
      .maybeSingle();

    if (error || !data) {
      throw new ApiError(400, error?.message || "Impossible de rejeter le fidèle");
    }

    await insertAuditLog({
      table_name: "profiles",
      record_id: userId,
      action: "update",
      organization_id: target.organization_id || null,
      actor_user_id: req.user.id,
      old_data: target,
      new_data: data,
    });

    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const createFidelByAdmin = async (req, res, next) => {
  try {
    if (!isAdmin(req)) {
      throw new ApiError(403, "Accès refusé");
    }

    const { first_name, last_name, email, phone, organization_id } = req.body;

    const cleanFirstName = String(first_name || "").trim();
    const cleanLastName = String(last_name || "").trim();
    const cleanEmail = normalizeEmail(email);
    const cleanPhone = String(phone || "").trim() || null;
    const targetOrganizationId = organization_id || null;

    if (!cleanFirstName) {
      throw new ApiError(400, "Le prénom est obligatoire");
    }

    if (!cleanLastName) {
      throw new ApiError(400, "Le nom est obligatoire");
    }

    if (!cleanEmail) {
      throw new ApiError(400, "L'email est obligatoire");
    }

    if (targetOrganizationId) {
      const { data: organization, error: organizationError } = await supabase
        .from("organizations")
        .select("id, is_active, deleted_at")
        .eq("id", targetOrganizationId)
        .maybeSingle();

      if (organizationError || !organization) {
        throw new ApiError(400, "Organisation invalide");
      }

      if (!organization.is_active || organization.deleted_at) {
        throw new ApiError(400, "Organisation indisponible");
      }
    }

    const { data: existingProfile, error: existingProfileError } = await supabase
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

    const temporaryPassword = generateTemporaryPassword();
    const now = new Date().toISOString();

    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email: cleanEmail,
        password: temporaryPassword,
        email_confirm: true,
        user_metadata: {
          first_name: cleanFirstName,
          last_name: cleanLastName,
          role: "fidel",
        },
      });

    if (authError || !authData?.user) {
      throw new ApiError(
        400,
        authError?.message || "Erreur création utilisateur"
      );
    }

    const userId = authData.user.id;

    const { data: createdProfile, error: profileInsertError } = await supabase
      .from("profiles")
      .insert({
        id: userId,
        first_name: cleanFirstName,
        last_name: cleanLastName,
        email: cleanEmail,
        phone: cleanPhone,
        role: "fidel",
        status: "approved",
        organization_id: targetOrganizationId,
        must_change_password: true,
        created_by: req.user.id,
        updated_by: req.user.id,
        created_at: now,
        updated_at: now,
      })
      .select()
      .maybeSingle();

    if (profileInsertError || !createdProfile) {
      await supabase.auth.admin.deleteUser(userId);
      throw new ApiError(
        400,
        profileInsertError?.message || "Erreur création profil"
      );
    }

    await insertAuditLog({
      table_name: "profiles",
      record_id: userId,
      action: "insert",
      organization_id: targetOrganizationId,
      actor_user_id: req.user.id,
      old_data: null,
      new_data: createdProfile,
    });

    res.status(201).json({
      message: "Fidèle créé avec succès",
      temporaryPassword,
      profile: createdProfile,
    });
  } catch (error) {
    next(error);
  }
};

export const assignSheepToFidel = async (req, res, next) => {
  try {
    if (!isAdmin(req)) {
      throw new ApiError(403, "Accès refusé");
    }

    const { userId } = req.params;
    const { sheepId } = req.body;

    if (!sheepId) {
      throw new ApiError(400, "sheepId requis");
    }

    const { data: fidel, error: fidelError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .eq("role", "fidel")
      .is("deleted_at", null)
      .maybeSingle();

    if (fidelError || !fidel) {
      throw new ApiError(404, "Fidèle introuvable");
    }

    const { data: sheep, error: sheepError } = await supabase
      .from("sheep")
      .select("*")
      .eq("id", sheepId)
      .maybeSingle();

    if (sheepError || !sheep) {
      throw new ApiError(404, "Mouton introuvable");
    }

    if (sheep.status !== "available") {
      throw new ApiError(400, "Mouton non disponible");
    }

    const { error: reservationError } = await supabase
      .from("reservations")
      .insert([
        {
          fidel_id: userId,
          sheep_id: sheepId,
          status: "confirmed",
          validated_by: req.user.id,
        },
      ]);

    if (reservationError) {
      throw new ApiError(400, reservationError.message);
    }

    const { error: updateError } = await supabase
      .from("sheep")
      .update({ status: "assigned" })
      .eq("id", sheepId);

    if (updateError) {
      throw new ApiError(400, updateError.message);
    }

    await insertAuditLog({
      table_name: "reservations",
      record_id: `${userId}:${sheepId}`,
      action: "insert",
      organization_id: fidel.organization_id || null,
      actor_user_id: req.user.id,
      old_data: null,
      new_data: {
        fidel_id: userId,
        sheep_id: sheepId,
        status: "confirmed",
      },
    });

    res.json({ message: "Mouton attribué avec succès" });
  } catch (error) {
    next(error);
  }
};