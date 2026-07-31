import { z } from "zod";

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(3, "Name must be at least 3 characters"),

    email: z
      .string()
      .trim()
      .min(1, "Email is required")
      .email("Enter a valid email address"),

    phone: z
      .string()
      .min(1, "Phone number is required")
      .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit phone number"),

    password: z
      .string()
      .min(1, "Password is required")
      .min(8, "Password must be at least 8 characters"),

    confirmPassword: z
      .string()
      .min(1, "Confirm Password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });