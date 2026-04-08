import { supabase } from "../config/supabase.js";
import { ApiError } from "../utils/apiError.js";
import { sendAppointmentEmail } from "../utils/emailService.js";

const isValidUUID = (id) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

// ✅ Récupère les settings depuis la BDD
const getSettings = async () => {
  const { data, error } = await supabase
    .from("appointment_settings")
    .select("key, value");
  if (error) throw new ApiError(500, "Erreur lecture settings");

  return data.reduce((acc, { key, value }) => {
    acc[key] = value;
    return acc;
  }, {});
};

// ✅ Génère les créneaux disponibles pour une date donnée
const generateSlots = (dateStr, slotCapacity) => {
  const slots = [];
  const hours = [8, 9, 10, 11, 14, 15, 16, 17];

  for (const hour of hours) {
    for (let i = 0; i < slotCapacity; i++) {
      slots.push(`${dateStr}T${String(hour).padStart(2, "0")}:00:00`);
    }
  }

  return slots;
};

// ✅ GET /api/appointments/settings
export const getAppointmentSettings = async (req, res, next) => {
  try {
    const settings = await getSettings();
    res.json(settings);
  } catch (error) {
    next(error);
  }
};

// ✅ PUT /api/appointments/settings
export const updateAppointmentSettings = async (req, res, next) => {
  try {
    const { slot_capacity, address, selection_start_date, sacrifice_date } = req.body;

    const updates = [];

    if (slot_capacity !== undefined) {
      const cap = parseInt(slot_capacity, 10);
      if (isNaN(cap) || cap < 1 || cap > 50) throw new ApiError(400, "Capacité invalide (1-50)");
      updates.push({ key: "slot_capacity", value: String(cap) });
    }
    if (address)              updates.push({ key: "address",              value: address });
    if (selection_start_date) updates.push({ key: "selection_start_date", value: selection_start_date });
    if (sacrifice_date)       updates.push({ key: "sacrifice_date",       value: sacrifice_date });

    for (const update of updates) {
      await supabase.from("appointment_settings")
        .update({ value: update.value, updated_at: new Date().toISOString() })
        .eq("key", update.key);
    }

    const settings = await getSettings();
    res.json(settings);
  } catch (error) {
    next(error);
  }
};

// ✅ POST /api/appointments/generate/:type — génère les RDV en draft
export const generateAppointments = async (req, res, next) => {
  try {
    const { type } = req.params;
    if (!["selection", "sacrifice"].includes(type)) throw new ApiError(400, "Type invalide");

    const settings     = await getSettings();
    const slotCapacity = parseInt(settings.slot_capacity, 10) || 5;
    const address      = settings.address;

    // ✅ Récupère tous les fidèles approuvés sans RDV de ce type
    const { data: fideles, error: fidelError } = await supabase
      .from("profiles")
      .select("id, first_name, last_name, email")
      .eq("role", "fidel")
      .eq("status", "approved")
      .is("deleted_at", null);

    if (fidelError) throw new ApiError(500, "Erreur récupération fidèles");
    if (!fideles?.length) throw new ApiError(400, "Aucun fidèle approuvé");

    // ✅ Supprime les drafts existants du même type
    await supabase.from("appointments")
      .delete()
      .eq("status", "scheduled")
      .eq("type", type);

    // ✅ Génère les dates selon le type
    const startDate    = type === "selection"
      ? new Date(settings.selection_start_date)
      : new Date(settings.sacrifice_date);

    const appointments = [];
    let fidelIndex     = 0;
    let currentDate    = new Date(startDate);

    while (fidelIndex < fideles.length) {
      const dateStr = currentDate.toISOString().split("T")[0];
      const slots   = generateSlots(dateStr, slotCapacity);

      for (const slot of slots) {
        if (fidelIndex >= fideles.length) break;
        appointments.push({
          fidel_id:       fideles[fidelIndex].id,
          type,
          appointment_at: new Date(slot).toISOString(),
          address,
          status:         "scheduled",
        });
        fidelIndex++;
      }

      // Passe au jour suivant (skip weekend optionnel)
      currentDate.setDate(currentDate.getDate() + 1);

      // ✅ Pour la sélection, on s'arrête avant le jour du sacrifice
      if (type === "selection") {
        const sacrificeDate = new Date(settings.sacrifice_date);
        if (currentDate >= sacrificeDate) break;
      }
    }

    const { error: insertError } = await supabase
      .from("appointments")
      .insert(appointments);

    if (insertError) {
      console.error("[GENERATE_APPOINTMENTS]", insertError);
      throw new ApiError(500, "Erreur création RDV");
    }

    res.json({
      message: `${appointments.length} RDV générés en draft`,
      count:   appointments.length,
      days:    Math.ceil(appointments.length / (8 * slotCapacity)),
    });
  } catch (error) {
    next(error);
  }
};

// ✅ GET /api/appointments — liste tous les RDV (admin)
export const getAppointments = async (req, res, next) => {
  try {
    const { type, status, date } = req.query;

    let query = supabase
      .from("appointments")
      .select(`
        id, type, appointment_at, address, status, notes,
        fidel:profiles!appointments_fidel_id_fkey(id, first_name, last_name, email, phone)
      `)
      .order("appointment_at", { ascending: true });

    if (type)   query = query.eq("type", type);
    if (status) query = query.eq("status", status);
    if (date)   query = query.gte("appointment_at", `${date}T00:00:00`)
                             .lte("appointment_at", `${date}T23:59:59`);

    const { data, error } = await query;
    if (error) throw new ApiError(500, "Erreur récupération RDV");

    res.json({ items: data || [] });
  } catch (error) {
    next(error);
  }
};

// ✅ GET /api/appointments/me — RDV du fidèle connecté
export const getMyAppointments = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("appointments")
      .select("id, type, appointment_at, address, status, notes")
      .eq("fidel_id", req.user.id)
      .order("appointment_at", { ascending: true });

    if (error) throw new ApiError(500, "Erreur récupération RDV");

    res.json({ items: data || [] });
  } catch (error) {
    next(error);
  }
};

// ✅ PATCH /api/appointments/:id — modifier un RDV (admin)
export const updateAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidUUID(id)) throw new ApiError(400, "ID invalide");

    const { fidel_id, appointment_at, address, notes, status } = req.body;

    const updateData = {};
    if (fidel_id)       updateData.fidel_id       = fidel_id;
    if (appointment_at) updateData.appointment_at = appointment_at;
    if (address)        updateData.address        = address;
    if (notes !== undefined) updateData.notes     = notes;
    if (status)         updateData.status         = status;

    const { data, error } = await supabase
      .from("appointments")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw new ApiError(500, "Erreur mise à jour RDV");

    res.json(data);
  } catch (error) {
    next(error);
  }
};

// ✅ POST /api/appointments/publish/:type — publie et envoie les emails
export const publishAppointments = async (req, res, next) => {
  try {
    const { type } = req.params;
    if (!["selection", "sacrifice"].includes(type)) throw new ApiError(400, "Type invalide");

    const { data: appointments, error } = await supabase
      .from("appointments")
      .select(`
        id, appointment_at, address, type,
        fidel:profiles!appointments_fidel_id_fkey(id, first_name, email)
      `)
      .eq("type", type)
      .eq("status", "scheduled");

    if (error) throw new ApiError(500, "Erreur récupération RDV");
    if (!appointments?.length) throw new ApiError(400, "Aucun RDV à publier");

    // ✅ Envoi des emails en parallèle (par batch de 10)
    let emailsSent = 0;
    for (let i = 0; i < appointments.length; i++) {
      const appt = appointments[i];
      try {
        await sendAppointmentEmail({
          to:            appt.fidel.email,
          firstName:     appt.fidel.first_name,
          type:          appt.type,
          appointmentAt: appt.appointment_at,
          address:       appt.address,
        });
        emailsSent++;
      } catch (e) {
        console.error(`[EMAIL] failed for ${appt.fidel.email}:`, e);
      }
      if (i < appointments.length - 1) {
        await sleep(250);
      }
    }
    

    res.json({
      message:    `RDV publiés — ${emailsSent}/${appointments.length} emails envoyés`,
      published:  appointments.length,
      emailsSent,
    });
  } catch (error) {
    next(error);
  }
};

// ✅ GET /api/appointments/export — export CSV
export const exportFideles = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("first_name, last_name, email, phone, status, organization:organizations(name), created_at")
      .eq("role", "fidel")
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) throw new ApiError(500, "Erreur export");

    const header = "Prénom,Nom,Email,Téléphone,Statut,Organisation,Inscrit le\n";
    const rows   = data.map((p) => [
      p.first_name || "",
      p.last_name  || "",
      p.email      || "",
      p.phone      || "",
      p.status     || "",
      p.organization?.name || "",
      new Date(p.created_at).toLocaleDateString("fr-FR"),
    ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="fideles-${Date.now()}.csv"`);
    res.send("\uFEFF" + header + rows); // ✅ BOM pour Excel
  } catch (error) {
    next(error);
  }
};