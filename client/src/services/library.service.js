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




 
 
  
