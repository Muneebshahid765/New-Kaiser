/* eslint-disable */
import { z } from "zod";
import { LabelVariant, ProductStatus } from "@prisma/client";

// Helpers for parsing stringified JSON inputs from Form-Data or JSON requests
const jsonFieldSchema = <T extends z.ZodTypeAny>(schema: T) =>
  z.string().transform((val, ctx) => {
    try {
      return JSON.parse(val);
    } catch {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid JSON string format",
      });
      return z.NEVER;
    }
  }).pipe(schema);

// 1. Image Schema (URL check relaxed for local upload paths)
export const ProductImageItemSchema = z.object({
  id: z.string().uuid().optional(),
  imageId: z.string().optional().nullable().or(z.literal("")),
  url: z.string().min(1, "Image path is required"), // 👈 Fixed: supports /uploads/...
  title: z.string().max(200).optional().default(""),
  description: z.string().optional().default(""),
  sortOrder: z.number().int().default(0),
});

export const ProductLabelSchema = z.object({
  text: z.string().optional().default(""),
  variant: z.nativeEnum(LabelVariant).default(LabelVariant.primary),
  sortOrder: z.number().int().default(0),
});

export const ProductPackageContentsSchema = z.object({
  name: z.string().optional().default(""),
  description: z.string().default(""),
  sortOrder: z.number().int().default(0),
});

// 2. Nutrition Fact Schema (Allows empty strings without throwing error)
export const ProductAttributesSchema = z.object({
  name: z.string().optional().default(""),
  value: z.string().optional().default(""),
  unit: z.string().max(20).default(""),
  description: z.string().default(""),
  sortOrder: z.number().int().default(0),
});

export const ProductBenefitSchema = z.object({
  title: z.string().optional().default(""),
  description: z.string().optional().default(""),
  icon: z.string().max(20).default("✓"),
  learnMoreUrl: z.string().default(""),
  sortOrder: z.number().int().default(0),
});

export const ProductFaqSchema = z.object({
  question: z.string().optional().default(""),
  answer: z.string().optional().default(""),
  sortOrder: z.number().int().default(0),
});


export const CreateProductSchema = z.object({
  name: z.string().min(2).max(200),
  
  // 3. Slug (Allows empty string "")
  slug: z.string().min(2).max(200).optional().or(z.literal("")),
  
  sku: z.string().min(2).max(40),
  description: z.string().min(10),
  price: z.coerce.number().positive(),
  originalPrice: z.coerce.number().positive().optional().nullable().or(z.literal("")),
  categoryId: z.string().uuid("Invalid Category ID format"),
  
  stockQuantity: z.coerce.number().int().nonnegative().default(0),
  status: z.nativeEnum(ProductStatus).default(ProductStatus.active),
  deliveryCharges: z.coerce.number().nonnegative().default(0),
  deliveryRule: z.string().default(""),
  insuranceDetails: z.string().default(""),
  usageInstructions: z.string().default(""),
  adminNotes: z.string().default(""),

  // Array & JSON fields
  features: z.union([z.array(z.string()), jsonFieldSchema(z.array(z.string()))]).default([]),
  highlights: z.union([z.array(z.string()), jsonFieldSchema(z.array(z.string()))]).default([]),

  // 4. Specifications (Supports both Array of Objects [{key, value}] and Record object)
specifications: z.union([
  z.record(z.string(), z.any()),
  z.array(z.object({
    name: z.string().optional(),   // 👈 add this
    key: z.string().optional(),
    value: z.string().optional(),
  })),
  jsonFieldSchema(z.any())
]).default([]),

  // Relational Collections
  labels: z.union([z.array(ProductLabelSchema), jsonFieldSchema(z.array(ProductLabelSchema))]).default([]),
  packageContents: z.union([z.array(ProductPackageContentsSchema), jsonFieldSchema(z.array(ProductPackageContentsSchema))]).default([]),
  attributes: z.union([z.array(ProductAttributesSchema), jsonFieldSchema(z.array(ProductAttributesSchema))]).default([]),
  benefits: z.union([z.array(ProductBenefitSchema), jsonFieldSchema(z.array(ProductBenefitSchema))]).default([]),
  faqs: z.union([z.array(ProductFaqSchema), jsonFieldSchema(z.array(ProductFaqSchema))]).default([]),  
  images: z.union([
    z.array(ProductImageItemSchema),
    jsonFieldSchema(z.array(ProductImageItemSchema))
  ]).default([]),
});

export type CreateProductDto = z.infer<typeof CreateProductSchema>;

// Update Schema
export const UpdateProductSchema = CreateProductSchema.partial();
export type UpdateProductDto = z.infer<typeof UpdateProductSchema>;