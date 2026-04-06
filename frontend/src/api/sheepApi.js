import api from "./client";

export const getSheepList = async (params = {}) => {
  const { data } = await api.get("/sheep", { params });
  return data;
};

export const createSheep = async (payload) => {
  const { data } = await api.post("/sheep", payload);
  return data;
};

// ✅ PUT → PATCH
export const updateSheep = async (id, payload) => {
  const { data } = await api.patch(`/sheep/${id}`, payload);
  return data;
};

export const deleteSheep = async (id) => {
  const { data } = await api.delete(`/sheep/${id}`);
  return data;
};