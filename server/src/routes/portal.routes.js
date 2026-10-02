import express from "express";
import { studentPortalLookup } from "../controllers/portal.controller.js";

const router = express.Router();

// Public student lookup route - no admin auth token required
router.post("/lookup", studentPortalLookup);

export default router;
