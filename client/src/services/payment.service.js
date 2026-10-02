import api from "../api/axios.js";

// 1. STANDARD PAYMENT LEDGER
export const createPayment = async (payload) => {
  const { data } = await api.post("/payments", payload);
  return data;
};

export const getAllPayments = async () => {
  const { data } = await api.get("/payments");
  return data;
};

export const getPaymentById = async (id) => {
  const { data } = await api.get(`/payments/${id}`);
  return data;
};

export const updatePayment = async ({ id, payload }) => {
  const { data } = await api.put(`/payments/${id}`, payload);
  return data;
};

export const refundPayment = async (id) => {
  const { data } = await api.post(`/payments/${id}/refund`);
  return data;
};

// 2. RAZORPAY SUBSCRIPTION CHECKOUT
export const createSubscriptionOrder = async (payload) => {
  const { data } = await api.post("/payments/razorpay/subscription-order", payload);
  return data;
};

export const verifySubscriptionPayment = async (payload) => {
  const { data } = await api.post("/payments/razorpay/verify-subscription", payload);
  return data;
};

// 3. RAZORPAY STUDENT DESK FEE CHECKOUT
export const createStudentFeeOrder = async (payload) => {
  const { data } = await api.post("/payments/razorpay/create-fee-order", payload);
  return data;
};

export const verifyStudentFeePayment = async (payload) => {
  const { data } = await api.post("/payments/razorpay/verify-fee-payment", payload);
  return data;
};