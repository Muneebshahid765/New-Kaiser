// features/uploads/hooks/uploads.hooks.ts
import { useQuery } from "@tanstack/react-query";
import { useMutationWithToast } from "@/hooks/use-mutation-toast";
import { uploadSingleImage, getImageAssetInfo } from "./uploads.api";
import type { ImageFolder, ImageAsset, ImageAssetWithUsages } from "./uploads-response.types";

// ─── Upload a single file, get back an ImageAsset (id + path) ────────────────
export function useUploadImage() {
  return useMutationWithToast<ImageAsset, { file: File; folder?: ImageFolder }>(
    uploadSingleImage,
    { successMsg: "Image uploaded successfully." },
  );
}

// ─── Inspect an existing asset + everywhere it's currently used ─────────────
export function useImageAssetInfo(id: string) {
  return useQuery<ImageAssetWithUsages, Error>({
    queryKey: ["uploads", "asset-info", id],
    queryFn: () => getImageAssetInfo(id),
    enabled: !!id,
    retry: false,
    staleTime: 1_000 * 60 * 5,
  });
}