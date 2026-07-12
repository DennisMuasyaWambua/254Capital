/**
 * Base API configuration for Salary Check-Off System
 */

export const API_BASE_URL = import.meta.env.VITE_SALARY_CHECKOFF_API_URL || 'http://localhost:8000';

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
    CHANGE_PASSWORD: `${API_BASE_URL}/api/v1/auth/change-password/`,
    PASSWORD_RESET_REQUEST: `${API_BASE_URL}/api/v1/auth/password-reset/request/`,
    PASSWORD_RESET_CONFIRM: `${API_BASE_URL}/api/v1/auth/password-reset/confirm/`,
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
    ADMIN_UPDATE: (id: string) => `${API_BASE_URL}/api/v1/loans/${id}/`,
    ADMIN_DELETE: (id: string) => `${API_BASE_URL}/api/v1/loans/${id}/`,
    ADMIN_DELETE_CHECK: (id: string) => `${API_BASE_URL}/api/v1/loans/${id}/delete-check/`,

    // Repayment endpoints
    REPAYMENTS: (loanId: string) => `${API_BASE_URL}/api/v1/loans/${loanId}/repayments/`,
    MANUAL_REPAYMENT: (loanId: string) => `${API_BASE_URL}/api/v1/loans/${loanId}/repayments/manual/`,
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
    EMPLOYER_DOCUMENTS: (employerId: string) =>
      `${API_BASE_URL}/api/v1/documents/employer/${employerId}/`,
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
    VALIDATE_BULK: `${API_BASE_URL}/api/v1/clients/validate/`,
    UPLOAD_TEMPLATE: `${API_BASE_URL}/api/v1/clients/template-download/`,
    PENDING_LIST: `${API_BASE_URL}/api/v1/clients/pending/`,
    CLIENT_DETAIL: (id: string) => `${API_BASE_URL}/api/v1/clients/${id}/`,
    UPDATE_CLIENT: (id: string) => `${API_BASE_URL}/api/v1/clients/${id}/`,
    DELETE_CLIENT: (id: string) => `${API_BASE_URL}/api/v1/clients/${id}/`,
    DELETE_CHECK: (id: string) => `${API_BASE_URL}/api/v1/clients/${id}/delete-check/`,
    APPROVE_CLIENT: (id: string) => `${API_BASE_URL}/api/v1/clients/${id}/approve/`,
    REJECT_CLIENT: (id: string) => `${API_BASE_URL}/api/v1/clients/${id}/reject/`,
    BULK_APPROVE: `${API_BASE_URL}/api/v1/clients/bulk-approve/`,
    COLLECTION_REPORT: `${API_BASE_URL}/api/v1/clients/collection-report/`,
    COLLECTION_REPORT_DATA: `${API_BASE_URL}/api/v1/clients/collection-report-data/`,
  },

  // Payment management endpoints
  PAYMENTS: {
    RECORD: `${API_BASE_URL}/api/v1/payments/record/`,
    CALCULATE_DISCOUNT: `${API_BASE_URL}/api/v1/payments/calculate-discount/`,
  },

  // Repayment management endpoints (Admin only)
  REPAYMENTS: {
    UPDATE: (id: string) => `${API_BASE_URL}/api/v1/repayments/${id}/`,
    DELETE: (id: string) => `${API_BASE_URL}/api/v1/repayments/${id}/`,
  },

  // HR User Management endpoints (Admin only)
  HR_USERS: {
    LIST: `${API_BASE_URL}/api/v1/auth/users/hr/`,
    CREATE: `${API_BASE_URL}/api/v1/auth/users/hr/create/`,
    DETAIL: (id: string) => `${API_BASE_URL}/api/v1/auth/users/hr/${id}/`,
    UPDATE: (id: string) => `${API_BASE_URL}/api/v1/auth/users/hr/${id}/update/`,
    TOGGLE_ACTIVE: (id: string) => `${API_BASE_URL}/api/v1/auth/users/hr/${id}/toggle-active/`,
    DELETE: (id: string) => `${API_BASE_URL}/api/v1/auth/users/hr/${id}/delete/`,
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
 * Generic API request wrapper.
 * On a 401 (expired access token) it refreshes the token once and retries the
 * request. If the refresh itself fails the session is over: tokens are cleared
 * and a 'salary-checkoff:session-expired' event is dispatched so the app can
 * return the user to the login page.
 */
export async function apiRequest<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const doFetch = (token: string | null) => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return fetch(url, {
      ...options,
      headers,
    });
  };

  try {
    let response = await doFetch(tokenManager.getAccessToken());

    if (response.status === 401 && tokenManager.getRefreshToken()) {
      let newToken: string;
      try {
        newToken = await tokenManager.refreshAccessToken();
      } catch {
        window.dispatchEvent(new Event('salary-checkoff:session-expired'));
        throw {
          message: 'Your session has expired. Please log in again.',
          status: 401,
        } as ApiError;
      }
      response = await doFetch(newToken);
    }

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
// Single in-flight refresh shared across concurrent 401s. The backend rotates
// and blacklists refresh tokens, so two parallel refresh calls with the same
// token would invalidate the session.
let refreshPromise: Promise<string> | null = null;

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

  refreshAccessToken: (): Promise<string> => {
    if (refreshPromise) {
      return refreshPromise;
    }

    refreshPromise = (async () => {
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
      // The backend rotates refresh tokens; keep the new one or the next
      // refresh will fail against the blacklist.
      if (data.refresh) {
        localStorage.setItem('salary_checkoff_refresh_token', data.refresh);
      }

      return data.access;
    })();

    return refreshPromise.finally(() => {
      refreshPromise = null;
    });
  },
};
