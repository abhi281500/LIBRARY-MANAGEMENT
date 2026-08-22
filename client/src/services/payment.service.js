import api from "../api/axios.js";

// CREATE PAYMENT
export const createPayment = async (payload) => {
  const { data } = await api.post("/payments", payload);
  return data;
};

// GET ALL PAYMENTS
export const getAllPayments = async () => {
  const { data } = await api.get("/payments");
  return data;
};

// GET PAYMENT BY ID
export const getPaymentById = async (id) => {
  const { data } = await api.get(`/payments/${id}`);
  return data;
};

// UPDATE PAYMENT
export const updatePayment = async ({ id, payload }) => {
  const { data } = await api.put(`/payments/${id}`, payload);
  return data;
};

// REFUND PAYMENT
export const refundPayment = async (id) => {
  const { data } = await api.post(`/payments/${id}/refund`);
  return data;
};