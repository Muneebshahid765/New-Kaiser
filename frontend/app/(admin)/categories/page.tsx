// app/admin/categories/page.tsx

import { CategoryListPage } from "@/app/components/admin/categories/CategoryListPage";

export const metadata = {
  title: "Categories | Admin",
  description: "Manage product categories",
};

export default function CategoriesPage() {
  return <CategoryListPage />;
}