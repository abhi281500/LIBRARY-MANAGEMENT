import Razorpay from "razorpay";
import dotenv from "dotenv";
dotenv.config();

const key_id = process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder";
const key_secret = process.env.RAZORPAY_KEY_SECRET || "rzp_secret_placeholder";

export const razorpayInstance = new Razorpay({
  key_id,
  key_secret,
});

export const RAZORPAY_KEY_ID = key_id;
export const RAZORPAY_KEY_SECRET = key_secret;
