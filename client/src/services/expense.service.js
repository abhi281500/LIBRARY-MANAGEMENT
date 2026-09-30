import api from "../api/axios.js";

export const getExpenseSummary = async (month) => {
  const { data } = await api.get("/expenses/summary", {
    params: month ? { month } : {},
  });
  return data;
};

export const getAllExpenses = async (params = {}) => {
  const { data } = await api.get("/expenses", { params });
  return data;
};

export const createExpense = async (payload) => {
  const { data } = await api.post("/expenses", payload);
  return data;
};

export const updateExpense = async ({ id, payload }) => {
  const { data } = await api.put(`/expenses/${id}`, payload);
  return data;
};

export const deleteExpense = async (id) => {
  const { data } = await api.delete(`/expenses/${id}`);
  return data;
};
