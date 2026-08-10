import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  submitContactForm,
  getMessagesAdmin,
  getMessageByIdAdmin,
  updateMessageStatusAdmin,
  replyToMessageAdmin,
  deleteMessageAdmin,
  bulkDeleteMessagesAdmin,
} from './contact.api';
import { ContactFormValues} from './contact.types';
import { GetMessagesQueryParams } from './contact.response';

export const MESSAGE_KEYS = {
  all: ['messages'] as const,
  list: (params: GetMessagesQueryParams) => [...MESSAGE_KEYS.all, 'list', params] as const,
  detail: (id: string) => [...MESSAGE_KEYS.all, 'detail', id] as const,
};

// Public Submit Hook
export function useSubmitContactForm() {
  return useMutation({
    mutationFn: (data: ContactFormValues) => submitContactForm(data),
  });
}

// Admin Fetch Hooks
export function useAdminMessages(params: GetMessagesQueryParams = {}) {
  return useQuery({
    queryKey: MESSAGE_KEYS.list(params),
    queryFn: () => getMessagesAdmin(params),
    placeholderData: (prev) => prev,
  });
}

export function useAdminMessageDetail(id: string) {
  return useQuery({
    queryKey: MESSAGE_KEYS.detail(id),
    queryFn: () => getMessageByIdAdmin(id),
    enabled: !!id,
  });
}

// Admin Mutation Hooks
export function useUpdateMessageStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'unread' | 'read' }) =>
      updateMessageStatusAdmin(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MESSAGE_KEYS.all });
    },
  });
}

export function useReplyToMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reply }: { id: string; reply: string }) =>
      replyToMessageAdmin(id, reply),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MESSAGE_KEYS.all });
    },
  });
}

export function useDeleteMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteMessageAdmin(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MESSAGE_KEYS.all });
    },
  });
}

export function useBulkDeleteMessages() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => bulkDeleteMessagesAdmin(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MESSAGE_KEYS.all });
    },
  });
}