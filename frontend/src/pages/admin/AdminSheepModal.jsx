import { useEffect, useState } from "react";
import Loader from "../../components/ui/Loader";
import { createPayment, deletePayment } from "../../api/paymentsApi";

const emptyPaymentForm = {
  amount: "",
  payment_type: "installment",
  payment_method: "cash",
  reference: "",
  notes: "",
};

const normalizeMoney = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export default function AdminSheepModal({
  styles,
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
  const [paymentForm, setPaymentForm] = useState(emptyPaymentForm);
  const [savingPayment, setSavingPayment] = useState(false);
  const [deletingPaymentId, setDeletingPaymentId] = useState(null);
  const [paymentError, setPaymentError] = useState("");

  useEffect(() => {
    setPaymentForm(emptyPaymentForm);
    setPaymentError("");
  }, [selectedSheep?.id]);

  if (!selectedSheep) return null;

  const sheepStatusTheme = getStatusTheme(getRealSheepStatus(selectedSheep));
  const paymentStatusTheme = getPaymentStatusTheme(
    paymentsSummary?.paymentStatus || selectedSheep.payment_status || "unpaid"
  );

  const handlePaymentChange = (e) => {
    const { name, value } = e.target;
    setPaymentForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreatePayment = async (e) => {
    e.preventDefault();

    if (!selectedSheep?.id) return;

    if (!selectedSheep?.fidel_id) {
      setPaymentError(
        "Impossible d'ajouter un paiement à un mouton non attribué."
      );
      return;
    }

    const parsedAmount = Number(String(paymentForm.amount).replace(",", "."));

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setPaymentError("Le montant du paiement est invalide.");
      return;
    }

    const currentRemaining = Math.max(normalizeMoney(remainingAmount), 0);

    if (currentRemaining <= 0) {
      setPaymentError("Ce mouton est déjà totalement payé.");
      return;
    }

    let computedPaymentType = paymentForm.payment_type;

    // Si le montant correspond exactement au reste à payer,
    // on force automatiquement le type "full".
    if (Math.abs(parsedAmount - currentRemaining) < 0.0001) {
      computedPaymentType = "full";
    }

    try {
      setSavingPayment(true);
      setPaymentError("");

      await createPayment({
        sheep_id: selectedSheep.id,
        profile_id: selectedSheep.fidel_id,
        amount: parsedAmount,
        payment_type: computedPaymentType,
        payment_method: paymentForm.payment_method || null,
        reference: paymentForm.reference || null,
        notes: paymentForm.notes || null,
      });

      setPaymentForm(emptyPaymentForm);

      if (onPaymentsChanged) {
        await onPaymentsChanged(selectedSheep.id);
      }
    } catch (error) {
      console.error("Erreur création paiement :", error);
      setPaymentError(
        error?.response?.data?.message ||
          error?.message ||
          "Impossible d'ajouter le paiement."
      );
    } finally {
      setSavingPayment(false);
    }
  };

  const handleDeletePayment = async (paymentId) => {
    const confirmed = window.confirm("Supprimer ce paiement ?");
    if (!confirmed) return;

    try {
      setDeletingPaymentId(paymentId);
      setPaymentError("");

      await deletePayment(paymentId);

      if (onPaymentsChanged) {
        await onPaymentsChanged(selectedSheep.id);
      }
    } catch (error) {
      console.error("Erreur suppression paiement :", error);
      setPaymentError(
        error?.response?.data?.message ||
          error?.message ||
          "Impossible de supprimer le paiement."
      );
    } finally {
      setDeletingPaymentId(null);
    }
  };

  return (
    <div style={styles.modalOverlay} onClick={() => setSelectedSheep(null)}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <h2 style={styles.modalTitle}>
            Détail du mouton #{selectedSheep.number || "-"}
          </h2>
          <button
            type="button"
            onClick={() => setSelectedSheep(null)}
            style={styles.secondaryButton}
          >
            Fermer
          </button>
        </div>

        <div style={styles.modalBody}>
          {selectedSheep.photo_url && (
            <img
              src={selectedSheep.photo_url}
              alt={`Mouton ${selectedSheep.number || "-"}`}
              style={styles.photoPreview}
            />
          )}

          <div style={styles.detailsGrid}>
            <DetailCard styles={styles} label="Numéro" value={selectedSheep.number || "-"} />
            <DetailCard styles={styles} label="ID" value={selectedSheep.id || "-"} />
            <DetailCard styles={styles} label="Poids" value={formatWeight(selectedSheep.weight)} />
            <DetailCard styles={styles} label="Prix initial" value={formatPrice(selectedSheep.price)} />
            <DetailCard styles={styles} label="Réduction" value={formatMoney(selectedSheep.discount_amount)} />
            <DetailCard styles={styles} label="Prix final" value={formatMoney(expectedAmount)} />
            <DetailCard styles={styles} label="Taille" value={selectedSheep.size || "-"} />
            <DetailCard styles={styles} label="Couleur" value={selectedSheep.color || "-"} />
            <DetailCard styles={styles} label="Statut du mouton" value={sheepStatusTheme.label} />
            <DetailCard styles={styles} label="Statut paiement" value={paymentStatusTheme.label} />
            <DetailCard styles={styles} label="Ajouté le" value={formatDateTime(selectedSheep.created_at)} />
            <DetailCard styles={styles} label="Attribué le" value={formatDateTime(selectedSheep.assigned_at)} />
            <DetailCard
              styles={styles}
              label="Fidèle attribué"
              value={
                selectedSheepAssignedProfile
                  ? getProfileDisplayName(selectedSheepAssignedProfile)
                  : "-"
              }
            />
            <DetailCard styles={styles} label="ID du fidèle" value={selectedSheep.fidel_id || "-"} />
            <DetailCard styles={styles} label="Total payé" value={formatMoney(paidAmount)} />
            <DetailCard styles={styles} label="Reste à payer" value={formatMoney(remainingAmount)} />

            {selectedSheep.payment_due_date && (
              <DetailCard
                styles={styles}
                label="Échéance paiement"
                value={formatDateTime(selectedSheep.payment_due_date)}
              />
            )}

            {selectedSheep.notes && (
              <div style={{ ...styles.detailCard, ...styles.detailBlock }}>
                <div style={styles.detailLabel}>Notes mouton</div>
                <div style={styles.detailValue}>{selectedSheep.notes}</div>
              </div>
            )}

            {selectedSheep.payment_notes && (
              <div style={{ ...styles.detailCard, ...styles.detailBlock }}>
                <div style={styles.detailLabel}>Notes paiement</div>
                <div style={styles.detailValue}>{selectedSheep.payment_notes}</div>
              </div>
            )}
          </div>

          <div style={styles.paymentsSection}>
            <h3 style={{ margin: 0, color: "#0f172a" }}>
              Ajouter un paiement
            </h3>

            {!selectedSheep.fidel_id ? (
              <div style={styles.empty}>
                Attribue d'abord ce mouton à un fidèle avant d'enregistrer un paiement.
              </div>
            ) : (
              <form
                onSubmit={handleCreatePayment}
                style={{
                  display: "grid",
                  gap: 12,
                  border: "1px solid #e2e8f0",
                  borderRadius: 16,
                  padding: 16,
                  background: "#f8fafc",
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                    gap: 12,
                  }}
                >
                  <label style={styles.label}>
                    Montant
                    <input
                      name="amount"
                      type="number"
                      step="0.01"
                      value={paymentForm.amount}
                      onChange={handlePaymentChange}
                      placeholder="100"
                      style={styles.input}
                      required
                    />
                  </label>

                  <label style={styles.label}>
                    Type
                    <select
                      name="payment_type"
                      value={paymentForm.payment_type}
                      onChange={handlePaymentChange}
                      style={styles.input}
                    >
                      <option value="deposit">Acompte</option>
                      <option value="installment">Versement</option>
                      <option value="full">Paiement complet</option>
                    </select>
                  </label>

                  <label style={styles.label}>
                    Méthode
                    <select
                      name="payment_method"
                      value={paymentForm.payment_method}
                      onChange={handlePaymentChange}
                      style={styles.input}
                    >
                      <option value="cash">Espèces</option>
                      <option value="card">Carte</option>
                      <option value="transfer">Virement</option>
                      <option value="mobile_money">Mobile money</option>
                      <option value="other">Autre</option>
                    </select>
                  </label>

                  <label style={styles.label}>
                    Référence
                    <input
                      name="reference"
                      value={paymentForm.reference}
                      onChange={handlePaymentChange}
                      placeholder="Ex: reçu #123 ou virement banque"
                      style={styles.input}
                    />
                  </label>

                  <label style={styles.label}>
                    Note
                    <input
                      name="notes"
                      value={paymentForm.notes}
                      onChange={handlePaymentChange}
                      placeholder="Ex: acompte versé sur place"
                      style={styles.input}
                    />
                  </label>
                </div>

                {paymentError ? (
                  <div
                    style={{
                      padding: 12,
                      borderRadius: 12,
                      background: "#fff1f2",
                      border: "1px solid #fecdd3",
                      color: "#9f1239",
                      fontWeight: 600,
                    }}
                  >
                    {paymentError}
                  </div>
                ) : null}

                <div
                  style={{
                    color: "#64748b",
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                >
                  Si le montant saisi correspond exactement au solde restant,
                  le paiement sera automatiquement enregistré comme paiement complet.
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button
                    type="submit"
                    style={styles.primaryButton}
                    disabled={savingPayment}
                  >
                    {savingPayment ? "Ajout..." : "Ajouter le paiement"}
                  </button>
                </div>
              </form>
            )}
          </div>

          <div style={styles.paymentsSection}>
            <h3 style={{ margin: 0, color: "#0f172a" }}>
              Historique des paiements
            </h3>

            {paymentsLoading ? (
              <Loader small={true} />
            ) : payments.length === 0 ? (
              <div style={styles.empty}>Aucun paiement enregistré.</div>
            ) : (
              payments.map((payment) => (
                <div key={payment.id} style={styles.paymentItem}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 12,
                      alignItems: "center",
                      flexWrap: "wrap",
                    }}
                  >
                    <div style={styles.paymentItemTitle}>
                      {formatMoney(payment.amount)} • {payment.payment_type || "-"}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeletePayment(payment.id)}
                      style={styles.secondaryButton}
                      disabled={deletingPaymentId === payment.id}
                    >
                      {deletingPaymentId === payment.id
                        ? "Suppression..."
                        : "Supprimer"}
                    </button>
                  </div>

                  <div style={styles.paymentItemText}>
                    Date : {formatDateTime(payment.payment_date)}
                  </div>

                  {payment.payment_method && (
                    <div style={styles.paymentItemText}>
                      Méthode : {payment.payment_method}
                    </div>
                  )}

                  {payment.reference && (
                    <div style={styles.paymentItemText}>
                      Référence : {payment.reference}
                    </div>
                  )}

                  {payment.notes && (
                    <div style={styles.paymentItemText}>
                      Note : {payment.notes}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div style={styles.modalFooter}>
          <button
            type="button"
            onClick={() => {
              onEdit(selectedSheep);
            }}
            style={styles.primaryButton}
          >
            Modifier
          </button>

          <button
            type="button"
            onClick={() => onDelete(selectedSheep.id, selectedSheep.number)}
            style={styles.secondaryButton}
            disabled={deletingId === selectedSheep.id}
          >
            {deletingId === selectedSheep.id ? "Suppression..." : "Supprimer"}
          </button>

          <button
            type="button"
            onClick={() => setSelectedSheep(null)}
            style={styles.secondaryButton}
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailCard({ styles, label, value }) {
  return (
    <div style={styles.detailCard}>
      <div style={styles.detailLabel}>{label}</div>
      <div style={styles.detailValue}>{value}</div>
    </div>
  );
}