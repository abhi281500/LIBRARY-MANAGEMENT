import express from "express";
import {
  getDashboard,
  getExpiringSoonBookings,
  triggerExpiryCheck,
} from "../controllers/dashboard.controller.js";
import { getMonthlyRevenue } from "../controllers/monthly_revenue.controller.js";
import { getYearlyRevenue } from "../controllers/yearly_revenue.controller.js";
import { getSeatOccupancy } from "../controllers/seat_occupancy.controller.js";
import { getRecentActivities } from "../controllers/recent_activity.controller.js";
import { getBookingTrends } from "../controllers/booking_trend.controller.js";

import verifyJWT from "../middlewares/auth.middlewares.js";
import roleMiddleware from "../middlewares/role.middlewares.js";

const router = express.Router();

// Allow both LIBRARY_OWNER and SUPER_ADMIN on all dashboard routes
router.use(verifyJWT, roleMiddleware("LIBRARY_OWNER", "SUPER_ADMIN"));

// Main Dashboard
router.get("/", getDashboard);

// Expiring Soon Bookings (Alerts)
router.get("/expiring-soon", getExpiringSoonBookings);

// Trigger Expiry Background Job
router.post("/trigger-expiry", triggerExpiryCheck);

// Monthly Revenue
router.get("/revenue/monthly", getMonthlyRevenue);

// Yearly Revenue
router.get("/revenue/yearly", getYearlyRevenue);

// Seat Occupancy
router.get("/occupancy", getSeatOccupancy);

// Booking Trends
router.get("/bookings/trends", getBookingTrends);

// Recent Activities
router.get("/activities", getRecentActivities);

export default router;