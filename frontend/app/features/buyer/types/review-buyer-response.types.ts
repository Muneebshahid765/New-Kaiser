export interface BuyerReviewItem {
  id: string;
  userName: string;
  email: string;
  rating: number;
  comment: string;
  createdAt: string;
  buyerProfile?: { id: string };
}

export interface ProductReviewsResponse {
  data: BuyerReviewItem[];
  meta: {
    nextCursor: string | null;
    hasMore: boolean;
    limit: number;
  };
}

export interface SubmitReviewResponse {
  success: boolean;
  message: string;
  review: {
    _id: string;
    userName: string;
    rating: number;
    comment: string;
    createdAt: string;
  };
}

export interface ProductForReviewResponse {
  success: boolean;
  product: {
    name: string;
    price: number | string;
    image: string | null;
  };
  customerEmail?: string | null;
  customerName?: string | null;
  alreadyReviewed?: boolean; 
  canReview?: boolean;
}

export interface CanReviewResponse {
  success: boolean;
  canReview: boolean;
  alreadyReviewed?: boolean;
  message: string;
  orderStatus?: string;
}