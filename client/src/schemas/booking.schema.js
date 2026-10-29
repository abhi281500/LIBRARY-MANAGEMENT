import { z } from "zod";

export const bookingSchema = z
  .object({
    studentId: z
      .string()
      .trim()
      .min(1, "Please select a student"),

    seatId: z
      .string()
      .trim()
      .min(1, "Please select a seat"),

    shift: z
      .enum(["FULL_DAY", "MORNING", "EVENING", "NIGHT", "CUSTOM"], {
        errorMap: () => ({ message: "Please select a valid shift timing slot" }),
      })
      .default("FULL_DAY"),

    startDate: z
      .string()
      .min(1, "Start date is required")
      .refine((date) => !isNaN(Date.parse(date)), "Enter a valid start date"),

    endDate: z
      .string()
      .min(1, "End date is required")
      .refine((date) => !isNaN(Date.parse(date)), "Enter a valid end date"),

    amount: z
      .number({ invalid_type_error: "Amount is required" })
      .min(0, "Amount must be a non-negative number"),
  })
  .refine(
    (data) => new Date(data.endDate) > new Date(data.startDate),
    {
      message: "End date must be after start date",
      path: ["endDate"],
    }
  );
