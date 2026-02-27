/**
 * Export Service for Salary Check-Off System
 */

import { API_ENDPOINTS, tokenManager } from './api';

export interface DeductionExportFilters {
  month?: number;
  year?: number;
  employer_id?: string;
}

export interface LoanBookReportFilters {
  search?: string;
}

export interface EmployerSummaryFilters {
  employer_id?: string;
}

export interface CollectionSheetFilters {
  month?: number;
  year?: number;
  employer_id?: string;
}

export interface LoanBookReportData {
  total_loans: number;
  total_disbursed_amount: string;
  total_outstanding: string;
  total_collected: string;
  loans: Array<{
    application_number: string;
    employee_name: string;
    employer_name: string;
    principal_amount: string;
    total_repayment: string;
    outstanding_balance: string;
    status: string;
    disbursement_date: string;
  }>;
}

export interface EmployerSummaryData {
  employer_name: string;
  total_employees: number;
  active_loans: number;
  total_disbursed: string;
  monthly_deduction: string;
  collection_rate: string;
}

export interface CollectionSheetData {
  period: string;
  employer: string;
  total_expected: string;
  total_collected: string;
  collection_rate: string;
  deductions: Array<{
    employee_name: string;
    employee_id: string;
    loan_number: string;
    amount: string;
    status: string;
  }>;
}

export const exportService = {
  /**
   * Export deduction list as Excel (HR/Admin)
   */
  exportDeductions: async (filters?: DeductionExportFilters): Promise<Blob> => {
    const params = new URLSearchParams();
    if (filters?.month) params.append('month', filters.month.toString());
    if (filters?.year) params.append('year', filters.year.toString());
    if (filters?.employer_id) params.append('employer_id', filters.employer_id);

    const url = `${API_ENDPOINTS.EXPORTS.DEDUCTIONS}?${params.toString()}`;

    const token = tokenManager.getAccessToken();
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw {
        message: errorData.detail || errorData.message || 'Export failed',
        status: response.status,
        data: errorData,
      };
    }

    return await response.blob();
  },

  /**
   * Generate repayment schedule PDF
   */
  generateRepaymentPDF: async (applicationId: string): Promise<Blob> => {
    const token = tokenManager.getAccessToken();
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(
      API_ENDPOINTS.EXPORTS.REPAYMENT_PDF(applicationId),
      {
        method: 'GET',
        headers,
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw {
        message: errorData.detail || errorData.message || 'PDF generation failed',
        status: response.status,
        data: errorData,
      };
    }

    return await response.blob();
  },

  /**
   * Get loan book report data (Admin)
   */
  getLoanBookReport: async (
    filters?: LoanBookReportFilters
  ): Promise<LoanBookReportData> => {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);

    const url = `${API_ENDPOINTS.EXPORTS.LOAN_BOOK_REPORT}?${params.toString()}`;

    const token = tokenManager.getAccessToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
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
   * Get employer summary report (Admin)
   */
  getEmployerSummary: async (
    filters?: EmployerSummaryFilters
  ): Promise<EmployerSummaryData[]> => {
    const params = new URLSearchParams();
    if (filters?.employer_id) params.append('employer_id', filters.employer_id);

    const url = `${API_ENDPOINTS.EXPORTS.EMPLOYER_SUMMARY}?${params.toString()}`;

    const token = tokenManager.getAccessToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
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
   * Get collection sheet report (HR/Admin)
   */
  getCollectionSheet: async (
    filters?: CollectionSheetFilters
  ): Promise<CollectionSheetData> => {
    const params = new URLSearchParams();
    if (filters?.month) params.append('month', filters.month.toString());
    if (filters?.year) params.append('year', filters.year.toString());
    if (filters?.employer_id) params.append('employer_id', filters.employer_id);

    const url = `${API_ENDPOINTS.EXPORTS.COLLECTION_SHEET}?${params.toString()}`;

    const token = tokenManager.getAccessToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
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
   * Download file helper
   */
  downloadFile: (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};
