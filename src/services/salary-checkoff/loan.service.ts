/**
 * Loan Service for Salary Check-Off System
 */

import { apiRequest, API_ENDPOINTS } from './api';

export interface LoanApplication {
  id: string;
  application_number: string;
  employee: {
    id: string;
    first_name: string;
    last_name: string;
    phone_number: string;
  };
  employer: {
    id: string;
    name: string;
  };
  principal_amount: string;
  interest_rate: string;
  repayment_months: number;
  purpose: string;
  total_repayment: string;
  monthly_deduction: string;
  status: string;
  terms_accepted: boolean;
  terms_accepted_at?: string;
  disbursement_method?: 'bank' | 'mpesa';
  disbursement_reference?: string;
  created_at: string;
  updated_at: string;
  disbursement_date?: string;
  first_deduction_date?: string;
}

export interface LoanApplicationDetail extends LoanApplication {
  status_history: Array<{
    id: string;
    status: string;
    actor: string;
    comment: string;
    created_at: string;
  }>;
  repayment_schedule: Array<{
    id: string;
    installment_number: number;
    due_date: string;
    amount: string;
    paid: boolean;
    payment_date?: string;
  }>;
}

export interface CreateLoanRequest {
  principal_amount: number;
  repayment_months: number;
  purpose: string;
  terms_accepted: boolean;
}

export interface LoanCalculatorRequest {
  principal: number;
  months: number;
  calculation_type: 'flat' | 'amortized';
  annual_rate?: number;
}

export interface LoanCalculatorResponse {
  calculation_type: string;
  principal_amount: string;
  interest_rate: string;
  repayment_months: number;
  total_repayment: string;
  monthly_deduction: string;
  interest_amount: string;
  first_deduction_date: string;
  schedule: Array<{
    installment_number: number;
    due_date: string;
    amount: string;
    running_balance: string;
    is_first_deduction: boolean;
  }>;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface HRReviewRequest {
  action: 'approve' | 'decline';
  comment: string;
}

export interface BatchApprovalRequest {
  application_ids: string[];
  action: 'approve' | 'decline';
  comment: string;
}

export interface AdminAssessmentRequest {
  action: 'approve' | 'decline';
  comment: string;
  credit_score_notes?: string;
}

export interface AdminDisbursementRequest {
  disbursement_date: string;
  disbursement_method: string;
  disbursement_reference: string;
}

export const loanService = {
  /**
   * List employee's loan applications
   */
  listApplications: async (
    filters?: {
      status?: string;
      from_date?: string;
      to_date?: string;
      page?: number;
    }
  ): Promise<PaginatedResponse<LoanApplication>> => {
    const params = new URLSearchParams();

    if (filters?.status) params.append('status', filters.status);
    if (filters?.from_date) params.append('from_date', filters.from_date);
    if (filters?.to_date) params.append('to_date', filters.to_date);
    if (filters?.page) params.append('page', filters.page.toString());

    const url = `${API_ENDPOINTS.LOANS.APPLICATIONS}?${params.toString()}`;

    return apiRequest<PaginatedResponse<LoanApplication>>(url, {
      method: 'GET',
    });
  },

  /**
   * Get application detail
   */
  getApplication: async (id: string): Promise<LoanApplicationDetail> => {
    return apiRequest<LoanApplicationDetail>(
      API_ENDPOINTS.LOANS.APPLICATION_DETAIL(id),
      {
        method: 'GET',
      }
    );
  },

  /**
   * Create new loan application
   */
  createApplication: async (
    data: CreateLoanRequest
  ): Promise<LoanApplicationDetail> => {
    return apiRequest<LoanApplicationDetail>(
      API_ENDPOINTS.LOANS.APPLICATIONS,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  },

  /**
   * Update loan application (submitted status only)
   */
  updateApplication: async (
    id: string,
    data: Partial<CreateLoanRequest>
  ): Promise<LoanApplicationDetail> => {
    return apiRequest<LoanApplicationDetail>(
      API_ENDPOINTS.LOANS.APPLICATION_DETAIL(id),
      {
        method: 'PATCH',
        body: JSON.stringify(data),
      }
    );
  },

  /**
   * Calculate loan repayment
   */
  calculateLoan: async (
    data: LoanCalculatorRequest
  ): Promise<LoanCalculatorResponse> => {
    return apiRequest<LoanCalculatorResponse>(API_ENDPOINTS.LOANS.CALCULATOR, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // ===== HR ENDPOINTS =====

  /**
   * List pending applications for HR
   */
  hrListPending: async (
    search?: string,
    page?: number
  ): Promise<PaginatedResponse<LoanApplication>> => {
    const params = new URLSearchParams();

    if (search) params.append('search', search);
    if (page) params.append('page', page.toString());

    const url = `${API_ENDPOINTS.LOANS.HR_PENDING}?${params.toString()}`;

    return apiRequest<PaginatedResponse<LoanApplication>>(url, {
      method: 'GET',
    });
  },

  /**
   * List all applications for HR
   */
  hrListAll: async (filters?: {
    status?: string;
    from_date?: string;
    to_date?: string;
    search?: string;
    page?: number;
  }): Promise<PaginatedResponse<LoanApplication>> => {
    const params = new URLSearchParams();

    if (filters?.status) params.append('status', filters.status);
    if (filters?.from_date) params.append('from_date', filters.from_date);
    if (filters?.to_date) params.append('to_date', filters.to_date);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.page) params.append('page', filters.page.toString());

    const url = `${API_ENDPOINTS.LOANS.HR_ALL}?${params.toString()}`;

    return apiRequest<PaginatedResponse<LoanApplication>>(url, {
      method: 'GET',
    });
  },

  /**
   * HR review application
   */
  hrReview: async (
    id: string,
    data: HRReviewRequest
  ): Promise<{ detail: string; application: LoanApplicationDetail }> => {
    return apiRequest<{ detail: string; application: LoanApplicationDetail }>(
      API_ENDPOINTS.LOANS.HR_REVIEW(id),
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  },

  /**
   * HR batch approval
   */
  hrBatchApproval: async (data: BatchApprovalRequest): Promise<{
    detail: string;
    processed_count: number;
    failed_count: number;
    processed: string[];
    failed: Array<{ id: string; error: string }>;
  }> => {
    return apiRequest(API_ENDPOINTS.LOANS.HR_BATCH_APPROVAL, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // ===== ADMIN ENDPOINTS =====

  /**
   * List applications in admin assessment queue
   */
  adminListQueue: async (filters?: {
    employer?: string;
    search?: string;
    page?: number;
  }): Promise<PaginatedResponse<LoanApplication>> => {
    const params = new URLSearchParams();

    if (filters?.employer) params.append('employer', filters.employer);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.page) params.append('page', filters.page.toString());

    const url = `${API_ENDPOINTS.LOANS.ADMIN_QUEUE}?${params.toString()}`;

    return apiRequest<PaginatedResponse<LoanApplication>>(url, {
      method: 'GET',
    });
  },

  /**
   * Admin credit assessment
   */
  adminAssess: async (
    id: string,
    data: AdminAssessmentRequest
  ): Promise<{ detail: string; application: LoanApplicationDetail }> => {
    return apiRequest<{ detail: string; application: LoanApplicationDetail }>(
      API_ENDPOINTS.LOANS.ADMIN_ASSESS(id),
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  },

  /**
   * Admin record disbursement
   */
  adminDisburse: async (
    id: string,
    data: AdminDisbursementRequest
  ): Promise<{ detail: string; application: LoanApplicationDetail }> => {
    return apiRequest<{ detail: string; application: LoanApplicationDetail }>(
      API_ENDPOINTS.LOANS.ADMIN_DISBURSE(id),
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  },
};
