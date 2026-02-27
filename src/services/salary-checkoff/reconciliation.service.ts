/**
 * Reconciliation Service for Salary Check-Off System
 */

import { apiRequest, API_ENDPOINTS, tokenManager } from './api';

export interface Remittance {
  id: string;
  employer: {
    id: string;
    name: string;
  };
  submitted_by: {
    id: string;
    first_name: string;
    last_name: string;
  };
  period_month: number;
  period_year: number;
  period_display: string;
  total_amount: string;
  proof_document: string;
  status: 'pending' | 'confirmed' | 'disputed';
  confirmed_by: string | null;
  confirmed_at: string | null;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface CreateRemittanceRequest {
  period_month: number;
  period_year: number;
  total_amount: number;
  proof_document: File;
  notes?: string;
}

export interface ConfirmRemittanceRequest {
  action: 'confirm' | 'dispute';
  notes?: string;
}

export interface ReconciliationRecord {
  id: string;
  remittance: string;
  loan_application: {
    id: string;
    application_number: string;
    employee: {
      first_name: string;
      last_name: string;
    };
  };
  expected_amount: string;
  received_amount: string;
  is_matched: boolean;
  variance: string;
  variance_percentage: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface RunReconciliationRequest {
  remittance_id: string;
}

export interface ReconciliationResult {
  detail: string;
  remittance_id: string;
  total_records: number;
  matched_count: number;
  unmatched_count: number;
  total_variance: string;
}

export interface UpdateRecordRequest {
  received_amount?: number;
  is_matched?: boolean;
  notes?: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  page: number;
  total_pages: number;
  results: T[];
}

export const reconciliationService = {
  // ===== REMITTANCE ENDPOINTS =====

  /**
   * List remittances
   */
  listRemittances: async (filters?: {
    status?: 'pending' | 'confirmed' | 'disputed';
    employer?: string;
    page?: number;
  }): Promise<PaginatedResponse<Remittance>> => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.employer) params.append('employer', filters.employer);
    if (filters?.page) params.append('page', filters.page.toString());

    const url = `${API_ENDPOINTS.RECONCILIATION.REMITTANCES}?${params.toString()}`;

    return apiRequest<PaginatedResponse<Remittance>>(url, {
      method: 'GET',
    });
  },

  /**
   * Submit remittance (HR only)
   */
  createRemittance: async (
    data: CreateRemittanceRequest
  ): Promise<Remittance> => {
    const formData = new FormData();
    formData.append('period_month', data.period_month.toString());
    formData.append('period_year', data.period_year.toString());
    formData.append('total_amount', data.total_amount.toString());
    formData.append('proof_document', data.proof_document);
    if (data.notes) {
      formData.append('notes', data.notes);
    }

    const token = tokenManager.getAccessToken();
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(API_ENDPOINTS.RECONCILIATION.REMITTANCE_CREATE, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw {
        message: errorData.detail || errorData.message || 'Request failed',
        status: response.status,
        data: errorData,
      };
    }

    return await response.json();
  },

  /**
   * Get remittance details with records
   */
  getRemittance: async (id: string): Promise<Remittance> => {
    return apiRequest<Remittance>(
      API_ENDPOINTS.RECONCILIATION.REMITTANCE_DETAIL(id),
      {
        method: 'GET',
      }
    );
  },

  /**
   * Confirm or dispute remittance (Admin only)
   */
  confirmRemittance: async (
    id: string,
    data: ConfirmRemittanceRequest
  ): Promise<{ detail: string; remittance: Remittance }> => {
    return apiRequest<{ detail: string; remittance: Remittance }>(
      API_ENDPOINTS.RECONCILIATION.REMITTANCE_CONFIRM(id),
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  },

  // ===== RECONCILIATION ENDPOINTS =====

  /**
   * Run reconciliation algorithm (Admin only)
   */
  runReconciliation: async (
    data: RunReconciliationRequest
  ): Promise<ReconciliationResult> => {
    return apiRequest<ReconciliationResult>(
      API_ENDPOINTS.RECONCILIATION.RECONCILE_RUN,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  },

  /**
   * List reconciliation records
   */
  listRecords: async (filters?: {
    is_matched?: boolean;
    remittance?: string;
    page?: number;
  }): Promise<PaginatedResponse<ReconciliationRecord>> => {
    const params = new URLSearchParams();
    if (filters?.is_matched !== undefined) {
      params.append('is_matched', filters.is_matched.toString());
    }
    if (filters?.remittance) params.append('remittance', filters.remittance);
    if (filters?.page) params.append('page', filters.page.toString());

    const url = `${API_ENDPOINTS.RECONCILIATION.RECORDS}?${params.toString()}`;

    return apiRequest<PaginatedResponse<ReconciliationRecord>>(url, {
      method: 'GET',
    });
  },

  /**
   * Update reconciliation record (Admin only)
   */
  updateRecord: async (
    id: string,
    data: UpdateRecordRequest
  ): Promise<ReconciliationRecord> => {
    return apiRequest<ReconciliationRecord>(
      API_ENDPOINTS.RECONCILIATION.RECORD_UPDATE(id),
      {
        method: 'PATCH',
        body: JSON.stringify(data),
      }
    );
  },
};
