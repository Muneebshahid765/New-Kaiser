import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getActiveFaqs,
  getAllFaqsAdmin,
  getFaqById,
  createFaq,
  updateFaq,
  deleteFaq,
} from "./faq.api";
import { FaqFormValues } from "./faq.types";

// Query Keys
export const FAQ_KEYS = {
  all: ["faqs"] as const,
  public: () => [...FAQ_KEYS.all, "public"] as const,
  adminAll: () => [...FAQ_KEYS.all, "admin"] as const,
  detail: (id: string) => [...FAQ_KEYS.all, "detail", id] as const,
};

// ─── Fetch Hooks ────────────────────────────────────────────────────────────

// 1. Hook for Public Website Page (Cached for 5 mins)
export function usePublicFaqs() {
  return useQuery({
    queryKey: FAQ_KEYS.public(),
    queryFn: async () => {
      const res = await getActiveFaqs();
      return res.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });
}

// 2. Hook for Admin Dashboard Table
export function useAdminFaqs() {
  return useQuery({
    queryKey: FAQ_KEYS.adminAll(),
    queryFn: async () => {
      const res = await getAllFaqsAdmin();
      return res.data;
    },
  });
}

// 3. Hook for Admin Edit Form
export function useFaqDetail(id: string) {
  return useQuery({
    queryKey: FAQ_KEYS.detail(id),
    queryFn: async () => {
      const res = await getFaqById(id);
      return res.data;
    },
    enabled: !!id, // Only run if ID is provided
  });
}

// ─── Mutation Hooks ─────────────────────────────────────────────────────────

export function useCreateFaq() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: FaqFormValues) => createFaq(data),
    onSuccess: () => {
      // Invalidate both admin table and public cache
      queryClient.invalidateQueries({ queryKey: FAQ_KEYS.adminAll() });
      queryClient.invalidateQueries({ queryKey: FAQ_KEYS.public() });
    },
  });
}

export function useUpdateFaq() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<FaqFormValues> }) =>
      updateFaq(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: FAQ_KEYS.adminAll() });
      queryClient.invalidateQueries({ queryKey: FAQ_KEYS.public() });
      queryClient.invalidateQueries({ queryKey: FAQ_KEYS.detail(variables.id) });
    },
  });
}

export function useDeleteFaq() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteFaq(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FAQ_KEYS.adminAll() });
      queryClient.invalidateQueries({ queryKey: FAQ_KEYS.public() });
    },
  });
}