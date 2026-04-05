export const SHEEP_STATUSES = [
  { value: "available", label: "Disponible" },
  { value: "assigned", label: "Attribué" },
  { value: "sacrificed", label: "Sacrifié" },
  { value: "missing", label: "Manquant" },
];

export const SHEEP_SIZES = [
  { value: "small", label: "Petit" },
  { value: "medium", label: "Moyen" },
  { value: "large", label: "Grand" },
];

export const DEFAULT_SHEEP_FILTERS = {
  search: "",
  status: "",
  size: "",
  organizationId: "",
  sortBy: "created_at",
  sortOrder: "desc",
  page: 1,
  limit: 1000,
};