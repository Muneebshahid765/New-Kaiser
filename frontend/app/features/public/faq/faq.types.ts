import { z } from "zod";

// ─── Zod Schemas for Forms (Admin Panel) ────────────────────────────────────

export const faqFormSchema = z.object({
  question: z
    .string()
    .trim()
    .min(3, "Question must be at least 3 characters")
    .max(300, "Question cannot exceed 300 characters"),
  answer: z
    .string()
    .trim()
    .min(3, "Answer must be at least 3 characters")
    .max(2000, "Answer cannot exceed 2000 characters"),
  sortOrder: z.number().int().optional().default(0),
  isActive: z.boolean().optional().default(true),
});

export type FaqFormValues = z.infer<typeof faqFormSchema>;