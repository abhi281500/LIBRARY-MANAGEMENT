import express from "express"
import { createBooking,getAllBookings,getBookingById,updateBooking,cancelBooking } from "../controllers/booking.controller.js";
import auth from "../middlewares/auth.middlewares.js"
import roleMiddleware from "../middlewares/role.middlewares.js"
const router = express.Router();

router.post( 
    "/",
    auth,
    roleMiddleware("LIBRARY_OWNER", "SUPER_ADMIN"),
     createBooking)
  

 router.get("/",
    auth,
    roleMiddleware("LIBRARY_OWNER", "SUPER_ADMIN"),
    getAllBookings)

 router.get("/:id" ,
    auth,
    roleMiddleware("LIBRARY_OWNER", "SUPER_ADMIN"),
   getBookingById)

router.put("/:id",
    auth,
    roleMiddleware("LIBRARY_OWNER", "SUPER_ADMIN"),
    updateBooking)   

router.patch("/:id/cancel",
    auth,
    roleMiddleware("LIBRARY_OWNER", "SUPER_ADMIN") ,
    cancelBooking)   



export default router;