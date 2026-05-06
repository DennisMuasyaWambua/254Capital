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
  employer: string; // Employer UUID
  employer_name: string;
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
  employer: string;
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
   * List all existing clients
   */
  listClients: async (
    filters?: {
      search?: string;
      status?: string;
      page?: number;
    }
  ): Promise<PaginatedResponse<ExistingClient>> => {
    const params = new URLSearchParams();

    if (filters?.search) params.append('search', filters.search);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.page) params.append('page', filters.page.toString());

    const url = `${API_ENDPOINTS.CLIENTS.LIST}?${params.toString()}`;

    return apiRequest<PaginatedResponse<ExistingClient>>(url, {
      method: 'GET',
    });
  },

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
   * Alias for createManualClient
   */
  createClient: async (
    data: CreateClientRequest
  ): Promise<ExistingClient> => {
    return clientService.createManualClient(data);
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
   * Alias for validateBulkData
   */
  validateBulkUpload: async (file: File): Promise<BulkUploadResponse> => {
    return clientService.validateBulkData(file);
  },

  /**
   * Download Excel template for bulk upload
   */
  downloadTemplate: async (): Promise<void> => {
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

    const blob = await response.blob();

    // Get filename from Content-Disposition header or use default
    const contentDisposition = response.headers.get('Content-Disposition');
    let filename = 'existing_clients_template.xlsx';

    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1].replace(/['"]/g, '');
      }
    }

    // Create a blob URL and trigger download
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
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

    console.log('Downloading collection report with params:', params);
    console.log('Collection report URL:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log('Collection report response status:', response.status);
    console.log('Collection report response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      let errorData: any = {};

      if (contentType && contentType.includes('application/json')) {
        errorData = await response.json().catch(() => ({}));
      } else {
        const text = await response.text().catch(() => '');
        errorData = { detail: text || 'Failed to download report' };
      }

      console.error('Collection report download failed:', {
        status: response.status,
        errorData,
        params
      });

      throw {
        message: errorData.error || errorData.detail || 'Failed to download report',
        status: response.status,
        data: errorData,
      };
    }

    const blob = await response.blob();
    console.log('Collection report downloaded successfully, size:', blob.size);
    return blob;
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

    console.log('Fetching collection report data with params:', params);
    console.log('Collection report data URL:', url);

    try {
      const data = await apiRequest<CollectionReportData>(url, {
        method: 'GET',
      });
      console.log('Collection report data fetched successfully:', data);
      return data;
    } catch (error: any) {
      console.error('Collection report data fetch failed:', {
        error,
        params,
        url
      });
      throw error;
    }
  },

  /**
   * Update client record (Admin only)
   */
  updateClient: async (
    id: string,
    data: UpdateClientRequest
  ): Promise<{ detail: string; client: ExistingClient; modification_logged: boolean }> => {
    return apiRequest(API_ENDPOINTS.CLIENTS.UPDATE_CLIENT(id), {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  /**
   * Check if client can be deleted (Admin only)
   */
  deleteCheck: async (id: string): Promise<DeleteCheckResponse> => {
    return apiRequest<DeleteCheckResponse>(API_ENDPOINTS.CLIENTS.DELETE_CHECK(id), {
      method: 'GET',
    });
  },

  /**
   * Delete client record (Admin only)
   */
  deleteClient: async (
    id: string,
    data: DeleteClientRequest
  ): Promise<{
    detail: string;
    deleted: {
      client_id: string;
      client_name: string;
      loans_deleted: number;
      repayments_deleted: number;
    };
    archived: boolean;
    archived_at: string;
  }> => {
    return apiRequest(API_ENDPOINTS.CLIENTS.DELETE_CLIENT(id), {
      method: 'DELETE',
      body: JSON.stringify(data),
    });
  },
};

export interface CollectionReportItem {
  id: string;
  full_name: string;
  loan_amount: string;
  monthly_deduction: string;
  outstanding_balance: string;
  disbursement_date: string;
  repayment_period: number;
}

export interface CollectionReportData {
  employer_name: string;
  period: string;
  items: CollectionReportItem[];
  total_amount_borrowed: string;
  total_installment_due: string;
}

export interface UpdateClientRequest {
  full_name?: string;
  national_id?: string;
  mobile?: string;
  email?: string;
  employer?: string;
  employee_id?: string;
  loan_amount?: number;
  interest_rate?: number;
  repayment_period?: number;
  disbursement_date?: string;
  disbursement_method?: 'mpesa' | 'bank' | 'cash';
  amount_paid?: number;
  loan_status?: 'Active' | 'Fully Paid' | 'Defaulted' | 'Restructured';
  admin_notes?: string;
}

export interface DeleteCheckResponse {
  can_delete: boolean;
  client: {
    id: string;
    full_name: string;
    employer_name: string;
  };
  associated_data: {
    total_loans: number;
    active_loans: number;
    closed_loans: number;
    total_repayments: number;
  };
  loans: Array<{
    id: string;
    loan_amount: string;
    status: string;
    outstanding_balance: string;
  }>;
  warning: string;
}

export interface DeleteClientRequest {
  confirm: boolean;
  reason: string;
}
