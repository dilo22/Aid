import { useEffect, useMemo, useState, useCallback } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { getSheepList } from "../../api/sheepApi";
import { getPaymentsByProfileId } from "../../api/paymentsApi";
import { getMyAppointments } from "../../api/appointmentsApi";
import Loader from "../../components/ui/Loader";
import StatusBadge from "../../components/ui/StatusBadge";
import {
  getDisplayName, formatMoney, formatDateTime, normalizeMoney,
} from "../../utils/fidelHelpers";
import "../../styles/FidelPages.css";

const DetailCard = ({ label, value, full = false }) => (
  <div className={`fidel-detail-card${full ? " fidel-detail-card--full" : ""}`}>
    <div className="fidel-detail-label">{label}</div>
    <div className="fidel-detail-value">{value ?? "-"}</div>
  </div>
);

const AppointmentCard = ({ appt }) => {
  const isSelection = appt.type === "selection";
  const date = new Date(appt.appointment_at).toLocaleDateString("fr-FR", {
    weekday: "long", day: "numeric", month: "long",
  });
  const time = new Date(appt.appointment_at).toLocaleTimeString("fr-FR", {
    hour: "2-digit", minute: "2-digit",
  });

  return (
    <div style={{
      border: "1px solid #e2e8f0", borderRadius: 14,
      padding: 16, background: "#f8fafc", display: "grid", gap: 8,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{
          fontSize: 12, fontWeight: 700, padding: "3px 10px",
          borderRadius: 999,
          background: isSelection ? "#eff6ff" : "#fef3c7",
          color:      isSelection ? "#1d4ed8" : "#b45309",
          border:     `1px solid ${isSelection ? "#bfdbfe" : "#fde68a"}`,
        }}>
          {isSelection ? "🐑 Sélection" : "📅 Sacrifice"}
        </span>
        <span style={{ fontSize: 12, color: "#64748b" }}>
          {appt.status === "scheduled" ? "Planifié" :
           appt.status === "completed" ? "Complété" : "Manqué"}
        </span>
      </div>
      <div style={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}>{date}</div>
      <div style={{ fontSize: 14, fontWeight: 600, color: "#2563eb" }}>{time}</div>
      <div style={{ fontSize: 13, color: "#64748b" }}>📍 {appt.address}</div>
      {appt.notes && <div style={{ fontSize: 13, color: "#475569" }}>📝 {appt.notes}</div>}
    </div>
  );
};

// ✅ Bandeau d'attente pour les fidèles pending
const PendingBanner = () => (
  <div style={{
    background: "#fff7ed",
    border: "1px solid #fdba74",
    borderRadius: 14,
    padding: "16px 20px",
    display: "flex",
    gap: 12,
    alignItems: "flex-start",
    color: "#c2410c",
    fontSize: 14,
    fontWeight: 600,
  }}>
    <span style={{ fontSize: 20, flexShrink: 0 }}>⏳</span>
    <div>
      <div>Votre compte est en attente de validation.</div>
      <div style={{ fontWeight: 400, marginTop: 4, color: "#9a3412", lineHeight: 1.6 }}>
        Un administrateur examinera votre dossier prochainement.
        Vous recevrez un accès complet dès l'approbation de votre compte.
      </div>
    </div>
  </div>
);

export default function FidelDashboard() {
  const { profile } = useAuth();

  const [sheep,         setSheep]         = useState([]);
  const [payments,      setPayments]      = useState([]);
  const [appointments,  setAppointments]  = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [selectedSheep, setSelectedSheep] = useState(null);

  const isPending = profile?.status === "pending";

  const loadData = useCallback(async () => {
    if (!profile?.id) return;
    try {
      setLoading(true);

      // ✅ Si pending — pas besoin de charger les données
      if (isPending) {
        setLoading(false);
        return;
      }

      const [sheepData, paymentsData, apptData] = await Promise.all([
        getSheepList({ page: 1, limit: 100 }),
        getPaymentsByProfileId(profile.id),
        getMyAppointments(),
      ]);
      setSheep(Array.isArray(sheepData?.items) ? sheepData.items : []);
      setPayments(Array.isArray(paymentsData?.items) ? paymentsData.items : []);
      setAppointments(Array.isArray(apptData?.items) ? apptData.items : []);
    } catch (error) {
      console.error("[FidelDashboard]", error);
    } finally {
      setLoading(false);
    }
  }, [profile?.id, isPending]);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    if (!selectedSheep) return;
    const onKey = (e) => { if (e.key === "Escape") setSelectedSheep(null); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [selectedSheep]);

  const assignedSheep = useMemo(() => {
    if (!profile?.id) return [];
    return sheep.filter((s) => s?.fidel_id === profile.id);
  }, [sheep, profile?.id]);

  const sheepWithSummary = useMemo(() => {
    return assignedSheep.map((item) => {
      const sheepPayments = payments
        .filter((p) => p?.sheep_id === item?.id)
        .sort((a, b) => new Date(b.payment_date || 0) - new Date(a.payment_date || 0));

      const expectedAmount = item?.final_price != null && item?.final_price !== ""
        ? normalizeMoney(item.final_price)
        : Math.max(normalizeMoney(item.price) - normalizeMoney(item.discount_amount), 0);

      const paidAmount      = sheepPayments.reduce((s, p) => s + normalizeMoney(p.amount), 0);
      const remainingAmount = Math.max(expectedAmount - paidAmount, 0);
      const paymentProgress = expectedAmount > 0 ? Math.min((paidAmount / expectedAmount) * 100, 100) : 0;

      return { ...item, sheepPayments, expectedAmount, paidAmount, remainingAmount, paymentProgress };
    });
  }, [assignedSheep, payments]);

  const selectedDetails = useMemo(
    () => selectedSheep ? sheepWithSummary.find((s) => s.id === selectedSheep.id) ?? null : null,
    [selectedSheep, sheepWithSummary]
  );

  const upcomingAppointments = useMemo(() =>
    appointments
      .filter((a) => a.status === "scheduled")
      .sort((a, b) => new Date(a.appointment_at) - new Date(b.appointment_at)),
    [appointments]
  );

  return (
    <div className="fidel-page">
      <div className="fidel-container">

        {/* HERO */}
        <div className="fidel-hero-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ display: "grid", gap: 10 }}>
              <h1 className="fidel-hero-title">Bonjour {getDisplayName(profile)}</h1>
              <p className="fidel-hero-subtitle">
                {isPending
                  ? "Bienvenue sur AID Platform. Votre espace sera disponible après validation."
                  : "Retrouvez ici vos moutons attribués et le suivi de votre dossier."}
              </p>
              <StatusBadge status={profile?.status} />
            </div>
            {!isPending && (
              <button onClick={loadData} disabled={loading}
                className="btn-secondary" style={{ flexShrink: 0, marginTop: 4 }}>
                {loading ? "..." : "↻ Actualiser"}
              </button>
            )}
          </div>
        </div>

        {/* ✅ Bandeau pending */}
        {isPending && <PendingBanner />}

        {/* GRILLE — masquée si pending */}
        {!isPending && (
          <div className="fidel-grid">

            {/* RENDEZ-VOUS */}
            <div className="fidel-card fidel-col-6">
              <div className="fidel-card-header">
                <h2 className="fidel-card-title">Rendez-vous à venir</h2>
                <p className="fidel-card-subtitle">Vos créneaux attribués par l'administration.</p>
              </div>
              <div className="fidel-card-body">
                {loading ? <Loader small /> : upcomingAppointments.length === 0 ? (
                  <div className="fidel-empty">
                    Aucun rendez-vous planifié pour le moment.
                    L'administration vous attribuera un créneau prochainement.
                  </div>
                ) : (
                  <div style={{ display: "grid", gap: 12 }}>
                    {upcomingAppointments.map((appt) => (
                      <AppointmentCard key={appt.id} appt={appt} />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* MOUTONS */}
            <div className="fidel-card fidel-col-6">
              <div className="fidel-card-header">
                <h2 className="fidel-card-title">Mes moutons</h2>
                <p className="fidel-card-subtitle">Cliquez sur un mouton pour voir ses détails.</p>
              </div>
              <div className="fidel-card-body">
                {loading ? <Loader small /> : sheepWithSummary.length === 0 ? (
                  <div className="fidel-empty">
                    Aucun mouton attribué pour le moment.
                  </div>
                ) : (
                  <div className="fidel-sheep-list">
                    {sheepWithSummary.map((item) => (
                      <div key={item.id} className="fidel-sheep-row" onClick={() => setSelectedSheep(item)}>
                        <div className="fidel-sheep-row-top">
                          <div className="fidel-sheep-row-left">
                            {item.photo_url
                              ? <img src={item.photo_url} alt={`Mouton ${item.number}`} className="fidel-sheep-photo" />
                              : <div className="fidel-sheep-fallback">🐏</div>
                            }
                            <div>
                              <h3 className="fidel-sheep-name">Mouton #{item.number || "-"}</h3>
                              <p className="fidel-sheep-sub">{item.size || "-"} • {item.color || "-"}</p>
                              <p className="fidel-sheep-sub">{item.weight ? `${item.weight} kg` : "-"}</p>
                            </div>
                          </div>
                          <div className="fidel-sheep-badges">
                            <StatusBadge status={item.status} />
                            <StatusBadge status={item.payment_status || "unpaid"} />
                          </div>
                        </div>

                        <div className="fidel-summary-grid">
                          {[
                            ["Prix final",    formatMoney(item.expectedAmount)],
                            ["Déjà payé",     formatMoney(item.paidAmount)],
                            ["Reste à payer", formatMoney(item.remainingAmount)],
                            ["Nb paiements",  item.sheepPayments.length],
                          ].map(([label, value]) => (
                            <div key={label} className="fidel-summary-box">
                              <div className="fidel-summary-label">{label}</div>
                              <div className="fidel-summary-value">{value}</div>
                            </div>
                          ))}
                        </div>

                        <div className="fidel-bar-track">
                          <div className="fidel-bar-fill" style={{ width: `${item.paymentProgress}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* INFO */}
            <div className="fidel-card fidel-col-12">
              <div className="fidel-card-header">
                <h2 className="fidel-card-title">Informations importantes</h2>
              </div>
              <div className="fidel-card-body">
                <div className="fidel-empty">
                  Votre profil, vos moutons et vos paiements sont mis à jour par l'administration.
                </div>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* MODAL */}
      {selectedDetails && (
        <div className="fidel-modal-overlay" onClick={() => setSelectedSheep(null)} role="dialog" aria-modal="true">
          <div className="fidel-modal" onClick={(e) => e.stopPropagation()}>
            <div className="fidel-modal-header">
              <h2 className="fidel-modal-title">Mouton #{selectedDetails.number || "-"}</h2>
              <button type="button" onClick={() => setSelectedSheep(null)} className="btn-secondary">Fermer</button>
            </div>

            <div className="fidel-modal-body">
              {selectedDetails.photo_url && (
                <img src={selectedDetails.photo_url} alt="" className="fidel-modal-photo" />
              )}

              <div className="fidel-details-grid">
                <DetailCard label="Référence"       value={`#${selectedDetails.number || "-"}`} />
                <DetailCard label="Statut"          value={<StatusBadge status={selectedDetails.status} />} />
                <DetailCard label="Poids"           value={selectedDetails.weight ? `${selectedDetails.weight} kg` : "-"} />
                <DetailCard label="Taille"          value={selectedDetails.size} />
                <DetailCard label="Couleur"         value={selectedDetails.color} />
                <DetailCard label="Attribué le"     value={formatDateTime(selectedDetails.assigned_at)} />
                <DetailCard label="Prix initial"    value={formatMoney(selectedDetails.price)} />
                <DetailCard label="Réduction"       value={formatMoney(selectedDetails.discount_amount)} />
                <DetailCard label="Prix final"      value={formatMoney(selectedDetails.expectedAmount)} />
                <DetailCard label="Statut paiement" value={<StatusBadge status={selectedDetails.payment_status || "unpaid"} />} />
                <DetailCard label="Payé"            value={formatMoney(selectedDetails.paidAmount)} />
                <DetailCard label="Reste à payer"   value={formatMoney(selectedDetails.remainingAmount)} />
                {selectedDetails.payment_due_date && (
                  <DetailCard label="Échéance" value={formatDateTime(selectedDetails.payment_due_date)} />
                )}
                {selectedDetails.notes && (
                  <DetailCard label="Notes" value={selectedDetails.notes} full />
                )}
                {selectedDetails.payment_notes && (
                  <DetailCard label="Notes paiement" value={selectedDetails.payment_notes} full />
                )}
              </div>

              <div>
                <h3 className="fidel-section-title">Historique des paiements</h3>
                {selectedDetails.sheepPayments.length === 0 ? (
                  <div className="fidel-empty">Aucun paiement enregistré.</div>
                ) : (
                  <div className="fidel-payments-list">
                    {selectedDetails.sheepPayments.map((p) => (
                      <div key={p.id} className="fidel-payment-item">
                        <div className="fidel-payment-title">
                          {formatMoney(p.amount)} • {p.payment_type || "-"}
                        </div>
                        <div className="fidel-payment-text">{formatDateTime(p.payment_date)}</div>
                        {p.payment_method && <div className="fidel-payment-text">Méthode : {p.payment_method}</div>}
                        {p.reference     && <div className="fidel-payment-text">Réf : {p.reference}</div>}
                        {p.notes         && <div className="fidel-payment-text">Note : {p.notes}</div>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="fidel-modal-footer">
              <button type="button" onClick={() => setSelectedSheep(null)} className="btn-secondary">Fermer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}