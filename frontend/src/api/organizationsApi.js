import api from "./client";

export const getOrganizations = async () => {
  const { data } = await api.get("/organizations");
  return data || [];
};

export const createOrganization = async (payload) => {
  const { data } = await api.post("/organizations", payload);
  return data;
};

// ✅ PUT → PATCH
export const updateOrganization = async (id, payload) => {
  const { data } = await api.patch(`/organizations/${id}`, payload);
  return data;
};

export const deleteOrganization = async (id) => {
  const { data } = await api.delete(`/organizations/${id}`);
  return data;
};