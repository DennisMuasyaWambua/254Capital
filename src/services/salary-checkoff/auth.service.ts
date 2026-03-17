/**
 * Authentication Service for Salary Check-Off System
 */

import { apiRequest, API_ENDPOINTS, tokenManager } from './api';

export interface SendOTPRequest {
  phone_number: string;
}

export interface SendOTPResponse {
  detail: string;
  masked_phone: string;
  expires_in: number;
}

export interface VerifyOTPRequest {
  phone_number: string;
  otp_code: string;
}

export interface VerifyOTPResponse {
  detail: string;
  is_new_user: boolean;
  phone_verified?: boolean;
  phone_number?: string;
  tokens?: {
    access: string;
    refresh: string;
  };
  user?: {
    id: string;
    phone_number: string;
    first_name: string;
    last_name: string;
    email: string;
    role: string;
  };
}

export interface RegisterEmployeeRequest {
  phone_number: string;
  first_name: string;
  last_name: string;
  employee_id: string;
  employer_id: string;
  national_id: string;
  email?: string;
  bank_name?: string;
  bank_account_number?: string;
  mpesa_number?: string;
  monthly_gross_salary?: string;
}

export interface RegisterEmployeeResponse {
  detail: string;
  tokens: {
    access: string;
    refresh: string;
  };
  user: {
    id: string;
    phone_number: string;
    first_name: string;
    last_name: string;
    email: string;
    role: string;
  };
}

export interface HRLoginRequest {
  email: string;
  password: string;
}

export interface HRLoginResponse {
  detail: string;
  requires_otp: boolean;
  temp_token: string;
  masked_phone: string;
  expires_in: number;
}

export interface AdminLoginRequest {
  email: string;
  password: string;
}

export interface AdminLoginResponse {
  detail: string;
  requires_otp: boolean;
  temp_token: string;
  masked_phone: string;
  expires_in: number;
}

export interface VerifyLoginOTPRequest {
  temp_token: string;
  otp: string;
}

export interface VerifyLoginOTPResponse {
  detail: string;
  tokens: {
    access: string;
    refresh: string;
  };
  user: {
    id: string;
    phone_number: string;
    first_name: string;
    last_name: string;
    email: string;
    role: string;
  };
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
    // Clear any existing invalid tokens before sending OTP
    tokenManager.clearTokens();

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
          otp: otpCode,
        }),
      }
    );

    // Store tokens if user exists
    if (!response.is_new_user && response.tokens) {
      tokenManager.setTokens(response.tokens.access, response.tokens.refresh);
    }

    return response;
  },

  /**
   * Register new employee
   */
  registerEmployee: async (
    data: RegisterEmployeeRequest
  ): Promise<RegisterEmployeeResponse> => {
    const response = await apiRequest<RegisterEmployeeResponse>(
      API_ENDPOINTS.AUTH.REGISTER,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );

    // Store tokens after successful registration
    tokenManager.setTokens(response.tokens.access, response.tokens.refresh);

    return response;
  },

  /**
   * HR login with email and password (step 1 - sends OTP)
   */
  hrLogin: async (
    email: string,
    password: string
  ): Promise<HRLoginResponse> => {
    // Clear any existing invalid tokens before login
    tokenManager.clearTokens();

    return apiRequest<HRLoginResponse>(
      API_ENDPOINTS.AUTH.HR_LOGIN,
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }
    );
  },

  /**
   * Admin login (step 1 - sends OTP)
   */
  adminLogin: async (
    email: string,
    password: string
  ): Promise<AdminLoginResponse> => {
    // Clear any existing invalid tokens before login
    tokenManager.clearTokens();

    return apiRequest<AdminLoginResponse>(
      API_ENDPOINTS.AUTH.ADMIN_LOGIN,
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }
    );
  },

  /**
   * Verify login OTP for HR/Admin (step 2)
   */
  verifyLoginOTP: async (
    tempToken: string,
    otp: string
  ): Promise<VerifyLoginOTPResponse> => {
    const response = await apiRequest<VerifyLoginOTPResponse>(
      API_ENDPOINTS.AUTH.VERIFY_LOGIN_OTP,
      {
        method: 'POST',
        body: JSON.stringify({
          temp_token: tempToken,
          otp,
        }),
      }
    );

    // Store tokens
    tokenManager.setTokens(response.tokens.access, response.tokens.refresh);

    return response;
  },

  /**
   * Admin verify 2FA (step 2) - DEPRECATED
   */
  adminVerify2FA: async (
    tempToken: string,
    totpCode: string
  ): Promise<VerifyLoginOTPResponse> => {
    const response = await apiRequest<VerifyLoginOTPResponse>(
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
    tokenManager.setTokens(response.tokens.access, response.tokens.refresh);

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
