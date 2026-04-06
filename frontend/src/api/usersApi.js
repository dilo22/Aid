import api from "./client";

// ✅ Réutilise profilesApi pour éviter la duplication
export { getPendingProfiles as getPendingUsers, getApprovedProfiles as getApprovedUsers } from "./profilesApi";

export const approveUser = async (userId) => {
  const { data } = await api.patch(`/profiles/${userId}/approve`);
  return data;
};

// ✅ Ajout manquant
export const rejectUser = async (userId) => {
  const { data } = await api.patch(`/profiles/${userId}/reject`);
  return data;
};

export const assignSheep = async (userId, sheepId) => {
  const { data } = await api.post(`/profiles/${userId}/assign-sheep`, { sheepId });
  return data;
};