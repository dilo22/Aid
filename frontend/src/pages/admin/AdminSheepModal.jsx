import { useEffect, useState } from "react";
import Loader from "../../components/ui/Loader";
import StatusBadge from "../../components/ui/StatusBadge";
import { createPayment, deletePayment } from "../../api/paymentsApi";
import "../../styles/AdminSheepModal.css";

// ✅ Défini avant le composant parent
const DetailCard = ({ label, value, full = false }) => (
  <div className={`smodal-detail-card${full ? " smodal-detail-card--full" : ""}`}>
    <div className="smodal-detail-label">{label}</div>
    <div className="smodal-detail-value">{value ?? "-"}</div>
  </div>
);

const EMPTY_PAYMENT_FORM = {
  amount:         "",
  payment_type:   "installment",
  payment_method: "cash",
  reference:      "",
  notes:          "",
};

const normalizeMoney = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

export default function AdminSheepModal({
  selectedSheep,
  selectedSheepAssignedProfile,
  deletingId,
  setSelectedSheep,
  onEdit,
  onDelete,
  getRealSheepStatus,
  getStatusTheme,
  getPaymentStatusTheme,
  getProfileDisplayName,
  formatPrice,
  formatMoney,
  formatWeight,
  formatDateTime,
  payments,
  paymentsLoading,
  paymentsSummary,
  expectedAmount,
  paidAmount,
  remainingAmount,
  onPaymentsChanged,
}) {
  const [paymentForm,       setPaymentForm]       = useState(EMPTY_PAYMENT_FORM);
  const [savingPayment,     setSavingPayment]     = useState(false);
  const [deletingPaymentId, setDeletingPaymentId] = useState(null);
  const [paymentError,      setPaymentError]      = useState("");

  // ✅ Reset form quand on change de mouton
  useEffect(() => {
    setPaymentForm(EMPTY_PAYMENT_FORM);
    setPaymentError("");
  }, [selectedSheep?.id]);

  // ✅ Escape + scroll lock
  useEffect(() => {
    if (!selectedSheep) return;
    const handleKey = (e) => { if (e.key === "Escape") setSelectedSheep(null); };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [selectedSheep]);

  if (!selectedSheep) return null;

  const close = () => setSelectedSheep(null);
  const realStatus       = getRealSheepStatus(selectedSheep);
  const paymentStatus    = paymentsSummary?.paymentStatus || selectedSheep.payment_status || "unpaid";
  const isDeleting       = deletingId === selectedSheep.id;

  const handlePaymentChange = (e) => {
    const { name, value } = e.target;
    setPaymentForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreatePayment = async (e) => {
    e.preventDefault();
    setPaymentError("");

    if (!selectedSheep?.fidel_id) {
      setPaymentError("Attribue d'abord ce mouton à un fidèle.");
      return;
    }

    const parsedAmount = Number(String(paymentForm.amount).replace(",", "."));
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setPaymentError("Le montant est invalide.");
      return;
    }

    const currentRemaining = Math.max(normalizeMoney(remainingAmount), 0);
    if (currentRemaining <= 0) {
      setPaymentError("Ce mouton est déjà totalement payé.");
      return;
    }

    // ✅ Auto-détection paiement complet
    const payment_type = Math.abs(parsedAmount - currentRemaining) < 0.0001
      ? "full"
      : paymentForm.payment_type;

    setSavingPayment(true);
    try {
      await createPayment({
        sheep_id:       selectedSheep.id,
        profile_id:     selectedSheep.fidel_id,
        amount:         parsedAmount,
        payment_type,
        payment_method: paymentForm.payment_method || null,
        reference:      paymentForm.reference      || null,
        notes:          paymentForm.notes          || null,
      });
      setPaymentForm(EMPTY_PAYMENT_FORM);
      await onPaymentsChanged?.(selectedSheep.id);
    } catch (error) {
      console.error("[AdminSheepModal] createPayment:", error);
      // ✅ error.message suffit — intercepteur axios normalise
      setPaymentError(error?.message || "Impossible d'ajouter le paiement.");
    } finally {
      setSavingPayment(false);
    }
  };

  const handleDeletePayment = async (paymentId) => {
    if (!window.confirm("Supprimer ce paiement ?")) return;
    setDeletingPaymentId(paymentId);
    setPaymentError("");
    try {
      await deletePayment(paymentId);
      await onPaymentsChanged?.(selectedSheep.id);
    } catch (error) {
      console.error("[AdminSheepModal] deletePayment:", error);
      setPaymentError(error?.message || "Impossible de supprimer le paiement.");
    } finally {
      setDeletingPaymentId(null);
    }
  };

  return (
    <div className="smodal-overlay" onClick={close} role="dialog" aria-modal="true">
      <div className="smodal" onClick={(e) => e.stopPropagation()}>

        {/* HEADER */}
        <div className="smodal-header">
          <h2 className="smodal-title">Mouton #{selectedSheep.number || "-"}</h2>
          <button type="button" onClick={close} className="btn-secondary">Fermer</button>
        </div>

        {/* BODY */}
        <div className="smodal-body">

          {/* Photo */}
          {selectedSheep.photo_url && (
            <img src={selectedSheep.photo_url}
              alt={`Mouton ${selectedSheep.number || "-"}`}
              className="smodal-photo" />
          )}

          {/* Détails */}
          <div className="smodal-details-grid">
            <DetailCard label="Numéro"          value={selectedSheep.number} />
            <DetailCard label="Poids"            value={formatWeight(selectedSheep.weight)} />
            <DetailCard label="Prix initial"     value={formatPrice(selectedSheep.price)} />
            <DetailCard label="Réduction"        value={formatMoney(selectedSheep.discount_amount)} />
            <DetailCard label="Prix final"       value={formatMoney(expectedAmount)} />
            <DetailCard label="Taille"           value={selectedSheep.size} />
            <DetailCard label="Couleur"          value={selectedSheep.color} />
            <DetailCard label="Statut"           value={<StatusBadge status={realStatus} />} />
            <DetailCard label="Statut paiement"  value={<StatusBadge status={paymentStatus} />} />
            <DetailCard label="Total payé"       value={formatMoney(paidAmount)} />
            <DetailCard label="Reste à payer"    value={formatMoney(remainingAmount)} />
            <DetailCard label="Ajouté le"        value={formatDateTime(selectedSheep.created_at)} />
            <DetailCard label="Attribué le"      value={formatDateTime(selectedSheep.assigned_at)} />
            <DetailCard label="Fidèle"
              value={selectedSheepAssignedProfile
                ? getProfileDisplayName(selectedSheepAssignedProfile)
                : "-"} />
            {selectedSheep.payment_due_date && (
              <DetailCard label="Échéance" value={formatDateTime(selectedSheep.payment_due_date)} />
            )}
            {selectedSheep.notes && (
              <DetailCard label="Notes mouton"   value={selectedSheep.notes}         full />
            )}
            {selectedSheep.payment_notes && (
              <DetailCard label="Notes paiement" value={selectedSheep.payment_notes} full />
            )}
          </div>

          {/* Ajouter un paiement */}
          <div>
            <h3 className="smodal-section-title" style={{ marginBottom: 12 }}>
              Ajouter un paiement
            </h3>

            {!selectedSheep.fidel_id ? (
              <div className="smodal-empty">
                Attribue d'abord ce mouton à un fidèle avant d'enregistrer un paiement.
              </div>
            ) : (
              <form onSubmit={handleCreatePayment} className="smodal-payment-form">
                <div className="smodal-payment-grid">
                  <label className="smodal-label">
                    Montant *
                    <input name="amount" type="number" step="0.01" min="0.01"
                      value={paymentForm.amount} onChange={handlePaymentChange}
                      placeholder="100" className="smodal-input" required />
                  </label>

                  <label className="smodal-label">
                    Type
                    <select name="payment_type" value={paymentForm.payment_type}
                      onChange={handlePaymentChange} className="smodal-input">
                      <option value="deposit">Acompte</option>
                      <option value="installment">Versement</option>
                      <option value="full">Paiement complet</option>
                    </select>
                  </label>

                  <label className="smodal-label">
                    Méthode
                    <select name="payment_method" value={paymentForm.payment_method}
                      onChange={handlePaymentChange} className="smodal-input">
                      <option value="cash">Espèces</option>
                      <option value="card">Carte</option>
                      <option value="transfer">Virement</option>
                      <option value="mobile_money">Mobile money</option>
                      <option value="other">Autre</option>
                    </select>
                  </label>

                  <label className="smodal-label">
                    Référence
                    <input name="reference" value={paymentForm.reference}
                      onChange={handlePaymentChange}
                      placeholder="Ex: reçu #123" className="smodal-input" />
                  </label>

                  <label className="smodal-label">
                    Note
                    <input name="notes" value={paymentForm.notes}
                      onChange={handlePaymentChange}
                      placeholder="Ex: acompte versé sur place" className="smodal-input" />
                  </label>
                </div>

                {paymentError && (
                  <div className="smodal-error">{paymentError}</div>
                )}

                <p className="smodal-payment-hint">
                  Si le montant correspond exactement au solde restant, le paiement sera enregistré comme paiement complet.
                </p>

                <div className="smodal-payment-submit">
                  <button type="submit" className="btn-primary" disabled={savingPayment}>
                    {savingPayment ? "Ajout..." : "Ajouter le paiement"}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Historique */}
          <div>
            <h3 className="smodal-section-title" style={{ marginBottom: 12 }}>
              Historique des paiements
            </h3>

            {paymentsLoading ? (
              <Loader small />
            ) : payments.length === 0 ? (
              <div className="smodal-empty">Aucun paiement enregistré.</div>
            ) : (
              <div className="smodal-payment-list">
                {payments.map((payment) => (
                  <div key={payment.id} className="smodal-payment-item">
                    <div className="smodal-payment-item-header">
                      <span className="smodal-payment-item-title">
                        {formatMoney(payment.amount)} • {payment.payment_type || "-"}
                      </span>
                      {/* ✅ Bouton danger distinct */}
                      <button type="button" className="btn-danger--sm"
                        onClick={() => handleDeletePayment(payment.id)}
                        disabled={deletingPaymentId === payment.id}>
                        {deletingPaymentId === payment.id ? "Suppression..." : "Supprimer"}
                      </button>
                    </div>
                    <div className="smodal-payment-item-text">
                      {formatDateTime(payment.payment_date)}
                      {payment.payment_method && ` • ${payment.payment_method}`}
                    </div>
                    {payment.reference && (
                      <div className="smodal-payment-item-text">Réf : {payment.reference}</div>
                    )}
                    {payment.notes && (
                      <div className="smodal-payment-item-text">Note : {payment.notes}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* FOOTER */}
        <div className="smodal-footer">
          <button type="button" onClick={() => onEdit(selectedSheep)} className="btn-primary">
            Modifier
          </button>
          {/* ✅ Bouton danger distinct */}
          <button type="button"
            onClick={() => onDelete(selectedSheep.id, selectedSheep.number)}
            className="btn-danger" disabled={isDeleting}>
            {isDeleting ? "Suppression..." : "Supprimer"}
          </button>
          <button type="button" onClick={close} className="btn-secondary">Fermer</button>
        </div>

      </div>
    </div>
  );
}