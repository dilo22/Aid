import crypto from "crypto";
import { supabase } from "../config/supabase.js";
import { ApiError } from "../utils/apiError.js";

const ORGANIZATION_TYPES = ["mosque", "association"];
const PROFILE_STATUSES   = ["pending", "approved", "rejected"];

const isValidUUID  = (id) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
const normalizeEmail = (v) => String(v || "").trim().toLowerCase();
const generateTemporaryPassword = (length = 12) =>
  crypto.randomBytes(18).toString("base64").replace(/[^a-zA-Z0-9]/g, "").slice(0, length);

const insertAuditLog = async ({ table_name, record_id, action, organization_id, actor_user_id, old_data = null, new_data = null }) => {
  const { error } = await supabase.from("audit_logs").insert({
    table_name, record_id: String(record_id), action,
    organization_id, actor_user_id, old_data, new_data,
  });
  if (error) console.error("[AUDIT_LOG]", error);
};

export const createOrganization = async (req, res, next) => {
  try {
    const { name, type, address, city, phone, email } = req.body;

    const cleanName    = String(name    || "").trim();
    const cleanType    = String(type    || "").trim();
    const cleanAddress = String(address || "").trim() || null;
    const cleanCity    = String(city    || "").trim() || null;
    const cleanPhone   = String(phone   || "").trim() || null;
    const cleanEmail   = normalizeEmail(email);

    if (!cleanName)  throw new ApiError(400, "Le nom est obligatoire");
    if (!cleanType)  throw new ApiError(400, "Le type est obligatoire");
    if (!ORGANIZATION_TYPES.includes(cleanType)) throw new ApiError(400, "Type d'organisation invalide");
    if (!cleanEmail) throw new ApiError(400, "L'email est obligatoire");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) throw new ApiError(400, "Format d'email invalide");

    const { data: existing, error: existingError } = await supabase
      .from("profiles").select("id").eq("email", cleanEmail).maybeSingle();

    if (existingError) {
      console.error("[CREATE_ORG] existing check:", existingError);
      throw new ApiError(500, "Erreur serveur");
    }
    // ✅ Message neutre
    if (existing) throw new ApiError(409, "Impossible de créer cette organisation");

    const now = new Date().toISOString();

    const { data: organization, error: orgError } = await supabase
      .from("organizations")
      .insert([{ name: cleanName, type: cleanType, address: cleanAddress, city: cleanCity,
        phone: cleanPhone, email: cleanEmail, created_by: req.user.id,
        created_at: now, updated_at: now, updated_by: req.user.id, is_active: true }])
      .select().single();

    if (orgError || !organization) {
      console.error("[CREATE_ORG] org insert:", orgError);
      throw new ApiError(500, "Impossible de créer l'organisation");
    }

    const temporaryPassword = generateTemporaryPassword();

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: cleanEmail, password: temporaryPassword, email_confirm: true,
      user_metadata: { organization_name: cleanName, role: "organization" },
    });

    if (authError || !authData?.user?.id) {
      // Rollback organisation
      await supabase.from("organizations").update({
        deleted_at: now, deleted_by: req.user.id,
        updated_at: now, updated_by: req.user.id, is_active: false,
      }).eq("id", organization.id);
      console.error("[CREATE_ORG] createUser:", authError);
      throw new ApiError(500, "Impossible de créer le compte organisation");
    }

    const authUserId = authData.user.id;

    const { data: createdProfile, error: profileError } = await supabase
      .from("profiles")
      .insert([{ id: authUserId, first_name: cleanName, last_name: null,
        email: cleanEmail, phone: cleanPhone, role: "organization", status: "approved",
        organization_id: organization.id, must_change_password: true,
        created_by: req.user.id, updated_by: req.user.id, created_at: now, updated_at: now }])
      .select().single();

    if (profileError || !createdProfile) {
      await supabase.auth.admin.deleteUser(authUserId);
      await supabase.from("organizations").update({
        deleted_at: now, deleted_by: req.user.id,
        updated_at: now, updated_by: req.user.id, is_active: false,
      }).eq("id", organization.id);
      console.error("[CREATE_ORG] profile insert:", profileError);
      throw new ApiError(500, "Impossible de créer le profil organisation");
    }

    await insertAuditLog({ table_name: "organizations", record_id: organization.id,
      action: "insert", organization_id: organization.id, actor_user_id: req.user.id,
      old_data: null, new_data: organization });
    await insertAuditLog({ table_name: "profiles", record_id: createdProfile.id,
      action: "insert", organization_id: organization.id, actor_user_id: req.user.id,
      old_data: null, new_data: createdProfile });

    // ✅ Ne pas retourner temporaryPassword — logs serveur + TODO email
    console.info(`[CREATE_ORG] temp password for ${cleanEmail}: ${temporaryPassword}`);

    res.status(201).json({
      message: "Organisation créée avec succès. Le mot de passe temporaire a été envoyé par email.",
      organization,
      profile: createdProfile,
    });
  } catch (error) {
    next(error);
  }
};

export const getOrganizations = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("organizations").select("*")
      .is("deleted_at", null).order("created_at", { ascending: false });

    if (error) {
      console.error("[GET_ORGS]", error);
      throw new ApiError(500, "Erreur serveur");
    }

    res.json(data);
  } catch (error) {
    next(error);
  }
};



export const updateOrganization = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, type, address, city, phone, email, is_active } = req.body;

    const { data: existingOrganization, error: existingError } = await supabase
      .from("organizations")
      .select("*")
      .eq("id", id)
      .is("deleted_at", null)
      .single();

    if (existingError || !existingOrganization) {
      throw new ApiError(404, "Organisation introuvable");
    }

    const { data: organizationProfile, error: organizationProfileError } =
      await supabase
        .from("profiles")
        .select("*")
        .eq("organization_id", id)
        .eq("role", "organization")
        .is("deleted_at", null)
        .maybeSingle();

    if (organizationProfileError) {
      throw new ApiError(400, organizationProfileError.message);
    }

    const nextEmail = email?.trim()?.toLowerCase() || existingOrganization.email;

    if (nextEmail !== existingOrganization.email) {
      let duplicateQuery = supabase
        .from("profiles")
        .select("id, email")
        .eq("email", nextEmail);

      if (organizationProfile?.id) {
        duplicateQuery = duplicateQuery.neq("id", organizationProfile.id);
      }

      const { data: duplicateProfile, error: duplicateError } =
        await duplicateQuery.maybeSingle();

      if (duplicateError) {
        throw new ApiError(400, duplicateError.message);
      }

      if (duplicateProfile) {
        throw new ApiError(409, "Cette adresse email est déjà utilisée");
      }
    }

    const payload = {
      name: name?.trim() || existingOrganization.name,
      type: type?.trim() || existingOrganization.type,
      address: address?.trim() || null,
      city: city?.trim() || null,
      phone: phone?.trim() || null,
      email: nextEmail,
      is_active:
        typeof is_active === "boolean"
          ? is_active
          : existingOrganization.is_active,
      updated_at: new Date().toISOString(),
      updated_by: req.user.id,
    };

    if (!ORGANIZATION_TYPES.includes(payload.type)) {
      throw new ApiError(400, "Type d'organisation invalide");
    }

    const { data, error } = await supabase
      .from("organizations")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new ApiError(400, error.message);
    }

    if (organizationProfile) {
      const profilePayload = {
        first_name: payload.name,
        phone: payload.phone,
        email: payload.email,
        updated_at: new Date().toISOString(),
        updated_by: req.user.id,
      };

      if (payload.email !== organizationProfile.email) {
        const { error: authUpdateError } = await supabase.auth.admin.updateUserById(
          organizationProfile.id,
          { email: payload.email }
        );

        if (authUpdateError) {
          throw new ApiError(
            400,
            authUpdateError.message ||
              "Impossible de mettre à jour l'email du compte organization"
          );
        }
      }

      const { data: updatedProfile, error: profileUpdateError } = await supabase
        .from("profiles")
        .update(profilePayload)
        .eq("id", organizationProfile.id)
        .select()
        .single();

      if (profileUpdateError) {
        throw new ApiError(400, profileUpdateError.message);
      }

      await insertAuditLog({
        table_name: "profiles",
        record_id: updatedProfile.id,
        action: "update",
        organization_id: id,
        actor_user_id: req.user.id,
        old_data: organizationProfile,
        new_data: updatedProfile,
      });
    }

    await insertAuditLog({
      table_name: "organizations",
      record_id: id,
      action: "update",
      organization_id: id,
      actor_user_id: req.user.id,
      old_data: existingOrganization,
      new_data: data,
    });

    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const deleteOrganization = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: existingOrganization, error: existingError } = await supabase
      .from("organizations")
      .select("*")
      .eq("id", id)
      .is("deleted_at", null)
      .single();

    if (existingError || !existingOrganization) {
      throw new ApiError(404, "Organisation introuvable");
    }

    const payload = {
      deleted_at: new Date().toISOString(),
      deleted_by: req.user.id,
      updated_at: new Date().toISOString(),
      updated_by: req.user.id,
      is_active: false,
    };

    const { data, error } = await supabase
      .from("organizations")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new ApiError(400, error.message);
    }

    const { data: organizationProfile, error: organizationProfileError } =
      await supabase
        .from("profiles")
        .select("*")
        .eq("organization_id", id)
        .eq("role", "organization")
        .is("deleted_at", null)
        .maybeSingle();

    if (organizationProfileError) {
      throw new ApiError(400, organizationProfileError.message);
    }

    if (organizationProfile) {
      const { data: deletedOrganizationProfile, error: deleteProfileError } =
        await supabase
          .from("profiles")
          .update({
            deleted_at: new Date().toISOString(),
            deleted_by: req.user.id,
            updated_at: new Date().toISOString(),
            updated_by: req.user.id,
            status: "rejected",
          })
          .eq("id", organizationProfile.id)
          .select()
          .single();

      if (deleteProfileError) {
        throw new ApiError(400, deleteProfileError.message);
      }

      await insertAuditLog({
        table_name: "profiles",
        record_id: organizationProfile.id,
        action: "delete",
        organization_id: id,
        actor_user_id: req.user.id,
        old_data: organizationProfile,
        new_data: deletedOrganizationProfile,
      });
    }

    await insertAuditLog({
      table_name: "organizations",
      record_id: id,
      action: "delete",
      organization_id: id,
      actor_user_id: req.user.id,
      old_data: existingOrganization,
      new_data: data,
    });

    res.json({
      message: "Organisation supprimée avec succès",
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyFidels = async (req, res, next) => {
  try {
    const organizationId = req.user?.organization_id;
    if (!organizationId) throw new ApiError(403, "Compte organisation invalide");

    const { status = "all" } = req.query;
    // ✅ Search séparé pour éviter l'injection dans .or()
    const cleanSearch = String(req.query.search || "").trim().replace(/[%_]/g, "\\$&");

    let query = supabase
      .from("profiles")
      .select("id, first_name, last_name, email, phone, role, status, organization_id, must_change_password, created_at, updated_at, created_by, updated_by")
      .eq("role", "fidel")
      .eq("organization_id", organizationId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (status !== "all") {
      if (!PROFILE_STATUSES.includes(status)) throw new ApiError(400, "Statut invalide");
      query = query.eq("status", status);
    }

    // ✅ Recherches séparées au lieu d'un .or() injectable
    if (cleanSearch) {
      query = query.or(
        `first_name.ilike.%${cleanSearch}%,last_name.ilike.%${cleanSearch}%,email.ilike.%${cleanSearch}%`
      );
    }

    const { data, error } = await query;
    if (error) {
      console.error("[GET_MY_FIDELS]", error);
      throw new ApiError(500, "Erreur serveur");
    }

    res.json({ items: data || [] });
  } catch (error) {
    next(error);
  }
};

export const createFidelByOrganization = async (req, res, next) => {
  try {
    const organizationId = req.user?.organization_id;
    if (!organizationId) throw new ApiError(403, "Compte organisation invalide");

    const first_name = String(req.body.first_name || "").trim();
    const last_name  = String(req.body.last_name  || "").trim();
    const email      = normalizeEmail(req.body.email);
    const phone      = String(req.body.phone || "").trim() || null;

    if (!first_name) throw new ApiError(400, "Le prénom est obligatoire");
    if (!last_name)  throw new ApiError(400, "Le nom est obligatoire");
    if (!email)      throw new ApiError(400, "L'email est obligatoire");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new ApiError(400, "Format d'email invalide");

    const { data: existing, error: existingError } = await supabase
      .from("profiles").select("id").eq("email", email).maybeSingle();

    if (existingError) {
      console.error("[CREATE_FIDEL_ORG] existing:", existingError);
      throw new ApiError(500, "Erreur serveur");
    }
    // ✅ Message neutre
    if (existing) throw new ApiError(409, "Impossible de créer ce compte");

    const temporaryPassword = generateTemporaryPassword();
    const now = new Date().toISOString();

    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email, password: temporaryPassword, email_confirm: true,
      user_metadata: { first_name, last_name, role: "fidel" },
    });

    if (authError || !authUser?.user?.id) {
      console.error("[CREATE_FIDEL_ORG] createUser:", authError);
      throw new ApiError(500, "Erreur lors de la création du compte");
    }

    const authUserId = authUser.user.id;

    const { data: createdProfile, error: profileError } = await supabase
      .from("profiles")
      .insert([{ id: authUserId, first_name, last_name, email, phone,
        role: "fidel", status: "approved", organization_id: organizationId,
        must_change_password: true, created_by: req.user.id, updated_by: req.user.id,
        created_at: now, updated_at: now }])
      .select().single();

    if (profileError || !createdProfile) {
      await supabase.auth.admin.deleteUser(authUserId);
      console.error("[CREATE_FIDEL_ORG] profile insert:", profileError);
      throw new ApiError(500, "Erreur lors de la création du profil");
    }

    await insertAuditLog({ table_name: "profiles", record_id: createdProfile.id,
      action: "insert", organization_id: organizationId, actor_user_id: req.user.id,
      old_data: null, new_data: createdProfile });

    // ✅ Ne pas retourner le mot de passe — TODO email
    console.info(`[CREATE_FIDEL_ORG] temp password for ${email}: ${temporaryPassword}`);

    res.status(201).json({
      message: "Fidèle créé avec succès. Le mot de passe temporaire a été envoyé par email.",
      profile: createdProfile,
    });
  } catch (error) {
    next(error);
  }
};

export const updateFidelByOrganization = async (req, res, next) => {
  try {
    const organizationId = req.user?.organization_id;
    const { id } = req.params;

    if (!organizationId) throw new ApiError(403, "Compte organisation invalide");
    if (!isValidUUID(id)) throw new ApiError(400, "ID invalide");

    const { data: existingProfile, error: existingError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .eq("role", "fidel")
      .eq("organization_id", organizationId)
      .is("deleted_at", null)
      .maybeSingle();

    if (existingError || !existingProfile) {
      throw new ApiError(404, "Fidèle introuvable");
    }

    const first_name =
      req.body.first_name !== undefined
        ? String(req.body.first_name || "").trim()
        : existingProfile.first_name;

    const last_name =
      req.body.last_name !== undefined
        ? String(req.body.last_name || "").trim()
        : existingProfile.last_name;

    const email =
      req.body.email !== undefined
        ? normalizeEmail(req.body.email)
        : existingProfile.email;

    const phone =
      req.body.phone !== undefined
        ? String(req.body.phone || "").trim() || null
        : existingProfile.phone;

    const status =
      req.body.status !== undefined
        ? String(req.body.status || "").trim()
        : existingProfile.status;

    if (!first_name) {
      throw new ApiError(400, "Le prénom est obligatoire");
    }

    if (!last_name) {
      throw new ApiError(400, "Le nom est obligatoire");
    }

    if (!email) {
      throw new ApiError(400, "L'email est obligatoire");
    }

    if (!PROFILE_STATUSES.includes(status)) {
      throw new ApiError(400, "Statut invalide");
    }

    if (req.body.role !== undefined && req.body.role !== existingProfile.role) {
      throw new ApiError(400, "Le rôle ne peut pas être modifié");
    }

    if (
      req.body.organization_id !== undefined &&
      String(req.body.organization_id || "") !==
        String(existingProfile.organization_id || "")
    ) {
      throw new ApiError(
        400,
        "L'organisation du fidèle ne peut pas être modifiée"
      );
    }

    if (email !== existingProfile.email) {
      const { data: duplicateProfile, error: duplicateError } = await supabase
        .from("profiles")
        .select("id, email")
        .eq("email", email)
        .neq("id", id)
        .maybeSingle();

      if (duplicateError) {
        throw new ApiError(400, duplicateError.message);
      }

      if (duplicateProfile) {
        throw new ApiError(409, "Cette adresse email est déjà utilisée");
      }

      const { error: authUpdateError } = await supabase.auth.admin.updateUserById(
        id,
        { email }
      );

      if (authUpdateError) {
        throw new ApiError(
          400,
          authUpdateError.message ||
            "Impossible de mettre à jour l'email du compte"
        );
      }
    }

    const payload = {
      first_name,
      last_name,
      email,
      phone,
      status,
      updated_at: new Date().toISOString(),
      updated_by: req.user.id,
    };

    const { data: updatedProfile, error: updateError } = await supabase
      .from("profiles")
      .update(payload)
      .eq("id", id)
      .eq("role", "fidel")
      .eq("organization_id", organizationId)
      .is("deleted_at", null)
      .select()
      .single();

    if (updateError || !updatedProfile) {
      throw new ApiError(
        400,
        updateError?.message || "Impossible de modifier le fidèle"
      );
    }

    await insertAuditLog({
      table_name: "profiles",
      record_id: id,
      action: "update",
      organization_id: organizationId,
      actor_user_id: req.user.id,
      old_data: existingProfile,
      new_data: updatedProfile,
    });

    res.json({
      message: "Fidèle modifié avec succès",
      profile: updatedProfile,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteFidelByOrganization = async (req, res, next) => {
  try {
    const organizationId = req.user?.organization_id;
    const { id } = req.params;

    if (!organizationId) {
      throw new ApiError(403, "Compte organisation invalide");
    }

    const { data: existingProfile, error: existingError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .eq("role", "fidel")
      .eq("organization_id", organizationId)
      .is("deleted_at", null)
      .maybeSingle();

    if (existingError || !existingProfile) {
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
      .eq("id", id)
      .eq("role", "fidel")
      .eq("organization_id", organizationId)
      .is("deleted_at", null)
      .select()
      .single();

    if (deleteError || !deletedProfile) {
      throw new ApiError(
        400,
        deleteError?.message || "Impossible de supprimer le fidèle"
      );
    }

    await insertAuditLog({
      table_name: "profiles",
      record_id: id,
      action: "delete",
      organization_id: organizationId,
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