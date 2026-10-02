import express from "express";
import {
  getPlatformOverview,
  getAllTenants,
  updateTenantPlan,
  toggleTenantStatus,
  impersonateTenant,
} from "../controllers/superadmin.controller.js";
import auth from "../middlewares/auth.middlewares.js";
import roleMiddleware from "../middlewares/role.middlewares.js";

const router = express.Router();

// All routes require SUPER_ADMIN role
router.use(auth, roleMiddleware("SUPER_ADMIN"));

// 1. Platform Metrics & Executive MRR
router.get("/overview", getPlatformOverview);

// 2. All Tenants List
router.get("/tenants", getAllTenants);

// 3. Override Plan
router.put("/tenants/:id/plan", updateTenantPlan);

// 4. Toggle Active / Suspended Status
router.put("/tenants/:id/status", toggleTenantStatus);

// 5. Impersonate Tenant
router.post("/tenants/:id/impersonate", impersonateTenant);

export default router;
