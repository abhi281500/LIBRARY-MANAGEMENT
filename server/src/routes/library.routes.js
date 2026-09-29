import express from "express";
import {
  createLibrary,
  getAllLibraries,
  getMyLibrary,
  getLibraryById,
  updateLibrary,
  deleteLibrary,
  getSubscription,
  upgradeSubscription,
} from "../controllers/library.controller.js";
import auth from "../middlewares/auth.middlewares.js";
import roleMiddleware from "../middlewares/role.middlewares.js";

const router = express.Router();

// SUBSCRIPTION MANAGEMENT
router.get("/subscription", auth, roleMiddleware("LIBRARY_OWNER", "SUPER_ADMIN"), getSubscription);
router.post("/subscription/upgrade", auth, roleMiddleware("LIBRARY_OWNER", "SUPER_ADMIN"), upgradeSubscription);


router.post("/", auth, roleMiddleware("LIBRARY_OWNER", "SUPER_ADMIN"), createLibrary);
router.get("/my", auth, roleMiddleware("LIBRARY_OWNER", "SUPER_ADMIN"), getMyLibrary);
router.get("/", auth, roleMiddleware("SUPER_ADMIN"), getAllLibraries);
router.get("/:id", auth, getLibraryById);
router.put("/:id", auth, roleMiddleware("LIBRARY_OWNER", "SUPER_ADMIN"), updateLibrary);
router.delete("/:id", auth, roleMiddleware("LIBRARY_OWNER", "SUPER_ADMIN"), deleteLibrary);

export default router;