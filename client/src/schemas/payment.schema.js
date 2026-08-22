import { z } from "zod";

export const createPaymentSchema = z.object({
  bookingId: z
    .string()
    .trim()
    .min(1, "Booking ID is required"),

  paymentMethod: z.enum(
    ["CASH", "UPI", "CARD", "BANK_TRANSFER"],
    {
      message: "Invalid payment method",
    }
  ),
});

export const updatePaymentSchema = z.object({
  paymentMethod: z.enum(
    ["CASH", "UPI", "CARD", "BANK_TRANSFER"],
    {
      message: "Invalid payment method",
    }
  ),
});