import { z } from "zod";

export const seatSchema = z
  .object({
    seatNumber: z
      .string()
      .trim()
      .min(1, "Seat number is required"),


    floor: z
      .coerce.number()
      .int("Floor must be a whole number")
      .min(1, "Floor must be at least 1"),

    type: z
      .enum(["NORMAL", "PREMIUM"])
      .default("NORMAL"),

    status: z
      .enum(["AVAILABLE", "OCCUPIED", "MAINTENANCE"])
      .default("AVAILABLE"),

    
  })
  