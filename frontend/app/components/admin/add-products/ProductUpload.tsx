'use client'
import React, { useState } from "react";
import { FormProvider } from "react-hook-form";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, RotateCcw } from "lucide-react";

import { useProductForm } from "../hooks/useProductForm";
import { useCreateProduct, useUpdateProduct, useProduct } from "@/app/features/products/hooks/product.hooks";
import type { ProductFormData } from "@/app/features/products/schemas/product.schema";
import InventorySection from "./InventorySection";
import MediaSection from "./MediaSection";
import DetailsSection from "./DetailsSection";
import SpecificationsSection from "./SpecificationsSection";
import BasicInfoSection from "./BasicInfoSection";
import { modals } from "@/hooks/store/useModalStore";

interface ProductFormContainerProps {
  productId?: string;
}

export const ProductFormContainer: React.FC<ProductFormContainerProps> = ({ productId }) => {
  const router = useRouter();
  const isEditMode = !!productId;

  const { data: productResponse, isLoading: isFetchingProduct } = useProduct(productId || "");
  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();

  const initialProduct = productResponse?.product ?? null;

  const { methods, handleUploadFiles, clearDraft, handleResetForm } = useProductForm(
  initialProduct,
  isEditMode
);

const { isDirty } = methods.formState;

  const [activeSections, setActiveSections] = useState({
    basic: true,
    specifications: true,
    inventory: true,
    media: true,
    details: true,
  });

  const toggleSection = (sectionKey: keyof typeof activeSections) => {
    setActiveSections((prev) => ({ ...prev, [sectionKey]: !prev[sectionKey] }));
  };

  const isSubmitting = createProductMutation.isPending || updateProductMutation.isPending;

 const onSubmit = async (data: ProductFormData) => {
  try {
    const payload = {
      ...data,
      // ✅ Remap frontend names → backend DTO names
      packageContents: (data.ingredients || []).filter(
        (item: any) => item?.name?.trim()
      ),
      attributes: (data.nutritionFacts || []).filter(
        (item: any) => item?.name?.trim() || item?.value?.trim()
      ),
      specifications: (data.specifications || []).filter(
        (item: any) => item?.name?.trim() || item?.value?.trim()
      ),
    };

    // Remove frontend-only keys so backend doesn't get confused
    delete (payload as any).ingredients;
    delete (payload as any).nutritionFacts;

   if (isEditMode && productId) {
  modals.confirm({
    title: "Update Product",
    description: "Are you sure you want to save these changes to the product?",
    variant: "info",
    confirmText: "Yes, Update",
    cancelText: "Cancel",
    onConfirm: async () => {
      await updateProductMutation.mutateAsync({ 
        id: productId, 
        payload: payload as any 
      });
      clearDraft();
    },
  });
  return; // Stop further execution so clearDraft doesn't run early
}
    else {
      await createProductMutation.mutateAsync(payload as any);
      handleResetForm();
    }

    clearDraft();
  } catch (err: any) {
    console.error("Product submit error:", err);
  }
};

  const onError = (errors: any) => {
    console.error("Form Validation Errors:", errors);
  };

 const onResetClick = () => {
  modals.confirm({
    title: "Reset Form",
    description: "Are you sure you want to reset all form fields and uploaded images?",
    variant: "warning",
    confirmText: "Yes, Reset Form",
    cancelText: "Cancel",
    onConfirm: () => {
      handleResetForm();
    },
  });
};

  if (isEditMode && isFetchingProduct) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-blue-600" size={32} />
        <span className="ml-2 font-medium text-slate-600">Loading Product Data...</span>
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      <div className="min-h-screen bg-slate-50 pb-10">
        <div className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm px-6 py-4 flex justify-between items-center">
          <button
            type="button"
            onClick={() => router.push("/products")}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-[8px] text-slate-600 text-[14px] hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} /> Back
          </button>
          <h1 className="text-[20px] font-bold text-slate-900">
            {isEditMode ? "Edit Product" : "Create New Product"}
          </h1>
        </div>

        <div className="max-w-[1100px] mx-auto px-6 py-6">
          <form onSubmit={methods.handleSubmit(onSubmit, onError)} className="flex flex-col gap-6">
            <BasicInfoSection
              isOpen={activeSections.basic}
              onToggle={() => toggleSection("basic")}
            />

            <SpecificationsSection
              isOpen={activeSections.specifications}
              onToggle={() => toggleSection("specifications")}
            />

            <InventorySection
              isOpen={activeSections.inventory}
              onToggle={() => toggleSection("inventory")}
            />

            <MediaSection
              isOpen={activeSections.media}
              onToggle={() => toggleSection("media")}
              onUploadFiles={handleUploadFiles}
            />

            <DetailsSection
              isOpen={activeSections.details}
              onToggle={() => toggleSection("details")}
            />

            <div className="flex justify-end items-center gap-3 p-4 bg-white border border-slate-200 rounded-[14px]">
              <button
                type="button"
                onClick={() => router.push("/products")}
                className="px-5 py-2.5 bg-slate-100 text-slate-600 rounded-[8px] font-semibold hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              {!isEditMode && (
                <button
                  type="button"
                  onClick={onResetClick}
                  className="px-5 py-2.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-[8px] font-semibold flex items-center gap-2 hover:bg-amber-100 transition-colors cursor-pointer"
                >
                  <RotateCcw size={16} /> Reset Form
                </button>
              )}

              <button
  type="submit"
  disabled={isSubmitting || (isEditMode && !isDirty)}
  className="px-5 py-2.5 bg-blue-600 text-white rounded-[8px] font-semibold flex items-center gap-2 hover:bg-blue-700 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
>
  {isSubmitting && <Loader2 size={16} className="animate-spin" />}
  {isEditMode ? "Update Product" : "Create Product"}
</button>
            </div>
          </form>
        </div>
      </div>
    </FormProvider>
  );
};