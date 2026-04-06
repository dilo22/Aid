// ✅ Fonctions utilitaires moutons — source unique de vérité
// Remplace les définitions dupliquées dans AdminSheepPage et fidelHelpers

export const formatPrice = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return "-";
  return new Intl.NumberFormat("fr-FR", {
    style:    "currency",
    currency: "EUR",
  }).format(n);
};

export const formatWeight = (value) => {
  if (value === null || value === undefined || value === "") return "-";
  return `${value} kg`;
};

export const formatMoney = formatPrice;

export const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString("fr-FR") : "-";

export const formatDateTime = (value) =>
  value ? new Date(value).toLocaleString("fr-FR") : "-";

export const normalizeMoney = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

export const getExpectedAmount = (sheep) => {
  if (!sheep) return 0;
  if (sheep.final_price != null && sheep.final_price !== "") {
    return Math.max(normalizeMoney(sheep.final_price), 0);
  }
  return Math.max(
    normalizeMoney(sheep.price) - normalizeMoney(sheep.discount_amount),
    0
  );
};

// ✅ Formulaire vide complet — aligné avec le backend
export const getInitialSheepForm = () => ({
  number:           "",
  photo_url:        "",
  weight:           "",
  price:            "",
  discount_amount:  "",
  final_price:      "",
  size:             "",
  color:            "",
  status:           "available",
  payment_due_date: "",
  payment_notes:    "",
  notes:            "",
});