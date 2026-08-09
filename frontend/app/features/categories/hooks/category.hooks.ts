import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMutationWithToast } from "@/hooks/use-mutation-toast";
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  bulkDeleteCategories,
  bulkUpdateCategoryStatus,
  getCategoryDropdown,
  getFeaturedCategories,
} from "../api/category.api";
import type {
  QueryCategoryPayload,
  CreateCategoryPayload,
  UpdateCategoryPayload,
  BulkDeleteCategoryPayload,
  BulkStatusCategoryPayload,
} from "../types/category.type";
import type {
  CategoryListItem,
  CategoryDetail,
  CategoryMessageResponse,
  CategoryDropdownItem,
  FeaturedCategoryItem,
} from "../types/category-reponse.types";

// ─── Canonical Query Keys ─────────────────────────────────────────────────────
const CATEGORY_LIST_ROOT = ["categories", "list"] as const;
export const FEATURED_CATEGORIES_KEY = ["categories", "category-featured"] as const;
export const CATEGORY_LIST_KEY = (query?: QueryCategoryPayload) =>
  [...CATEGORY_LIST_ROOT, query ?? {}] as const;
export const CATEGORY_DETAIL_KEY = (id: string) => ["categories", "detail", id] as const;
export const CATEGORY_DROPDOWN_KEY = ["categories", "dropdown"] as const;


// features/categories/hooks/use-categories.ts (addition)



export function useFeaturedCategories() {
  return useQuery<FeaturedCategoryItem[], Error>({
    queryKey: FEATURED_CATEGORIES_KEY,
    queryFn: async () => {
      const res = await getFeaturedCategories();
      return res.data ?? [];
    },
    staleTime: 1_000 * 60 * 15, // 15 min — backend 900s cache se match
    retry: false,
    refetchOnWindowFocus: false,
  });
}
// ─── List ─────────────────────────────────────────────────────────────────────
export function useCategories(query?: QueryCategoryPayload) {
  return useQuery<CategoryListItem[], Error>({
    queryKey: CATEGORY_LIST_KEY(query),
    queryFn: () => getCategories(query),
    select: (res: any) => {
      if (Array.isArray(res)) return res;
      if (Array.isArray(res?.data)) return res.data;
      if (Array.isArray(res?.categories)) return res.categories;
      return [];
    },
    staleTime: 1_000 * 60 * 2,
    retry: false,
    refetchOnWindowFocus: false,
  });
}

// ─── Single Category ──────────────────────────────────────────────────────────
export function useCategory(id?: string) {
  return useQuery<CategoryDetail, Error>({
    queryKey: CATEGORY_DETAIL_KEY(id ?? ""),
    queryFn: () => getCategoryById(id!),
    enabled: Boolean(id),
    staleTime: 1_000 * 60 * 5,
    retry: false,
  });
}

// ─── Create ───────────────────────────────────────────────────────────────────
export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutationWithToast<CategoryDetail, { dto: CreateCategoryPayload; image?: File }>(
    createCategory,
    {
      successMsg: "Category created successfully.",
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: CATEGORY_LIST_ROOT });
      },
    },
  );
}

// ─── Update ───────────────────────────────────────────────────────────────────
export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutationWithToast<
    CategoryDetail,
    { id: string; dto: UpdateCategoryPayload; image?: File }
  >(updateCategory, {
    successMsg: "Category updated successfully.",
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: CATEGORY_LIST_ROOT });
      queryClient.invalidateQueries({ queryKey: CATEGORY_DETAIL_KEY(variables.id) });
    },
  });
}

// ─── Delete ───────────────────────────────────────────────────────────────────
export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutationWithToast<CategoryMessageResponse, { id: string; force?: boolean }>(
    deleteCategory,
    {
      successMsg: "Category deleted successfully.",
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: CATEGORY_LIST_ROOT });
      },
    },
  );
}

// ─── Bulk Delete ──────────────────────────────────────────────────────────────
export function useBulkDeleteCategories() {
  const queryClient = useQueryClient();

  return useMutationWithToast<CategoryMessageResponse, BulkDeleteCategoryPayload>(
    bulkDeleteCategories,
    {
      successMsg: "Selected categories deleted successfully.",
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: CATEGORY_LIST_ROOT });
      },
    },
  );
}

// ─── Bulk Status Update ───────────────────────────────────────────────────────
export function useBulkUpdateCategoryStatus() {
  const queryClient = useQueryClient();

  return useMutationWithToast<CategoryMessageResponse, BulkStatusCategoryPayload>(
    bulkUpdateCategoryStatus,
    {
      successMsg: "Category status updated successfully.",
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: CATEGORY_LIST_ROOT });
      },
    },
  );
}

export function useCategoryDropdown() {
  return useQuery<CategoryDropdownItem[], Error>({
    queryKey: CATEGORY_DROPDOWN_KEY,
    queryFn: getCategoryDropdown,
    staleTime: 1000 * 60 * 10,
    retry: false,
    refetchOnWindowFocus: false,
  });
}