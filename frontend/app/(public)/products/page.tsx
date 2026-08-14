// app/(public)/products/page.tsx
import { Suspense } from 'react';
import MainContent from '@/app/components/public/products/MainContent'; // path apne project ke mutabiq dekhein

// Optional: Fallback component jab tak search params load hotey hain
function ProductsLoading() {
  return <div className="p-8 text-center">Loading products...</div>;
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<ProductsLoading />}>
      <MainContent />
    </Suspense>
  );
}