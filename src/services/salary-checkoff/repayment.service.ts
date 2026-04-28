/**
 * Repayment Service for Salary Check-Off System
 * Handles repayment CRUD operations (Admin only)
 */

import { apiRequest, API_ENDPOINTS } from './api';

export interface Repayment {
  id: string;
  installment_number: number;
  due_date: string;
  amount: string;
  paid: boolean;
  payment_date?: string;
  payment_method?: string;
  reference?: string;
}

export interface UpdateRepaymentRequest {
  amount?: number;
  due_date?: string;
  paid?: boolean;
  payment_date?: string;
  payment_method?: string;
  reference?: string;
  admin_notes?: string;
}

export interface DeleteRepaymentRequest {
  confirm: boolean;
  reason: string;
}

export const repaymentService = {
  /**
   * Update repayment record (Admin only)
   */
  updateRepayment: async (
    id: string,
    data: UpdateRepaymentRequest
  ): Promise<{
    detail: string;
    repayment: Repayment;
    loan_balance_updated: boolean;
    modification_logged: boolean;
  }> => {
    return apiRequest(API_ENDPOINTS.REPAYMENTS.UPDATE(id), {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete repayment record (Admin only)
   */
  deleteRepayment: async (
    id: string,
    data: DeleteRepaymentRequest
  ): Promise<{
    detail: string;
    deleted: {
      repayment_id: string;
      installment_number: number;
      amount: string;
      loan_id: string;
    };
    loan_balance_updated: boolean;
    archived: boolean;
    archived_at: string;
  }> => {
    return apiRequest(API_ENDPOINTS.REPAYMENTS.DELETE(id), {
      method: 'DELETE',
      body: JSON.stringify(data),
    });
  },
};
