const labels = {
  pending: "En attente",
  approved: "Validé",
  rejected: "Refusé",
  scheduled: "Planifié"
};

const StatusBadge = ({ status }) => {
  return (
    <span
      style={{
        padding: "4px 10px",
        borderRadius: 999,
        border: "1px solid #ccc",
        fontSize: 12
      }}
    >
      {labels[status] || status}
    </span>
  );
};

export default StatusBadge;