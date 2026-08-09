// features/auth/schemas/register.schema.ts
import { z } from "zod";

export const registerSchema = z
  .object({
    firstName: z.string().min(2, "Name at least 2 char"),
    lastName: z.string().min(2, "Name at least 2 char"),
    email: z
      .string()
      .min(1, "Email is compulsory")
      .email("Valid email daalo"),
    password: z
      .string()
      .min(8, "Password must 8 characters")
      .regex(/[A-Z]/, "Ek capital letter zaroori hai")
      .regex(/[0-9]/, "Ek number zaroori hai"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords match nahi kar rahe",
    path: ["confirmPassword"],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;