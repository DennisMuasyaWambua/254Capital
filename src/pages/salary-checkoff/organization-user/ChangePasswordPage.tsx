import React, { useState } from 'react';
import { Card } from '@/components/salary-checkoff/ui/Card';
import { Button } from '@/components/salary-checkoff/ui/Button';
import { Input } from '@/components/salary-checkoff/ui/Input';
import { Lock, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { passwordService } from '@/services/salary-checkoff/company-management.service';

interface ChangePasswordPageProps {
  forceChange?: boolean;
  onSuccess?: () => void;
}

export function ChangePasswordPage({ forceChange = false, onSuccess }: ChangePasswordPageProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    message: '',
    color: 'bg-gray-300',
  });
  const [showSuccess, setShowSuccess] = useState(false);

  // Password validation requirements
  const requirements = [
    { label: 'At least 8 characters', test: (pwd: string) => pwd.length >= 8 },
    { label: 'One uppercase letter', test: (pwd: string) => /[A-Z]/.test(pwd) },
    { label: 'One lowercase letter', test: (pwd: string) => /[a-z]/.test(pwd) },
    { label: 'One number', test: (pwd: string) => /[0-9]/.test(pwd) },
    { label: 'One special character (!@#$%^&*)', test: (pwd: string) => /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(pwd) },
  ];

  // Calculate password strength
  const calculatePasswordStrength = (password: string) => {
    const passedReqs = requirements.filter((req) => req.test(password)).length;
    const percentage = (passedReqs / requirements.length) * 100;

    let score = 0;
    let message = '';
    let color = 'bg-gray-300';

    if (percentage === 0) {
      score = 0;
      message = '';
      color = 'bg-gray-300';
    } else if (percentage <= 40) {
      score = 1;
      message = 'Weak';
      color = 'bg-red-500';
    } else if (percentage <= 60) {
      score = 2;
      message = 'Fair';
      color = 'bg-orange-500';
    } else if (percentage <= 80) {
      score = 3;
      message = 'Good';
      color = 'bg-yellow-500';
    } else {
      score = 4;
      message = 'Strong';
      color = 'bg-green-500';
    }

    setPasswordStrength({ score, message, color });
  };

  const handleNewPasswordChange = (value: string) => {
    setFormData({ ...formData, new_password: value });
    calculatePasswordStrength(value);
    setErrors({ ...errors, new_password: '' });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.current_password) {
      newErrors.current_password = 'Current password is required';
    }

    if (!formData.new_password) {
      newErrors.new_password = 'New password is required';
    } else {
      // Check all requirements
      const failedReqs = requirements.filter((req) => !req.test(formData.new_password));
      if (failedReqs.length > 0) {
        newErrors.new_password = 'Password does not meet all requirements';
      }
    }

    if (!formData.confirm_password) {
      newErrors.confirm_password = 'Please confirm your password';
    } else if (formData.new_password !== formData.confirm_password) {
      newErrors.confirm_password = 'Passwords do not match';
    }

    if (formData.current_password && formData.new_password && formData.current_password === formData.new_password) {
      newErrors.new_password = 'New password must be different from current password';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      await passwordService.changePassword(formData);
      setShowSuccess(true);

      // Call onSuccess callback after 2 seconds
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        }
      }, 2000);
    } catch (err: any) {
      if (err.data) {
        setErrors(err.data);
      } else {
        setErrors({
          current_password: err.message || 'Failed to change password. Please try again.',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="flex items-center justify-center min-h-[400px] animate-fade-in">
        <Card className="max-w-md w-full p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Password Changed Successfully!</h2>
          <p className="text-slate-600 mb-6">
            Your password has been updated. {forceChange ? 'You can now access the system.' : 'Please use your new password for future logins.'}
          </p>
          {onSuccess && (
            <Button onClick={onSuccess} className="w-full">
              Continue
            </Button>
          )}
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Change Password</h1>
        <p className="mt-1 text-slate-600">
          {forceChange
            ? 'You must change your temporary password before accessing the system.'
            : 'Update your password to keep your account secure.'}
        </p>
      </div>

      {/* Mandatory Change Warning */}
      {forceChange && (
        <Card className="p-4 bg-yellow-50 border-yellow-200">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-yellow-900 mb-1">Password Change Required</h4>
              <p className="text-sm text-yellow-800">
                For security reasons, you must change your temporary password before continuing.
                Please choose a strong, unique password.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Change Password Form */}
      <Card>
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Current Password */}
            <div className="relative">
              <Input
                label="Current Password"
                type={showPasswords.current ? 'text' : 'password'}
                value={formData.current_password}
                onChange={(e) => {
                  setFormData({ ...formData, current_password: e.target.value });
                  setErrors({ ...errors, current_password: '' });
                }}
                error={errors.current_password}
                placeholder="Enter your current password"
                leftIcon={<Lock className="h-5 w-5" />}
                required
              />
              <button
                type="button"
                onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                className="absolute right-3 top-[38px] text-slate-400 hover:text-slate-600"
              >
                {showPasswords.current ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            {/* New Password */}
            <div className="relative">
              <Input
                label="New Password"
                type={showPasswords.new ? 'text' : 'password'}
                value={formData.new_password}
                onChange={(e) => handleNewPasswordChange(e.target.value)}
                error={errors.new_password}
                placeholder="Enter your new password"
                leftIcon={<Lock className="h-5 w-5" />}
                required
              />
              <button
                type="button"
                onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                className="absolute right-3 top-[38px] text-slate-400 hover:text-slate-600"
              >
                {showPasswords.new ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>

              {/* Password Strength Meter */}
              {formData.new_password && (
                <div className="mt-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-slate-600">Password Strength:</span>
                    <span className={`text-sm font-medium ${
                      passwordStrength.score === 1 ? 'text-red-600' :
                      passwordStrength.score === 2 ? 'text-orange-600' :
                      passwordStrength.score === 3 ? 'text-yellow-600' :
                      passwordStrength.score === 4 ? 'text-green-600' : 'text-slate-400'
                    }`}>
                      {passwordStrength.message}
                    </span>
                  </div>
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                      style={{ width: `${(passwordStrength.score / 4) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <Input
                label="Confirm New Password"
                type={showPasswords.confirm ? 'text' : 'password'}
                value={formData.confirm_password}
                onChange={(e) => {
                  setFormData({ ...formData, confirm_password: e.target.value });
                  setErrors({ ...errors, confirm_password: '' });
                }}
                error={errors.confirm_password}
                placeholder="Re-enter your new password"
                leftIcon={<Lock className="h-5 w-5" />}
                required
              />
              <button
                type="button"
                onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                className="absolute right-3 top-[38px] text-slate-400 hover:text-slate-600"
              >
                {showPasswords.confirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            {/* Password Requirements */}
            <div className="bg-slate-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-slate-900 mb-3">Password Requirements</h4>
              <ul className="space-y-2">
                {requirements.map((req, index) => {
                  const isPassed = formData.new_password && req.test(formData.new_password);
                  return (
                    <li key={index} className="flex items-center space-x-2 text-sm">
                      <div className={`flex-shrink-0 h-4 w-4 rounded-full flex items-center justify-center ${
                        isPassed ? 'bg-green-100' : 'bg-slate-200'
                      }`}>
                        {isPassed && <CheckCircle className="h-3 w-3 text-green-600" />}
                      </div>
                      <span className={isPassed ? 'text-green-700' : 'text-slate-600'}>
                        {req.label}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
              Change Password
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
