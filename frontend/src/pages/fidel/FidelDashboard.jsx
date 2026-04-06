import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { getSheepList } from "../../api/sheepApi";
import { getPaymentsByProfileId } from "../../api/paymentsApi";
import Loader from "../../components/ui/Loader";
import StatusBadge from "../../components/ui/StatusBadge";
import {
  getDisplayName, getSheepStatusTheme, getPaymentStatusTheme,
  formatMoney, formatDateTime, normalizeMoney,
} from "../../utils/fidelHelpers";
import "../../styles/FidelPages.css";

// ✅ Défini avant le composant
const DetailCard = ({ label, value, full = false }) => (
  <div className={`fidel-detail-card${full ? " fidel-detail-card--full" : ""}`}>
    <div className="fidel-detail-label">{label}</div>
    <div className="fidel-detail-value">{value ?? "-"}</div>
  </div>
);

const Badge = ({ theme, children }) => (
  <span className="fidel-badge" style={{
    background: theme.background, color: theme.color, borderColor: theme.border?.replace("1px solid ", ""),
  }}>{children}</span>
);

export default function FidelDashboard() {
  const { profile } = useAuth();

  const [sheep,         setSheep]         = useState([]);
  const [payments,      setPayments]      = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [selectedSheep, setSelectedSheep] = useState(null);

  useEffect(() => {
    if (!profile?.id) return;

    const loadData = async () => {
      try {
        setLoading(true);
        const [sheepData, paymentsData] = await Promise.all([
          // ✅ limit réduit — un fidèle n'aura jamais 1000 moutons
          getSheepList({ page: 1, limit: 20 }),
          getPaymentsByProfileId(profile.id),
        ]);
        setSheep(Array.isArray(sheepData?.items) ? sheepData.items : []);
        setPayments(Array.isArray(paymentsData?.items) ? paymentsData.items : []);
      } catch (error) {
        console.error("[FidelDashboard]", error);
        setSheep([]);
        setPayments([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [profile?.id]);

  // ✅ Escape + scroll lock
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

  return (
    <div className="fidel-page">
      <div className="fidel-container">

        {/* HERO */}
        <div className="fidel-hero-card">
          <h1 className="fidel-hero-title">Bonjour {getDisplayName(profile)}</h1>
          <p className="fidel-hero-subtitle">
            Retrouvez ici vos moutons attribués et le suivi de votre dossier.
          </p>
          <StatusBadge status={profile?.status} />
        </div>

        {/* GRILLE */}
        <div className="fidel-grid">

          {/* Rendez-vous */}
          <div className="fidel-card fidel-col-6">
            <div className="fidel-card-header">
              <h2 className="fidel-card-title">Rendez-vous à venir</h2>
              <p className="fidel-card-subtitle">L'admin pourra vous attribuer des créneaux ici.</p>
            </div>
            <div className="fidel-card-body">
              <div className="fidel-empty">Aucun rendez-vous planifié pour le moment.</div>
            </div>
          </div>

          {/* Moutons */}
          <div className="fidel-card fidel-col-6">
            <div className="fidel-card-header">
              <h2 className="fidel-card-title">Mes moutons</h2>
              <p className="fidel-card-subtitle">Cliquez sur un mouton pour voir ses détails.</p>
            </div>
            <div className="fidel-card-body">
              {loading ? <Loader small /> : sheepWithSummary.length === 0 ? (
                <div className="fidel-empty">
                  Aucun mouton attribué pour le moment. Dès qu'un admin vous en affecte un, il apparaîtra ici.
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
                          ["Prix final",     formatMoney(item.expectedAmount)],
                          ["Déjà payé",      formatMoney(item.paidAmount)],
                          ["Reste à payer",  formatMoney(item.remainingAmount)],
                          ["Nb paiements",   item.sheepPayments.length],
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

          {/* Info */}
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