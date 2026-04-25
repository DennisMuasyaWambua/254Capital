/**
 * HR User Management Service for Salary Check-Off System
 * Admin-only functionality for managing HR user accounts
 */

import { apiRequest, API_ENDPOINTS } from './api';
import { PaginatedResponse } from './loan.service';

export interface HRUser {
  id: string;
  email: string;
  phone_number: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  employer: {
    id: string;
    name: string;
  };
  position: string;
  created_at: string;
  last_login?: string;
}

export interface HRUserDetail extends HRUser {
  employer: {
    id: string;
    name: string;
    registration_number: string;
    total_employees: number;
    active_loans_count: number;
  };
  login_history?: Array<{
    timestamp: string;
    ip_address: string;
  }>;
}

export interface CreateHRUserRequest {
  email: string;
  phone_number: string;
  first_name: string;
  last_name: string;
  employer_id: string;
  position: string;
  send_welcome_email?: boolean;
  send_credentials_sms?: boolean;
}

export interface CreateHRUserResponse {
  detail: string;
  user: HRUser;
  temporary_password: string;
  welcome_email_sent: boolean;
  credentials_sms_sent: boolean;
  password_expires_in_hours: number;
}

export interface UpdateHRUserRequest {
  email?: string;
  phone_number?: string;
  first_name?: string;
  last_name?: string;
  position?: string;
  employer_id?: string;
}

export interface ToggleActiveRequest {
  is_active: boolean;
  reason?: string;
}

export interface DeleteHRUserRequest {
  confirm: boolean;
  reason?: string;
}

export const hrUserService = {
  /**
   * List all HR users (admin only)
   */
  listHRUsers: async (filters?: {
    search?: string;
    employer_id?: string;
    is_active?: boolean;
    page?: number;
  }): Promise<PaginatedResponse<HRUser>> => {
    const params = new URLSearchParams();

    if (filters?.search) params.append('search', filters.search);
    if (filters?.employer_id) params.append('employer_id', filters.employer_id);
    if (filters?.is_active !== undefined)
      params.append('is_active', filters.is_active.toString());
    if (filters?.page) params.append('page', filters.page.toString());

    const url = `${API_ENDPOINTS.HR_USERS.LIST}?${params.toString()}`;

    return apiRequest<PaginatedResponse<HRUser>>(url, {
      method: 'GET',
    });
  },

  /**
   * Get HR user details (admin only)
   */
  getHRUser: async (id: string): Promise<HRUserDetail> => {
    return apiRequest<HRUserDetail>(API_ENDPOINTS.HR_USERS.DETAIL(id), {
      method: 'GET',
    });
  },

  /**
   * Create new HR user (admin only)
   */
  createHRUser: async (
    data: CreateHRUserRequest
  ): Promise<CreateHRUserResponse> => {
    return apiRequest<CreateHRUserResponse>(API_ENDPOINTS.HR_USERS.CREATE, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Update HR user details (admin only)
   */
  updateHRUser: async (
    id: string,
    data: UpdateHRUserRequest
  ): Promise<{ detail: string; user: HRUser }> => {
    return apiRequest<{ detail: string; user: HRUser }>(
      API_ENDPOINTS.HR_USERS.UPDATE(id),
      {
        method: 'PATCH',
        body: JSON.stringify(data),
      }
    );
  },

  /**
   * Toggle HR user active status (admin only)
   */
  toggleHRUserActive: async (
    id: string,
    data: ToggleActiveRequest
  ): Promise<{
    detail: string;
    user: {
      id: string;
      email: string;
      is_active: boolean;
      deactivated_at?: string;
      deactivation_reason?: string;
    };
  }> => {
    return apiRequest(API_ENDPOINTS.HR_USERS.TOGGLE_ACTIVE(id), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete HR user account (admin only)
   */
  deleteHRUser: async (
    id: string,
    data: DeleteHRUserRequest
  ): Promise<{
    detail: string;
    deleted_user: {
      id: string;
      email: string;
      name: string;
      employer: string;
    };
    archived: boolean;
    archived_at: string;
  }> => {
    return apiRequest(API_ENDPOINTS.HR_USERS.DELETE(id), {
      method: 'DELETE',
      body: JSON.stringify(data),
    });
  },
};
