import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { getSheepList } from "../../api/sheepApi";
import { getPaymentsByProfileId } from "../../api/paymentsApi";
import Loader from "../../components/ui/Loader";

const styles = {
  page: {
    background: "#f8fafc",
    padding: 24,
    boxSizing: "border-box",
    minHeight: "100vh",
  },
  container: {
    maxWidth: 1400,
    margin: "0 auto",
    display: "grid",
    gap: 20,
  },
  heroCard: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 20,
    boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
    padding: 24,
    display: "grid",
    gap: 10,
  },
  heroTitle: {
    margin: 0,
    fontSize: 32,
    color: "#0f172a",
  },
  heroSubtitle: {
    margin: 0,
    color: "#64748b",
    fontSize: 16,
    lineHeight: 1.5,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(12, minmax(0, 1fr))",
    gap: 20,
  },
  card: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 18,
    boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
    overflow: "hidden",
  },
  cardSpan6: {
    gridColumn: "span 6",
  },
  cardSpan12: {
    gridColumn: "span 12",
  },
  cardHeader: {
    padding: 20,
    borderBottom: "1px solid #e2e8f0",
    display: "grid",
    gap: 6,
  },
  cardTitle: {
    margin: 0,
    fontSize: 22,
    color: "#0f172a",
  },
  cardSubtitle: {
    margin: 0,
    color: "#64748b",
    fontSize: 14,
  },
  cardBody: {
    padding: 20,
    display: "grid",
    gap: 16,
  },
  emptyState: {
    border: "1px dashed #cbd5e1",
    borderRadius: 16,
    padding: 20,
    background: "#f8fafc",
    color: "#475569",
    lineHeight: 1.6,
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 800,
    whiteSpace: "nowrap",
    width: "fit-content",
  },
  sheepList: {
    display: "grid",
    gap: 12,
  },
  sheepRow: {
    border: "1px solid #e2e8f0",
    borderRadius: 16,
    padding: 16,
    background: "#fff",
    display: "grid",
    gap: 14,
    cursor: "pointer",
  },
  sheepRowTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
    alignItems: "center",
    flexWrap: "wrap",
  },
  sheepRowLeft: {
    display: "flex",
    gap: 14,
    alignItems: "center",
  },
  sheepPhoto: {
    width: 72,
    height: 72,
    objectFit: "cover",
    borderRadius: 14,
    border: "1px solid #e2e8f0",
    flexShrink: 0,
  },
  sheepFallbackPhoto: {
    width: 72,
    height: 72,
    borderRadius: 14,
    border: "1px solid #e2e8f0",
    background: "#f8fafc",
    display: "grid",
    placeItems: "center",
    fontSize: 26,
    flexShrink: 0,
  },
  sheepMeta: {
    display: "grid",
    gap: 4,
  },
  sheepTitle: {
    margin: 0,
    fontSize: 18,
    fontWeight: 800,
    color: "#0f172a",
  },
  sheepSub: {
    margin: 0,
    color: "#64748b",
    fontSize: 14,
  },
  sheepSummaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: 12,
  },
  summaryBox: {
    border: "1px solid #e2e8f0",
    borderRadius: 14,
    padding: 12,
    background: "#f8fafc",
    display: "grid",
    gap: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: "#64748b",
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 800,
    color: "#0f172a",
  },
  paymentBarTrack: {
    width: "100%",
    height: 10,
    borderRadius: 999,
    background: "#e2e8f0",
    overflow: "hidden",
  },
  paymentBarFill: {
    height: "100%",
    borderRadius: 999,
    background: "#2563eb",
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15, 23, 42, 0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    zIndex: 1000,
  },
  modal: {
    width: "100%",
    maxWidth: 900,
    background: "#fff",
    borderRadius: 20,
    boxShadow: "0 20px 60px rgba(15, 23, 42, 0.2)",
    overflow: "hidden",
    maxHeight: "90vh",
    overflowY: "auto",
  },
  modalHeader: {
    padding: "20px 24px",
    borderBottom: "1px solid #e2e8f0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  modalTitle: {
    margin: 0,
    fontSize: 22,
    color: "#0f172a",
  },
  modalBody: {
    padding: 24,
    display: "grid",
    gap: 18,
  },
  detailsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 12,
  },
  detailCard: {
    border: "1px solid #e2e8f0",
    borderRadius: 14,
    padding: 14,
    background: "#f8fafc",
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: 700,
    color: "#64748b",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  detailValue: {
    color: "#0f172a",
    fontWeight: 600,
    wordBreak: "break-word",
  },
  detailBlock: {
    gridColumn: "1 / -1",
  },
  paymentsList: {
    display: "grid",
    gap: 10,
  },
  paymentItem: {
    border: "1px solid #e2e8f0",
    borderRadius: 14,
    padding: 14,
    background: "#fff",
    display: "grid",
    gap: 6,
  },
  paymentTitle: {
    fontWeight: 800,
    color: "#0f172a",
  },
  paymentText: {
    fontSize: 14,
    color: "#475569",
  },
  modalFooter: {
    padding: "18px 24px",
    borderTop: "1px solid #e2e8f0",
    display: "flex",
    justifyContent: "flex-end",
    gap: 12,
  },
  secondaryButton: {
    border: "1px solid #cbd5e1",
    borderRadius: 12,
    padding: "12px 18px",
    background: "#fff",
    color: "#0f172a",
    fontWeight: 700,
    cursor: "pointer",
  },
};

const getStatusTheme = (status) => {
  switch (status) {
    case "approved":
      return {
        background: "#eff6ff",
        color: "#1d4ed8",
        border: "1px solid #bfdbfe",
        label: "Approuvé",
      };
    case "pending":
      return {
        background: "#fff7ed",
        color: "#c2410c",
        border: "1px solid #fdba74",
        label: "En attente",
      };
    case "inactive":
      return {
        background: "#f1f5f9",
        color: "#334155",
        border: "1px solid #cbd5e1",
        label: "Inactif",
      };
    case "blocked":
      return {
        background: "#fff1f2",
        color: "#be123c",
        border: "1px solid #fecdd3",
        label: "Bloqué",
      };
    default:
      return {
        background: "#f8fafc",
        color: "#475569",
        border: "1px solid #e2e8f0",
        label: status || "-",
      };
  }
};

const getSheepStatusTheme = (status) => {
  switch (status) {
    case "available":
      return {
        background: "#ecfdf5",
        color: "#047857",
        border: "1px solid #a7f3d0",
        label: "Disponible",
      };
    case "assigned":
      return {
        background: "#eff6ff",
        color: "#1d4ed8",
        border: "1px solid #bfdbfe",
        label: "Attribué",
      };
    case "sacrificed":
      return {
        background: "#fef3c7",
        color: "#b45309",
        border: "1px solid #fde68a",
        label: "Sacrifié",
      };
    case "missing":
      return {
        background: "#fff1f2",
        color: "#be123c",
        border: "1px solid #fecdd3",
        label: "Manquant",
      };
    default:
      return {
        background: "#f8fafc",
        color: "#475569",
        border: "1px solid #e2e8f0",
        label: status || "-",
      };
  }
};

const getPaymentStatusTheme = (status) => {
  switch (status) {
    case "paid":
      return {
        background: "#ecfdf5",
        color: "#047857",
        border: "1px solid #a7f3d0",
        label: "Payé",
      };
    case "partial":
      return {
        background: "#fff7ed",
        color: "#c2410c",
        border: "1px solid #fdba74",
        label: "Partiel",
      };
    case "overpaid":
      return {
        background: "#eff6ff",
        color: "#1d4ed8",
        border: "1px solid #bfdbfe",
        label: "Surpayé",
      };
    case "cancelled":
      return {
        background: "#fff1f2",
        color: "#be123c",
        border: "1px solid #fecdd3",
        label: "Annulé",
      };
    case "unpaid":
    default:
      return {
        background: "#f1f5f9",
        color: "#334155",
        border: "1px solid #cbd5e1",
        label: "Impayé",
      };
  }
};

const getDisplayName = (profile) => {
  const firstName = profile?.first_name?.trim() || "";
  const lastName = profile?.last_name?.trim() || "";
  const rebuilt = `${firstName} ${lastName}`.trim();

  if (rebuilt) return rebuilt;
  if (profile?.email) return profile.email;

  return "cher fidèle";
};

const formatMoney = (value) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return "-";
  return `${number.toLocaleString("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} €`;
};

const formatDateTime = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleString("fr-FR");
};

const normalizeMoney = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

export default function FidelDashboard() {
  const { profile } = useAuth();

  const [sheep, setSheep] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSheep, setSelectedSheep] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        const [sheepData, paymentsData] = await Promise.all([
          getSheepList({ page: 1, limit: 1000 }),
          profile?.id ? getPaymentsByProfileId(profile.id) : Promise.resolve({ items: [] }),
        ]);

        const normalizedSheep = Array.isArray(sheepData)
          ? sheepData
          : Array.isArray(sheepData?.items)
          ? sheepData.items
          : Array.isArray(sheepData?.data)
          ? sheepData.data
          : Array.isArray(sheepData?.results)
          ? sheepData.results
          : Array.isArray(sheepData?.rows)
          ? sheepData.rows
          : [];

        setSheep(normalizedSheep);
        setPayments(Array.isArray(paymentsData?.items) ? paymentsData.items : []);
      } catch (error) {
        console.error("Erreur chargement dashboard fidèle :", error);
        setSheep([]);
        setPayments([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [profile?.id]);

  const statusTheme = useMemo(
    () => getStatusTheme(profile?.status),
    [profile?.status]
  );

  const assignedSheepList = useMemo(() => {
    const profileId = String(profile?.id || "").trim();
    if (!profileId) return [];

    return sheep.filter(
      (item) => String(item?.fidel_id || "").trim() === profileId
    );
  }, [sheep, profile?.id]);

  const sheepWithPaymentSummary = useMemo(() => {
    return assignedSheepList.map((item) => {
      const sheepPayments = payments
        .filter((payment) => String(payment?.sheep_id || "") === String(item?.id || ""))
        .sort(
          (a, b) =>
            new Date(b.payment_date || 0).getTime() -
            new Date(a.payment_date || 0).getTime()
        );

      const expectedAmount =
        item?.final_price !== null && item?.final_price !== undefined
          ? normalizeMoney(item.final_price)
          : Math.max(
              normalizeMoney(item.price) - normalizeMoney(item.discount_amount),
              0
            );

      const paidAmount = sheepPayments.reduce(
        (sum, payment) => sum + normalizeMoney(payment.amount),
        0
      );

      const remainingAmount = Math.max(expectedAmount - paidAmount, 0);
      const paymentProgress =
        expectedAmount > 0
          ? Math.min((paidAmount / expectedAmount) * 100, 100)
          : 0;

      return {
        ...item,
        sheepPayments,
        expectedAmount,
        paidAmount,
        remainingAmount,
        paymentProgress,
      };
    });
  }, [assignedSheepList, payments]);

  const selectedSheepDetails = useMemo(() => {
    if (!selectedSheep) return null;

    return (
      sheepWithPaymentSummary.find(
        (item) => String(item.id) === String(selectedSheep.id)
      ) || null
    );
  }, [selectedSheep, sheepWithPaymentSummary]);

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.heroCard}>
          <h1 style={styles.heroTitle}>Bonjour {getDisplayName(profile)}</h1>
          <p style={styles.heroSubtitle}>
            Retrouvez ici vos rendez-vous, vos moutons attribués et le suivi de votre dossier.
          </p>
          <span
            style={{
              ...styles.badge,
              background: statusTheme.background,
              color: statusTheme.color,
              border: statusTheme.border,
            }}
          >
            Statut du profil : {statusTheme.label}
          </span>
        </div>

        <div style={styles.grid}>
          <div style={{ ...styles.card, ...styles.cardSpan6 }}>
            <div style={styles.cardHeader}>
              <h2 style={styles.cardTitle}>Rendez-vous à venir</h2>
              <p style={styles.cardSubtitle}>
                L’admin pourra vous attribuer vos créneaux ici.
              </p>
            </div>

            <div style={styles.cardBody}>
              <div style={styles.emptyState}>
                Aucun rendez-vous planifié pour le moment.
              </div>
            </div>
          </div>

          <div style={{ ...styles.card, ...styles.cardSpan6 }}>
            <div style={styles.cardHeader}>
              <h2 style={styles.cardTitle}>Mes moutons</h2>
              <p style={styles.cardSubtitle}>
                Cliquez sur un mouton pour voir ses détails et son suivi de paiement.
              </p>
            </div>

            <div style={styles.cardBody}>
              {loading ? (
                <Loader small={true} />
              ) : sheepWithPaymentSummary.length === 0 ? (
                <div style={styles.emptyState}>
                  Aucun mouton attribué pour le moment.
                  <br />
                  Dès qu’un admin vous affectera un mouton, vous verrez ici sa référence,
                  ses caractéristiques et son état de paiement.
                </div>
              ) : (
                <div style={styles.sheepList}>
                  {sheepWithPaymentSummary.map((item) => {
                    const sheepStatusTheme = getSheepStatusTheme(item.status);
                    const paymentStatusTheme = getPaymentStatusTheme(item.payment_status);

                    return (
                      <div
                        key={item.id}
                        style={styles.sheepRow}
                        onClick={() => setSelectedSheep(item)}
                      >
                        <div style={styles.sheepRowTop}>
                          <div style={styles.sheepRowLeft}>
                            {item.photo_url ? (
                              <img
                                src={item.photo_url}
                                alt={`Mouton ${item.number}`}
                                style={styles.sheepPhoto}
                              />
                            ) : (
                              <div style={styles.sheepFallbackPhoto}>🐏</div>
                            )}

                            <div style={styles.sheepMeta}>
                              <h3 style={styles.sheepTitle}>
                                Mouton #{item.number || "-"}
                              </h3>
                              <p style={styles.sheepSub}>
                                Taille : {item.size || "-"} • Couleur : {item.color || "-"}
                              </p>
                              <p style={styles.sheepSub}>
                                Poids : {item.weight ? `${item.weight} kg` : "-"}
                              </p>
                            </div>
                          </div>

                          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                            <span
                              style={{
                                ...styles.badge,
                                background: sheepStatusTheme.background,
                                color: sheepStatusTheme.color,
                                border: sheepStatusTheme.border,
                              }}
                            >
                              {sheepStatusTheme.label}
                            </span>

                            <span
                              style={{
                                ...styles.badge,
                                background: paymentStatusTheme.background,
                                color: paymentStatusTheme.color,
                                border: paymentStatusTheme.border,
                              }}
                            >
                              Paiement : {paymentStatusTheme.label}
                            </span>
                          </div>
                        </div>

                        <div style={styles.sheepSummaryGrid}>
                          <div style={styles.summaryBox}>
                            <div style={styles.summaryLabel}>Prix final</div>
                            <div style={styles.summaryValue}>
                              {formatMoney(item.expectedAmount)}
                            </div>
                          </div>

                          <div style={styles.summaryBox}>
                            <div style={styles.summaryLabel}>Déjà payé</div>
                            <div style={styles.summaryValue}>
                              {formatMoney(item.paidAmount)}
                            </div>
                          </div>

                          <div style={styles.summaryBox}>
                            <div style={styles.summaryLabel}>Reste à payer</div>
                            <div style={styles.summaryValue}>
                              {formatMoney(item.remainingAmount)}
                            </div>
                          </div>

                          <div style={styles.summaryBox}>
                            <div style={styles.summaryLabel}>Nb paiements</div>
                            <div style={styles.summaryValue}>
                              {item.sheepPayments.length}
                            </div>
                          </div>
                        </div>

                        <div style={styles.paymentBarTrack}>
                          <div
                            style={{
                              ...styles.paymentBarFill,
                              width: `${item.paymentProgress}%`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div style={{ ...styles.card, ...styles.cardSpan12 }}>
            <div style={styles.cardHeader}>
              <h2 style={styles.cardTitle}>Informations importantes</h2>
              <p style={styles.cardSubtitle}>
                Suivi simple en attendant la mise en place complète des rendez-vous.
              </p>
            </div>

            <div style={styles.cardBody}>
              <div style={styles.emptyState}>
                Votre profil, vos moutons attribués et vos paiements sont mis à jour par l’administration.
              </div>
            </div>
          </div>
        </div>
      </div>

      {selectedSheepDetails && (
        <div
          style={styles.modalOverlay}
          onClick={() => setSelectedSheep(null)}
        >
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                Détail du mouton #{selectedSheepDetails.number || "-"}
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
              {selectedSheepDetails.photo_url && (
                <img
                  src={selectedSheepDetails.photo_url}
                  alt={`Mouton ${selectedSheepDetails.number}`}
                  style={{
                    width: "100%",
                    maxHeight: 320,
                    objectFit: "cover",
                    borderRadius: 16,
                    border: "1px solid #e2e8f0",
                  }}
                />
              )}

              <div style={styles.detailsGrid}>
                <DetailCard label="Référence" value={`Mouton #${selectedSheepDetails.number || "-"}`} />
                <DetailCard label="Statut du mouton" value={getSheepStatusTheme(selectedSheepDetails.status).label} />
                <DetailCard label="Poids" value={selectedSheepDetails.weight ? `${selectedSheepDetails.weight} kg` : "-"} />
                <DetailCard label="Taille" value={selectedSheepDetails.size || "-"} />
                <DetailCard label="Couleur" value={selectedSheepDetails.color || "-"} />
                <DetailCard label="Attribué le" value={formatDateTime(selectedSheepDetails.assigned_at)} />
                <DetailCard label="Prix initial" value={formatMoney(selectedSheepDetails.price)} />
                <DetailCard label="Réduction" value={formatMoney(selectedSheepDetails.discount_amount)} />
                <DetailCard label="Prix final" value={formatMoney(selectedSheepDetails.expectedAmount)} />
                <DetailCard label="Statut paiement" value={getPaymentStatusTheme(selectedSheepDetails.payment_status).label} />
                <DetailCard label="Payé" value={formatMoney(selectedSheepDetails.paidAmount)} />
                <DetailCard label="Reste à payer" value={formatMoney(selectedSheepDetails.remainingAmount)} />

                {selectedSheepDetails.payment_due_date && (
                  <DetailCard
                    label="Échéance"
                    value={formatDateTime(selectedSheepDetails.payment_due_date)}
                  />
                )}

                {selectedSheepDetails.notes && (
                  <div style={{ ...styles.detailCard, ...styles.detailBlock }}>
                    <div style={styles.detailLabel}>Notes sur le mouton</div>
                    <div style={styles.detailValue}>{selectedSheepDetails.notes}</div>
                  </div>
                )}

                {selectedSheepDetails.payment_notes && (
                  <div style={{ ...styles.detailCard, ...styles.detailBlock }}>
                    <div style={styles.detailLabel}>Notes de paiement</div>
                    <div style={styles.detailValue}>{selectedSheepDetails.payment_notes}</div>
                  </div>
                )}
              </div>

              <div>
                <h3 style={{ margin: "0 0 12px 0", color: "#0f172a" }}>
                  Historique des paiements
                </h3>

                {selectedSheepDetails.sheepPayments.length === 0 ? (
                  <div style={styles.emptyState}>
                    Aucun paiement enregistré pour ce mouton.
                  </div>
                ) : (
                  <div style={styles.paymentsList}>
                    {selectedSheepDetails.sheepPayments.map((payment) => (
                      <div key={payment.id} style={styles.paymentItem}>
                        <div style={styles.paymentTitle}>
                          {formatMoney(payment.amount)} • {payment.payment_type || "-"}
                        </div>
                        <div style={styles.paymentText}>
                          Date : {formatDateTime(payment.payment_date)}
                        </div>
                        {payment.payment_method && (
                          <div style={styles.paymentText}>
                            Méthode : {payment.payment_method}
                          </div>
                        )}
                        {payment.reference && (
                          <div style={styles.paymentText}>
                            Référence : {payment.reference}
                          </div>
                        )}
                        {payment.notes && (
                          <div style={styles.paymentText}>
                            Note : {payment.notes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div style={styles.modalFooter}>
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
      )}
    </div>
  );
}

function DetailCard({ label, value }) {
  return (
    <div style={styles.detailCard}>
      <div style={styles.detailLabel}>{label}</div>
      <div style={styles.detailValue}>{value}</div>
    </div>
  );
}