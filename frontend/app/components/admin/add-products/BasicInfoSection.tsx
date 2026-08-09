'use client';

import React from "react";
import { useFormContext } from "react-hook-form";
import { Info, AlertCircle } from "lucide-react";

// 👈 FIX: Sirf useCategoryDropdown import karein (CategoryDropdownItem ko remove kar diya hai)
import { useCategoryDropdown } from "@/app/features/categories/hooks/category.hooks";
import type { ProductFormData } from "@/app/features/products/schemas/product.schema";

// Local fallback type define kar lein agar needed ho
interface CategoryItem {
  id?: string;
  _id?: string;
  name: string;
}

interface BasicInfoSectionProps {
  isOpen: boolean;
  onToggle: () => void;
}

const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({ isOpen, onToggle }) => {
  const { register, formState: { errors } } = useFormContext<ProductFormData>();

  // 1️⃣ Dedicated Category Dropdown Hook Call
  const { data: rawCategories, isLoading: isCategoriesLoading, isError, error } = useCategoryDropdown();

  // 2️⃣ Safe Array Normalization
  const categories: CategoryItem[] = Array.isArray(rawCategories)
    ? rawCategories
    : Array.isArray((rawCategories as any)?.data)
    ? (rawCategories as any).data
    : Array.isArray((rawCategories as any)?.data?.data)
    ? (rawCategories as any).data.data
    : [];

  return (
    <div className="bg-white border border-[#e2e8f0] rounded-[14px] overflow-hidden shadow-sm">
      {/* Accordion Header */}
      <div 
        className="flex justify-between items-center px-6 py-5 cursor-pointer bg-white hover:bg-slate-50/50 transition-colors" 
        onClick={onToggle}
      >
        <div className="flex items-center gap-3">
          <Info size={20} className="text-[#64748b]" />
          <h3 className="text-[17px] font-bold text-[#0f172a]">Basic Information</h3>
        </div>
      </div>

      {/* Accordion Body */}
      {isOpen && (
        <div className="p-6 border-t border-[#e2e8f0] grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Product Name */}
          <div className="md:col-span-2">
            <label className="block text-[13px] font-semibold text-[#0f172a] mb-1">
              Product Name *
            </label>
            <input
              type="text"
              {...register("name")}
              className={`w-full px-4 py-2 border rounded-[10px] text-[14px] outline-none ${
                errors.name ? "border-red-500" : "border-[#e2e8f0] focus:border-[#6366f1]"
              }`}
              placeholder="Enter product title"
            />
            {errors.name && <p className="text-red-500 text-[12px] mt-1">{errors.name.message}</p>}
          </div>

          {/* Dynamic Category Selector */}
          <div>
            <label className="block text-[13px] text-[#0f172a] font-semibold mb-1">
              Category *
            </label>
            <select
              {...register("categoryId")}
              disabled={isCategoriesLoading || isError}
              className={`w-full px-4 py-2 border rounded-[10px] text-[14px] bg-white disabled:bg-slate-100 disabled:cursor-not-allowed outline-none ${
                errors.categoryId ? "border-red-500" : "border-[#e2e8f0] focus:border-[#6366f1]"
              }`}
            >
              <option value="">
                {isCategoriesLoading
                  ? "Loading Categories..."
                  : isError
                  ? "Failed to load categories"
                  : "-- Select Category --"}
              </option>

              {categories.map((cat, index) => {
                const categoryId = cat.id || cat._id || index;
                return (
                  <option key={categoryId} value={categoryId}>
                    {cat.name}
                  </option>
                );
              })}
            </select>
            {errors.categoryId && <p className="text-red-500 text-[12px] mt-1">{errors.categoryId.message}</p>}
            {isError && (
              <p className="text-amber-600 text-[12px] mt-1 flex items-center gap-1">
                <AlertCircle size={13} />
                <span>{error?.message || "Categories loading failed."}</span>
              </p>
            )}
          </div>

          {/* SKU */}
          <div>
            <label className="block text-[13px] font-semibold text-[#0f172a] mb-1">SKU *</label>
            <input
              type="text"
              {...register("sku")}
              className={`w-full px-4 py-2 border rounded-[10px] text-[14px] outline-none ${
                errors.sku ? "border-red-500" : "border-[#e2e8f0] focus:border-[#6366f1]"
              }`}
            />
            {errors.sku && <p className="text-red-500 text-[12px] mt-1">{errors.sku.message}</p>}
          </div>

          {/* Price */}
          <div>
            <label className="block text-[13px] font-semibold text-[#0f172a] mb-1">Price *</label>
            <input
              type="number"
              step="0.01"
              {...register("price", { valueAsNumber: true })}
              className={`w-full px-4 py-2 border rounded-[10px] text-[14px] outline-none ${
                errors.price ? "border-red-500" : "border-[#e2e8f0] focus:border-[#6366f1]"
              }`}
            />
            {errors.price && <p className="text-red-500 text-[12px] mt-1">{errors.price.message}</p>}
          </div>

          {/* Original Price */}
          <div>
            <label className="block text-[13px] font-semibold text-[#0f172a] mb-1">Original Price</label>
            <input
              type="number"
              step="0.01"
              {...register("originalPrice", { valueAsNumber: true })}
              className="w-full px-4 py-2 border border-[#e2e8f0] rounded-[10px] text-[14px] outline-none focus:border-[#6366f1]"
            />
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className="block text-[13px] font-semibold text-[#0f172a] mb-1">Description *</label>
            <textarea
              rows={4}
              {...register("description")}
              className={`w-full px-4 py-2 border rounded-[10px] text-[14px] outline-none ${
                errors.description ? "border-red-500" : "border-[#e2e8f0] focus:border-[#6366f1]"
              }`}
            />
            {errors.description && <p className="text-red-500 text-[12px] mt-1">{errors.description.message}</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default BasicInfoSection;