/**
 * Authentication Service for Salary Check-Off System
 */

import { apiRequest, API_ENDPOINTS, tokenManager } from './api';

export interface SendOTPRequest {
  phone_number: string;
}

export interface SendOTPResponse {
  message: string;
  otp_sent: boolean;
}

export interface VerifyOTPRequest {
  phone_number: string;
  otp_code: string;
}

export interface VerifyOTPResponse {
  access: string;
  refresh: string;
  user: {
    id: string;
    phone_number: string;
    first_name: string;
    last_name: string;
    role: string;
  };
}

export interface RegisterEmployeeRequest {
  phone_number: string;
  first_name: string;
  last_name: string;
  employee_number: string;
  employer_code: string;
  national_id: string;
  email?: string;
}

export interface RegisterEmployeeResponse {
  message: string;
  user_id: string;
}

export interface HRLoginRequest {
  email: string;
  password: string;
}

export interface AdminLoginRequest {
  email: string;
  password: string;
}

export interface Admin2FARequest {
  temp_token: string;
  totp_code: string;
}

export interface UserProfile {
  id: string;
  phone_number: string;
  first_name: string;
  last_name: string;
  email: string;
  role: 'employee' | 'hr_manager' | 'admin';
  employee_profile?: {
    employee_number: string;
    employer: {
      id: string;
      name: string;
    };
    national_id: string;
    monthly_salary: string;
  };
  hr_profile?: {
    position: string;
    employer: {
      id: string;
      name: string;
    };
  };
}

export const authService = {
  /**
   * Send OTP to phone number
   */
  sendOTP: async (phoneNumber: string): Promise<SendOTPResponse> => {
    return apiRequest<SendOTPResponse>(API_ENDPOINTS.AUTH.SEND_OTP, {
      method: 'POST',
      body: JSON.stringify({ phone_number: phoneNumber }),
    });
  },

  /**
   * Verify OTP and get tokens
   */
  verifyOTP: async (
    phoneNumber: string,
    otpCode: string
  ): Promise<VerifyOTPResponse> => {
    const response = await apiRequest<VerifyOTPResponse>(
      API_ENDPOINTS.AUTH.VERIFY_OTP,
      {
        method: 'POST',
        body: JSON.stringify({
          phone_number: phoneNumber,
          otp_code: otpCode,
        }),
      }
    );

    // Store tokens
    tokenManager.setTokens(response.access, response.refresh);

    return response;
  },

  /**
   * Register new employee
   */
  registerEmployee: async (
    data: RegisterEmployeeRequest
  ): Promise<RegisterEmployeeResponse> => {
    return apiRequest<RegisterEmployeeResponse>(API_ENDPOINTS.AUTH.REGISTER, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * HR login with email and password
   */
  hrLogin: async (
    email: string,
    password: string
  ): Promise<VerifyOTPResponse> => {
    const response = await apiRequest<VerifyOTPResponse>(
      API_ENDPOINTS.AUTH.HR_LOGIN,
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }
    );

    // Store tokens
    tokenManager.setTokens(response.access, response.refresh);

    return response;
  },

  /**
   * Admin login (step 1)
   */
  adminLogin: async (
    email: string,
    password: string
  ): Promise<{ temp_token: string; message: string }> => {
    return apiRequest<{ temp_token: string; message: string }>(
      API_ENDPOINTS.AUTH.ADMIN_LOGIN,
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }
    );
  },

  /**
   * Admin verify 2FA (step 2)
   */
  adminVerify2FA: async (
    tempToken: string,
    totpCode: string
  ): Promise<VerifyOTPResponse> => {
    const response = await apiRequest<VerifyOTPResponse>(
      API_ENDPOINTS.AUTH.ADMIN_VERIFY_2FA,
      {
        method: 'POST',
        body: JSON.stringify({
          temp_token: tempToken,
          totp_code: totpCode,
        }),
      }
    );

    // Store tokens
    tokenManager.setTokens(response.access, response.refresh);

    return response;
  },

  /**
   * Get user profile
   */
  getProfile: async (): Promise<UserProfile> => {
    return apiRequest<UserProfile>(API_ENDPOINTS.AUTH.PROFILE, {
      method: 'GET',
    });
  },

  /**
   * Update user profile
   */
  updateProfile: async (data: Partial<UserProfile>): Promise<UserProfile> => {
    return apiRequest<UserProfile>(API_ENDPOINTS.AUTH.PROFILE, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Logout user
   */
  logout: () => {
    tokenManager.clearTokens();
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: (): boolean => {
    return !!tokenManager.getAccessToken();
  },
};
