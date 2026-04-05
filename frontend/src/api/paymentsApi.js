import client from "./client";

export const getPaymentsBySheepId = async (sheepId) => {
  const { data } = await client.get(`/payments/sheep/${sheepId}`);
  return data;
};

export const getPaymentsByProfileId = async (profileId) => {
  const { data } = await client.get(`/payments/profile/${profileId}`);
  return data;
};

export const createPayment = async (payload) => {
  const { data } = await client.post("/payments", payload);
  return data;
};

export const updatePayment = async (id, payload) => {
  const { data } = await client.put(`/payments/${id}`, payload);
  return data;
};

export const deletePayment = async (id) => {
  const { data } = await client.delete(`/payments/${id}`);
  return data;
};