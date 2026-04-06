import { supabase } from "../config/supabase.js";
import { ApiError } from "../utils/apiError.js";

const ALLOWED_PAYMENT_TYPES = ["advance", "deposit", "installment", "full"];
const ALLOWED_PAYMENT_METHODS = [
  "cash",
  "card",
  "transfer",
  "mobile_money",
  "other",
];
const PAYMENT_STATUS = ["unpaid", "partial", "paid", "overpaid", "cancelled"];

const normalizeMoney = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const parseAmount = (value) => {
  if (value === undefined || value === null || value === "") {
    throw new ApiError(400, "Le montant est obligatoire");
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new ApiError(400, "Montant invalide");
  }

  return parsed;
};

const parseNullableText = (value) => {
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

const validatePaymentType = (value) => {
  if (value !== undefined && value !== null && !ALLOWED_PAYMENT_TYPES.includes(value)) {
    throw new ApiError(400, "Type de paiement invalide");
  }
};

const validatePaymentMethod = (value) => {
  if (
    value !== undefined &&
    value !== null &&
    value !== "" &&
    !ALLOWED_PAYMENT_METHODS.includes(value)
  ) {
    throw new ApiError(400, "Méthode de paiement invalide");
  }
};

const getExpectedAmount = (sheep) => {
  if (!sheep) return 0;

  if (sheep.final_price !== null && sheep.final_price !== undefined) {
    return Math.max(normalizeMoney(sheep.final_price), 0);
  }

  return Math.max(
    normalizeMoney(sheep.price) - normalizeMoney(sheep.discount_amount),
    0
  );
};

const computePaymentStatus = (expectedAmount, paidAmount, currentPaymentStatus) => {
  if (currentPaymentStatus === "cancelled") {
    return "cancelled";
  }

  if (paidAmount <= 0) return "unpaid";
  if (paidAmount < expectedAmount) return "partial";
  if (paidAmount === expectedAmount) return "paid";
  return "overpaid";
};

const getSheepById = async (sheepId) => {
  const { data, error } = await supabase
    .from("sheep")
    .select("*")
    .eq("id", sheepId)
    .single();

  if (error || !data) {
    throw new ApiError(404, "Mouton introuvable");
  }

  return data;
};

const getPaymentById = async (paymentId) => {
  const { data, error } = await supabase
    .from("sheep_payments")
    .select("*")
    .eq("id", paymentId)
    .single();

  if (error || !data) {
    throw new ApiError(404, "Paiement introuvable");
  }

  return data;
};

const getPaymentsForSheep = async (sheepId) => {
  const { data, error } = await supabase
    .from("sheep_payments")
    .select("*")
    .eq("sheep_id", sheepId)
    .order("payment_date", { ascending: false });

  if (error) {
    throw new ApiError(400, error.message);
  }

  return data || [];
};

const buildSheepPaymentSummary = async (sheepId) => {
  const sheep = await getSheepById(sheepId);
  const payments = await getPaymentsForSheep(sheepId);

  const expectedAmount = getExpectedAmount(sheep);
  const paidAmount = payments.reduce(
    (sum, payment) => sum + normalizeMoney(payment.amount),
    0
  );
  const remainingAmount = Math.max(expectedAmount - paidAmount, 0);

  const nextPaymentStatus = computePaymentStatus(
    expectedAmount,
    paidAmount,
    sheep.payment_status
  );

  if (
    PAYMENT_STATUS.includes(nextPaymentStatus) &&
    nextPaymentStatus !== sheep.payment_status
  ) {
    const { error: updateError } = await supabase
      .from("sheep")
      .update({ payment_status: nextPaymentStatus })
      .eq("id", sheepId);

    if (updateError) {
      throw new ApiError(400, updateError.message);
    }
  }

  return {
    sheepId: sheep.id,
    expectedAmount,
    paidAmount,
    remainingAmount,
    paymentStatus: nextPaymentStatus,
  };
};

const ensurePaymentMatchesAssignedProfile = async (sheepId, profileId) => {
  const sheep = await getSheepById(sheepId);

  if (!sheep.fidel_id) {
    throw new ApiError(
      400,
      "Ce mouton n'est attribué à aucun fidèle. Impossible d'enregistrer un paiement."
    );
  }

  if (String(sheep.fidel_id).trim() !== String(profileId).trim()) {
    throw new ApiError(
      400,
      "Le profil du paiement ne correspond pas au fidèle attribué à ce mouton."
    );
  }

  return sheep;
};

export const getPaymentsBySheepId = async (req, res, next) => {
  try {
    const { sheepId } = req.params;

    if (!sheepId) {
      throw new ApiError(400, "ID du mouton manquant");
    }

    const payments = await getPaymentsForSheep(sheepId);
    const summary = await buildSheepPaymentSummary(sheepId);

    res.json({
      items: payments,
      summary,
    });
  } catch (error) {
    next(error);
  }
};

export const getPaymentsByProfileId = async (req, res, next) => {
  try {
    const { profileId } = req.params;
    if (!profileId) throw new ApiError(400, "ID du profil manquant");
    if (!isValidUUID(profileId)) throw new ApiError(400, "ID invalide");

    // ✅ Un fidèle ne peut voir que SES paiements
    if (req.user.role === "fidel" && req.user.id !== profileId) {
      throw new ApiError(403, "Accès refusé");
    }

    // ✅ Une organisation ne peut voir que les paiements de SES fidèles
    if (req.user.role === "organization") {
      const { data: profile } = await supabase
        .from("profiles").select("organization_id").eq("id", profileId).maybeSingle();
      if (!profile || profile.organization_id !== req.user.organization_id) {
        throw new ApiError(403, "Accès refusé");
      }
    }

    const { data, error } = await supabase
      .from("sheep_payments").select("*").eq("profile_id", profileId)
      .order("payment_date", { ascending: false });

    if (error) {
      console.error("[GET_PAYMENTS_PROFILE]", error);
      throw new ApiError(500, "Erreur serveur");
    }

    res.json({ items: data || [] });
  } catch (error) {
    next(error);
  }
};

export const createPayment = async (req, res, next) => {
  try {
    const { sheep_id, profile_id, amount, payment_method, payment_date, payment_type, reference, notes } = req.body;

    if (!sheep_id)   throw new ApiError(400, "Le mouton est obligatoire");
    if (!profile_id) throw new ApiError(400, "Le profil est obligatoire");
    if (!isValidUUID(sheep_id))   throw new ApiError(400, "ID mouton invalide");
    if (!isValidUUID(profile_id)) throw new ApiError(400, "ID profil invalide");

    validatePaymentType(payment_type);
    validatePaymentMethod(payment_method);

    const cleanAmount = parseAmount(amount);
    const cleanPaymentDate =
      parseNullableDate(payment_date, "Date de paiement invalide") ||
      new Date().toISOString();

    await ensurePaymentMatchesAssignedProfile(sheep_id, profile_id);

    const payload = {
      sheep_id,
      profile_id,
      amount: cleanAmount,
      payment_method: parseNullableText(payment_method) ?? null,
      payment_date: cleanPaymentDate,
      payment_type: payment_type || "installment",
      reference: parseNullableText(reference) ?? null,
      notes: parseNullableText(notes) ?? null,
      created_by: req.user?.id || null,
    };

    const { data, error } = await supabase
      .from("sheep_payments")
      .insert([payload])
      .select("*")
      .single();

    if (error) {
      throw new ApiError(400, error.message);
    }

    const summary = await buildSheepPaymentSummary(sheep_id);

    res.status(201).json({
      item: data,
      summary,
    });
  } catch (error) {
    next(error);
  }
};

export const updatePayment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      amount,
      payment_method,
      payment_date,
      payment_type,
      reference,
      notes,
    } = req.body;

    if (!id) {
      throw new ApiError(400, "ID du paiement manquant");
    }

    const existingPayment = await getPaymentById(id);

    validatePaymentType(payment_type);
    validatePaymentMethod(payment_method);

    const updateData = {};

    if (amount !== undefined) {
      updateData.amount = parseAmount(amount);
    }

    if (payment_method !== undefined) {
      updateData.payment_method = parseNullableText(payment_method);
    }

    if (payment_date !== undefined) {
      updateData.payment_date = parseNullableDate(
        payment_date,
        "Date de paiement invalide"
      );
    }

    if (payment_type !== undefined) {
      updateData.payment_type = payment_type;
    }

    if (reference !== undefined) {
      updateData.reference = parseNullableText(reference);
    }

    if (notes !== undefined) {
      updateData.notes = parseNullableText(notes);
    }

    const { data, error } = await supabase
      .from("sheep_payments")
      .update(updateData)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      throw new ApiError(400, error.message);
    }

    const summary = await buildSheepPaymentSummary(existingPayment.sheep_id);

    res.json({
      item: data,
      summary,
    });
  } catch (error) {
    next(error);
  }
};

export const deletePayment = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) throw new ApiError(400, "ID du paiement manquant");
    if (!isValidUUID(id)) throw new ApiError(400, "ID invalide");

    const existingPayment = await getPaymentById(id);

    // ✅ Soft delete — on garde la traçabilité financière
    const { error } = await supabase
      .from("sheep_payments")
      .update({ deleted_at: new Date().toISOString(), deleted_by: req.user.id })
      .eq("id", id);

    if (error) {
      console.error("[DELETE_PAYMENT]", error);
      throw new ApiError(500, "Erreur serveur");
    }

    const summary = await buildSheepPaymentSummary(existingPayment.sheep_id);
    res.json({ message: "Paiement supprimé avec succès", summary });
  } catch (error) {
    next(error);
  }
};