import api from "../api/axios.js";

export const getPlatformOverview = async () => {
  const { data } = await api.get("/superadmin/overview");
  return data;
};

export const getAllTenants = async (params = {}) => {
  const { data } = await api.get("/superadmin/tenants", { params });
  return data;
};

export const updateTenantPlan = async ({ id, plan }) => {
  const { data } = await api.put(`/superadmin/tenants/${id}/plan`, { plan });
  return data;
};

export const toggleTenantStatus = async ({ id, status }) => {
  const { data } = await api.put(`/superadmin/tenants/${id}/status`, { status });
  return data;
};

export const impersonateTenant = async (id) => {
  const { data } = await api.post(`/superadmin/tenants/${id}/impersonate`);
  return data;
};
