// features/auth/schemas/login.schema.ts
import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email daalna zaroori hai")
    .email("Valid email daalo"),

  password: z
    .string()
    .min(1, "Password daalna zaroori hai"),


})


export type LoginFormData = z.infer<typeof loginSchema>;