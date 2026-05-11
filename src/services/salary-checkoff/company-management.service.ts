/**
 * Company Management Service
 *
 * Handles API calls for organization-scoped RBAC (Role-Based Access Control)
 * including organizations, roles, users, and audit logs.
 */

import { apiRequest, API_BASE_URL } from './api';

// ============================================================================
// Type Definitions
// ============================================================================

export interface Organization {
  id: string;
  name: string;
  address?: string;
  contact_email?: string;
  contact_phone?: string;
  tax_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
  created_by_name?: string;
  active_users_count?: number;
  active_roles_count?: number;
}

export interface Role {
  id: string;
  organization: string;
  organization_name?: string;
  name: string;
  description?: string;
  can_view_loan_application: boolean;
  can_approve_loan_application: boolean;
  can_decline_loan_application: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  assigned_users_count?: number;
  permissions?: {
    can_view_loan_application: boolean;
    can_approve_loan_application: boolean;
    can_decline_loan_application: boolean;
  };
}

export interface UserBasic {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
}

export interface OrganizationUser {
  id: string;
  organization: string;
  organization_name?: string;
  user: string;
  user_details?: UserBasic;
  role: string;
  role_details?: Role;
  is_active: boolean;
  force_password_change: boolean;
  password_changed_at?: string;
  last_login_at?: string;
  created_at: string;
  updated_at: string;
  permissions?: string[];
}

export interface CreateUserRequest {
  organization_id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  role_id: string;
}

export interface CreateUserResponse {
  user: OrganizationUser;
  onboarding_email_sent: boolean;
  message: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export interface AuditLog {
  id: string;
  event_type: string;
  user?: string;
  user_name?: string;
  target_user?: string;
  target_user_name?: string;
  organization?: string;
  organization_name?: string;
  target_resource_type?: string;
  target_resource_id?: string;
  ip_address?: string;
  user_agent?: string;
  result: 'success' | 'failure';
  error_message?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next?: string;
  previous?: string;
  results: T[];
}

// ============================================================================
// Organization Service
// ============================================================================

export const organizationService = {
  /**
   * Get list of organizations
   */
  async list(params?: {
    page?: number;
    page_size?: number;
    search?: string;
    is_active?: boolean;
  }): Promise<PaginatedResponse<Organization>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.page_size) queryParams.append('page_size', params.page_size.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.is_active !== undefined) queryParams.append('is_active', params.is_active.toString());

    const url = `${API_BASE_URL}/company-management/organizations/?${queryParams}`;
    return apiRequest<PaginatedResponse<Organization>>(url);
  },

  /**
   * Get organization by ID
   */
  async get(id: string): Promise<Organization> {
    const url = `${API_BASE_URL}/company-management/organizations/${id}/`;
    return apiRequest<Organization>(url);
  },

  /**
   * Create new organization
   */
  async create(data: Partial<Organization>): Promise<Organization> {
    const url = `${API_BASE_URL}/company-management/organizations/`;
    return apiRequest<Organization>(url, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Update organization
   */
  async update(id: string, data: Partial<Organization>): Promise<Organization> {
    const url = `${API_BASE_URL}/company-management/organizations/${id}/`;
    return apiRequest<Organization>(url, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Deactivate organization
   */
  async deactivate(id: string): Promise<Organization> {
    const url = `${API_BASE_URL}/company-management/organizations/${id}/deactivate/`;
    return apiRequest<Organization>(url, {
      method: 'PATCH',
    });
  },
};

// ============================================================================
// Role Service
// ============================================================================

export const roleService = {
  /**
   * Get list of roles
   */
  async list(params?: {
    organization_id?: string;
    page?: number;
    page_size?: number;
    search?: string;
    is_active?: boolean;
  }): Promise<PaginatedResponse<Role>> {
    const queryParams = new URLSearchParams();
    if (params?.organization_id) queryParams.append('organization_id', params.organization_id);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.page_size) queryParams.append('page_size', params.page_size.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.is_active !== undefined) queryParams.append('is_active', params.is_active.toString());

    const url = `${API_BASE_URL}/company-management/roles/?${queryParams}`;
    return apiRequest<PaginatedResponse<Role>>(url);
  },

  /**
   * Get role by ID
   */
  async get(id: string): Promise<Role> {
    const url = `${API_BASE_URL}/company-management/roles/${id}/`;
    return apiRequest<Role>(url);
  },

  /**
   * Create new role
   */
  async create(data: Partial<Role>): Promise<Role> {
    const url = `${API_BASE_URL}/company-management/roles/`;
    return apiRequest<Role>(url, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Update role
   */
  async update(id: string, data: Partial<Role>): Promise<Role> {
    const url = `${API_BASE_URL}/company-management/roles/${id}/`;
    return apiRequest<Role>(url, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Soft delete role (set is_active=false)
   */
  async delete(id: string): Promise<void> {
    const url = `${API_BASE_URL}/company-management/roles/${id}/`;
    return apiRequest<void>(url, {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// Organization User Service
// ============================================================================

export const organizationUserService = {
  /**
   * Get list of organization users
   */
  async list(params?: {
    organization_id?: string;
    role?: string;
    is_active?: boolean;
    page?: number;
    page_size?: number;
    search?: string;
  }): Promise<PaginatedResponse<OrganizationUser>> {
    const queryParams = new URLSearchParams();
    if (params?.organization_id) queryParams.append('organization_id', params.organization_id);
    if (params?.role) queryParams.append('role', params.role);
    if (params?.is_active !== undefined) queryParams.append('is_active', params.is_active.toString());
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.page_size) queryParams.append('page_size', params.page_size.toString());
    if (params?.search) queryParams.append('search', params.search);

    const url = `${API_BASE_URL}/company-management/organization-users/?${queryParams}`;
    return apiRequest<PaginatedResponse<OrganizationUser>>(url);
  },

  /**
   * Get organization user by ID
   */
  async get(id: string): Promise<OrganizationUser> {
    const url = `${API_BASE_URL}/company-management/organization-users/${id}/`;
    return apiRequest<OrganizationUser>(url);
  },

  /**
   * Create new user with system-generated password and email delivery
   */
  async createWithEmail(data: CreateUserRequest): Promise<CreateUserResponse> {
    const url = `${API_BASE_URL}/company-management/organization-users/create-with-email/`;
    return apiRequest<CreateUserResponse>(url, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Deactivate organization user
   */
  async deactivate(id: string): Promise<OrganizationUser> {
    const url = `${API_BASE_URL}/company-management/organization-users/${id}/deactivate/`;
    return apiRequest<OrganizationUser>(url, {
      method: 'PATCH',
    });
  },
};

// ============================================================================
// Password Service
// ============================================================================

export const passwordService = {
  /**
   * Change current user's password
   */
  async changePassword(data: ChangePasswordRequest): Promise<{ message: string }> {
    const url = `${API_BASE_URL}/company-management/change-password/`;
    return apiRequest<{ message: string }>(url, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// ============================================================================
// Audit Log Service
// ============================================================================

export const auditLogService = {
  /**
   * Get list of audit logs
   */
  async list(params?: {
    organization?: string;
    event_type?: string;
    result?: 'success' | 'failure';
    page?: number;
    page_size?: number;
  }): Promise<PaginatedResponse<AuditLog>> {
    const queryParams = new URLSearchParams();
    if (params?.organization) queryParams.append('organization', params.organization);
    if (params?.event_type) queryParams.append('event_type', params.event_type);
    if (params?.result) queryParams.append('result', params.result);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.page_size) queryParams.append('page_size', params.page_size.toString());

    const url = `${API_BASE_URL}/company-management/audit-logs/?${queryParams}`;
    return apiRequest<PaginatedResponse<AuditLog>>(url);
  },

  /**
   * Get audit log by ID
   */
  async get(id: string): Promise<AuditLog> {
    const url = `${API_BASE_URL}/company-management/audit-logs/${id}/`;
    return apiRequest<AuditLog>(url);
  },
};

// ============================================================================
// Unified Export
// ============================================================================

const companyManagementService = {
  organizations: organizationService,
  roles: roleService,
  users: organizationUserService,
  password: passwordService,
  auditLogs: auditLogService,
};

export default companyManagementService;
