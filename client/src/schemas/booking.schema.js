import { z } from "zod";
  
export const bookingSchema = z
  .object({
    studentId: z
      .string()
      .trim()
      .min(3, "Name must be at least 3 characters"),

     seatId: z
      .string()
      .trim()
      .min(1, "Seat ID is required"),
     

    startDate: z
      .string()
      .min(1, "Start date is required")
      .refine((date) => !isNaN(Date.parse(date)), "Enter a valid date"),

    endDate: z
      .string()
      .min(1, "End date is required")
      .refine((date) => !isNaN(Date.parse(date)), "Enter a valid date"),

    amount: z
      .number()
      .min(0, "Amount must be a positive number"),
  });

   