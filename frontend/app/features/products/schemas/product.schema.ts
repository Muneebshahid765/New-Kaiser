// features/products/schemas/product.schema.ts
import { z } from "zod";

export const LabelVariantEnum = z.enum([
  "primary",
  "secondary",
  "accent",
  "purple",
  "green",
  "blue",
  "orange",
]);

export const ProductStatusEnum = z.enum(["active", "draft", "archived"]);

// ─── Sub-item schemas ───────────────────────────────────────────────────

export const ProductImageItemSchema = z.object({
  id: z.string().uuid().optional(),
  imageId: z.string().optional().nullable().or(z.literal("")),
  // 👈 FIX 1: URL restriction hata di taake /uploads/ path bhi accept ho sake
  url: z.string().min(1, "Image URL/path is required"),
  title: z.string().max(200).optional().default(""),
  description: z.string().optional().default(""),
  sortOrder: z.number().int().default(0),
});

export const ProductLabelSchema = z.object({
  text: z.string().optional().default(""),
  variant: LabelVariantEnum.default("primary"),
  sortOrder: z.number().int().default(0),
});

export const ProductIngredientSchema = z.object({
  name: z.string().optional().default(""),
  description: z.string().default(""),
  sortOrder: z.number().int().default(0),
});

// 👈 FIX 2: Khali row submit karne par validation fail nahi hogi
export const ProductNutritionFactSchema = z.object({
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

export const ProductStatHighlightSchema = z.object({
  label: z.string().optional().default(""),
  value: z.string().optional().default(""),
  description: z.string().default(""),
  sortOrder: z.number().int().default(0),
});

export const ProductSpecificationItemSchema = z.object({
  name: z.string().optional(),
  key: z.string().optional(),
  value: z.string().optional(),
});
// ─── Main product schema ─────────────────────────────────────────────────────

export const CreateProductSchema = z.object({
  name: z.string().min(2, "Naam kam az kam 2 characters ka ho").max(200),
  
  // 👈 FIX 3: Khali slug "" ya undefined dono allow kiye hain
  slug: z.string().min(2).max(200).optional().or(z.literal("")),
  
  sku: z.string().min(2, "SKU zaroori hai").max(40),
  description: z.string().min(10, "Description kam az kam 10 characters ka ho"),
  price: z.coerce.number().positive("Price 0 se ziada hona chahiye"),
  originalPrice: z.coerce.number().positive().optional().nullable().or(z.literal("")),
  categoryId: z.string().min(1, "Category select karo"),

  stockQuantity: z.coerce.number().int().nonnegative().default(0),
  status: ProductStatusEnum.default("active"),
  deliveryCharges: z.coerce.number().nonnegative().default(0),
  deliveryRule: z.string().default(""),
  insuranceDetails: z.string().default(""),
  usageInstructions: z.string().default(""),
  adminNotes: z.string().default(""),

  features: z.array(z.string()).default([]),
  highlights: z.array(z.string()).default([]),
  sharedFeatures: z.array(z.string()).default([]),

  // 👈 FIX 4: Array [{key, value}] aur Record {} dono formats ko support karta hai
  specifications: z.union([
  z.record(z.string(), z.any()),
  z.array(ProductSpecificationItemSchema)
]).default([]),

  labels: z.array(ProductLabelSchema).default([]),
  ingredients: z.array(ProductIngredientSchema).default([]),
  nutritionFacts: z.array(ProductNutritionFactSchema).default([]),
  benefits: z.array(ProductBenefitSchema).default([]),
  faqs: z.array(ProductFaqSchema).default([]),
  statHighlights: z.array(ProductStatHighlightSchema).default([]),

  images: z.array(ProductImageItemSchema).default([]),
});

export type ProductFormData = z.infer<typeof CreateProductSchema>;

export const UpdateProductSchema = CreateProductSchema.partial();
export type UpdateProductFormData = z.infer<typeof UpdateProductSchema>;

export const BulkUpdateProductSchema = z.object({
  productIds: z.array(z.string().uuid("Invalid product")).min(1, "Kam az kam 1 product select karo"),
  updates: UpdateProductSchema.refine((data) => Object.keys(data).length > 0, {
    message: "Kam az kam 1 field update ke liye do",
  }),
});
export type BulkUpdateProductFormData = z.infer<typeof BulkUpdateProductSchema>;
export type ProductFormInput = z.input<typeof CreateProductSchema>;