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
    VERIFY_LOGIN_OTP: `${API_BASE_URL}/api/v1/auth/verify-login-otp/`,
    ADMIN_VERIFY_2FA: `${API_BASE_URL}/api/v1/auth/admin/verify-2fa/`,
    PROFILE: `${API_BASE_URL}/api/v1/auth/profile/`,
  },

  // Loan endpoints
  LOANS: {
    APPLICATIONS: `${API_BASE_URL}/api/v1/loans/applications/`,
    APPLICATION_DETAIL: (id: string) => `${API_BASE_URL}/api/v1/loans/applications/${id}/`,
    CALCULATOR: `${API_BASE_URL}/api/v1/loans/calculator/`,
    SEARCH: `${API_BASE_URL}/api/v1/loans/search/`,

    // HR endpoints
    HR_PENDING: `${API_BASE_URL}/api/v1/loans/hr/pending/`,
    HR_ALL: `${API_BASE_URL}/api/v1/loans/hr/all/`,
    HR_DASHBOARD_STATS: `${API_BASE_URL}/api/v1/loans/hr/dashboard-stats/`,
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
    CREATE: `${API_BASE_URL}/api/v1/employers/create/`,
    DETAIL: (id: string) => `${API_BASE_URL}/api/v1/employers/${id}/`,
  },

  // Document endpoints
  DOCUMENTS: {
    UPLOAD: `${API_BASE_URL}/api/v1/documents/upload/`,
    LIST: `${API_BASE_URL}/api/v1/documents/`,
    DETAIL: (id: string) => `${API_BASE_URL}/api/v1/documents/${id}/`,
    APPLICATION_DOCUMENTS: (applicationId: string) =>
      `${API_BASE_URL}/api/v1/documents/application/${applicationId}/`,
  },

  // Notification endpoints
  NOTIFICATIONS: {
    LIST: `${API_BASE_URL}/api/v1/notifications/`,
    UNREAD_COUNT: `${API_BASE_URL}/api/v1/notifications/unread-count/`,
    MARK_READ: (id: string) => `${API_BASE_URL}/api/v1/notifications/${id}/read/`,
    MARK_ALL_READ: `${API_BASE_URL}/api/v1/notifications/mark-all-read/`,

    // Message thread endpoints
    THREADS: `${API_BASE_URL}/api/v1/notifications/threads/`,
    THREAD_MESSAGES: (threadId: string) =>
      `${API_BASE_URL}/api/v1/notifications/threads/${threadId}/messages/`,
  },

  // Reconciliation endpoints
  RECONCILIATION: {
    // Remittance endpoints
    REMITTANCES: `${API_BASE_URL}/api/v1/reconciliation/remittances/`,
    REMITTANCE_CREATE: `${API_BASE_URL}/api/v1/reconciliation/remittances/create/`,
    REMITTANCE_DETAIL: (id: string) => `${API_BASE_URL}/api/v1/reconciliation/remittances/${id}/`,
    REMITTANCE_CONFIRM: (id: string) => `${API_BASE_URL}/api/v1/reconciliation/remittances/${id}/confirm/`,

    // Reconciliation endpoints
    RECONCILE_RUN: `${API_BASE_URL}/api/v1/reconciliation/reconcile/`,
    RECORDS: `${API_BASE_URL}/api/v1/reconciliation/records/`,
    RECORD_UPDATE: (id: string) => `${API_BASE_URL}/api/v1/reconciliation/records/${id}/`,
  },

  // Export endpoints
  EXPORTS: {
    DEDUCTIONS: `${API_BASE_URL}/api/v1/exports/deductions/`,
    REPAYMENT_PDF: (applicationId: string) =>
      `${API_BASE_URL}/api/v1/exports/repayment-pdf/${applicationId}/`,
    LOAN_BOOK_REPORT: `${API_BASE_URL}/api/v1/exports/reports/loan-book/`,
    EMPLOYER_SUMMARY: `${API_BASE_URL}/api/v1/exports/reports/employer-summary/`,
    COLLECTION_SHEET: `${API_BASE_URL}/api/v1/exports/reports/collection-sheet/`,
  },

  // Client management endpoints
  CLIENTS: {
    LIST: `${API_BASE_URL}/api/v1/clients/`,
    MANUAL_CREATE: `${API_BASE_URL}/api/v1/clients/manual/`,
    BULK_UPLOAD: `${API_BASE_URL}/api/v1/clients/bulk-upload/`,
    VALIDATE_BULK: `${API_BASE_URL}/api/v1/clients/validate-upload/`,
    UPLOAD_TEMPLATE: `${API_BASE_URL}/api/v1/clients/template-download/`,
    PENDING_LIST: `${API_BASE_URL}/api/v1/clients/pending/`,
    CLIENT_DETAIL: (id: string) => `${API_BASE_URL}/api/v1/clients/${id}/`,
    APPROVE_CLIENT: (id: string) => `${API_BASE_URL}/api/v1/clients/${id}/approve/`,
    REJECT_CLIENT: (id: string) => `${API_BASE_URL}/api/v1/clients/${id}/reject/`,
    BULK_APPROVE: `${API_BASE_URL}/api/v1/clients/bulk-approve/`,
  },

  // Payment management endpoints
  PAYMENTS: {
    RECORD: `${API_BASE_URL}/api/v1/payments/record/`,
    CALCULATE_DISCOUNT: `${API_BASE_URL}/api/v1/payments/calculate-discount/`,
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
 * Public API request wrapper (no authentication required)
 */
export async function publicApiRequest<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

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
