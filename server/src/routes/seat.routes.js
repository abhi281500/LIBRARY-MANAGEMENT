import express from "express";
import { createSeat, getAllSeats, getSeatById, updateSeat, deleteSeat } from "../controllers/seat.controller.js";
import auth from "../middlewares/auth.middlewares.js"
import roleMiddleware from "../middlewares/role.middlewares.js"
const router = express.Router();


router.post(
    "/",
    auth,
    roleMiddleware("LIBRARY_OWNER", "SUPER_ADMIN"),
    createSeat
);

router.get(
    "/",
    auth,
    roleMiddleware("LIBRARY_OWNER", "SUPER_ADMIN"),
     getAllSeats
);

router.get(
    "/:id",
    auth,
    roleMiddleware("LIBRARY_OWNER", "SUPER_ADMIN"),
     getSeatById
);

router.put(
    "/:id",
    auth,
    roleMiddleware("LIBRARY_OWNER", "SUPER_ADMIN"),
     updateSeat
);


router.delete(
    "/:id",
    auth,
    roleMiddleware("LIBRARY_OWNER", "SUPER_ADMIN"),
     deleteSeat
);

export default router;

