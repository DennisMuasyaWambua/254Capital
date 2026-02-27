/**
 * Employer Service for Salary Check-Off System
 */

import { apiRequest, API_ENDPOINTS } from './api';

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
}

export interface CreateEmployerRequest {
  name: string;
  registration_number: string;
  address: string;
  payroll_cycle_day: number;
  hr_contact_name: string;
  hr_contact_email: string;
  hr_contact_phone: string;
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

export const employerService = {
  /**
   * List active employers with search
   */
  listEmployers: async (search?: string): Promise<Employer[]> => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);

    const url = `${API_ENDPOINTS.EMPLOYERS.LIST}?${params.toString()}`;

    return apiRequest<Employer[]>(url, {
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
    data: Partial<CreateEmployerRequest>
  ): Promise<Employer> => {
    return apiRequest<Employer>(API_ENDPOINTS.EMPLOYERS.DETAIL(id), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};
