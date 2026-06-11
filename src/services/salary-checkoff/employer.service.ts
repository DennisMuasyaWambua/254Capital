/**
 * Employer Service for Salary Check-Off System
 */

import { apiRequest, publicApiRequest, API_ENDPOINTS } from './api';

export type InterestMethod = 'flat' | 'reducing_balance';

export interface Employer {
  id: string;
  name: string;
  registration_number: string;
  address: string;
  payroll_cycle_day: number;
  hr_contact_name: string;
  hr_contact_email: string;
  hr_contact_phone: string;
  is_active: boolean;
  onboarded_by: string | null;
  onboarded_at: string;
  updated_at: string;
  total_employees?: number;
  active_loans_count?: number;
  pending_applications_count?: number;
  interest_method: InterestMethod; // 'flat' or 'reducing_balance'
  interest_rate: number; // Monthly interest rate as decimal (e.g., 0.05 for 5%)
}

export interface CreateEmployerRequest {
  name: string;
  registration_number: string;
  address: string;
  payroll_cycle_day: number;
  hr_contact_name: string;
  hr_contact_email: string;
  hr_contact_phone: string;
  interest_method?: InterestMethod; // defaults to 'flat' on backend
  interest_rate?: number; // Monthly rate as decimal (defaults to 0.05)
}

export interface UpdateEmployerRequest {
  name?: string;
  registration_number?: string;
  address?: string;
  payroll_cycle_day?: number;
  hr_contact_name?: string;
  hr_contact_email?: string;
  hr_contact_phone?: string;
  interest_method?: InterestMethod;
  interest_rate?: number; // Monthly rate as decimal
  is_active?: boolean;
}

export interface EmployerDetail extends Employer {
  employees: Array<{
    id: string;
    first_name: string;
    last_name: string;
    employee_id: string;
    phone_number: string;
  }>;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  page: number;
  total_pages: number;
  results: T[];
}

export const employerService = {
  /**
   * List active employers with search (public endpoint - no auth required)
   */
  listEmployers: async (search?: string): Promise<PaginatedResponse<Employer>> => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);

    const url = `${API_ENDPOINTS.EMPLOYERS.LIST}?${params.toString()}`;

    return publicApiRequest<PaginatedResponse<Employer>>(url, {
      method: 'GET',
    });
  },

  /**
   * Create new employer (admin only)
   */
  createEmployer: async (data: CreateEmployerRequest): Promise<Employer> => {
    return apiRequest<Employer>(API_ENDPOINTS.EMPLOYERS.CREATE, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Get employer details
   */
  getEmployer: async (id: string): Promise<EmployerDetail> => {
    return apiRequest<EmployerDetail>(API_ENDPOINTS.EMPLOYERS.DETAIL(id), {
      method: 'GET',
    });
  },

  /**
   * Update employer (admin only)
   */
  updateEmployer: async (
    id: string,
    data: UpdateEmployerRequest
  ): Promise<Employer> => {
    return apiRequest<Employer>(API_ENDPOINTS.EMPLOYERS.DETAIL(id), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Update employer interest method (admin only)
   */
  updateInterestMethod: async (
    id: string,
    interestMethod: InterestMethod
  ): Promise<Employer> => {
    return apiRequest<Employer>(API_ENDPOINTS.EMPLOYERS.DETAIL(id), {
      method: 'PUT',
      body: JSON.stringify({ interest_method: interestMethod }),
    });
  },

  /**
   * Update employer interest settings (method and rate)
   */
  updateInterestSettings: async (
    id: string,
    interestMethod: InterestMethod,
    interestRate: number
  ): Promise<Employer> => {
    return apiRequest<Employer>(API_ENDPOINTS.EMPLOYERS.DETAIL(id), {
      method: 'PUT',
      body: JSON.stringify({
        interest_method: interestMethod,
        interest_rate: interestRate,
      }),
    });
  },
};

/**
 * Loan calculation utilities for different interest methods
 */
export const loanCalculationUtils = {
  /**
   * Calculate flat rate loan
   * Formula: monthly_installment = (principal + (principal × 5% × tenure)) / tenure
   */
  calculateFlatRate: (principal: number, tenureMonths: number, monthlyRate: number = 0.05) => {
    const totalInterest = principal * monthlyRate * tenureMonths;
    const totalRepayment = principal + totalInterest;
    const monthlyInstallment = totalRepayment / tenureMonths;

    const schedule = [];
    let runningBalance = totalRepayment;

    for (let i = 1; i <= tenureMonths; i++) {
      runningBalance -= monthlyInstallment;
      schedule.push({
        installment_number: i,
        due_date: '', // Will be calculated based on disbursement date
        amount: monthlyInstallment.toFixed(2),
        principal_portion: (principal / tenureMonths).toFixed(2),
        interest_portion: (totalInterest / tenureMonths).toFixed(2),
        running_balance: Math.max(0, runningBalance).toFixed(2),
      });
    }

    return {
      calculation_type: 'flat',
      principal_amount: principal.toFixed(2),
      interest_rate: (monthlyRate * 100).toFixed(2),
      repayment_months: tenureMonths,
      total_repayment: totalRepayment.toFixed(2),
      monthly_deduction: monthlyInstallment.toFixed(2),
      interest_amount: totalInterest.toFixed(2),
      schedule,
    };
  },

  /**
   * Calculate reducing balance loan (EMI)
   * Formula: EMI = P × r × (1+r)^n / ((1+r)^n - 1)
   * Where: P = principal, r = monthly interest rate, n = tenure in months
   */
  calculateReducingBalance: (principal: number, tenureMonths: number, monthlyRate: number = 0.05) => {
    // EMI formula
    const r = monthlyRate;
    const n = tenureMonths;
    const numerator = principal * r * Math.pow(1 + r, n);
    const denominator = Math.pow(1 + r, n) - 1;
    const emi = numerator / denominator;

    const totalRepayment = emi * tenureMonths;
    const totalInterest = totalRepayment - principal;

    // Generate amortization schedule
    const schedule = [];
    let outstandingPrincipal = principal;

    for (let i = 1; i <= tenureMonths; i++) {
      const interestPortion = outstandingPrincipal * r;
      const principalPortion = emi - interestPortion;
      outstandingPrincipal -= principalPortion;

      schedule.push({
        installment_number: i,
        due_date: '', // Will be calculated based on disbursement date
        amount: emi.toFixed(2),
        principal_portion: principalPortion.toFixed(2),
        interest_portion: interestPortion.toFixed(2),
        running_balance: Math.max(0, outstandingPrincipal).toFixed(2),
      });
    }

    return {
      calculation_type: 'reducing_balance',
      principal_amount: principal.toFixed(2),
      interest_rate: (monthlyRate * 100).toFixed(2),
      repayment_months: tenureMonths,
      total_repayment: totalRepayment.toFixed(2),
      monthly_deduction: emi.toFixed(2),
      interest_amount: totalInterest.toFixed(2),
      schedule,
    };
  },

  /**
   * Calculate loan based on employer's interest method
   */
  calculateLoanForEmployer: (
    principal: number,
    tenureMonths: number,
    interestMethod: InterestMethod,
    monthlyRate: number = 0.05
  ) => {
    if (interestMethod === 'reducing_balance') {
      return loanCalculationUtils.calculateReducingBalance(principal, tenureMonths, monthlyRate);
    }
    return loanCalculationUtils.calculateFlatRate(principal, tenureMonths, monthlyRate);
  },
};
