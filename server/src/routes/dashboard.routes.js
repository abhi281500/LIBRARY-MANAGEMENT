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

// Main Dashboard
router.get("/", verifyJWT, roleMiddleware("LIBRARY_OWNER"), getDashboard);

// Expiring Soon Bookings (Alerts)
router.get("/expiring-soon", verifyJWT, roleMiddleware("LIBRARY_OWNER"), getExpiringSoonBookings);

// Trigger Expiry Background Job
router.post("/trigger-expiry", verifyJWT, roleMiddleware("LIBRARY_OWNER", "SUPER_ADMIN"), triggerExpiryCheck);

// Monthly Revenue
router.get("/revenue/monthly", verifyJWT, roleMiddleware("LIBRARY_OWNER"), getMonthlyRevenue);

// Yearly Revenue
router.get("/revenue/yearly", verifyJWT, roleMiddleware("LIBRARY_OWNER"), getYearlyRevenue);

// Seat Occupancy
router.get("/occupancy", verifyJWT, roleMiddleware("LIBRARY_OWNER"), getSeatOccupancy);

// Booking Trends
router.get("/bookings/trends", verifyJWT, roleMiddleware("LIBRARY_OWNER"), getBookingTrends);

// Recent Activities
router.get("/activities", verifyJWT, roleMiddleware("LIBRARY_OWNER"), getRecentActivities);

export default router;