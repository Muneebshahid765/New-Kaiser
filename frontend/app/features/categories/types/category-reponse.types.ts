import { CategoryStatus } from "./category.type";

export interface CategoryImage {
  id: string;
  path: string;
}

// ─── GET /categories ─────────────────────────────────────────────────────────
export interface CategoryListItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  status: CategoryStatus;
  createdAt: string;
  updatedAt: string;
  image: CategoryImage | null;
  productCount: number;
  activeProductCount: number;
  avgRating: number;
  totalReviews: number;
  totalStock: number;
  avgPrice: number;
  outOfStockCount: number;
  lowStockCount: number;
  // ── Added Missing Properties ──
  totalRevenue?: number;
  totalOrders?: number;
}

// ─── GET /categories/:id, POST /categories, PUT /categories/:id ────────────
export interface CategoryDetail {
  id: string;
  name: string;
  slug: string;
  description: string;
  status: CategoryStatus;
  imageId: string | null;
  image: CategoryImage | null;
  createdAt: string;
  updatedAt: string;
}

// ─── DELETE /categories/:id, bulk-delete, bulk-status ───────────────────────
export interface CategoryMessageResponse {
  success: boolean;
  message: string;
}

export interface CategoryDeleteConflictResponse {
  success: false;
  message: string;
  productCount: number;
  canForce: boolean;
}

export interface CategoryDropdownItem {
  id: string;
  name: string;
}


export interface FeaturedCategoryImage {
  id: string;
  path: string;
  folder: string;
}

export interface FeaturedCategoryItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  image: FeaturedCategoryImage | null;
  productCount: number;
  activeInStockCount: number;
  avgRating: number;
  totalReviews: number;
  totalStock: number;
}

export interface FeaturedCategoriesResponse {
  success: boolean;
  count: number;
  data: FeaturedCategoryItem[];
}