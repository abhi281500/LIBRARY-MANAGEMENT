import express from "express";
import {
  registerUser,
  loginUser,
  getMe,
} from "../controllers/auth.controller.js";

import auth from "../middlewares/auth.middlewares.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

// New Route
router.get("/me", auth, getMe);

export default router;