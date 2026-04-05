import api from "./client";

export const getOrganizations = async () => {
  const { data } = await api.get("/organizations");
  return data || [];
};

export const createOrganization = async (payload) => {
  const { data } = await api.post("/organizations", payload);
  return data;
};

export const updateOrganization = async (id, payload) => {
  const { data } = await api.put(`/organizations/${id}`, payload);
  return data;
};

export const deleteOrganization = async (id) => {
  const response = await api.delete(`/organizations/${id}`);
  return response.data;
};