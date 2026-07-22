import express from "express"
import { createBooking,getAllBookings,getBookingById,updateBooking,cancelBooking } from "../controllers/booking.controller.js";
const router = express.Router();

router.post( "/bookings", createBooking)
  

 router.get("/bookings",getAllBookings)

 router.get("/bookings/:id" ,getBookingById)

router.put(" /bookings/:id",updateBooking)   

router.patch(" /bookings/:id/cancel",cancelBooking)   



export default router;