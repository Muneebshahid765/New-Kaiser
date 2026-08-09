// app/admin/categories/[id]/edit/page.tsx

import { use } from "react";
import { CategoryFormContainer } from "@/app/components/admin/categories/CategoryFormContainer";

export const metadata = {
  title: "Edit Category | Admin",
};

export default function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <CategoryFormContainer categoryId={id} />;
}