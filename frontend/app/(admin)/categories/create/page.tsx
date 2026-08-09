// app/admin/categories/create/page.tsx

import { CategoryFormContainer } from "@/app/components/admin/categories/CategoryFormContainer";

export const metadata = {
  title: "Create Category | Admin",
};

export default function CreateCategoryPage() {
  return <CategoryFormContainer />;
}