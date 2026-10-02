import express from "express";
import {
  createPayment,
  getAllPayments,
  getPaymentById,
  updatePayment,
  refundPayment,
} from "../controllers/payment.controller.js";
import {
  createSubscriptionOrder,
  verifySubscriptionPayment,
  createStudentFeeOrder,
  verifyStudentFeePayment,
  handleRazorpayWebhook,
} from "../controllers/razorpay.controller.js";
import auth from "../middlewares/auth.middlewares.js";
import roleMiddleware from "../middlewares/role.middlewares.js";

const router = express.Router();

// ==========================================
// 1. RAZORPAY SUBSCRIPTION & ONLINE CHECKOUT
// ==========================================

// Create SaaS Plan Upgrade Order
router.post(
  "/razorpay/subscription-order",
  auth,
  roleMiddleware("LIBRARY_OWNER", "SUPER_ADMIN"),
  createSubscriptionOrder
);

// Verify SaaS Plan Upgrade Payment
router.post(
  "/razorpay/verify-subscription",
  auth,
  roleMiddleware("LIBRARY_OWNER", "SUPER_ADMIN"),
  verifySubscriptionPayment
);

// Create Student Desk Fee Order
router.post(
  "/razorpay/create-fee-order",
  auth,
  roleMiddleware("LIBRARY_OWNER", "SUPER_ADMIN"),
  createStudentFeeOrder
);

// Verify Student Desk Fee Payment
router.post(
  "/razorpay/verify-fee-payment",
  auth,
  roleMiddleware("LIBRARY_OWNER", "SUPER_ADMIN"),
  verifyStudentFeePayment
);

// Razorpay Webhook Endpoint (No JWT auth - verified via signature)
router.post("/razorpay/webhook", handleRazorpayWebhook);

// ==========================================
// 2. STANDARD PAYMENT RECORD LEDGER CRUD
// ==========================================

router.post(
  "/",
  auth,
  roleMiddleware("LIBRARY_OWNER", "SUPER_ADMIN"),
  createPayment
);

router.get(
  "/",
  auth,
  roleMiddleware("LIBRARY_OWNER", "SUPER_ADMIN"),
  getAllPayments
);

router.get(
  "/:id",
  auth,
  roleMiddleware("LIBRARY_OWNER", "SUPER_ADMIN"),
  getPaymentById
);

router.put(
  "/:id",
  auth,
  roleMiddleware("LIBRARY_OWNER", "SUPER_ADMIN"),
  updatePayment
);

router.post(
  "/:id/refund",
  auth,
  roleMiddleware("LIBRARY_OWNER", "SUPER_ADMIN"),
  refundPayment
);

export default router;