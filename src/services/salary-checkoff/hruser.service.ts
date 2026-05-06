/**
 * HR User Service for Salary Check-Off System
 * Handles HR user management operations
 */

import { apiRequest, API_ENDPOINTS } from './api';

export interface HRUser {
  id: string;
  phone_number: string;
  first_name: string;
  last_name: string;
  email: string;
  position: string;
  employer: {
    id: string;
    name: string;
  };
  is_active: boolean;
  created_at: string;
  last_login: string | null;
}

export interface CreateHRUserRequest {
  phone_number: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  position: string;
  employer_id: string;
}

export interface CreateHRUserResponse {
  detail: string;
  user: HRUser;
  credentials: {
    email: string;
    temporary_password: string;
  };
}

export interface UpdateHRUserRequest {
  phone_number?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  position?: string;
  employer_id?: string;
}

export interface ToggleActiveResponse {
  detail: string;
  user: HRUser;
}

export interface DeleteHRUserResponse {
  detail: string;
  deleted_user_id: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export const hrUserService = {
  /**
   * List all HR users
   */
  listHRUsers: async (params?: {
    search?: string;
    employer_id?: string;
    is_active?: boolean;
    page?: number;
  }): Promise<PaginatedResponse<HRUser>> => {
    const queryParams = new URLSearchParams();

    if (params?.search) queryParams.append('search', params.search);
    if (params?.employer_id) queryParams.append('employer_id', params.employer_id);
    if (params?.is_active !== undefined) queryParams.append('is_active', params.is_active.toString());
    if (params?.page) queryParams.append('page', params.page.toString());

    const url = `${API_ENDPOINTS.HR_USERS.LIST}?${queryParams.toString()}`;

    return apiRequest<PaginatedResponse<HRUser>>(url, {
      method: 'GET',
    });
  },

  /**
   * Create new HR user
   */
  createHRUser: async (data: CreateHRUserRequest): Promise<CreateHRUserResponse> => {
    return apiRequest<CreateHRUserResponse>(API_ENDPOINTS.HR_USERS.CREATE, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Get HR user details
   */
  getHRUser: async (id: string): Promise<HRUser> => {
    return apiRequest<HRUser>(API_ENDPOINTS.HR_USERS.DETAIL(id), {
      method: 'GET',
    });
  },

  /**
   * Update HR user
   */
  updateHRUser: async (id: string, data: UpdateHRUserRequest): Promise<HRUser> => {
    return apiRequest<HRUser>(API_ENDPOINTS.HR_USERS.UPDATE(id), {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  /**
   * Toggle HR user active status
   */
  toggleActiveStatus: async (id: string): Promise<ToggleActiveResponse> => {
    return apiRequest<ToggleActiveResponse>(API_ENDPOINTS.HR_USERS.TOGGLE_ACTIVE(id), {
      method: 'POST',
    });
  },

  /**
   * Delete HR user
   */
  deleteHRUser: async (id: string): Promise<DeleteHRUserResponse> => {
    return apiRequest<DeleteHRUserResponse>(API_ENDPOINTS.HR_USERS.DELETE(id), {
      method: 'DELETE',
    });
  },
};
