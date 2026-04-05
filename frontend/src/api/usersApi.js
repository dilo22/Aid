import api from "./client";

export const getPendingUsers = async () => {
  const { data } = await api.get("/profiles/pending");
  return data;
};

export const approveUser = async (userId) => {
  const { data } = await api.patch(`/profiles/${userId}/approve`);
  return data;
};

export const getApprovedUsers = async () => {
  const { data } = await api.get("/profiles/approved");
  return data;
};

export const assignSheep = async (userId, sheepId) => {
  const { data } = await api.post(`/profiles/${userId}/assign-sheep`, {
    sheepId,
  });
  return data;
};