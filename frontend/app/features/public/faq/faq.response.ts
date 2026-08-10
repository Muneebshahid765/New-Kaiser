export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PublicFaqItem extends Pick<FaqItem, 'id' | 'question' | 'answer' | 'sortOrder'> {}

export interface GetPublicFaqsResponse {
  success: boolean;
  data: PublicFaqItem[];
}

export interface GetAllFaqsResponse {
  success: boolean;
  data: FaqItem[];
}

export interface GetSingleFaqResponse {
  success: boolean;
  data: FaqItem;
}

export interface FaqMutationResponse {
  success: boolean;
  message: string;
  data?: FaqItem;
}