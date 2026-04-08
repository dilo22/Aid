export const SHEEP_STATUSES = [
  { value: "available", label: "Disponible" },
  { value: "assigned", label: "Assigné" },
  { value: "sacrificed", label: "Sacrifié" },
  { value: "missing", label: "Manquant" },
];

export const SHEEP_SIZES = [
  { value: "small", label: "Petit" },
  { value: "medium", label: "Moyen" },
  { value: "large", label: "Grand" },
];

export const PAYMENT_STATUSES = [
  { value: "unpaid", label: "Non payé" },
  { value: "partial", label: "Partiel" },
  { value: "paid", label: "Payé" },
  { value: "overpaid", label: "Surpayé" },
  { value: "cancelled", label: "Annulé" },
];

export const DEFAULT_SHEEP_FILTERS = {
  search: "",
  status: "",
  size: "",
  color: "",
  sortBy: "created_at",
  sortOrder: "desc",
  page: 1,
  limit: 20,
};