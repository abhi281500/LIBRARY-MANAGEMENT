import api from "../api/axios.js";

/**
 * Public Student Portal Lookup by Phone Number or Admission ID
 */
export const studentPortalLookup = async (identifier, pin) => {
  const { data } = await api.post("/portal/lookup", { identifier, pin });
  return data;
};
