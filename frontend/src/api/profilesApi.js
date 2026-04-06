import api from "./client";

const normalizeArrayResponse = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  return [];
};

export const getPendingProfiles = async () => {
  const { data } = await api.get("/profiles/pending");
  return normalizeArrayResponse(data);
};

export const getApprovedProfiles = async () => {
  const { data } = await api.get("/profiles/approved");
  return normalizeArrayResponse(data);
};

// ✅ Filtrage côté serveur — un seul appel selon le statut
export const getProfiles = async (filters = {}) => {
  const { status = "all", role, organization_id } = filters;

  if (status === "pending")  return getPendingProfiles();
  if (status === "approved") return getApprovedProfiles();

  // ✅ Pour "all" : un seul appel parallèle, mais on laisse le serveur filtrer si possible
  const [pending, approved] = await Promise.all([
    getPendingProfiles(),
    getApprovedProfiles(),
  ]);

  let profiles = [...pending, ...approved]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  // Filtres locaux uniquement si nécessaire
  if (role && role !== "all") {
    profiles = profiles.filter((p) => p.role === role);
  }
  if (organization_id && organization_id !== "all") {
    profiles = profiles.filter((p) => p.organization_id === organization_id);
  }

  return profiles;
};

export const registerFidel = async (payload) => {
  const { data } = await api.post("/profiles/create-fidel", {
    first_name:      payload.first_name,
    last_name:       payload.last_name,
    email:           payload.email,
    phone:           payload.phone,
    organization_id: payload.organization_id || null,
  });
  return data;
};

export const approveProfile = async (id) => {
  const { data } = await api.patch(`/profiles/${id}/approve`);
  return data;
};

// ✅ Ajout rejectProfile manquant
export const rejectProfile = async (id) => {
  const { data } = await api.patch(`/profiles/${id}/reject`);
  return data;
};

export const getOrganizationFidels = async (params = {}) => {
  const searchParams = new URLSearchParams();
  if (params.search) searchParams.set("search", params.search);
  if (params.status && params.status !== "all") searchParams.set("status", params.status);

  const query = searchParams.toString();
  const { data } = await api.get(`/organizations/me/fidels${query ? `?${query}` : ""}`);
  return data;
};

export const createOrganizationFidel = async (payload) => {
  const { data } = await api.post("/organizations/me/fidels", {
    first_name: payload.first_name,
    last_name:  payload.last_name,
    email:      payload.email,
    phone:      payload.phone,
  });
  return data;
};

export const updateOrganizationFidel = async (id, payload) => {
  const { data } = await api.patch(`/organizations/me/fidels/${id}`, {
    first_name: payload.first_name,
    last_name:  payload.last_name,
    email:      payload.email,
    phone:      payload.phone,
    status:     payload.status,
  });
  return data;
};

export const deleteOrganizationFidel = async (id) => {
  const { data } = await api.delete(`/organizations/me/fidels/${id}`);
  return data;
};

// ✅ Fonctions désactivées — erreurs explicites
export const createProfile = async () => {
  throw new Error("Utilise registerFidel ou createOrganizationFidel.");
};
export const updateProfile = async () => {
  throw new Error("updateProfile non disponible.");
};
export const deleteProfile = async () => {
  throw new Error("deleteProfile non disponible.");
};