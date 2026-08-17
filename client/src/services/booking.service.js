import api from "../api/axios.js";

export const createBooking = async (payload) => {
  const { data } = await api.post("/bookings", payload);
  return data;
};

export const getAllBookings = async () => {
  const { data } = await api.get("/bookings");
  return data;
};

export const getBookingById = async (id) => {
  const { data } = await api.get(`/bookings/${id}`);
  return data;
};

export const updateBooking = async ({ id, payload }) => {
  const { data } = await api.put(`/bookings/${id}`, payload);
  return data;
};

export const cancelBooking = async (id) => {
  const { data } = await api.patch(`/bookings/${id}/cancel`);
  return data;
};



