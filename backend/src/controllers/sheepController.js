import { supabase } from "../config/supabase.js";
import { ApiError } from "../utils/apiError.js";

const ALLOWED_STATUS = ["available", "assigned", "sacrificed", "missing"];
const ALLOWED_SIZE = ["small", "medium", "large"];
const ALLOWED_PAYMENT_STATUS = [
  "unpaid",
  "partial",
  "paid",
  "overpaid",
  "cancelled",
];
const ALLOWED_SORT_FIELDS = [
  "created_at",
  "number",
  "price",
  "weight",
  "status",
  "size",
  "assigned_at",
  "payment_status",
  "final_price",
];
const ALLOWED_SORT_ORDERS = ["asc", "desc"];

const parseNullableNumber = (value) => {
  if (value === undefined || value === null || value === "") return null;

  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    throw new ApiError(400, "Valeur numérique invalide");
  }

  return parsed;
};

const parseNonNegativeNullableNumber = (value, fieldLabel) => {
  const parsed = parseNullableNumber(value);

  if (parsed !== null && parsed < 0) {
    throw new ApiError(400, `${fieldLabel} ne peut pas être négatif`);
  }

  return parsed;
};

const validateStatus = (status) => {
  if (status && !ALLOWED_STATUS.includes(status)) {
    throw new ApiError(400, "Statut de mouton invalide");
  }
};

const validateSize = (size) => {
  if (size && !ALLOWED_SIZE.includes(size)) {
    throw new ApiError(400, "Taille de mouton invalide");
  }
};

const validatePaymentStatus = (paymentStatus) => {
  if (paymentStatus && !ALLOWED_PAYMENT_STATUS.includes(paymentStatus)) {
    throw new ApiError(400, "Statut de paiement invalide");
  }
};

const normalizeTextOrNull = (value) => {
  if (value === undefined) return undefined;
  if (value === null) return null;

  const cleaned = String(value).trim();
  return cleaned || null;
};

const parseNullableDate = (value, fieldLabel = "Date invalide") => {
  if (value === undefined) return undefined;
  if (value === null || value === "") return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new ApiError(400, fieldLabel);
  }

  return date.toISOString();
};
export const getSheepList = async (req, res, next) => {
  try {
    const {
      search = "", status = "", size = "", color = "",
      sortBy = "created_at", sortOrder = "desc",
      page = 1, limit = 10,
    } = req.query;

    const parsedPage  = Math.max(parseInt(page,  10) || 1,  1);
    const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
    const from = (parsedPage - 1) * parsedLimit;
    const to   = from + parsedLimit - 1;

    const safeSortBy    = ALLOWED_SORT_FIELDS.includes(sortBy)    ? sortBy    : "created_at";
    const safeSortOrder = ALLOWED_SORT_ORDERS.includes(sortOrder) ? sortOrder : "desc";

    let query = supabase
  .from("sheep")
  .select("*", { count: "exact" })
  .is("deleted_at", null);

    // ✅ Filtrage selon le rôle
    if (req.user.role === "fidel") {
      query = query.eq("fidel_id", req.user.id);
    } else if (req.user.role !== "admin" && req.user.organization_id) {
      query = query.eq("organization_id", req.user.organization_id);
    }

    if (search) query = query.ilike("number", `%${search}%`);
    if (status) query = query.eq("status", status);
    if (size)   query = query.eq("size", size);
    if (color)  query = query.eq("color", color);

    query = query.order(safeSortBy, { ascending: safeSortOrder === "asc" }).range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error("[GET_SHEEP_LIST]", error);
      throw new ApiError(500, "Erreur serveur");
    }

    res.json({
      items: data || [],
      meta: { total: count || 0, page: parsedPage, limit: parsedLimit, totalPages: Math.ceil((count || 0) / parsedLimit) || 1 },
    });
  } catch (error) {
    next(error);
  }
};

export const createSheep = async (req, res, next) => {
  try {
    const {
      number,
      photo_url,
      weight,
      price,
      status,
      notes,
      size,
      color,
      fidel_id,
      discount_amount,
      final_price,
      payment_status,
      payment_due_date,
      payment_notes,
      assigned_at,
    } = req.body;

    if (!number || !String(number).trim()) {
      throw new ApiError(400, "Le numéro du mouton est obligatoire");
    }

    validateStatus(status);
    validateSize(size);
    validatePaymentStatus(payment_status);

    const cleanNumber = String(number).trim();
    const cleanWeight = parseNullableNumber(weight);
    const cleanPrice = parseNonNegativeNullableNumber(price, "Le prix");
    const cleanDiscountAmount =
      parseNonNegativeNullableNumber(
        discount_amount,
        "La réduction"
      ) ?? 0;
    const cleanFinalPrice = parseNonNegativeNullableNumber(
      final_price,
      "Le prix final"
    );
    const cleanPaymentDueDate = parseNullableDate(
      payment_due_date,
      "Date d'échéance invalide"
    );
    const cleanAssignedAt = parseNullableDate(
      assigned_at,
      "Date d'attribution invalide"
    );

    const cleanFidelId =
      fidel_id === undefined ? undefined : normalizeTextOrNull(fidel_id);

    const { data: existing, error: existingError } = await supabase
      .from("sheep")
      .select("id")
      .eq("number", cleanNumber)
      .maybeSingle();

    if (existingError) {
      throw new ApiError(400, existingError.message);
    }

    if (existing) {
      throw new ApiError(400, "Ce numéro de mouton existe déjà");
    }

    const insertData = {
      number: cleanNumber,
      photo_url: normalizeTextOrNull(photo_url) ?? null,
      weight: cleanWeight,
      price: cleanPrice,
      status: status || "available",
      notes: notes?.trim?.() || null,
      size: size || null,
      color: color || null,
      fidel_id: cleanFidelId ?? null,
      discount_amount: cleanDiscountAmount,
      final_price: cleanFinalPrice,
      payment_status: payment_status || "unpaid",
      payment_due_date: cleanPaymentDueDate ?? null,
      payment_notes: payment_notes?.trim?.() || null,
      assigned_at: cleanAssignedAt ?? null,
    };

    if (insertData.fidel_id) {
      insertData.assigned_at = insertData.assigned_at || new Date().toISOString();

      if (
        !insertData.status ||
        insertData.status === "available"
      ) {
        insertData.status = "assigned";
      }
    }

    const { data, error } = await supabase
      .from("sheep")
      .insert([insertData])
      .select("*")
      .single();

    if (error) {
      throw new ApiError(400, error.message);
    }

    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
};

export const updateSheep = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      number,
      photo_url,
      weight,
      price,
      status,
      notes,
      size,
      color,
      fidel_id,
      discount_amount,
      final_price,
      payment_status,
      payment_due_date,
      payment_notes,
      assigned_at,
    } = req.body;

    if (!id) {
      throw new ApiError(400, "ID du mouton manquant");
    }

    if (status !== undefined) {
      validateStatus(status);
    }

    if (size !== undefined) {
      validateSize(size);
    }

    if (payment_status !== undefined) {
      validatePaymentStatus(payment_status);
    }

    const { data: existingSheep, error: existingSheepError } = await supabase
      .from("sheep")
      .select("*")
      .eq("id", id)
      .single();

    if (existingSheepError || !existingSheep) {
      throw new ApiError(404, "Mouton introuvable");
    }

    const updateData = {};

    if (number !== undefined) {
      if (!String(number).trim()) {
        throw new ApiError(400, "Le numéro du mouton est obligatoire");
      }

      const cleanNumber = String(number).trim();

      const { data: existing, error: existingError } = await supabase
        .from("sheep")
        .select("id")
        .eq("number", cleanNumber)
        .neq("id", id)
        .maybeSingle();

      if (existingError) {
        throw new ApiError(400, existingError.message);
      }

      if (existing) {
        throw new ApiError(400, "Ce numéro de mouton existe déjà");
      }

      updateData.number = cleanNumber;
    }

    if (photo_url !== undefined) {
      updateData.photo_url = normalizeTextOrNull(photo_url);
    }

    if (weight !== undefined) {
      updateData.weight = parseNullableNumber(weight);
    }

    if (price !== undefined) {
      updateData.price = parseNonNegativeNullableNumber(price, "Le prix");
    }

    if (status !== undefined) {
      updateData.status = status;
    }

    if (notes !== undefined) {
      updateData.notes = notes?.trim?.() || null;
    }

    if (size !== undefined) {
      updateData.size = size || null;
    }

    if (color !== undefined) {
      updateData.color = color || null;
    }

    if (discount_amount !== undefined) {
      updateData.discount_amount =
        parseNonNegativeNullableNumber(discount_amount, "La réduction") ?? 0;
    }

    if (final_price !== undefined) {
      updateData.final_price = parseNonNegativeNullableNumber(
        final_price,
        "Le prix final"
      );
    }

    if (payment_status !== undefined) {
      updateData.payment_status = payment_status;
    }

    if (payment_due_date !== undefined) {
      updateData.payment_due_date = parseNullableDate(
        payment_due_date,
        "Date d'échéance invalide"
      );
    }

    if (payment_notes !== undefined) {
      updateData.payment_notes = payment_notes?.trim?.() || null;
    }

    if (assigned_at !== undefined) {
      updateData.assigned_at = parseNullableDate(
        assigned_at,
        "Date d'attribution invalide"
      );
    }

    if (fidel_id !== undefined) {
      updateData.fidel_id = normalizeTextOrNull(fidel_id);
    }

    const nextFidelId =
      fidel_id !== undefined ? updateData.fidel_id : existingSheep.fidel_id;

    const nextStatus =
      status !== undefined ? status : existingSheep.status;

    if (fidel_id !== undefined) {
      if (nextFidelId) {
        updateData.assigned_at =
          updateData.assigned_at ||
          existingSheep.assigned_at ||
          new Date().toISOString();

        if (status === undefined && nextStatus === "available") {
          updateData.status = "assigned";
        }
      } else {
        updateData.assigned_at = null;

        if (status === undefined && nextStatus === "assigned") {
          updateData.status = "available";
        }
      }
    }

    const { data, error } = await supabase
      .from("sheep")
      .update(updateData)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      throw new ApiError(400, error.message);
    }

    if (!data) {
      throw new ApiError(404, "Mouton introuvable");
    }

    res.json(data);
  } catch (error) {
    next(error);
  }
};



// ✅ deleteSheep — soft delete au lieu de suppression physique
export const deleteSheep = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) throw new ApiError(400, "ID du mouton manquant");

    const { data: sheep } = await supabase
      .from("sheep").select("status").eq("id", id).maybeSingle();

    if (!sheep) throw new ApiError(404, "Mouton introuvable");

    // ✅ Bloquer la suppression si assigné ou sacrifié
    if (["assigned", "sacrificed"].includes(sheep.status)) {
      throw new ApiError(400, "Impossible de supprimer un mouton assigné ou sacrifié");
    }

    const { data, error } = await supabase
      .from("sheep")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id)
      .select("id, number")
      .single();

    if (error) {
      console.error("[DELETE_SHEEP]", error);
      throw new ApiError(500, "Erreur serveur");
    }

    res.json({ message: "Mouton supprimé avec succès", item: data });
  } catch (error) {
    next(error);
  }
};


// ✅ assignSheep — supprimer l'erreur intentionnelle, route à désactiver proprement
export const assignSheep = async (req, res, next) => {
  next(new ApiError(501, "Fonctionnalité non disponible"));
};