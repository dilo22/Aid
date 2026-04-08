import { supabase } from "../config/supabase.js";
import { ApiError } from "../utils/apiError.js";
import { sendAppointmentEmail } from "../utils/emailService.js";

const isValidUUID = (id) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

// ✅ Pause entre emails
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const getSettings = async () => {
  const { data, error } = await supabase
    .from("appointment_settings")
    .select("key, value");
  if (error) throw new ApiError(500, "Erreur lecture settings");
  return data.reduce((acc, { key, value }) => { acc[key] = value; return acc; }, {});
};

// ✅ Un slot par heure — slotCapacity fidèles assignés dans la boucle principale
const generateSlots = (dateStr) => {
  const hours = [8, 9, 10, 11, 14, 15, 16, 17];
  return hours.map((h) => `${dateStr}T${String(h).padStart(2, "0")}:00:00`);
};

// ===== SETTINGS =====

export const getAppointmentSettings = async (req, res, next) => {
  try {
    res.json(await getSettings());
  } catch (error) { next(error); }
};

export const updateAppointmentSettings = async (req, res, next) => {
  try {
    const { slot_capacity, address, selection_start_date, sacrifice_date } = req.body;
    const updates = [];

    if (slot_capacity !== undefined) {
      const cap = parseInt(slot_capacity, 10);
      if (isNaN(cap) || cap < 1 || cap > 50) throw new ApiError(400, "Capacité invalide (1-50)");
      updates.push({ key: "slot_capacity", value: String(cap) });
    }
    if (address)              updates.push({ key: "address",               value: address });
    if (selection_start_date) updates.push({ key: "selection_start_date",  value: selection_start_date });
    if (sacrifice_date)       updates.push({ key: "sacrifice_date",        value: sacrifice_date });

    for (const u of updates) {
      await supabase.from("appointment_settings")
        .update({ value: u.value, updated_at: new Date().toISOString() })
        .eq("key", u.key);
    }

    res.json(await getSettings());
  } catch (error) { next(error); }
};

// ===== GÉNÉRATION =====

export const generateAppointments = async (req, res, next) => {
  try {
    const { type } = req.params;
    if (!["selection", "sacrifice"].includes(type)) throw new ApiError(400, "Type invalide");

    const settings     = await getSettings();
    const slotCapacity = parseInt(settings.slot_capacity, 10) || 5;
    const address      = settings.address;

    const { data: fideles, error: fidelError } = await supabase
      .from("profiles")
      .select("id, first_name, last_name, email")
      .eq("role", "fidel")
      .eq("status", "approved")
      .is("deleted_at", null);

    if (fidelError) throw new ApiError(500, "Erreur récupération fidèles");
    if (!fideles?.length) throw new ApiError(400, "Aucun fidèle approuvé");

    // ✅ Supprime les RDV scheduled existants du même type
    await supabase.from("appointments")
      .delete()
      .eq("status", "scheduled")
      .eq("type", type);

    const startDate    = new Date(
      type === "selection" ? settings.selection_start_date : settings.sacrifice_date
    );
    const sacrificeDate = new Date(settings.sacrifice_date);

    const appointments = [];
    let fidelIndex     = 0;
    let currentDate    = new Date(startDate);

    while (fidelIndex < fideles.length) {
      const dateStr = currentDate.toISOString().split("T")[0];
      const slots   = generateSlots(dateStr);

      for (const slot of slots) {
        // ✅ slotCapacity fidèles par créneau
        for (let i = 0; i < slotCapacity; i++) {
          if (fidelIndex >= fideles.length) break;
          appointments.push({
            fidel_id:       fideles[fidelIndex].id,
            type,
            appointment_at: new Date(`${slot}+00:00`).toISOString(),
            address,
            status:         "scheduled",
          });
          fidelIndex++;
        }
        if (fidelIndex >= fideles.length) break;
      }

      currentDate.setDate(currentDate.getDate() + 1);

      if (type === "selection" && currentDate >= sacrificeDate) break;
    }

    const { error: insertError } = await supabase
      .from("appointments").insert(appointments);

    if (insertError) {
      console.error("[GENERATE_APPOINTMENTS]", insertError);
      throw new ApiError(500, "Erreur création RDV");
    }

    res.json({
      message: `${appointments.length} RDV générés`,
      count:   appointments.length,
      days:    Math.ceil(appointments.length / (8 * slotCapacity)),
    });
  } catch (error) { next(error); }
};

// ===== LECTURE =====

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
    if (date)   query = query
      .gte("appointment_at", `${date}T00:00:00`)
      .lte("appointment_at", `${date}T23:59:59`);

    const { data, error } = await query;
    if (error) throw new ApiError(500, "Erreur récupération RDV");

    res.json({ items: data || [] });
  } catch (error) { next(error); }
};

export const getMyAppointments = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("appointments")
      .select("id, type, appointment_at, address, status, notes")
      .eq("fidel_id", req.user.id)
      .order("appointment_at", { ascending: true });

    if (error) throw new ApiError(500, "Erreur récupération RDV");
    res.json({ items: data || [] });
  } catch (error) { next(error); }
};

// ✅ Vue fidèles + leurs RDV
export const getFidelesWithAppointments = async (req, res, next) => {
  try {
    const { data: fideles, error: fidelError } = await supabase
      .from("profiles")
      .select("id, first_name, last_name, email, phone, organization:organizations(name)")
      .eq("role", "fidel")
      .eq("status", "approved")
      .is("deleted_at", null)
      .order("last_name", { ascending: true });

    if (fidelError) throw new ApiError(500, "Erreur récupération fidèles");

    const { data: appts, error: apptError } = await supabase
      .from("appointments")
      .select("id, fidel_id, type, appointment_at, address, status")
      .order("appointment_at", { ascending: true });

    if (apptError) throw new ApiError(500, "Erreur récupération RDV");

    const apptByFidel = {};
    for (const appt of appts) {
      if (!apptByFidel[appt.fidel_id]) apptByFidel[appt.fidel_id] = [];
      apptByFidel[appt.fidel_id].push(appt);
    }

    res.json({
      items: fideles.map((f) => ({ ...f, appointments: apptByFidel[f.id] || [] })),
    });
  } catch (error) { next(error); }
};

// ===== MODIFICATION =====

export const updateAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidUUID(id)) throw new ApiError(400, "ID invalide");

    const { fidel_id, appointment_at, address, notes, status } = req.body;
    const updateData = {};

    if (fidel_id)            updateData.fidel_id       = fidel_id;
    if (appointment_at)      updateData.appointment_at = appointment_at;
    if (address)             updateData.address        = address;
    if (notes !== undefined) updateData.notes          = notes;
    if (status)              updateData.status         = status;

    const { data, error } = await supabase
      .from("appointments")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw new ApiError(500, "Erreur mise à jour RDV");
    res.json(data);
  } catch (error) { next(error); }
};

// ✅ RDV individuel
export const createSingleAppointment = async (req, res, next) => {
  try {
    const { fidel_id, type, date, hour, notes, send_email } = req.body;

    if (!isValidUUID(fidel_id)) throw new ApiError(400, "ID fidèle invalide");
    if (!["selection", "sacrifice"].includes(type)) throw new ApiError(400, "Type invalide");
    if (!date || hour === undefined) throw new ApiError(400, "Date et heure obligatoires");

    const settings       = await getSettings();
    const address        = settings.address;
    const appointment_at = new Date(
      `${date}T${String(hour).padStart(2, "0")}:00:00+00:00`
    ).toISOString();

    const { data: fidel } = await supabase
      .from("profiles")
      .select("id, first_name, last_name, email")
      .eq("id", fidel_id)
      .single();

    if (!fidel) throw new ApiError(404, "Fidèle introuvable");

    const { data, error } = await supabase
      .from("appointments")
      .insert({ fidel_id, type, appointment_at, address, status: "scheduled", notes: notes || null })
      .select()
      .single();

    if (error) throw new ApiError(500, "Erreur création RDV");

    if (send_email) {
      try {
        await sendAppointmentEmail({
          to:            fidel.email,
          firstName:     fidel.first_name,
          type,
          appointmentAt: appointment_at,
          address,
        });
      } catch (e) {
        console.error("[SINGLE_APPT] email failed:", e);
      }
    }

    res.status(201).json({ message: "RDV créé avec succès", item: data });
  } catch (error) { next(error); }
};

// ===== EMAILS =====

// ✅ Publier les RDV (visibles sur les comptes) SANS envoyer les emails
export const publishAppointments = async (req, res, next) => {
  try {
    const { type } = req.params;
    if (!["selection", "sacrifice"].includes(type)) throw new ApiError(400, "Type invalide");

    const { data: appointments, error } = await supabase
      .from("appointments")
      .select("id")
      .eq("type", type)
      .eq("status", "scheduled");

    if (error) throw new ApiError(500, "Erreur récupération RDV");
    if (!appointments?.length) throw new ApiError(400, "Aucun RDV à publier");

    res.json({
      message:   `${appointments.length} RDV publiés et visibles sur les comptes fidèles.`,
      published: appointments.length,
    });
  } catch (error) { next(error); }
};

// ✅ Envoyer les emails séparément
export const sendAppointmentEmails = async (req, res, next) => {
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
    if (!appointments?.length) throw new ApiError(400, "Aucun RDV trouvé");

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
      if (i < appointments.length - 1) await sleep(250);
    }

    res.json({
      message:   `${emailsSent}/${appointments.length} emails envoyés`,
      emailsSent,
    });
  } catch (error) { next(error); }
};

// ===== EXPORT CSV =====

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
    res.send("\uFEFF" + header + rows);
  } catch (error) { next(error); }
};