// features/uploads/types/uploads-response.types.ts

export type ImageFolder = "products" | "categories" | "order_items" | "profiles";
export type UsageModel = "product" | "category" | "order" | "profile";

// ─── POST /uploads/single ─────────────────────────────────────────────────────
// Service returns { success, data: asset } — after the global-envelope peel
// (stage 1) and the default per-endpoint unwrap (stage 2, `data` key present),
// this resolves to the flat ImageAsset below.
export interface ImageAsset {
  id: string;
  path: string;
  folder: ImageFolder;
  sha256: string;
  phash: string | null;
  sizeBytes: number;
  createdAt: string;
  updatedAt: string;
}

export interface ImageAssetUsage {
  id: string;
  imageId: string;
  model: UsageModel;
  docId: string;
  field: string;
  createdAt: string;
}

// ─── GET /uploads/:id/info ────────────────────────────────────────────────────
export interface ImageAssetWithUsages extends ImageAsset {
  usages: ImageAssetUsage[];
}