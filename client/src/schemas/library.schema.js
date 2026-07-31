import { z } from "zod";

export const librarySchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Library name must be at least 3 characters")
    .max(100, "Library name cannot exceed 100 characters"),

  openTime: z
    .string()
    .min(1, "Open time is required")
    .regex(
      /^([01]\d|2[0-3]):([0-5]\d)$/,
      "Enter a valid time (HH:mm)"
    ),

  closeTime: z
    .string()
    .min(1, "Close time is required")
    .regex(
      /^([01]\d|2[0-3]):([0-5]\d)$/,
      "Enter a valid time (HH:mm)"
    ),

  address: z
    .string()
    .trim()
    .min(5, "Address must be at least 5 characters")
    .max(250, "Address cannot exceed 250 characters"),

  phone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit phone number"),

  description: z
    .string()
    .trim()
    .max(500, "Description cannot exceed 500 characters")
    .optional()
    .or(z.literal("")),

  totalSeats: z
    .coerce.number()
    .int("Total seats must be a whole number")
    .min(1, "Total seats must be at least 1"),
});