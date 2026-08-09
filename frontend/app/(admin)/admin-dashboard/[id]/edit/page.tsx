
import { ProductFormContainer } from "@/app/components/admin/add-products/ProductUpload";
import { use } from "react";

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  return <ProductFormContainer productId={resolvedParams.id} />;
}