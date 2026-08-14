"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertTriangle,
  ArrowLeft,
  BadgePercent,
  CameraIcon,
  CheckCircle,
  ClipboardList,
  FileText,
  ImageIcon,
  Save,
  Sparkles,
  X,
} from "lucide-react";

import {
  useCategory,
  useCreateCategory,
  useUpdateCategory,
} from "@/app/features/categories/hooks/category.hooks";
import {
  CreateCategorySchema,
  type CategoryFormData,
} from "@/app/features/categories/schemas/category.schema";

// Import your AppImage component here
import { AppImage } from "@/app/components/ui/AppImage"; 

interface CategoryFormContainerProps {
  categoryId?: string;
}

export function CategoryFormContainer({ categoryId }: CategoryFormContainerProps) {
  const router = useRouter();
  const isEditMode = Boolean(categoryId);

  // ── Remote data (edit mode only) ──────────────────────────────────────────
  const { data: categoryData, isLoading: isFetching } = useCategory(categoryId);
  const existingCategory = (categoryData as any)?.data ?? categoryData;

  // ── Mutations ─────────────────────────────────────────────────────────────
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const isPending = createMutation.isPending || updateMutation.isPending;

  // ── Image state ───────────────────────────────────────────────────────────
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Form ──────────────────────────────────────────────────────────────────
 const {
  register,
  handleSubmit,
  reset,
  watch,
  formState: { errors },
} = useForm<CategoryFormData>({
  resolver: zodResolver(CreateCategorySchema) as any,
  defaultValues: { name: "", description: "", status: "active" },
});

  // const descriptionValue = watch("description") || "";
  // const nameValue = watch("name") || "";
  const statusValue = watch("status");

  // Populate form and set image preview on edit load
  useEffect(() => {
    if (existingCategory && isEditMode) {
      reset({
        name: existingCategory.name ?? "",
        description: existingCategory.description ?? "",
        status: existingCategory.status ?? "active",
      });

      // Pass backend image path or object path
      const imagePath = existingCategory.image?.path || existingCategory.image;
      if (imagePath) {
        setImagePreview(imagePath);
      }
    }
  }, [existingCategory, isEditMode, reset]);

  // ── Image handlers ────────────────────────────────────────────────────────
  const handleImageChange = useCallback((file: File | undefined | null) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return;
    if (!file.type.startsWith("image/")) return;

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      handleImageChange(e.dataTransfer.files[0]);
    },
    [handleImageChange],
  );

  // ── Submit ────────────────────────────────────────────────────────────────
 const handleFormSubmit = async (data: CategoryFormData) => {
  if (isEditMode && categoryId) {
    updateMutation.mutate(
      { id: categoryId, dto: data, image: imageFile ?? undefined },
      { onSuccess: () => router.push("/admin/categories") }
    );
  } else {
    createMutation.mutate(
      { dto: data, image: imageFile ?? undefined },
      { onSuccess: () => router.push("/admin/categories") }
    );
  }
};

const onSubmit = handleSubmit(handleFormSubmit as any);

  if (isEditMode && isFetching) {
    // return <FormSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-slate-50 to-stone-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto">
        <button
          type="button"
          onClick={() => router.push("/admin/categories")}
          className="inline-flex items-center gap-2 text-stone-500 hover:text-stone-800 text-sm font-medium mb-6 transition-colors group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          Back to Categories
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-stone-200/80 overflow-hidden">
          <div className="relative px-7 py-6 bg-gradient-to-r from-stone-900 to-stone-700 overflow-hidden">
            <div className="relative">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white/70 text-xs font-medium mb-3">
                {isEditMode ? <><Save size={11} /> Edit Mode</> : <><Sparkles size={11} /> New Category</>}
              </div>
              <h1 className="text-xl font-bold text-white tracking-tight">
                {isEditMode ? "Edit Category" : "Create Category"}
              </h1>
            </div>
          </div>

          <form onSubmit={onSubmit} className="divide-y divide-stone-100">
            <div className="px-7 py-6 space-y-5">
              {/* <SectionHeader icon={<ClipboardList size={15} />} title="Basic Information" /> */}

              {/* Name Input */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-sm font-semibold text-stone-700">
                  <BadgePercent size={14} className="text-amber-500" /> Category Name *
                </label>
                <input
                  {...register("name")}
                  type="text"
                  placeholder="e.g. Electronics, Supplements"
                  disabled={isPending}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-900/10"
                />
              </div>

              {/* Description Input */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-sm font-semibold text-stone-700">
                  <FileText size={14} className="text-stone-400" /> Description *
                </label>
                <textarea
                  {...register("description")}
                  rows={4}
                  placeholder="Category details..."
                  disabled={isPending}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-900/10 resize-none"
                />
              </div>

              {/* Status Radio */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-stone-700">Status</label>
                <div className="flex gap-3">
                  {(["active", "inactive"] as const).map((s) => (
                    <label
                      key={s}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 cursor-pointer text-sm font-semibold transition-all ${
                        statusValue === s
                          ? s === "active" ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-red-400 bg-red-50 text-red-700"
                          : "border-stone-200 bg-stone-50 text-stone-500"
                      }`}
                    >
                      <input {...register("status")} type="radio" value={s} className="sr-only" disabled={isPending} />
                      {s === "active" ? <CheckCircle size={15} /> : <X size={15} />}
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Image Upload Area with AppImage */}
            <div className="px-7 py-6 space-y-4">
              {/* <SectionHeader icon={<ImageIcon size={15} />} title="Category Image" /> */}

              {!imagePreview ? (
                <div
                  role="button"
                  tabIndex={0}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                    dragActive ? "border-stone-600 bg-stone-100" : "border-stone-300 bg-stone-50 hover:bg-stone-100/50"
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-xl bg-stone-200/70 flex items-center justify-center">
                      <CameraIcon size={22} className="text-stone-400" />
                    </div>
                    <p className="text-sm font-semibold text-stone-600">Drop image here or click to browse</p>
                    <p className="text-xs text-stone-400">PNG, JPG, WEBP · max 5 MB</p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => handleImageChange(e.target.files?.[0])}
                    disabled={isPending}
                  />
                </div>
              ) : (
                <div className="flex items-start gap-4">
                  {/* APP IMAGE INTEGRATED HERE */}
                  <div className="relative shrink-0">
                    <AppImage
                      src={imagePreview}
                      alt="Category Preview"
                      width={96}
                      height={126}
                      className="rounded-xl border-2 border-stone-200 shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview(null);
                      }}
                      disabled={isPending}
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center shadow-md hover:bg-red-600"
                    >
                      <X size={12} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="px-7 py-5 bg-stone-50/60 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => router.push("/admin/categories")}
                disabled={isPending}
                className="px-5 py-2.5 rounded-xl border-2 border-stone-200 bg-white text-stone-700 text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-stone-900 text-white text-sm font-semibold hover:bg-stone-800"
              >
                {isPending ? "Saving..." : isEditMode ? "Update Category" : "Create Category"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
//   return (
//     <div className="flex items-center gap-2.5 pb-3 border-b border-stone-100">
//       <div className="w-7 h-7 rounded-lg bg-stone-900 flex items-center justify-center text-white">{icon}</div>
//       <span className="text-sm font-bold text-stone-800 tracking-tight">{title}</span>
//     </div>
//   );
// }
