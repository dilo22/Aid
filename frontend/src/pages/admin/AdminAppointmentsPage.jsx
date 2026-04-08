import { useEffect, useState, useCallback } from "react";
import {
  getAppointmentSettings, updateAppointmentSettings,
  generateAppointments, getAppointments,
  publishAppointments, exportFideles,
} from "../../api/appointmentsApi";
import "../../styles/AdminAppointments.css";

const SLOT_HOURS = [8, 9, 10, 11, 14, 15, 16, 17];

const formatDate = (iso) => new Date(iso).toLocaleDateString("fr-FR", {
  weekday: "short", day: "numeric", month: "short",
});

const formatTime = (iso) => new Date(iso).toLocaleTimeString("fr-FR", {
  hour: "2-digit", minute: "2-digit",
});

const groupByDay = (appointments) => {
  const groups = {};
  for (const appt of appointments) {
    const day = appt.appointment_at.split("T")[0];
    if (!groups[day]) groups[day] = [];
    groups[day].push(appt);
  }
  return groups;
};

export default function AdminAppointmentsPage() {
  const [settings,     setSettings]     = useState(null);
  const [editSettings, setEditSettings] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [activeType,   setActiveType]   = useState("selection");
  const [loading,      setLoading]      = useState(true);
  const [generating,   setGenerating]   = useState(false);
  const [publishing,   setPublishing]   = useState(false);
  const [exporting,    setExporting]    = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [message,      setMessage]      = useState({ type: "", text: "" });

  const showMsg = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  const loadSettings = useCallback(async () => {
    try {
      const s = await getAppointmentSettings();
      setSettings(s);
      setEditSettings(s);
    } catch (e) {
      console.error("[AdminAppointments] settings:", e);
    }
  }, []);

  const loadAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAppointments({ type: activeType });
      setAppointments(Array.isArray(data?.items) ? data.items : []);
    } catch (e) {
      console.error("[AdminAppointments] load:", e);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, [activeType]);

  useEffect(() => { loadSettings(); }, [loadSettings]);
  useEffect(() => { loadAppointments(); }, [loadAppointments]);

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      const updated = await updateAppointmentSettings(editSettings);
      setSettings(updated);
      showMsg("success", "Paramètres sauvegardés.");
    } catch (e) {
      showMsg("error", e?.message || "Erreur sauvegarde.");
    } finally {
      setSavingSettings(false);
    }
  };

  const handleGenerate = async () => {
    if (!window.confirm(`Générer les RDV ${activeType} ? Les drafts existants seront remplacés.`)) return;
    setGenerating(true);
    try {
      const result = await generateAppointments(activeType);
      showMsg("success", result.message);
      await loadAppointments();
    } catch (e) {
      showMsg("error", e?.message || "Erreur génération.");
    } finally {
      setGenerating(false);
    }
  };

  const handlePublish = async () => {
    if (!window.confirm(`Publier les RDV ${activeType} et envoyer les emails ?`)) return;
    setPublishing(true);
    try {
      const result = await publishAppointments(activeType);
      showMsg("success", result.message);
      await loadAppointments();
    } catch (e) {
      showMsg("error", e?.message || "Erreur publication.");
    } finally {
      setPublishing(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportFideles();
      showMsg("success", "Export CSV téléchargé.");
    } catch (e) {
      showMsg("error", "Erreur export.");
    } finally {
      setExporting(false);
    }
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
            <p className="appt-hero-sub">
              Génère, ajuste et publie les créneaux pour les fidèles.
            </p>
          </div>
          <div className="appt-hero-actions">
            <button className="appt-btn-white" onClick={handleExport} disabled={exporting}>
              {exporting ? "Export..." : "⬇ Export CSV fidèles"}
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
            <div className="appt-stat-label">Type actif</div>
            <div className="appt-stat-value" style={{ fontSize: 16, marginTop: 4 }}>
              {activeType === "selection" ? "Sélection" : "Sacrifice"}
            </div>
          </div>
        </div>
      </section>

      {/* FEEDBACK */}
      {message.text && (
        <div className={message.type === "success" ? "appt-success" : "appt-error"}>
          {message.text}
        </div>
      )}

      {/* SETTINGS */}
      {editSettings && (
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

      {/* TABS + ACTIONS */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div className="appt-tabs">
          <button className={`appt-tab${activeType === "selection" ? " appt-tab--active" : ""}`}
            onClick={() => setActiveType("selection")}>
            🐑 Sélection mouton
          </button>
          <button className={`appt-tab${activeType === "sacrifice" ? " appt-tab--active" : ""}`}
            onClick={() => setActiveType("sacrifice")}>
            📅 Jour du sacrifice
          </button>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn-secondary" onClick={handleGenerate} disabled={generating}>
            {generating ? "Génération..." : "⚡ Générer les RDV"}
          </button>
          <button className="btn-primary" onClick={handlePublish} disabled={publishing || !totalAppt}>
            {publishing ? "Publication..." : "📨 Publier & envoyer emails"}
          </button>
        </div>
      </div>

      {/* LISTE PAR JOUR */}
      {loading ? (
        <div className="appt-empty">Chargement...</div>
      ) : days.length === 0 ? (
        <div className="appt-empty">
          Aucun RDV généré. Cliquez sur "Générer les RDV" pour commencer.
        </div>
      ) : (
        <div style={{ display: "grid", gap: 16 }}>
          {days.map((day) => (
            <div key={day} className="appt-card">
              <div className="appt-card-header">
                <h3 className="appt-card-title">📅 {formatDate(`${day}T08:00:00`)}</h3>
                <span style={{ fontSize: 13, color: "#64748b" }}>
                  {grouped[day].length} fidèle(s)
                </span>
              </div>
              <div className="appt-card-body">
                {grouped[day].map((appt) => (
                  <div key={appt.id} className="appt-slot">
                    <div>
                      <div className="appt-slot-time">{formatTime(appt.appointment_at)}</div>
                      <div className="appt-slot-name">
                        {appt.fidel?.first_name} {appt.fidel?.last_name}
                      </div>
                      <div className="appt-slot-email">{appt.fidel?.email}</div>
                    </div>
                    <span className="appt-slot-badge">
                      {appt.status === "scheduled"  ? "Planifié"  :
                       appt.status === "completed"  ? "Complété"  : "Manqué"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}