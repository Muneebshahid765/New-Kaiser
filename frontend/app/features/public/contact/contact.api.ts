import { get, post, patch, del } from '@/services/https'; // Standard axios instance wrapper
import {
  ContactFormValues,
 
} from './contact.types';

import {
  GetMessagesQueryParams,
  GetMessagesResponse,
  GetSingleMessageResponse,
  MessageMutationResponse,
} from './contact.response';

// Public Contact Submission
export const submitContactForm = (data: ContactFormValues) =>
  post<MessageMutationResponse>('/messages', data);

// Admin API
export const getMessagesAdmin = (params: GetMessagesQueryParams = {}) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== '') {
      query.append(key, String(val));
    }
  });
  const queryString = query.toString();
  return get<GetMessagesResponse>(`/messages${queryString ? `?${queryString}` : ''}`);
};

export const getMessageByIdAdmin = (id: string) =>
  get<GetSingleMessageResponse>(`/messages/${id}`);

export const updateMessageStatusAdmin = (id: string, status: 'unread' | 'read') =>
  patch<MessageMutationResponse>(`/messages/${id}/status`, { status });

export const replyToMessageAdmin = (id: string, reply: string) =>
  post<MessageMutationResponse>(`/messages/${id}/reply`, { reply });

export const deleteMessageAdmin = (id: string) =>
  del<MessageMutationResponse>(`/messages/${id}`);

export const bulkDeleteMessagesAdmin = (ids: string[]) =>
  del<MessageMutationResponse>('/messages', { data: { ids } });