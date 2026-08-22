import  mongoose from 'mongoose';
import express from "express";
import {
  createPayment,
  getAllPayments,
  getPaymentById,
  updatePayment,
  refundPayment,
} from "../controllers/payment.controller.js";

import auth from "../middlewares/auth.middlewares.js";
import roleMiddleware from "../middlewares/role.middlewares.js";

const router = express.Router();


// CREATE PAYMENT
router.post(
  "/",
  auth,
  roleMiddleware("LIBRARY_OWNER", "SUPER_ADMIN"),
  createPayment
);

// GET ALL PAYMENTS
// Only SUPER_ADMIN
router.get(
  "/",
  auth,
  roleMiddleware("SUPER_ADMIN"),
  getAllPayments
);


// GET PAYMENT BY ID
router.get(
  "/:id",
  auth,
  getPaymentById
);


// UPDATE PAYMENT
router.put(
  "/:id",
  auth,
  roleMiddleware("LIBRARY_OWNER", "SUPER_ADMIN"),
  updatePayment
);


// DELETE PAYMENT
router.post(
  "/:id/refund",
  auth,
  roleMiddleware("LIBRARY_OWNER", "SUPER_ADMIN"),
  refundPayment
);


export default router;