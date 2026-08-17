import api from "../api/axios.js";

// Main dashboard statistics
export const getDashboard = async () => {
  const { data } = await api.get("/dashboard");
  return data;
};

// Monthly revenue
export const getMonthlyRevenue = async (year) => {
  const { data } = await api.get("/dashboard/revenue/monthly", {
    params: {
      year,
    },
  });

  return data;
};

// Yearly revenue
export const getYearlyRevenue = async () => {
  const { data } = await api.get("/dashboard/revenue/yearly");

  return data;
};

// Seat occupancy
export const getSeatOccupancy = async () => {
  const { data } = await api.get("/dashboard/occupancy");

  return data;
};

// Booking trends
export const getBookingTrends = async (year) => {
  const { data } = await api.get("/dashboard/bookings/trends", {
    params: {
      year,
    },
  });

  return data;
};

// Recent activities
export const getRecentActivities = async () => {
  const { data } = await api.get("/dashboard/activities");

  return data;
};