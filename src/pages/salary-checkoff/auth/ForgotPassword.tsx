import React, { useState } from 'react';
import { Card } from '@/components/salary-checkoff/ui/Card';
import { Button } from '@/components/salary-checkoff/ui/Button';
import { Input } from '@/components/salary-checkoff/ui/Input';
import { authService } from '@/services/salary-checkoff/auth.service';
import {
  Loader2,
  AlertCircle,
  CheckCircle,
  Lock,
  Mail,
  KeyRound,
  ArrowLeft,
} from 'lucide-react';

type Step = 'email' | 'otp' | 'success';

interface ForgotPasswordProps {
  onBack?: () => void;
  onSuccess?: () => void;
}

export function ForgotPassword({ onBack, onSuccess }: ForgotPasswordProps) {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [tempToken, setTempToken] = useState('');
  const [maskedPhone, setMaskedPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expiresIn, setExpiresIn] = useState(300);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setError('Email is required');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await authService.requestPasswordReset(email);

      setTempToken(response.temp_token);
      setMaskedPhone(response.masked_phone);
      setExpiresIn(response.expires_in);
      setStep('otp');
    } catch (error: any) {
      console.error('Password reset request error:', error);
      setError(error.message || 'Failed to request password reset');
    } finally {
      setIsLoading(false);
    }
  };

  const validatePassword = (): boolean => {
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }

    if (!/[A-Z]/.test(newPassword)) {
      setError('Password must contain at least one uppercase letter');
      return false;
    }

    if (!/[a-z]/.test(newPassword)) {
      setError('Password must contain at least one lowercase letter');
      return false;
    }

    if (!/[0-9]/.test(newPassword)) {
      setError('Password must contain at least one number');
      return false;
    }

    if (!/[^A-Za-z0-9]/.test(newPassword)) {
      setError('Password must contain at least one special character');
      return false;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    return true;
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp) {
      setError('OTP is required');
      return;
    }

    if (!validatePassword()) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      await authService.resetPassword({
        temp_token: tempToken,
        otp,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });

      setStep('success');

      setTimeout(() => {
        if (onSuccess) onSuccess();
        // Redirect to login or dashboard
        window.location.href = '/salary-checkoff/login';
      }, 3000);
    } catch (error: any) {
      console.error('Password reset error:', error);
      setError(error.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  const renderEmailStep = () => (
    <form onSubmit={handleRequestReset} className="space-y-4">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-[#008080]/10 rounded-full mb-4">
          <Lock className="h-8 w-8 text-[#008080]" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Forgot Password?</h2>
        <p className="text-slate-600 mt-2">
          Enter your email address and we'll send you an OTP to reset your password.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-800">
          <AlertCircle className="h-5 w-5 mr-2 text-red-600 flex-shrink-0" />
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Email Address
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="hr@company.com"
            className="pl-10"
            required
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="space-y-3 pt-2">
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending OTP...
            </>
          ) : (
            'Send OTP'
          )}
        </Button>

        {onBack && (
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            disabled={isLoading}
            className="w-full"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Login
          </Button>
        )}
      </div>
    </form>
  );

  const renderOTPStep = () => (
    <form onSubmit={handleResetPassword} className="space-y-4">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-[#008080]/10 rounded-full mb-4">
          <KeyRound className="h-8 w-8 text-[#008080]" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Enter OTP</h2>
        <p className="text-slate-600 mt-2">
          We've sent a verification code to {maskedPhone}
        </p>
        <p className="text-sm text-slate-500 mt-1">
          Code expires in {Math.floor(expiresIn / 60)} minutes
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-800">
          <AlertCircle className="h-5 w-5 mr-2 text-red-600 flex-shrink-0" />
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          OTP Code
        </label>
        <Input
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
          placeholder="Enter 6-digit code"
          maxLength={6}
          required
          disabled={isLoading}
          className="text-center text-2xl tracking-widest"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          New Password
        </label>
        <Input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="Enter new password"
          required
          disabled={isLoading}
        />
        <div className="mt-2 space-y-1">
          <p className="text-xs text-slate-600">Password must contain:</p>
          <ul className="text-xs text-slate-600 space-y-1 ml-4">
            <li className={newPassword.length >= 8 ? 'text-green-600' : ''}>
              • At least 8 characters
            </li>
            <li className={/[A-Z]/.test(newPassword) ? 'text-green-600' : ''}>
              • One uppercase letter
            </li>
            <li className={/[a-z]/.test(newPassword) ? 'text-green-600' : ''}>
              • One lowercase letter
            </li>
            <li className={/[0-9]/.test(newPassword) ? 'text-green-600' : ''}>
              • One number
            </li>
            <li className={/[^A-Za-z0-9]/.test(newPassword) ? 'text-green-600' : ''}>
              • One special character
            </li>
          </ul>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Confirm Password
        </label>
        <Input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm new password"
          required
          disabled={isLoading}
        />
      </div>

      <div className="space-y-3 pt-2">
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Resetting Password...
            </>
          ) : (
            'Reset Password'
          )}
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={() => setStep('email')}
          disabled={isLoading}
          className="w-full"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Change Email
        </Button>
      </div>
    </form>
  );

  const renderSuccessStep = () => (
    <div className="text-center py-8">
      <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
        <CheckCircle className="h-12 w-12 text-green-600" />
      </div>
      <h2 className="text-2xl font-bold text-slate-900 mb-2">
        Password Reset Successful!
      </h2>
      <p className="text-slate-600 mb-6">
        Your password has been reset successfully. You will be redirected to the login page shortly.
      </p>
      <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        Redirecting...
      </div>
    </div>
  );

  return (
    <div className="max-w-md mx-auto">
      <Card>
        {step === 'email' && renderEmailStep()}
        {step === 'otp' && renderOTPStep()}
        {step === 'success' && renderSuccessStep()}
      </Card>
    </div>
  );
}
