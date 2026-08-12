"use client";

import React, { useRef, useState } from "react";
import { useFormContext, useFieldArray } from "react-hook-form";
import { ChevronDown, ChevronRight, ImageIcon, Folder, Trash2, AlertCircle } from "lucide-react";
import { AppImage } from "@/app/components/ui/AppImage";
import type { ProductFormData } from "@/app/features/products/schemas/product.schema";

interface MediaSectionProps {
  isOpen: boolean;
  onToggle: () => void;
  onUploadFiles: (files: File[]) => void;
}

const MediaSection: React.FC<MediaSectionProps> = ({ isOpen, onToggle, onUploadFiles }) => {
  const { control, register, watch } = useFormContext<ProductFormData>();
  const { fields, remove } = useFieldArray({ control, name: "images" });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const watchedImages = watch("images");

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      onUploadFiles(files);
    }
    if (e.target) e.target.value = "";
  };

  return (
    <div className={`bg-white border border-[#e2e8f0] rounded-[14px] overflow-hidden transition-shadow ${isOpen ? "shadow-md" : ""}`}>
      {/* Header Bar */}
      <div
        className={`flex justify-between items-center px-6 py-5 cursor-pointer border-b border-[#e2e8f0] ${
          isOpen ? "bg-gradient-to-r from-[#eff6ff] to-[#dbeafe] border-b-2 border-[#3b82f6]" : "bg-white hover:bg-[#f8fafc]"
        }`}
        onClick={onToggle}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center bg-[#f1f5f9] rounded-[10px]">
            <ImageIcon size={20} className="text-[#64748b]" />
          </div>
          <div>
            <h3 className="text-[17px] font-bold text-[#0f172a] m-0">Product Images</h3>
            <p className="text-[13px] text-[#64748b] m-0 mt-0.5">Upload gallery assets</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {fields.length > 0 && (
            <span className="px-3 py-1 bg-[#cffafe] text-[#155e75] text-[12px] font-semibold rounded-full">
              {fields.length} Image{fields.length > 1 ? "s" : ""}
            </span>
          )}
          <button type="button" className="w-8 h-8 border border-[#e2e8f0] bg-white rounded-[10px] flex items-center justify-center text-[#64748b]">
            {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          </button>
        </div>
      </div>

      {/* Expanded Content */}
      {isOpen && (
        <div className="p-6">
          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            id="product-images-input"
            type="file"
            multiple
            onChange={handleFilesChange}
            className="hidden"
            accept="image/*"
          />

          {/* Upload Drop Zone */}
          <label
            htmlFor="product-images-input"
            className="block border-2 border-dashed border-[#e2e8f0] rounded-[14px] p-8 bg-gradient-to-b from-white to-[#f8fafc] cursor-pointer text-center hover:border-[#3b82f6] transition-all mb-6"
          >
            <Folder size={40} className="text-[#94a3b8] mx-auto mb-2" />
            <p className="text-[15px] font-semibold text-[#0f172a] m-0">Click to upload or drag & drop</p>
            <p className="text-[12px] text-[#64748b] m-0 mt-1">PNG, JPG, WEBP up to 10MB</p>
          </label>

          {/* Images Grid */}
          {fields.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {fields.map((field, index) => {
                const rawUrl = watchedImages?.[index]?.url || (field as any).url;
                
                return (
                  <div key={field.id} className="relative bg-white border-2 border-[#e2e8f0] rounded-[14px] overflow-hidden p-3 flex flex-col gap-2">
                    {/* Image Container with AppImage */}
                    <div className="relative h-[140px] bg-[#f8fafc] rounded-[8px] overflow-hidden flex items-center justify-center border border-[#f1f5f9]">
                      <AppImage
                        src={rawUrl}
                        alt={`Product asset ${index + 1}`}
                        width={300}
                        height={140}
                        className="w-full h-full object-cover"
                        iconSize={32}
                      />
                    </div>

                    {/* Hidden RHF Inputs */}
                    <input type="hidden" {...register(`images.${index}.imageId`)} />
                    <input type="hidden" {...register(`images.${index}.url`)} />

                    {/* Title & Description Inputs */}
                    <input
                      type="text"
                      {...register(`images.${index}.title`)}
                      placeholder="Title"
                      className="w-full px-3 py-1.5 border border-[#e2e8f0] rounded-[8px] text-[13px] focus:outline-none focus:border-[#3b82f6]"
                    />
                    <textarea
                      rows={2}
                      {...register(`images.${index}.description`)}
                      placeholder="Description"
                      className="w-full px-3 py-1.5 border border-[#e2e8f0] rounded-[8px] text-[13px] focus:outline-none focus:border-[#3b82f6] resize-none"
                    />

                    {/* Remove Button */}
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="py-1.5 px-3 bg-[#fee2e2] text-[#991b1b] rounded-[8px] text-[12px] font-semibold flex items-center justify-center gap-1 hover:bg-[#fecaca] transition-colors"
                    >
                      <Trash2 size={14} /> Remove
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MediaSection;