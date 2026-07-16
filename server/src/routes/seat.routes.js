import express from "express";
import { createSeat, getAllSeats, getSeatById, updateSeat, deleteSeat } from "../controllers/seat.controller.js";
import auth from "../middlewares/auth.middlewares.js"
import roleMiddleware from "../middlewares/role.middlewares.js"
const router = express.Router();


router.post(
    "/seats",
    auth,
    roleMiddleware("LIBRARY_OWNER", "SUPER_ADMIN"),
    createSeat
);

router.get(
    "/seats",
    auth,
    roleMiddleware("LIBRARY_OWNER", "SUPER_ADMIN"),
     getAllSeats
);

router.get(
    "/seats/:id",
    auth,
    roleMiddleware("LIBRARY_OWNER", "SUPER_ADMIN"),
     getSeatById
);

router.put(
    "/seats/:id",
    auth,
    roleMiddleware("LIBRARY_OWNER", "SUPER_ADMIN"),
     updateSeat
);


router.delete(
    "/seats/:id",
    auth,
    roleMiddleware("LIBRARY_OWNER", "SUPER_ADMIN"),
     deleteSeat
);

export default router;

