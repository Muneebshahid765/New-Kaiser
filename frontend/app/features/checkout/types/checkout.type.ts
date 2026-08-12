import { z } from "zod";
import {
  CreatePaymentIntentSchema,
  VerifyPaymentSchema,
} from "../schemas/checkout.schema";

export type CreatePaymentIntentPayload = z.infer<typeof CreatePaymentIntentSchema>;
export type VerifyPaymentPayload = z.infer<typeof VerifyPaymentSchema>;