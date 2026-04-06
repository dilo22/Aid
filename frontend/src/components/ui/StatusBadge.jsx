import "../styles/StatusBadge.css";

const LABELS = {
  // Profils
  pending:   "En attente",
  approved:  "Validé",
  rejected:  "Refusé",
  scheduled: "Planifié",
  // Moutons
  available:  "Disponible",
  assigned:   "Assigné",
  sacrificed: "Sacrifié",
  missing:    "Manquant",
  // Paiements
  unpaid:    "Non payé",
  partial:   "Partiel",
  paid:      "Payé",
  overpaid:  "Surpayé",
  cancelled: "Annulé",
};

const StatusBadge = ({ status }) => {
  const knownStatuses = Object.keys(LABELS);
  const modifier = knownStatuses.includes(status) ? status : "unknown";

  return (
    <span className={`badge badge--${modifier}`}>
      {LABELS[status] || status}
    </span>
  );
};

export default StatusBadge;