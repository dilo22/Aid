import { useEffect, useState, useCallback } from "react";
import {
  getAppointmentSettings, updateAppointmentSettings,
  generateAppointments, getAppointments,
  publishAppointments, sendAppointmentEmails,
  exportFideles, updateAppointment,
  createSingleAppointment, getFidelesWithAppointments,
} from "../../api/appointmentsApi";
import { getApprovedProfiles } from "../../api/profilesApi";
import "../../styles/AdminAppointments.css";

const SLOT_HOURS = [8, 9, 10, 11, 14, 15, 16, 17];

const formatDate = (iso) => new Date(iso).toLocaleDateString("fr-FR", {
  weekday: "short", day: "numeric", month: "short", timeZone: "Europe/Paris",
});

const formatTime = (iso) => new Date(iso).toLocaleTimeString("fr-FR", {
  hour: "2-digit", minute: "2-digit", timeZone: "Europe/Paris",
});

const groupByDay = (appointments) => {
  const groups = {};
  for (const appt of appointments) {
    const day = new Date(appt.appointment_at)
      .toLocaleDateString("fr-CA", { timeZone: "Europe/Paris" });
    if (!groups[day]) groups[day] = [];
    groups[day].push(appt);
  }
  return groups;
};

// ===== MODAL EDIT =====
const EditModal = ({ appt, onClose, onSaved }) => {
  const currentDate = new Date(appt.appointment_at)
    .toLocaleDateString("fr-CA", { timeZone: "Europe/Paris" });
  const currentHour = new Date(appt.appointment_at)
    .toLocaleString("fr-FR", { hour: "numeric", timeZone: "Europe/Paris" });

  const [date,   setDate]   = useState(currentDate);
  const [hour,   setHour]   = useState(Number(currentHour));
  const [notes,  setNotes]  = useState(appt.notes || "");
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState("");

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [onClose]);

  const handleSave = async () => {
    setSaving(true); setError("");
    try {
      const appointment_at = `${date}T${String(hour).padStart(2, "0")}:00:00+00:00`;
      await updateAppointment(appt.id, { appointment_at, notes: notes || null });
      onSaved(); onClose();
    } catch (e) { setError(e?.message || "Erreur sauvegarde."); }
    finally { setSaving(false); }
  };

  return (
    <div className="appt-modal-overlay" onClick={onClose}>
      <div className="appt-modal" onClick={(e) => e.stopPropagation()}>
        <div className="appt-modal-header">
          <h2 className="appt-modal-title">Modifier le rendez-vous</h2>
          <button className="btn-secondary" onClick={onClose}>Fermer</button>
        </div>
        <div className="appt-modal-body">
          <div className="appt-modal-fidel">
            <div className="appt-modal-fidel-name">{appt.fidel?.first_name} {appt.fidel?.last_name}</div>
            <div className="appt-modal-fidel-email">{appt.fidel?.email}</div>
          </div>
          <label className="appt-settings-field">
            <span className="appt-settings-label">Date</span>
            <input type="date" className="appt-settings-input" value={date} onChange={(e) => setDate(e.target.value)} />
          </label>
          <label className="appt-settings-field">
            <span className="appt-settings-label">Créneau horaire</span>
            <select className="appt-settings-input" value={hour} onChange={(e) => setHour(Number(e.target.value))}>
              {SLOT_HOURS.map((h) => (
                <option key={h} value={h}>{String(h).padStart(2, "0")}:00 — {String(h + 1).padStart(2, "0")}:00</option>
              ))}
            </select>
          </label>
          <label className="appt-settings-field">
            <span className="appt-settings-label">Notes</span>
            <textarea className="appt-settings-input" rows={3} style={{ resize: "vertical" }}
              value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Instructions particulières..." />
          </label>
          {error && <div className="appt-error">{error}</div>}
        </div>
        <div className="appt-modal-footer">
          <button className="btn-secondary" onClick={onClose}>Annuler</button>
          <button className="btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? "Sauvegarde..." : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ===== MODAL RDV INDIVIDUEL =====
const SingleApptModal = ({ onClose, onSaved }) => {
  const [fideles,    setFideles]    = useState([]);
  const [fidelId,    setFidelId]    = useState("");
  const [type,       setType]       = useState("selection");
  const [date,       setDate]       = useState("");
  const [hour,       setHour]       = useState(8);
  const [notes,      setNotes]      = useState("");
  const [sendEmail,  setSendEmail]  = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [error,      setError]      = useState("");

  useEffect(() => {
    getApprovedProfiles().then((data) => {
      setFideles(Array.isArray(data) ? data : []);
    }).catch(() => setFideles([]));
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [onClose]);

  const handleSave = async () => {
    if (!fidelId) return setError("Sélectionnez un fidèle.");
    if (!date)    return setError("Choisissez une date.");
    setSaving(true); setError("");
    try {
      await createSingleAppointment({ fidel_id: fidelId, type, date, hour, notes: notes || null, send_email: sendEmail });
      onSaved(); onClose();
    } catch (e) { setError(e?.message || "Erreur création RDV."); }
    finally { setSaving(false); }
  };

  return (
    <div className="appt-modal-overlay" onClick={onClose}>
      <div className="appt-modal" onClick={(e) => e.stopPropagation()}>
        <div className="appt-modal-header">
          <h2 className="appt-modal-title">Nouveau RDV individuel</h2>
          <button className="btn-secondary" onClick={onClose}>Fermer</button>
        </div>
        <div className="appt-modal-body">
          <label className="appt-settings-field">
            <span className="appt-settings-label">Fidèle *</span>
            <select className="appt-settings-input" value={fidelId} onChange={(e) => setFidelId(e.target.value)}>
              <option value="">Sélectionner un fidèle...</option>
              {fideles.map((f) => (
                <option key={f.id} value={f.id}>{f.first_name} {f.last_name} — {f.email}</option>
              ))}
            </select>
          </label>
          <label className="appt-settings-field">
            <span className="appt-settings-label">Type de RDV *</span>
            <select className="appt-settings-input" value={type} onChange={(e) => setType(e.target.value)}>
              <option value="selection">🐑 Sélection du mouton</option>
              <option value="sacrifice">📅 Jour du sacrifice</option>
            </select>
          </label>
          <label className="appt-settings-field">
            <span className="appt-settings-label">Date *</span>
            <input type="date" className="appt-settings-input" value={date} onChange={(e) => setDate(e.target.value)} />
          </label>
          <label className="appt-settings-field">
            <span className="appt-settings-label">Créneau horaire *</span>
            <select className="appt-settings-input" value={hour} onChange={(e) => setHour(Number(e.target.value))}>
              {SLOT_HOURS.map((h) => (
                <option key={h} value={h}>{String(h).padStart(2, "0")}:00 — {String(h + 1).padStart(2, "0")}:00</option>
              ))}
            </select>
          </label>
          <label className="appt-settings-field">
            <span className="appt-settings-label">Notes (optionnel)</span>
            <textarea className="appt-settings-input" rows={2} style={{ resize: "vertical" }}
              value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Instructions particulières..." />
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, cursor: "pointer" }}>
            <input type="checkbox" checked={sendEmail} onChange={(e) => setSendEmail(e.target.checked)} />
            <span>Envoyer un email de confirmation au fidèle</span>
          </label>
          {error && <div className="appt-error">{error}</div>}
        </div>
        <div className="appt-modal-footer">
          <button className="btn-secondary" onClick={onClose}>Annuler</button>
          <button className="btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? "Création..." : "Créer le RDV"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ===== PAGE PRINCIPALE =====
export default function AdminAppointmentsPage() {
  const [settings,       setSettings]       = useState(null);
  const [editSettings,   setEditSettings]   = useState(null);
  const [appointments,   setAppointments]   = useState([]);
  const [fideles,        setFideles]        = useState([]);
  const [activeTab,      setActiveTab]      = useState("planning");
  const [activeType,     setActiveType]     = useState("selection");
  const [loading,        setLoading]        = useState(true);
  const [loadingFideles, setLoadingFideles] = useState(false);
  const [generating,     setGenerating]     = useState(false);
  const [publishing,     setPublishing]     = useState(false);
  const [sendingEmails,  setSendingEmails]  = useState(false);
  const [exporting,      setExporting]      = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [editingAppt,    setEditingAppt]    = useState(null);
  const [showSingle,     setShowSingle]     = useState(false);
  const [message,        setMessage]        = useState({ type: "", text: "" });

  const showMsg = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  const loadSettings = useCallback(async () => {
    try {
      const s = await getAppointmentSettings();
      setSettings(s); setEditSettings(s);
    } catch (e) { console.error("[AdminAppointments] settings:", e); }
  }, []);

  const loadAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAppointments({ type: activeType });
      setAppointments(Array.isArray(data?.items) ? data.items : []);
    } catch (e) { setAppointments([]); }
    finally { setLoading(false); }
  }, [activeType]);

  const loadFideles = useCallback(async () => {
    try {
      setLoadingFideles(true);
      const data = await getFidelesWithAppointments();
      setFideles(Array.isArray(data?.items) ? data.items : []);
    } catch (e) { setFideles([]); }
    finally { setLoadingFideles(false); }
  }, []);

  useEffect(() => { loadSettings(); }, [loadSettings]);
  useEffect(() => {
    if (activeTab === "planning") loadAppointments();
    if (activeTab === "fideles")  loadFideles();
  }, [activeTab, loadAppointments, loadFideles]);

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      const updated = await updateAppointmentSettings(editSettings);
      setSettings(updated);
      showMsg("success", "Paramètres sauvegardés.");
    } catch (e) { showMsg("error", e?.message || "Erreur sauvegarde."); }
    finally { setSavingSettings(false); }
  };

  const handleGenerate = async () => {
    if (!window.confirm(`Générer les RDV ${activeType} ? Les RDV existants seront remplacés.`)) return;
    setGenerating(true);
    try {
      const result = await generateAppointments(activeType);
      showMsg("success", result.message);
      await loadAppointments();
    } catch (e) { showMsg("error", e?.message || "Erreur génération."); }
    finally { setGenerating(false); }
  };

  const handlePublish = async () => {
    if (!window.confirm(`Rendre visibles les RDV ${activeType} sur les comptes fidèles ?`)) return;
    setPublishing(true);
    try {
      const result = await publishAppointments(activeType);
      showMsg("success", result.message);
    } catch (e) { showMsg("error", e?.message || "Erreur publication."); }
    finally { setPublishing(false); }
  };

  const handleSendEmails = async () => {
    if (!window.confirm(`Envoyer les emails pour les RDV ${activeType} ?`)) return;
    setSendingEmails(true);
    try {
      const result = await sendAppointmentEmails(activeType);
      showMsg("success", result.message);
    } catch (e) { showMsg("error", e?.message || "Erreur envoi emails."); }
    finally { setSendingEmails(false); }
  };

  const handleExport = async () => {
    setExporting(true);
    try { await exportFideles(); showMsg("success", "Export CSV téléchargé."); }
    catch (e) { showMsg("error", "Erreur export."); }
    finally { setExporting(false); }
  };

  const grouped   = groupByDay(appointments);
  const days      = Object.keys(grouped).sort();
  const totalAppt = appointments.length;

  return (
    <div className="appt-page">

      {/* HERO */}
      <section className="appt-hero">
        <div className="appt-hero-top">
          <div>
            <h1 className="appt-hero-title">Gestion des rendez-vous</h1>
            <p className="appt-hero-sub">Génère, ajuste et publie les créneaux pour les fidèles.</p>
          </div>
          <div className="appt-hero-actions">
            <button className="appt-btn-outline" onClick={() => setShowSingle(true)}>
              ➕ RDV individuel
            </button>
            <button className="appt-btn-white" onClick={handleExport} disabled={exporting}>
              {exporting ? "Export..." : "⬇ Export CSV"}
            </button>
          </div>
        </div>

        <div className="appt-stats">
          <div className="appt-stat">
            <div className="appt-stat-label">RDV générés</div>
            <div className="appt-stat-value">{totalAppt}</div>
          </div>
          <div className="appt-stat">
            <div className="appt-stat-label">Jours utilisés</div>
            <div className="appt-stat-value">{days.length}</div>
          </div>
          <div className="appt-stat">
            <div className="appt-stat-label">Capacité/créneau</div>
            <div className="appt-stat-value">{settings?.slot_capacity ?? "-"}</div>
          </div>
          <div className="appt-stat">
            <div className="appt-stat-label">Fidèles suivis</div>
            <div className="appt-stat-value">{fideles.length || "-"}</div>
          </div>
        </div>
      </section>

      {/* FEEDBACK */}
      {message.text && (
        <div className={message.type === "success" ? "appt-success" : "appt-error"}>
          {message.text}
        </div>
      )}

      {/* ONGLETS PRINCIPAUX */}
      <div className="appt-tabs">
        <button className={`appt-tab${activeTab === "planning"  ? " appt-tab--active" : ""}`} onClick={() => setActiveTab("planning")}>
          📅 Planning
        </button>
        <button className={`appt-tab${activeTab === "fideles"   ? " appt-tab--active" : ""}`} onClick={() => setActiveTab("fideles")}>
          👥 Vue par fidèle
        </button>
        <button className={`appt-tab${activeTab === "settings"  ? " appt-tab--active" : ""}`} onClick={() => setActiveTab("settings")}>
          ⚙️ Paramètres
        </button>
      </div>

      {/* ===== ONGLET PLANNING ===== */}
      {activeTab === "planning" && (
        <>
          {/* Sous-tabs type */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <div className="appt-tabs">
              <button className={`appt-tab${activeType === "selection" ? " appt-tab--active" : ""}`}
                onClick={() => setActiveType("selection")}>🐑 Sélection</button>
              <button className={`appt-tab${activeType === "sacrifice" ? " appt-tab--active" : ""}`}
                onClick={() => setActiveType("sacrifice")}>📅 Sacrifice</button>
            </div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button className="btn-secondary" onClick={handleGenerate} disabled={generating}>
                {generating ? "Génération..." : "⚡ Générer"}
              </button>
              <button className="btn-secondary" onClick={handlePublish} disabled={publishing || !totalAppt}>
                {publishing ? "Publication..." : "✅ Publier sur les comptes"}
              </button>
              <button className="btn-primary" onClick={handleSendEmails} disabled={sendingEmails || !totalAppt}>
                {sendingEmails ? "Envoi..." : "📨 Envoyer les emails"}
              </button>
            </div>
          </div>

          {loading ? (
            <div className="appt-empty">Chargement...</div>
          ) : days.length === 0 ? (
            <div className="appt-empty">Aucun RDV généré. Cliquez sur "Générer" pour commencer.</div>
          ) : (
            <div style={{ display: "grid", gap: 16 }}>
              {days.map((day) => (
                <div key={day} className="appt-card">
                  <div className="appt-card-header">
                    <h3 className="appt-card-title">📅 {formatDate(`${day}T08:00:00`)}</h3>
                    <span style={{ fontSize: 13, color: "#64748b" }}>{grouped[day].length} fidèle(s)</span>
                  </div>
                  <div className="appt-card-body">
                    {grouped[day]
                      .sort((a, b) => new Date(a.appointment_at) - new Date(b.appointment_at))
                      .map((appt) => (
                        <div key={appt.id} className="appt-slot">
                          <div style={{ flex: 1 }}>
                            <div className="appt-slot-time">{formatTime(appt.appointment_at)}</div>
                            <div className="appt-slot-name">{appt.fidel?.first_name} {appt.fidel?.last_name}</div>
                            <div className="appt-slot-email">{appt.fidel?.email}</div>
                            {appt.notes && <div style={{ fontSize: 12, color: "#f59e0b", marginTop: 4 }}>📝 {appt.notes}</div>}
                          </div>
                          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            <span className="appt-slot-badge">
                              {appt.status === "scheduled" ? "Planifié" :
                               appt.status === "completed" ? "Complété" : "Manqué"}
                            </span>
                            <button onClick={() => setEditingAppt(appt)}
                              style={{ width: 32, height: 32, border: "1px solid #e2e8f0", borderRadius: 8,
                                background: "#f8fafc", cursor: "pointer", fontSize: 14, display: "grid", placeItems: "center" }}
                              title="Modifier">✏️</button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ===== ONGLET VUE PAR FIDÈLE ===== */}
      {activeTab === "fideles" && (
        <div className="appt-card">
          <div className="appt-card-header">
            <h3 className="appt-card-title">Vue par fidèle</h3>
            <span style={{ fontSize: 13, color: "#64748b" }}>{fideles.length} fidèle(s)</span>
          </div>
          {loadingFideles ? (
            <div className="appt-empty">Chargement...</div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                <thead>
                  <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                    {["Fidèle", "Email", "Sélection", "Sacrifice"].map((h) => (
                      <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontWeight: 700,
                        fontSize: 12, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {fideles.map((f) => {
                    const selection = f.appointments.find((a) => a.type === "selection");
                    const sacrifice = f.appointments.find((a) => a.type === "sacrifice");
                    return (
                      <tr key={f.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "12px 16px", fontWeight: 600, color: "#0f172a" }}>
                          {f.first_name} {f.last_name}
                        </td>
                        <td style={{ padding: "12px 16px", color: "#64748b", fontSize: 13 }}>{f.email}</td>
                        <td style={{ padding: "12px 16px" }}>
                          {selection ? (
                            <span style={{ fontSize: 13, color: "#1d4ed8" }}>
                              {formatDate(selection.appointment_at)} {formatTime(selection.appointment_at)}
                            </span>
                          ) : (
                            <span style={{ fontSize: 12, color: "#94a3b8" }}>—</span>
                          )}
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          {sacrifice ? (
                            <span style={{ fontSize: 13, color: "#b45309" }}>
                              {formatDate(sacrifice.appointment_at)} {formatTime(sacrifice.appointment_at)}
                            </span>
                          ) : (
                            <span style={{ fontSize: 12, color: "#94a3b8" }}>—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ===== ONGLET PARAMÈTRES ===== */}
      {activeTab === "settings" && editSettings && (
        <div className="appt-settings-card">
          <h2 className="appt-settings-title">⚙️ Paramètres</h2>
          <div className="appt-settings-grid">
            <label className="appt-settings-field">
              <span className="appt-settings-label">Personnes par créneau</span>
              <input type="number" min="1" max="50" className="appt-settings-input"
                value={editSettings.slot_capacity || ""}
                onChange={(e) => setEditSettings((p) => ({ ...p, slot_capacity: e.target.value }))} />
            </label>
            <label className="appt-settings-field">
              <span className="appt-settings-label">Date début sélection</span>
              <input type="date" className="appt-settings-input"
                value={editSettings.selection_start_date || ""}
                onChange={(e) => setEditSettings((p) => ({ ...p, selection_start_date: e.target.value }))} />
            </label>
            <label className="appt-settings-field">
              <span className="appt-settings-label">Date du sacrifice</span>
              <input type="date" className="appt-settings-input"
                value={editSettings.sacrifice_date || ""}
                onChange={(e) => setEditSettings((p) => ({ ...p, sacrifice_date: e.target.value }))} />
            </label>
            <label className="appt-settings-field" style={{ gridColumn: "1 / -1" }}>
              <span className="appt-settings-label">Adresse</span>
              <input type="text" className="appt-settings-input"
                value={editSettings.address || ""}
                onChange={(e) => setEditSettings((p) => ({ ...p, address: e.target.value }))} />
            </label>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button className="btn-primary" onClick={handleSaveSettings} disabled={savingSettings}>
              {savingSettings ? "Sauvegarde..." : "Sauvegarder"}
            </button>
          </div>
        </div>
      )}

      {/* MODALS */}
      {editingAppt && (
        <EditModal appt={editingAppt} onClose={() => setEditingAppt(null)} onSaved={loadAppointments} />
      )}
      {showSingle && (
        <SingleApptModal onClose={() => setShowSingle(false)} onSaved={loadAppointments} />
      )}
    </div>
  );
}