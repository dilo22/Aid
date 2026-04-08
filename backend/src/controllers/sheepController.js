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

// ===== HELPERS =====

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

// ===== GET LIST =====

export const getSheepList = async (req, res, next) => {
  try {
    const {
      search = "",
      status = "",
      size = "",
      color = "",
      sortBy = "created_at",
      sortOrder = "desc",
      page = 1,
      limit = 10,
    } = req.query;

    const parsedPage = Math.max(parseInt(page, 10) || 1, 1);
    const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);

    const from = (parsedPage - 1) * parsedLimit;
    const to = from + parsedLimit - 1;

    const safeSortBy = ALLOWED_SORT_FIELDS.includes(sortBy)
      ? sortBy
      : "created_at";

    const safeSortOrder = ALLOWED_SORT_ORDERS.includes(sortOrder)
      ? sortOrder
      : "desc";

    let query = supabase
      .from("sheep")
      .select("*", { count: "exact" });

    // ✅ Filtre fidèle uniquement
    if (req.user.role === "fidel") {
      query = query.eq("fidel_id", req.user.id);
    }

    if (search) query = query.ilike("number", `%${search}%`);
    if (status) query = query.eq("status", status);
    if (size) query = query.eq("size", size);
    if (color) query = query.eq("color", color);

    query = query
      .order(safeSortBy, { ascending: safeSortOrder === "asc" })
      .range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error("[GET_SHEEP_LIST]", error);
      throw new ApiError(500, error.message);
    }

    res.json({
      items: data || [],
      meta: {
        total: count || 0,
        page: parsedPage,
        limit: parsedLimit,
        totalPages: Math.ceil((count || 0) / parsedLimit) || 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ===== CREATE =====

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

    const { data: existing } = await supabase
      .from("sheep")
      .select("id")
      .eq("number", cleanNumber)
      .maybeSingle();

    if (existing) {
      throw new ApiError(400, "Ce numéro de mouton existe déjà");
    }

    const insertData = {
      number: cleanNumber,
      photo_url: normalizeTextOrNull(photo_url) ?? null,
      weight: parseNullableNumber(weight),
      price: parseNonNegativeNullableNumber(price, "Le prix"),
      status: status || "available",
      notes: normalizeTextOrNull(notes),
      size: size || null,
      color: normalizeTextOrNull(color),
      fidel_id: normalizeTextOrNull(fidel_id),
      discount_amount:
        parseNonNegativeNullableNumber(discount_amount, "La réduction") ?? 0,
      final_price: parseNonNegativeNullableNumber(
        final_price,
        "Le prix final"
      ),
      payment_status: payment_status || "unpaid",
      payment_due_date: parseNullableDate(payment_due_date),
      payment_notes: normalizeTextOrNull(payment_notes),
      assigned_at: parseNullableDate(assigned_at),
    };

    if (insertData.fidel_id) {
      insertData.assigned_at =
        insertData.assigned_at || new Date().toISOString();
      if (!insertData.status || insertData.status === "available") {
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

// ===== UPDATE =====

export const updateSheep = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data: existingSheep } = await supabase
      .from("sheep")
      .select("*")
      .eq("id", id)
      .single();

    if (!existingSheep) {
      throw new ApiError(404, "Mouton introuvable");
    }

    if (updates.number) {
      const { data: duplicate } = await supabase
        .from("sheep")
        .select("id")
        .eq("number", updates.number)
        .neq("id", id)
        .maybeSingle();

      if (duplicate) {
        throw new ApiError(400, "Ce numéro de mouton existe déjà");
      }
    }

    const { data, error } = await supabase
      .from("sheep")
      .update(updates)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      throw new ApiError(400, error.message);
    }

    res.json(data);
  } catch (error) {
    next(error);
  }
};

// ===== DELETE (HARD DELETE) =====

export const deleteSheep = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: sheep } = await supabase
      .from("sheep")
      .select("status, number")
      .eq("id", id)
      .maybeSingle();

    if (!sheep) throw new ApiError(404, "Mouton introuvable");

    if (["assigned", "sacrificed"].includes(sheep.status)) {
      throw new ApiError(
        400,
        "Impossible de supprimer un mouton assigné ou sacrifié"
      );
    }

    const { error } = await supabase
      .from("sheep")
      .delete()
      .eq("id", id);

    if (error) {
      throw new ApiError(500, error.message);
    }

    res.json({
      message: "Mouton supprimé avec succès",
      item: { id, number: sheep.number },
    });
  } catch (error) {
    next(error);
  }
};

// ===== DISABLED FEATURE =====

export const assignSheep = async (req, res, next) => {
  next(new ApiError(501, "Fonctionnalité non disponible"));
};