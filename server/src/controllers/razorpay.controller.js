import crypto from "crypto";
import { razorpayInstance, RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } from "../config/razorpay.js";
import Library from "../models/library.models.js";
import Booking from "../models/booking.models.js";
import Payment from "../models/payment.models.js";
import User from "../models/user.models.js";

const PLAN_PRICING = {
  PRO: {
    MONTHLY: 499,
    YEARLY: 4999,
  },
  ENTERPRISE: {
    MONTHLY: 1499,
    YEARLY: 14999,
  },
};

/**
 * 1. CREATE SAAS PLAN SUBSCRIPTION ORDER (For Library Owners)
 */
export const createSubscriptionOrder = async (req, res) => {
  try {
    const { plan, billingCycle = "MONTHLY" } = req.body;

    if (!["PRO", "ENTERPRISE"].includes(plan)) {
      return res.status(400).json({ message: "Invalid subscription plan selected" });
    }

    const library = await Library.findOne({ owner: req.user._id });
    if (!library) {
      return res.status(404).json({ message: "Library not found" });
    }

    const amountInRupees = PLAN_PRICING[plan][billingCycle] || PLAN_PRICING[plan].MONTHLY;
    const amountInPaise = amountInRupees * 100;

    let orderId = `order_${Date.now()}`;

    // Try creating via Razorpay instance if keys are configured
    if (RAZORPAY_KEY_ID && !RAZORPAY_KEY_ID.includes("placeholder")) {
      try {
        const order = await razorpayInstance.orders.create({
          amount: amountInPaise,
          currency: "INR",
          receipt: `rcpt_sub_${library._id.toString().slice(-6)}_${Date.now()}`,
          notes: {
            libraryId: library._id.toString(),
            libraryName: library.name,
            plan,
            billingCycle,
          },
        });
        orderId = order.id;
      } catch (sdkError) {
        console.warn("[Razorpay SDK Notice]: Using mock order fallback for test mode.", sdkError.message);
      }
    }

    return res.status(200).json({
      message: "Subscription order generated successfully",
      orderId,
      amount: amountInPaise,
      amountInRupees,
      currency: "INR",
      keyId: RAZORPAY_KEY_ID,
      plan,
      billingCycle,
      libraryName: library.name,
      user: {
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone || library.phone,
      },
    });
  } catch (error) {
    console.error("createSubscriptionOrder error:", error);
    return res.status(500).json({ message: error.message || "Failed to create subscription order" });
  }
};

/**
 * 2. VERIFY SAAS PLAN SUBSCRIPTION PAYMENT & AUTO-UPGRADE
 */
export const verifySubscriptionPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      plan,
      billingCycle = "MONTHLY",
    } = req.body;

    if (!plan) {
      return res.status(400).json({ message: "Plan is required" });
    }

    const library = await Library.findOne({ owner: req.user._id });
    if (!library) {
      return res.status(404).json({ message: "Library not found" });
    }

    // Signature verification if live secret configured
    if (
      razorpay_order_id &&
      razorpay_payment_id &&
      razorpay_signature &&
      RAZORPAY_KEY_SECRET &&
      !RAZORPAY_KEY_SECRET.includes("placeholder")
    ) {
      const body = `${razorpay_order_id}|${razorpay_payment_id}`;
      const expectedSignature = crypto
        .createHmac("sha256", RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest("hex");

      if (expectedSignature !== razorpay_signature) {
        return res.status(400).json({ message: "Invalid payment signature verification failed" });
      }
    }

    // Auto-upgrade library subscription tier immediately
    library.subscription = plan;
    await library.save();

    return res.status(200).json({
      message: `🎉 Congratulations! Your library is now upgraded to the ${plan} Plan.`,
      plan: library.subscription,
      paymentId: razorpay_payment_id || `PAY_MOCK_${Date.now()}`,
    });
  } catch (error) {
    console.error("verifySubscriptionPayment error:", error);
    return res.status(500).json({ message: error.message || "Failed to verify payment" });
  }
};

/**
 * 3. CREATE STUDENT DESK FEE ORDER (Online Student Fee Checkout)
 */
export const createStudentFeeOrder = async (req, res) => {
  try {
    const { bookingId } = req.body;

    if (!bookingId) {
      return res.status(400).json({ message: "Booking ID is required" });
    }

    const library = await Library.findOne({ owner: req.user._id });
    if (!library) {
      return res.status(404).json({ message: "Library not found" });
    }

    const booking = await Booking.findOne({
      _id: bookingId,
      library: library._id,
    })
      .populate("student")
      .populate("seat");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const amountInPaise = Number(booking.amount) * 100;
    let orderId = `order_fee_${Date.now()}`;

    if (RAZORPAY_KEY_ID && !RAZORPAY_KEY_ID.includes("placeholder")) {
      try {
        const order = await razorpayInstance.orders.create({
          amount: amountInPaise,
          currency: "INR",
          receipt: `rcpt_fee_${booking._id.toString().slice(-6)}`,
          notes: {
            bookingId: booking._id.toString(),
            studentId: booking.student?._id?.toString(),
            seatNumber: booking.seat?.seatNumber,
          },
        });
        orderId = order.id;
      } catch (e) {
        console.warn("[Razorpay Student Fee]: Using mock order fallback", e.message);
      }
    }

    return res.status(200).json({
      message: "Student fee order created",
      orderId,
      amount: amountInPaise,
      amountInRupees: booking.amount,
      currency: "INR",
      keyId: RAZORPAY_KEY_ID,
      booking,
    });
  } catch (error) {
    console.error("createStudentFeeOrder error:", error);
    return res.status(500).json({ message: error.message || "Failed to create fee order" });
  }
};

/**
 * 4. VERIFY STUDENT DESK FEE & AUTO-GENERATE RECEIPT
 */
export const verifyStudentFeePayment = async (req, res) => {
  try {
    const {
      bookingId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    const library = await Library.findOne({ owner: req.user._id });
    if (!library) {
      return res.status(404).json({ message: "Library not found" });
    }

    const booking = await Booking.findOne({ _id: bookingId, library: library._id });
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Verify signature if secret present
    if (
      razorpay_order_id &&
      razorpay_payment_id &&
      razorpay_signature &&
      RAZORPAY_KEY_SECRET &&
      !RAZORPAY_KEY_SECRET.includes("placeholder")
    ) {
      const body = `${razorpay_order_id}|${razorpay_payment_id}`;
      const expectedSignature = crypto
        .createHmac("sha256", RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest("hex");

      if (expectedSignature !== razorpay_signature) {
        return res.status(400).json({ message: "Signature verification failed" });
      }
    }

    // Create Paid Payment record
    const receiptNumber = `REC-${Date.now()}-${Math.floor(Math.random() * 100)}`;
    const payment = await Payment.create({
      booking: booking._id,
      student: booking.student,
      library: library._id,
      amount: booking.amount,
      paymentMethod: "UPI",
      paymentStatus: "PAID",
      paymentDate: new Date(),
      receiptNumber,
    });

    booking.status = "ACTIVE";
    await booking.save();

    return res.status(200).json({
      message: "Student desk fee paid and verified successfully!",
      payment,
      booking,
    });
  } catch (error) {
    console.error("verifyStudentFeePayment error:", error);
    return res.status(500).json({ message: error.message || "Failed to verify fee payment" });
  }
};

/**
 * 5. RAZORPAY WEBHOOK LISTENER (For Automated Asynchronous Events)
 */
export const handleRazorpayWebhook = async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || "rzp_webhook_secret_default";
    const signature = req.headers["x-razorpay-signature"];

    if (signature && secret) {
      const shasum = crypto.createHmac("sha256", secret);
      shasum.update(JSON.stringify(req.body));
      const digest = shasum.digest("hex");

      if (digest !== signature) {
        return res.status(400).json({ message: "Invalid webhook signature" });
      }
    }

    const event = req.body.event;
    console.log(`[Razorpay Webhook Received]: ${event}`);

    if (event === "payment.captured" || event === "order.paid") {
      const paymentEntity = req.body.payload.payment.entity;
      const notes = paymentEntity.notes || {};

      if (notes.plan && notes.libraryId) {
        await Library.findByIdAndUpdate(notes.libraryId, {
          subscription: notes.plan,
        });
        console.log(`[Webhook Auto-Upgrade]: Library ${notes.libraryId} upgraded to ${notes.plan}`);
      }
    }

    return res.status(200).json({ status: "ok" });
  } catch (error) {
    console.error("handleRazorpayWebhook error:", error);
    return res.status(500).json({ message: "Webhook handler failed" });
  }
};
