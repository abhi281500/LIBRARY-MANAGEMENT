import express from "express";
import  {getDashboard} from "../controllers/dashboard.controller.js";
import verifyJWT from "../middlewares/auth.middlewares.js";
import roleMiddleware from "../middlewares/role.middlewares.js";
import { getMonthlyRevenue } from "../controllers/monthly_revenue.controller.js";
import { getYearlyRevenue } from "../controllers/yearly_revenue.controller.js";
import { getSeatOccupancy } from "../controllers/seat_occupancy.controller.js";
import { getRecentActivities } from "../controllers/recent_activity.controller.js";

const router = express.Router();

router.get(
    "/",
    verifyJWT,
    roleMiddleware("LIBRARY_OWNER"),
    getDashboard
);
router.get(
    "/",
    verifyJWT,
    roleMiddleware("LIBRARY_OWNER"),
    getMonthlyRevenue 
    
);
router.get(
    "/",
    verifyJWT,
    roleMiddleware("LIBRARY_OWNER"),
    getYearlyRevenue
);
router.get(
    "/",
    verifyJWT,
    roleMiddleware("LIBRARY_OWNER"),
    getSeatOccupancy
);
router.get(
    "/",
    verifyJWT,
    roleMiddleware("LIBRARY_OWNER"),
    getRecentActivities
);

export default router;