"use client";

import { use } from "react";
import { BuyerReviewForm } from "./buyer-review-form";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ orderId?: string }>;
}

export default function ProductReviewsPage({ params, searchParams }: PageProps) {
  const { slug } = use(params);
  const { orderId } = use(searchParams);

  return (
    <main className="min-h-screen bg-[#FAF7F2] py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-10">
        <header className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-[#5A4332]">
            Product Reviews
          </h1>
          <p className="mt-2 text-sm text-[#8C7462]">
            Verified customer ratings and testimonials
          </p>
        </header>

        {orderId && (
          <section>
            <BuyerReviewForm productId={slug} orderId={orderId} />
          </section>
        )}

      </div>
    </main>
  );
}