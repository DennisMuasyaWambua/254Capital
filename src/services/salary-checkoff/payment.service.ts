/**
 * Payment Service for Salary Check-Off System
 * Handles manual payment recording and early payment discounts
 */

import { apiRequest, API_ENDPOINTS } from './api';

export interface LoanSearchResult {
  id: string;
  loan_number: string;
  employee_name: string;
  employee_id: string;
  employer_name: string;
  employer_id: string;
  original_amount: number;
  total_due: number;
  amount_paid: number;
  outstanding_balance: number;
  start_date: string;
  disbursement_date: string;
  repayment_period: number;
  monthly_deduction: number;
  interest_rate: number;
  status: string;
}

export interface RecordPaymentRequest {
  payment_date: string;
  amount_received: number;
  payment_method: 'mpesa' | 'bank' | 'cash' | 'cheque';
  reference_number?: string;
  notes?: string;
  apply_early_payment_discount?: boolean;
}

export interface PaymentRecordResponse {
  detail: string;
  payment_id: string;
  new_balance: number;
  loan_status: string;
}

export interface EarlyPaymentDiscountCalculation {
  actual_months: number;
  original_interest: number;
  adjusted_interest: number;
  discount_amount: number;
  new_total_due: number;
  new_outstanding: number;
}

export interface MonthlyReconciliationData {
  employee_name: string;
  employee_id: string;
  employer_name: string;
  expected_amount: number;
  actual_amount: number;
  outstanding_amount: number;
  status: 'Paid' | 'Partial' | 'Missed' | 'Overpaid';
  payment_date?: string;
  payment_method?: string;
  loan_id: string;
}

export interface MonthlyReconciliationSummary {
  expected_collections: number;
  actual_collections: number;
  outstanding: number;
  collection_rate: number;
  trend?: number;
}

export interface ReconciliationFilters {
  month: number;
  year: number;
  employer_id?: string;
}

export const paymentService = {
  /**
   * Search for loans by employee name, ID, or mobile
   */
  searchLoans: async (query: string): Promise<LoanSearchResult[]> => {
    const params = new URLSearchParams();
    params.append('q', query);

    const url = `${API_ENDPOINTS.LOANS.SEARCH}?${params.toString()}`;

    return apiRequest<LoanSearchResult[]>(url, {
      method: 'GET',
    });
  },

  /**
   * Get detailed loan information
   */
  getLoanDetail: async (id: string): Promise<LoanSearchResult> => {
    return apiRequest<LoanSearchResult>(API_ENDPOINTS.LOANS.APPLICATION_DETAIL(id), {
      method: 'GET',
    });
  },

  /**
   * Record manual payment
   */
  recordPayment: async (
    loanId: string,
    data: RecordPaymentRequest
  ): Promise<PaymentRecordResponse> => {
    return apiRequest<PaymentRecordResponse>(API_ENDPOINTS.PAYMENTS.RECORD, {
      method: 'POST',
      body: JSON.stringify({
        loan_id: loanId,
        ...data,
      }),
    });
  },

  /**
   * Calculate early payment discount
   */
  calculateEarlyPaymentDiscount: async (
    loanId: string,
    paymentDate?: string
  ): Promise<EarlyPaymentDiscountCalculation> => {
    return apiRequest<EarlyPaymentDiscountCalculation>(
      API_ENDPOINTS.PAYMENTS.CALCULATE_DISCOUNT,
      {
        method: 'POST',
        body: JSON.stringify({
          loan_id: loanId,
          payment_date: paymentDate || new Date().toISOString().split('T')[0],
        }),
      }
    );
  },

  /**
   * Update loan outstanding balance
   */
  updateLoanBalance: async (
    id: string,
    newBalance: number
  ): Promise<{ detail: string; new_balance: number }> => {
    return apiRequest<{ detail: string; new_balance: number }>(
      API_ENDPOINTS.LOANS.APPLICATION_DETAIL(id) + 'update-balance/',
      {
        method: 'POST',
        body: JSON.stringify({ new_balance: newBalance }),
      }
    );
  },

  /**
   * Get monthly reconciliation data
   */
  getMonthlyReconciliation: async (
    filters: ReconciliationFilters
  ): Promise<MonthlyReconciliationData[]> => {
    const params = new URLSearchParams();
    params.append('month', filters.month.toString());
    params.append('year', filters.year.toString());
    if (filters.employer_id) params.append('employer', filters.employer_id);

    const url = `${API_ENDPOINTS.RECONCILIATION.RECORDS}?${params.toString()}`;

    return apiRequest<MonthlyReconciliationData[]>(url, {
      method: 'GET',
    });
  },

  /**
   * Apply reconciliation filters
   */
  applyReconciliationFilters: async (
    filters: ReconciliationFilters
  ): Promise<MonthlyReconciliationData[]> => {
    return apiRequest<MonthlyReconciliationData[]>(
      API_ENDPOINTS.RECONCILIATION.RECORDS,
      {
        method: 'POST',
        body: JSON.stringify(filters),
      }
    );
  },

  /**
   * Get reconciliation summary statistics
   */
  getReconciliationSummary: async (
    filters: ReconciliationFilters
  ): Promise<MonthlyReconciliationSummary> => {
    const params = new URLSearchParams();
    params.append('month', filters.month.toString());
    params.append('year', filters.year.toString());
    if (filters.employer_id) params.append('employer', filters.employer_id);

    const url = `${API_ENDPOINTS.RECONCILIATION.RECORDS}?${params.toString()}`;

    return apiRequest<MonthlyReconciliationSummary>(url, {
      method: 'GET',
    });
  },

  /**
   * Generate reconciliation report
   */
  generateReconciliationReport: async (
    filters: ReconciliationFilters
  ): Promise<{ report_url: string; detail: string }> => {
    return apiRequest<{ report_url: string; detail: string }>(
      API_ENDPOINTS.RECONCILIATION.RECORDS,
      {
        method: 'POST',
        body: JSON.stringify(filters),
      }
    );
  },

  /**
   * Export reconciliation data
   */
  exportReconciliationData: async (
    filters: ReconciliationFilters,
    format: 'excel' | 'pdf' | 'csv' = 'excel'
  ): Promise<Blob> => {
    const token = localStorage.getItem('salary_checkoff_access_token');
    const params = new URLSearchParams();
    params.append('month', filters.month.toString());
    params.append('year', filters.year.toString());
    if (filters.employer_id) params.append('employer', filters.employer_id);
    params.append('format', format);

    const url = `${API_ENDPOINTS.RECONCILIATION.RECORDS}?${params.toString()}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Export failed');
    }

    return await response.blob();
  },
};
