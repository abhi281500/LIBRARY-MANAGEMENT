import express from "express";
import { getDashboard } from "../controllers/dashboard.controller.js";
import verifyJWT from "../middleware/auth.middleware.js";
import roleMiddleware from "../middleware/role.middleware.js";

const router = express.Router();

router.get(
    "/",
    verifyJWT,
    roleMiddleware("LIBRARY_OWNER"),
    getDashboard
);

export default router;