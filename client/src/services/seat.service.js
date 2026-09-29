import api from "../api/axios.js";


export const createSeat = async (payload) => {
    const { data } = await api.post("/seats", payload);
    return data;
}

export const getAllSeats = async () => {
    const { data } = await api.get("/seats");
    return data;
}

export const getSeatById = async (id) => {
    const { data } = await api.get(`/seats/${id}`);
    return data;
}

export const updateSeat = async ({ id, payload }) => {
    const { data } = await api.put(`/seats/${id}`, payload);
    return data;
}

export const deleteSeat = async (id) => {
    const { data } = await api.delete(`/seats/${id}`);
    return data;
}


export const bulkCreateSeats = async (payload) => {
    const { data } = await api.post("/seats/bulk-create", payload);
    return data;
};

export const getSeatMatrix = async ({ shift, floor } = {}) => {
    const params = new URLSearchParams();
    if (shift) params.append("shift", shift);
    if (floor) params.append("floor", floor);
    const { data } = await api.get(`/seats/matrix?${params.toString()}`);
    return data;
};