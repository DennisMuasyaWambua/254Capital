/**
 * Base API configuration for Salary Check-Off System
 */

const API_BASE_URL = import.meta.env.VITE_SALARY_CHECKOFF_API_URL || 'http://localhost:8000';

export const API_ENDPOINTS = {
  // Authentication endpoints
  AUTH: {
    SEND_OTP: `${API_BASE_URL}/api/v1/auth/otp/send/`,
    VERIFY_OTP: `${API_BASE_URL}/api/v1/auth/otp/verify/`,
    REGISTER: `${API_BASE_URL}/api/v1/auth/register/`,
    TOKEN_REFRESH: `${API_BASE_URL}/api/v1/auth/token/refresh/`,
    HR_LOGIN: `${API_BASE_URL}/api/v1/auth/hr/login/`,
    ADMIN_LOGIN: `${API_BASE_URL}/api/v1/auth/admin/login/`,
    ADMIN_VERIFY_2FA: `${API_BASE_URL}/api/v1/auth/admin/verify-2fa/`,
    PROFILE: `${API_BASE_URL}/api/v1/auth/profile/`,
  },

  // Loan endpoints
  LOANS: {
    APPLICATIONS: `${API_BASE_URL}/api/v1/loans/applications/`,
    APPLICATION_DETAIL: (id: string) => `${API_BASE_URL}/api/v1/loans/applications/${id}/`,
    CALCULATOR: `${API_BASE_URL}/api/v1/loans/calculator/`,

    // HR endpoints
    HR_PENDING: `${API_BASE_URL}/api/v1/loans/hr/pending/`,
    HR_ALL: `${API_BASE_URL}/api/v1/loans/hr/all/`,
    HR_REVIEW: (id: string) => `${API_BASE_URL}/api/v1/loans/hr/${id}/review/`,
    HR_BATCH_APPROVAL: `${API_BASE_URL}/api/v1/loans/hr/batch-approval/`,

    // Admin endpoints
    ADMIN_QUEUE: `${API_BASE_URL}/api/v1/loans/admin/queue/`,
    ADMIN_ASSESS: (id: string) => `${API_BASE_URL}/api/v1/loans/admin/${id}/assess/`,
    ADMIN_DISBURSE: (id: string) => `${API_BASE_URL}/api/v1/loans/admin/${id}/disburse/`,
  },

  // Employer endpoints
  EMPLOYERS: {
    LIST: `${API_BASE_URL}/api/v1/employers/`,
    DETAIL: (id: string) => `${API_BASE_URL}/api/v1/employers/${id}/`,
  },

  // Document endpoints
  DOCUMENTS: {
    UPLOAD: `${API_BASE_URL}/api/v1/documents/upload/`,
    LIST: `${API_BASE_URL}/api/v1/documents/`,
    DETAIL: (id: string) => `${API_BASE_URL}/api/v1/documents/${id}/`,
    VERIFY: (id: string) => `${API_BASE_URL}/api/v1/documents/${id}/verify/`,
  },

  // Notification endpoints
  NOTIFICATIONS: {
    LIST: `${API_BASE_URL}/api/v1/notifications/`,
    MARK_READ: (id: string) => `${API_BASE_URL}/api/v1/notifications/${id}/mark-read/`,
    MARK_ALL_READ: `${API_BASE_URL}/api/v1/notifications/mark-all-read/`,
  },

  // Reconciliation endpoints
  RECONCILIATION: {
    LIST: `${API_BASE_URL}/api/v1/reconciliation/`,
    DETAIL: (id: string) => `${API_BASE_URL}/api/v1/reconciliation/${id}/`,
    UPLOAD: `${API_BASE_URL}/api/v1/reconciliation/upload/`,
  },

  // Export endpoints
  EXPORTS: {
    SCHEDULE: `${API_BASE_URL}/api/v1/exports/schedule/`,
    DEDUCTION_LIST: `${API_BASE_URL}/api/v1/exports/deduction-list/`,
  },
};

/**
 * API error handler
 */
export interface ApiError {
  message: string;
  status?: number;
  data?: any;
}

/**
 * Generic API request wrapper
 */
export async function apiRequest<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('salary_checkoff_access_token');

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw {
        message: errorData.detail || errorData.message || 'Request failed',
        status: response.status,
        data: errorData,
      } as ApiError;
    }

    // Handle empty responses (204 No Content)
    if (response.status === 204) {
      return {} as T;
    }

    return await response.json();
  } catch (error: any) {
    if (error.status) {
      throw error;
    }

    throw {
      message: error.message || 'Network error',
      status: 0,
    } as ApiError;
  }
}

/**
 * Token management
 */
export const tokenManager = {
  getAccessToken: () => localStorage.getItem('salary_checkoff_access_token'),
  getRefreshToken: () => localStorage.getItem('salary_checkoff_refresh_token'),

  setTokens: (accessToken: string, refreshToken: string) => {
    localStorage.setItem('salary_checkoff_access_token', accessToken);
    localStorage.setItem('salary_checkoff_refresh_token', refreshToken);
  },

  clearTokens: () => {
    localStorage.removeItem('salary_checkoff_access_token');
    localStorage.removeItem('salary_checkoff_refresh_token');
  },

  refreshAccessToken: async (): Promise<string> => {
    const refreshToken = tokenManager.getRefreshToken();

    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch(API_ENDPOINTS.AUTH.TOKEN_REFRESH, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!response.ok) {
      tokenManager.clearTokens();
      throw new Error('Token refresh failed');
    }

    const data = await response.json();
    localStorage.setItem('salary_checkoff_access_token', data.access);

    return data.access;
  },
};
