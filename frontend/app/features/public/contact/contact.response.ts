export type MessageStatus = 'unread' | 'read';

export interface MessageItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  status: MessageStatus;
  adminReply?: string | null;
  repliedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GetMessagesQueryParams {
  page?: number;
  limit?: number;
  status?: MessageStatus;
  sortBy?: 'createdAt' | 'name' | 'email';
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

export interface MessagePagination {
  currentPage: number;
  totalPages: number;
  totalMessages: number;
  messagesPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface MessageStatistics {
  totalMessages: number;
  unreadMessages: number;
  readMessages: number;
}

export interface GetMessagesResponse {
  success: boolean;
  messages: MessageItem[];
  pagination: MessagePagination;
  statistics: MessageStatistics;
}

export interface GetSingleMessageResponse {
  success: boolean;
  message: MessageItem;
}

export interface MessageMutationResponse {
  success: boolean;
  message: string;
  data?: any;
}