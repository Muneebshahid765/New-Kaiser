import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateProductSchema, type ProductFormData } from "@/app/features/products/schemas/product.schema";
import type { Product } from "@/app/features/products/types/product-response.types";
import { buildImageUrl } from "@/app/features/products/api/product.api";
import { useUploadImage } from "@/app/features/uploads/uploads.hooks";

const DRAFT_STORAGE_KEY = "product_form_draft_data";

// ✅ FIX 1: statHighlights: [] add kar diya gaya hai
const defaultFormValues: ProductFormData = {
  name: "",
  slug: "",
  sku: "",
  description: "",
  price: 0,
  originalPrice: undefined,
  categoryId: "",
  stockQuantity: 0,
  status: "active",
  deliveryCharges: 0,
  deliveryRule: "",
  insuranceDetails: "",
  usageInstructions: "",
  adminNotes: "",
  features: [],
  highlights: [],
  statHighlights: [], // 👈 Required field added
  sharedFeatures: [],
  specifications: [],
  labels: [],
  ingredients: [],
  nutritionFacts: [],
  benefits: [],
  faqs: [],
  images: [],
};

// ✅ FIX 2: Type flexibility (Product | any | null) support for PublicProductView
export function useProductForm(
  initialProduct?: Product | any | null,
  isEditMode: boolean = false
) {
  const { mutateAsync: uploadImage } = useUploadImage();

  const methods = useForm<ProductFormData>({
    resolver: zodResolver(CreateProductSchema) as any, // 👈 Type cast resolver for compatibility
    defaultValues: defaultFormValues,
  });

  const { reset, getValues, setValue, watch } = methods;

  // 1. Load Initial Data or Local Storage Draft
  useEffect(() => {
    if (isEditMode) {
      if (!initialProduct || Object.keys(initialProduct).length === 0) return;

      // Robust Specification Mapping
      let specArray: { name: string; value: string }[] = [];

      if (initialProduct.specifications) {
        if (Array.isArray(initialProduct.specifications)) {
          specArray = initialProduct.specifications.map((item: any) => {
            if (typeof item === "object" && item !== null) {
              return {
                name: item.name || item.key || "",
                value: item.value || "",
              };
            }
            return { name: "", value: String(item) };
          });
        } else if (typeof initialProduct.specifications === "object") {
          specArray = Object.entries(initialProduct.specifications).map(([name, value]) => ({
            name,
            value: String(value),
          }));
        }
      }

      reset({
        name: initialProduct.name || "",
        slug: initialProduct.slug || "",
        sku: initialProduct.sku || "",
        description: initialProduct.description || "",
        price: initialProduct.price ? Number(initialProduct.price) : 0,
        originalPrice: initialProduct.originalPrice ? Number(initialProduct.originalPrice) : undefined,
        categoryId: initialProduct.categoryId || "",
        stockQuantity: Number(initialProduct.stockQuantity ?? 0),
        status: (initialProduct.status as any) || "active",
        deliveryCharges: Number(initialProduct.deliveryCharges ?? 0),
        deliveryRule: initialProduct.deliveryRule || "",
        insuranceDetails: initialProduct.insuranceDetails || "",
        usageInstructions: initialProduct.usageInstructions || "",
        adminNotes: initialProduct.adminNotes || "",
        specifications: specArray,
        features: initialProduct.features || [],
        highlights: initialProduct.highlights || [],
        statHighlights: initialProduct.statHighlights || [], // 👈 Mapped statHighlights
        sharedFeatures: initialProduct.sharedFeatures || [],
        labels: initialProduct.labels || [],
        ingredients: (initialProduct as any).packageContents || initialProduct.ingredients || [],
        nutritionFacts: (initialProduct as any).attributes || initialProduct.nutritionFacts || [],
        benefits: initialProduct.benefits || [],
        faqs: initialProduct.faqs || [],
        images: initialProduct.images
          ? initialProduct.images.map((img: any, idx: number) => ({
              id: img.id,
              imageId: img.imageId,
              url: img.url || (img.imageAsset?.path ? buildImageUrl(img.imageAsset.path) : ""),
              title: img.title || "",
              description: img.description || "",
              sortOrder: img.sortOrder ?? idx,
            }))
          : [],
      });
    } else {
      // Create mode: LocalStorage draft load karo
      try {
        const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
        if (savedDraft) {
          const parsed = JSON.parse(savedDraft);
          reset(parsed);
        }
      } catch (err) {
        console.error("Failed to restore draft:", err);
      }
    }
  }, [initialProduct, isEditMode, reset]);

  // 2. Draft Auto-save (Only when NOT in Edit Mode)
  useEffect(() => {
    if (isEditMode) return;

    const subscription = watch((value) => {
      try {
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(value));
      } catch (err) {
        console.error("Failed to save draft:", err);
      }
    });

    return () => subscription.unsubscribe();
  }, [watch, isEditMode]);

  const clearDraft = () => {
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch (e) {}
  };

  const handleResetForm = () => {
    clearDraft();
    reset(defaultFormValues);
  };

  const handleUploadFiles = async (files: File[]) => {
    for (const file of files) {
      try {
        const localBlobUrl = URL.createObjectURL(file);
        const response: any = await uploadImage({ file, folder: "products" });
        // ✅ FIX 3: Safe asset response parsing using type cast
        const asset = response?.data || response;

        const currentImages = getValues("images") || [];
        const finalUrl = asset?.path ? asset.path : localBlobUrl;

        setValue(
          "images",
          [
            ...currentImages,
            {
              imageId: asset?.id || "",
              url: finalUrl,
              title: file.name.split(".")[0],
              description: "",
              sortOrder: currentImages.length,
            },
          ],
          { shouldDirty: true, shouldTouch: true, shouldValidate: true }
        );
      } catch (error) {
        console.error("Image upload failed:", error);
      }
    }
  };

  return { methods, handleUploadFiles, clearDraft, handleResetForm };
}