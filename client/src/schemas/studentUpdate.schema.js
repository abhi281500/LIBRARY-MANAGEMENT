import { z } from "zod";

export const studentUpdateSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(3, "Name must be at least 3 characters"),

    email: z
      .string()
      .trim()
      .email("Enter a valid email address"),

    password: z
      .string()
      .optional(),

    confirmPassword: z
      .string()
      .optional(),

    phone: z
      .string()
      .regex(/^[6-9]\d{9}$/, "Enter a valid phone number"),

    admissionNumber: z
      .string()
      .trim()
      .min(1, "Admission number is required"),

    status: z
      .enum(["ACTIVE", "INACTIVE"]),

    joiningDate: z
      .string()
      .optional(),
  })
  .refine(
    (data) => {
      // Password change nahi kar raha
      if (!data.password && !data.confirmPassword) {
        return true;
      }

      // Password change kar raha hai
      return data.password === data.confirmPassword;
    },
    {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    }
  );