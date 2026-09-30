import api from "../api/axios.js";


export const createLibrary = async (payload) => {
  const { data } = await api.post("/libraries", payload);
  return data;
};


export const getAllLibraries = async () => {
  const { data } = await api.get("/libraries");
  return data;
};


export const getLibraryById = async (id) => {
  const { data } = await api.get(`/libraries/${id}`);
  return data;
};


export const updateLibrary = async ({ id, payload }) => {
  const { data } = await api.put(`/libraries/${id}`, payload);
  return data;
};

export const deleteLibrary = async (id) => {
  const { data } = await api.delete(`/libraries/${id}`);
  return data;
};

export const getMyLibrary = async () => {
  const { data } = await api.get("/libraries/my");
  return data;
};


export const getSubscription = async () => {
  const { data } = await api.get("/libraries/subscription");
  return data;
};

export const upgradeSubscription = async (payload) => {
  const { data } = await api.post("/libraries/subscription/upgrade", payload);
  return data;
};

export const getWhatsAppTemplates = async () => {
  const { data } = await api.get("/libraries/whatsapp-templates");
  return data;
};

export const updateWhatsAppTemplates = async (payload) => {
  const { data } = await api.put("/libraries/whatsapp-templates", payload);
  return data;
};



 
 
  
