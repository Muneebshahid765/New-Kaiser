import ProductReviewsPage from "@/app/components/buyer/reviews/mainPage";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ orderId?: string }>;
}

export default async function Page(props: PageProps) {
  return <ProductReviewsPage {...props} />;
}