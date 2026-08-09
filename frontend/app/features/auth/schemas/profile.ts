import { z } from "zod";

// ─── 1. ZOD VALIDATION SCHEMA (Industry Standard) ───────────────────────────
export const profileSchema = z.object({
  name: z
    .string()
    .min(2, "Display name must be at least 2 characters")
    .max(50, "Display name is too long"),
  email: z
    .string()
    .min(1, "Email address is required")
    .email("Please enter a valid email address"),
});

// ─── 1. Zod Validation Schema (Real World Realignment) ────────────────────────
export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string({ error: "Current password zaroori hai" })
      .min(1, "Current password likhna zaroori hai"),
    newPassword: z
      .string({error: "Naya password zaroori hai" })
      .min(8, "Password kam se kam 8 characters ka hona chahiye")
      .regex(/[A-Z]/, "Kam se kam ek Bara Lafz (Capital letter) zaroori hai")
      .regex(/[0-9]/, "Kam se kam ek Number zaroori hai")
      .regex(/[^A-Za-z0-9]/, "Kam se kam ek special character (@, $, #, etc.) zaroori hai"),
    confirmPassword: z
      .string({ error: "Confirm password zaroori hai" })
      .min(1, "Confirm password likhna zaroori hai"),
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: "Naya password purane password se mukhtalif hona chahiye",
    path: ["newPassword"],
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords match nahi kar rahe hain",
    path: ["confirmPassword"],
  });

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

export type ProfileFormValues = z.infer<typeof profileSchema>;