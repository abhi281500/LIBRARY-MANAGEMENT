import api from "../api/axios.js";

export const toggleCheckInOut = async (payload) => {
  const { data } = await api.post("/attendance/toggle", payload);
  return data;
};

export const getDailyAttendance = async (params = {}) => {
  const { data } = await api.get("/attendance/daily", { params });
  return data;
};

export const getStudentAttendanceHistory = async (studentId, days = 30) => {
  const { data } = await api.get(`/attendance/student/${studentId}`, {
    params: { days },
  });
  return data;
};
