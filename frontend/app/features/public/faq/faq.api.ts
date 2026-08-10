import { post,get,patch,del } from "@/services/https";
import {
  GetPublicFaqsResponse,
  GetAllFaqsResponse,
  GetSingleFaqResponse,
  FaqMutationResponse,
} from "./faq.response";
import { FaqFormValues } from "./faq.types";

// ─── Public ───
export const getActiveFaqs = () => get<GetPublicFaqsResponse>("/faqs");

// ─── Admin CRUD ───
export const getAllFaqsAdmin = () => get<GetAllFaqsResponse>("/faqs/admin/all");

export const getFaqById = (id: string) => get<GetSingleFaqResponse>(`/faqs/${id}`);

export const createFaq = (data: FaqFormValues) =>
  post<FaqMutationResponse>("/faqs", data);

export const updateFaq = (id: string, data: Partial<FaqFormValues>) =>
  patch<FaqMutationResponse>(`/faqs/${id}`, data);

export const deleteFaq = (id: string) =>
  del<FaqMutationResponse>(`/faqs/${id}`);