// features/uploads/api/uploads.api.ts
//
// This is the "Method 1" upload flow the Product module's images array
// depends on: upload a file here FIRST to get an ImageAsset (id + path),
// then pass { imageId: asset.id, url: <built from asset.path> } into the
// product create/update payload's `images` array. See product.api.ts's
// buildImageUrl() helper for the url construction convention.
import { get, post } from "@/services/https";
import type { ImageFolder, ImageAsset, ImageAssetWithUsages } from "./uploads-response.types";

export const uploadSingleImage = ({
  file,
  folder,
}: {
  file: File;
  folder?: ImageFolder;
}) => {
  const formData = new FormData();
  formData.append("file", file);
  const query = folder ? `?folder=${folder}` : "";
  return post<ImageAsset>(`/uploads/single${query}`, formData);
};

export const getImageAssetInfo = (id: string) =>
  get<ImageAssetWithUsages>(`/uploads/${id}/info`);