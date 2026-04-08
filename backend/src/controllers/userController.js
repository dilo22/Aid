import crypto from "crypto";
import { supabase } from "../config/supabase.js";
import { ApiError } from "../utils/apiError.js";

const isValidUUID = (id) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

const normalizeEmail = (value) => String(value || "").trim().toLowerCase();

const generateTemporaryPassword = (length = 12) =>
  crypto
    .randomBytes(18)
    .toString("base64")
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, length);

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
    console.error("[AUDIT_LOG] error:", error);
  }
};

const PROFILE_SELECT = `
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
  )
`;

export const getMe = async (req, res, next) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      throw new ApiError(401, "Non authentifié");
    }

    const { data, error } = await supabase
      .from("profiles")
      .select(PROFILE_SELECT)
      .eq("id", userId)
      .is("deleted_at", null)
      .maybeSingle();

    if (error) {
      console.error("[GET_ME]", error);
      throw new ApiError(500, "Erreur serveur");
    }

    if (!data) {
      throw new ApiError(404, "Profil introuvable");
    }

    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const updateMe = async (req, res, next) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      throw new ApiError(401, "Non authentifié");
    }

    const first_name = String(req.body.first_name || "").trim();
    const last_name = String(req.body.last_name || "").trim();
    const phoneRaw = req.body.phone;
    const phone = String(phoneRaw || "").trim() || null;

    if (!first_name) {
      throw new ApiError(400, "Le prénom est obligatoire");
    }

    if (!last_name) {
      throw new ApiError(400, "Le nom est obligatoire");
    }

    const { data: existing, error: existingError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .is("deleted_at", null)
      .maybeSingle();

    if (existingError) {
      console.error("[UPDATE_ME][EXISTING]", existingError);
      throw new ApiError(500, "Erreur serveur");
    }

    if (!existing) {
      throw new ApiError(404, "Profil introuvable");
    }

    const updates = {
      first_name,
      last_name,
      phone,
      updated_at: new Date().toISOString(),
      updated_by: userId,
    };

    const { data: updated, error: updateError } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", userId)
      .is("deleted_at", null)
      .select(PROFILE_SELECT)
      .maybeSingle();

    if (updateError) {
      console.error("[UPDATE_ME][UPDATE]", updateError);
      throw new ApiError(500, "Impossible de mettre à jour le profil");
    }

    if (!updated) {
      throw new ApiError(404, "Profil introuvable après mise à jour");
    }

    await insertAuditLog({
      table_name: "profiles",
      record_id: userId,
      action: "update",
      organization_id: existing.organization_id || null,
      actor_user_id: userId,
      old_data: existing,
      new_data: updated,
    });

    res.json({
      message: "Profil mis à jour avec succès",
      profile: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const getPendingUsers = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select(PROFILE_SELECT)
      .eq("role", "fidel")
      .eq("status", "pending")
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[GET_PENDING_USERS]", error);
      throw new ApiError(500, "Erreur serveur");
    }

    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const getApprovedUsers = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select(PROFILE_SELECT)
      .eq("role", "fidel")
      .eq("status", "approved")
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[GET_APPROVED_USERS]", error);
      throw new ApiError(500, "Erreur serveur");
    }

    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const approveUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (!isValidUUID(userId)) {
      throw new ApiError(400, "ID invalide");
    }

    const { data: target, error: targetError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .is("deleted_at", null)
      .maybeSingle();

    if (targetError) {
      console.error("[APPROVE_USER][TARGET]", targetError);
      throw new ApiError(500, "Erreur serveur");
    }

    if (!target) {
      throw new ApiError(404, "Utilisateur introuvable");
    }

    if (target.role !== "fidel") {
      throw new ApiError(400, "Seuls les fidèles peuvent être validés");
    }

    if (target.status === "approved") {
      throw new ApiError(400, "Utilisateur déjà approuvé");
    }

    const { data, error } = await supabase
      .from("profiles")
      .update({
        status: "approved",
        updated_by: req.user.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .is("deleted_at", null)
      .select(PROFILE_SELECT)
      .maybeSingle();

    if (error) {
      console.error("[APPROVE_USER][UPDATE]", error);
      throw new ApiError(500, "Impossible de valider le fidèle");
    }

    if (!data) {
      throw new ApiError(404, "Utilisateur introuvable");
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
    const { userId } = req.params;

    if (!isValidUUID(userId)) {
      throw new ApiError(400, "ID invalide");
    }

    const { data: target, error: targetError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .is("deleted_at", null)
      .maybeSingle();

    if (targetError) {
      console.error("[REJECT_USER][TARGET]", targetError);
      throw new ApiError(500, "Erreur serveur");
    }

    if (!target) {
      throw new ApiError(404, "Utilisateur introuvable");
    }

    if (target.role !== "fidel") {
      throw new ApiError(400, "Seuls les fidèles peuvent être rejetés");
    }

    if (target.status === "rejected") {
      throw new ApiError(400, "Utilisateur déjà rejeté");
    }

    const { data, error } = await supabase
      .from("profiles")
      .update({
        status: "rejected",
        updated_by: req.user.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .is("deleted_at", null)
      .select(PROFILE_SELECT)
      .maybeSingle();

    if (error) {
      console.error("[REJECT_USER][UPDATE]", error);
      throw new ApiError(500, "Impossible de rejeter le fidèle");
    }

    if (!data) {
      throw new ApiError(404, "Utilisateur introuvable");
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

export const deleteFidelByAdmin = async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (!isValidUUID(userId)) {
      throw new ApiError(400, "ID invalide");
    }

    const { data: existingProfile, error: existingError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .eq("role", "fidel")
      .is("deleted_at", null)
      .maybeSingle();

    if (existingError) {
      console.error("[DELETE_FIDEL_BY_ADMIN][EXISTING]", existingError);
      throw new ApiError(500, "Erreur serveur");
    }

    if (!existingProfile) {
      throw new ApiError(404, "Fidèle introuvable");
    }

    const payload = {
      deleted_at: new Date().toISOString(),
      deleted_by: req.user.id,
      updated_at: new Date().toISOString(),
      updated_by: req.user.id,
      status: "rejected",
    };

    const { data: deletedProfile, error: deleteError } = await supabase
      .from("profiles")
      .update(payload)
      .eq("id", userId)
      .eq("role", "fidel")
      .is("deleted_at", null)
      .select(PROFILE_SELECT)
      .maybeSingle();

    if (deleteError) {
      console.error("[DELETE_FIDEL_BY_ADMIN][UPDATE]", deleteError);
      throw new ApiError(500, "Impossible de supprimer le fidèle");
    }

    if (!deletedProfile) {
      throw new ApiError(404, "Fidèle introuvable");
    }

    await insertAuditLog({
      table_name: "profiles",
      record_id: userId,
      action: "delete",
      organization_id: existingProfile.organization_id || null,
      actor_user_id: req.user.id,
      old_data: existingProfile,
      new_data: deletedProfile,
    });

    res.json({
      message: "Fidèle supprimé avec succès",
      profile: deletedProfile,
    });
  } catch (error) {
    next(error);
  }
};

export const createFidelByAdmin = async (req, res, next) => {
  try {
    const { first_name, last_name, email, phone, organization_id } = req.body;

    const cleanFirstName = String(first_name || "").trim();
    const cleanLastName = String(last_name || "").trim();
    const cleanEmail = normalizeEmail(email);
    const cleanPhone = String(phone || "").trim() || null;

    if (!cleanFirstName) {
      throw new ApiError(400, "Le prénom est obligatoire");
    }

    if (!cleanLastName) {
      throw new ApiError(400, "Le nom est obligatoire");
    }

    if (!cleanEmail) {
      throw new ApiError(400, "L'email est obligatoire");
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      throw new ApiError(400, "Format d'email invalide");
    }

    if (organization_id) {
      if (!isValidUUID(organization_id)) {
        throw new ApiError(400, "ID organisation invalide");
      }

      const { data: org, error: orgError } = await supabase
        .from("organizations")
        .select("id, is_active, deleted_at")
        .eq("id", organization_id)
        .maybeSingle();

      if (orgError) {
        console.error("[CREATE_FIDEL][ORG]", orgError);
        throw new ApiError(500, "Erreur serveur");
      }

      if (!org) {
        throw new ApiError(400, "Organisation invalide");
      }

      if (!org.is_active || org.deleted_at) {
        throw new ApiError(400, "Organisation indisponible");
      }
    }

    const { data: existing, error: existingError } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", cleanEmail)
      .maybeSingle();

    if (existingError) {
      console.error("[CREATE_FIDEL][EXISTING]", existingError);
      throw new ApiError(500, "Erreur serveur");
    }

    if (existing) {
      throw new ApiError(409, "Impossible de créer ce compte");
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
      console.error("[CREATE_FIDEL][AUTH]", authError);
      throw new ApiError(500, "Erreur lors de la création du compte");
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
        organization_id: organization_id || null,
        must_change_password: true,
        created_by: req.user.id,
        updated_by: req.user.id,
        created_at: now,
        updated_at: now,
      })
      .select(PROFILE_SELECT)
      .maybeSingle();

    if (profileInsertError || !createdProfile) {
      await supabase.auth.admin.deleteUser(userId);
      console.error("[CREATE_FIDEL][PROFILE_INSERT]", profileInsertError);
      throw new ApiError(500, "Erreur lors de la création du profil");
    }

    await insertAuditLog({
      table_name: "profiles",
      record_id: userId,
      action: "insert",
      organization_id: organization_id || null,
      actor_user_id: req.user.id,
      old_data: null,
      new_data: createdProfile,
    });

    console.info(
      `[CREATE_FIDEL] temp password for ${cleanEmail}: ${temporaryPassword}`
    );

    res.status(201).json({
      message:
        "Fidèle créé avec succès. Le mot de passe temporaire a été envoyé par email.",
      profile: createdProfile,
    });
  } catch (error) {
    next(error);
  }
};

export const assignSheepToFidel = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { sheepId } = req.body;

    if (!isValidUUID(userId)) {
      throw new ApiError(400, "ID fidèle invalide");
    }

    if (!isValidUUID(sheepId)) {
      throw new ApiError(400, "ID mouton invalide");
    }

    const { data: fidel, error: fidelError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .eq("role", "fidel")
      .is("deleted_at", null)
      .maybeSingle();

    if (fidelError) {
      console.error("[ASSIGN_SHEEP][FIDEL]", fidelError);
      throw new ApiError(500, "Erreur serveur");
    }

    if (!fidel) {
      throw new ApiError(404, "Fidèle introuvable");
    }

    const { data: sheep, error: updateError } = await supabase
      .from("sheep")
      .update({
        status: "assigned",
        fidel_id: userId,
      })
      .eq("id", sheepId)
      .eq("status", "available")
      .select()
      .maybeSingle();

    if (updateError) {
      console.error("[ASSIGN_SHEEP][SHEEP_UPDATE]", updateError);
      throw new ApiError(500, "Erreur serveur");
    }

    if (!sheep) {
      throw new ApiError(409, "Mouton non disponible ou déjà assigné");
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
      await supabase
        .from("sheep")
        .update({ status: "available", fidel_id: null })
        .eq("id", sheepId);

      console.error("[ASSIGN_SHEEP][RESERVATION_INSERT]", reservationError);
      throw new ApiError(500, "Erreur lors de la réservation");
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