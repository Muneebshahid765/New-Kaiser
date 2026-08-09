// features/categories/api/category.api.ts
import { get, post, put, del } from "@/services/https";
import type {
  CreateCategoryPayload,
  UpdateCategoryPayload,
  QueryCategoryPayload,
  BulkDeleteCategoryPayload,
  BulkStatusCategoryPayload,
} from "../types/category.type";
import type {
  CategoryListItem,
  CategoryDetail,
  CategoryMessageResponse,
  CategoryDropdownItem,
  FeaturedCategoriesResponse,
} from "../types/category-reponse.types";

// ─── multipart/form-data builder (create/update accept an optional image) ──
function buildCategoryFormData(
  dto: CreateCategoryPayload | UpdateCategoryPayload,
  image?: File,
): FormData {
  const formData = new FormData();
  if (dto.name !== undefined) formData.append("name", dto.name);
  if (dto.description !== undefined) formData.append("description", dto.description);
  if (dto.status !== undefined) formData.append("status", dto.status);
  if (image) formData.append("image", image);
  return formData;
}

// ─── List ─────────────────────────────────────────────────────────────────────
export const getCategories = (query?: QueryCategoryPayload) =>
  get<CategoryListItem[]>("/categories", { params: query });

// ─── Single ───────────────────────────────────────────────────────────────────
export const getCategoryById = (id: string) =>
  get<CategoryDetail>(`/categories/${id}`);

// ─── Create ───────────────────────────────────────────────────────────────────
export const createCategory = ({
  dto,
  image,
}: {
  dto: CreateCategoryPayload;
  image?: File;
}) => post<CategoryDetail>("/categories", buildCategoryFormData(dto, image));

// ─── Update ───────────────────────────────────────────────────────────────────
export const updateCategory = ({
  id,
  dto,
  image,
}: {
  id: string;
  dto: UpdateCategoryPayload;
  image?: File;
}) => put<CategoryDetail>(`/categories/${id}`, buildCategoryFormData(dto, image));

// ─── Delete (pass force: true after a 409 conflict to reassign products) ───
export const deleteCategory = ({ id, force = false }: { id: string; force?: boolean }) =>
  del<CategoryMessageResponse>(`/categories/${id}`, undefined, {
    params: force ? { force: "true" } : undefined,
  });

// ─── Bulk Delete ──────────────────────────────────────────────────────────────
export const bulkDeleteCategories = (payload: BulkDeleteCategoryPayload) =>
  post<CategoryMessageResponse>("/categories/bulk-delete", payload);

// ─── Bulk Status Update ───────────────────────────────────────────────────────
export const bulkUpdateCategoryStatus = (payload: BulkStatusCategoryPayload) =>
  put<CategoryMessageResponse>("/categories/bulk-status", payload);

export const getCategoryDropdown = () =>
  get<CategoryDropdownItem[]>("/categories/dropdown");


export const getFeaturedCategories = () =>
  get<FeaturedCategoriesResponse>("/categories/featured-categories");