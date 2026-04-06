// ✅ Centralisé — évite la duplication entre FidelDashboard et FidelProfilePage

export const getDisplayName = (profile) => {
  const name = `${profile?.first_name || ""} ${profile?.last_name || ""}`.trim();
  return name || profile?.email || "cher fidèle";
};

// ✅ Statuts alignés avec le backend (pending, approved, rejected)
export const getStatusTheme = (status) => ({
  approved: { background: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe", label: "Approuvé" },
  pending:  { background: "#fff7ed", color: "#c2410c", border: "1px solid #fdba74", label: "En attente" },
  rejected: { background: "#fef2f2", color: "#dc2626", border: "1px solid #fca5a5", label: "Rejeté" },
}[status] ?? { background: "#f8fafc", color: "#475569", border: "1px solid #e2e8f0", label: status || "-" });

export const getSheepStatusTheme = (status) => ({
  available:  { background: "#ecfdf5", color: "#047857", border: "1px solid #a7f3d0", label: "Disponible" },
  assigned:   { background: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe", label: "Attribué"  },
  sacrificed: { background: "#fef3c7", color: "#b45309", border: "1px solid #fde68a", label: "Sacrifié"  },
  missing:    { background: "#fff1f2", color: "#be123c", border: "1px solid #fecdd3", label: "Manquant"  },
}[status] ?? { background: "#f8fafc", color: "#475569", border: "1px solid #e2e8f0", label: status || "-" });

export const getPaymentStatusTheme = (status) => ({
  paid:      { background: "#ecfdf5", color: "#047857", border: "1px solid #a7f3d0", label: "Payé"    },
  partial:   { background: "#fff7ed", color: "#c2410c", border: "1px solid #fdba74", label: "Partiel"  },
  overpaid:  { background: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe", label: "Surpayé"  },
  cancelled: { background: "#fff1f2", color: "#be123c", border: "1px solid #fecdd3", label: "Annulé"   },
  unpaid:    { background: "#f1f5f9", color: "#334155", border: "1px solid #cbd5e1", label: "Impayé"   },
}[status] ?? { background: "#f1f5f9", color: "#334155", border: "1px solid #cbd5e1", label: "Impayé" });

export const formatMoney = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return "-";
  return `${n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
};

export const formatDateTime = (value) =>
  value ? new Date(value).toLocaleString("fr-FR") : "-";

export const normalizeMoney = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

export const getOrganizationLabel = (profile) => {
  const name = profile?.organization?.name || "";
  const type = profile?.organization?.type || "";
  if (name && type) return `${name} (${type})`;
  return name || profile?.organization_id || "-";
};