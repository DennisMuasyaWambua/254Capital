/**
 * Notification Service for Salary Check-Off System
 */

import { apiRequest, API_ENDPOINTS, tokenManager } from './api';

export interface Notification {
  id: string;
  user: string;
  title: string;
  message: string;
  link: string | null;
  is_read: boolean;
  notification_type:
    | 'otp'
    | 'status_update'
    | 'disbursement'
    | 'remittance'
    | 'reminder'
    | 'general';
  created_at: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  page: number;
  total_pages: number;
  results: T[];
}

export interface MessageThread {
  id: string;
  application: string;
  subject: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  latest_message?: Message;
}

export interface Message {
  id: string;
  thread: string;
  sender: {
    id: string;
    first_name: string;
    last_name: string;
    role: string;
  };
  body: string;
  attachment: string | null;
  is_read: boolean;
  created_at: string;
}

export interface CreateThreadRequest {
  application_id: string;
  subject: string;
  initial_message: string;
}

export interface SendMessageRequest {
  body: string;
  attachment?: File;
}

export const notificationService = {
  /**
   * List user's notifications with filtering
   */
  listNotifications: async (filters?: {
    is_read?: boolean;
    page?: number;
  }): Promise<PaginatedResponse<Notification>> => {
    const params = new URLSearchParams();
    if (filters?.is_read !== undefined) {
      params.append('is_read', filters.is_read.toString());
    }
    if (filters?.page) {
      params.append('page', filters.page.toString());
    }

    const url = `${API_ENDPOINTS.NOTIFICATIONS.LIST}?${params.toString()}`;

    return apiRequest<PaginatedResponse<Notification>>(url, {
      method: 'GET',
    });
  },

  /**
   * Get count of unread notifications
   */
  getUnreadCount: async (): Promise<{ count: number }> => {
    return apiRequest<{ count: number }>(API_ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT, {
      method: 'GET',
    });
  },

  /**
   * Mark single notification as read
   */
  markAsRead: async (id: string): Promise<{ detail: string }> => {
    return apiRequest<{ detail: string }>(API_ENDPOINTS.NOTIFICATIONS.MARK_READ(id), {
      method: 'PATCH',
    });
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead: async (): Promise<{ detail: string; count: number }> => {
    return apiRequest<{ detail: string; count: number }>(
      API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ,
      {
        method: 'POST',
      }
    );
  },

  // ===== MESSAGE THREAD ENDPOINTS =====

  /**
   * List message threads for user's applications
   */
  listThreads: async (): Promise<MessageThread[]> => {
    return apiRequest<MessageThread[]>(API_ENDPOINTS.NOTIFICATIONS.THREADS, {
      method: 'GET',
    });
  },

  /**
   * Create new message thread
   */
  createThread: async (data: CreateThreadRequest): Promise<MessageThread> => {
    return apiRequest<MessageThread>(API_ENDPOINTS.NOTIFICATIONS.THREADS, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * List messages in a thread
   */
  listMessages: async (threadId: string): Promise<Message[]> => {
    return apiRequest<Message[]>(API_ENDPOINTS.NOTIFICATIONS.THREAD_MESSAGES(threadId), {
      method: 'GET',
    });
  },

  /**
   * Send message in a thread
   */
  sendMessage: async (
    threadId: string,
    data: SendMessageRequest
  ): Promise<Message> => {
    if (data.attachment) {
      // Use FormData for file upload
      const formData = new FormData();
      formData.append('body', data.body);
      formData.append('attachment', data.attachment);

      const token = tokenManager.getAccessToken();
      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(
        API_ENDPOINTS.NOTIFICATIONS.THREAD_MESSAGES(threadId),
        {
          method: 'POST',
          headers,
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw {
          message: errorData.detail || errorData.message || 'Request failed',
          status: response.status,
          data: errorData,
        };
      }

      return await response.json();
    } else {
      // Use JSON for text-only messages
      return apiRequest<Message>(
        API_ENDPOINTS.NOTIFICATIONS.THREAD_MESSAGES(threadId),
        {
          method: 'POST',
          body: JSON.stringify({ body: data.body }),
        }
      );
    }
  },
};
