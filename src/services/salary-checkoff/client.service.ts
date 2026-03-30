/**
 * Client Service for Salary Check-Off System
 * Handles existing client imports, bulk uploads, and approvals
 */

import { apiRequest, API_ENDPOINTS } from './api';
import { PaginatedResponse } from './loan.service';

export interface ExistingClient {
  id: string;
  full_name: string;
  national_id: string;
  mobile: string;
  email?: string;
  employer: {
    id: string;
    name: string;
  };
  employee_id?: string;
  loan_amount: string;
  interest_rate: string;
  start_date: string;
  repayment_period: number;
  disbursement_date: string;
  disbursement_method: 'mpesa' | 'bank' | 'cash';
  amount_paid: string;
  total_due: string;
  monthly_deduction: string;
  outstanding_balance: string;
  loan_status: 'Active' | 'Fully Paid' | 'Defaulted' | 'Restructured';
  approval_status: 'pending' | 'approved' | 'rejected';
  entered_by?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateClientRequest {
  full_name: string;
  national_id: string;
  mobile: string;
  email?: string;
  employer_id: string;
  employee_id?: string;
  loan_amount: number;
  interest_rate: number;
  start_date: string;
  repayment_period: number;
  disbursement_date: string;
  disbursement_method: 'mpesa' | 'bank' | 'cash';
  amount_paid?: number;
  loan_status?: 'Active' | 'Fully Paid' | 'Defaulted' | 'Restructured';
}

export interface BulkUploadValidationRow {
  row_number: number;
  name: string;
  national_id: string;
  mobile: string;
  employer: string;
  loan_amount: number;
  status: 'valid' | 'warning' | 'error';
  issue?: string;
}

export interface BulkUploadResponse {
  total_rows: number;
  valid_rows: number;
  invalid_rows: number;
  preview: BulkUploadValidationRow[];
}

export interface ApproveClientRequest {
  comment?: string;
}

export interface BulkApproveRequest {
  client_ids: string[];
  comment?: string;
}

export const clientService = {
  /**
   * Create manual existing client entry
   */
  createManualClient: async (
    data: CreateClientRequest
  ): Promise<ExistingClient> => {
    return apiRequest<ExistingClient>(API_ENDPOINTS.CLIENTS.MANUAL_CREATE, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Upload bulk client data file
   */
  bulkUploadClients: async (file: File): Promise<BulkUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('salary_checkoff_access_token');

    const response = await fetch(API_ENDPOINTS.CLIENTS.BULK_UPLOAD, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw {
        message: errorData.detail || errorData.message || 'Upload failed',
        status: response.status,
        data: errorData,
      };
    }

    return await response.json();
  },

  /**
   * Validate bulk upload data before import
   */
  validateBulkData: async (file: File): Promise<BulkUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('salary_checkoff_access_token');

    const response = await fetch(API_ENDPOINTS.CLIENTS.VALIDATE_BULK, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw {
        message: errorData.detail || errorData.message || 'Validation failed',
        status: response.status,
        data: errorData,
      };
    }

    return await response.json();
  },

  /**
   * Download Excel template for bulk upload
   */
  downloadTemplate: async (): Promise<Blob> => {
    const token = localStorage.getItem('salary_checkoff_access_token');

    const response = await fetch(API_ENDPOINTS.CLIENTS.UPLOAD_TEMPLATE, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Template download failed');
    }

    return await response.blob();
  },

  /**
   * List pending client approvals
   */
  listPendingClients: async (
    page?: number
  ): Promise<PaginatedResponse<ExistingClient>> => {
    const params = new URLSearchParams();
    if (page) params.append('page', page.toString());

    const url = `${API_ENDPOINTS.CLIENTS.PENDING_LIST}?${params.toString()}`;

    return apiRequest<PaginatedResponse<ExistingClient>>(url, {
      method: 'GET',
    });
  },

  /**
   * Get client details
   */
  getClientDetail: async (id: string): Promise<ExistingClient> => {
    return apiRequest<ExistingClient>(API_ENDPOINTS.CLIENTS.CLIENT_DETAIL(id), {
      method: 'GET',
    });
  },

  /**
   * Approve client record
   */
  approveClient: async (
    id: string,
    data?: ApproveClientRequest
  ): Promise<{ detail: string; client: ExistingClient }> => {
    return apiRequest<{ detail: string; client: ExistingClient }>(
      API_ENDPOINTS.CLIENTS.APPROVE_CLIENT(id),
      {
        method: 'POST',
        body: JSON.stringify(data || {}),
      }
    );
  },

  /**
   * Reject client record
   */
  rejectClient: async (
    id: string,
    data?: ApproveClientRequest
  ): Promise<{ detail: string; client: ExistingClient }> => {
    return apiRequest<{ detail: string; client: ExistingClient }>(
      API_ENDPOINTS.CLIENTS.REJECT_CLIENT(id),
      {
        method: 'POST',
        body: JSON.stringify(data || {}),
      }
    );
  },

  /**
   * Bulk approve client records
   */
  bulkApproveClients: async (data: BulkApproveRequest): Promise<{
    detail: string;
    processed_count: number;
    failed_count: number;
    processed: string[];
    failed: Array<{ id: string; error: string }>;
  }> => {
    return apiRequest(API_ENDPOINTS.CLIENTS.BULK_APPROVE, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Download collection/deduction report
   */
  downloadCollectionReport: async (params: {
    employer_id?: string;
    month?: number;
    year?: number;
  }): Promise<Blob> => {
    const token = localStorage.getItem('salary_checkoff_access_token');

    const queryParams = new URLSearchParams();
    if (params.employer_id) queryParams.append('employer_id', params.employer_id);
    if (params.month) queryParams.append('month', params.month.toString());
    if (params.year) queryParams.append('year', params.year.toString());

    const url = `${API_ENDPOINTS.CLIENTS.COLLECTION_REPORT}?${queryParams.toString()}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw {
        message: errorData.error || errorData.detail || 'Failed to download report',
        status: response.status,
        data: errorData,
      };
    }

    return await response.blob();
  },

  /**
   * Fetch collection report data as JSON for preview
   */
  getCollectionReportData: async (params: {
    employer_id?: string;
    month?: number;
    year?: number;
  }): Promise<CollectionReportData> => {
    const queryParams = new URLSearchParams();
    if (params.employer_id) queryParams.append('employer_id', params.employer_id);
    if (params.month) queryParams.append('month', params.month.toString());
    if (params.year) queryParams.append('year', params.year.toString());

    const url = `${API_ENDPOINTS.CLIENTS.COLLECTION_REPORT_DATA}?${queryParams.toString()}`;

    return apiRequest<CollectionReportData>(url, {
      method: 'GET',
    });
  },
};

export interface CollectionReportItem {
  id: string;
  full_name: string;
  loan_amount: string;
  monthly_deduction: string;
  outstanding_balance: string;
}

export interface CollectionReportData {
  employer_name: string;
  period: string;
  items: CollectionReportItem[];
  total_amount_borrowed: string;
  total_installment_due: string;
}
