import React, { useState } from 'react';
import { Card } from '@/components/salary-checkoff/ui/Card';
import { Button } from '@/components/salary-checkoff/ui/Button';
import { Input } from '@/components/salary-checkoff/ui/Input';
import { authService } from '@/services/salary-checkoff/auth.service';
import { Loader2, AlertCircle, CheckCircle, Lock, X } from 'lucide-react';

interface ChangePasswordProps {
  onClose?: () => void;
  onSuccess?: () => void;
}

export function ChangePassword({ onClose, onSuccess }: ChangePasswordProps) {
  const [formData, setFormData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] = useState<{
    score: number;
    message: string;
  }>({ score: 0, message: '' });

  const validatePasswordStrength = (password: string) => {
    let score = 0;
    let message = '';

    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score === 0) {
      message = '';
    } else if (score <= 2) {
      message = 'Weak password';
    } else if (score === 3) {
      message = 'Medium password';
    } else if (score === 4) {
      message = 'Strong password';
    } else {
      message = 'Very strong password';
    }

    return { score, message };
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === 'new_password') {
      setPasswordStrength(validatePasswordStrength(value));
    }

    setError(null);
  };

  const validateForm = (): boolean => {
    if (!formData.current_password) {
      setError('Current password is required');
      return false;
    }

    if (!formData.new_password) {
      setError('New password is required');
      return false;
    }

    if (formData.new_password.length < 8) {
      setError('New password must be at least 8 characters long');
      return false;
    }

    if (!/[A-Z]/.test(formData.new_password)) {
      setError('New password must contain at least one uppercase letter');
      return false;
    }

    if (!/[a-z]/.test(formData.new_password)) {
      setError('New password must contain at least one lowercase letter');
      return false;
    }

    if (!/[0-9]/.test(formData.new_password)) {
      setError('New password must contain at least one number');
      return false;
    }

    if (!/[^A-Za-z0-9]/.test(formData.new_password)) {
      setError('New password must contain at least one special character');
      return false;
    }

    if (formData.new_password !== formData.confirm_password) {
      setError('New passwords do not match');
      return false;
    }

    if (formData.current_password === formData.new_password) {
      setError('New password must be different from current password');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      const response = await authService.changePassword(formData);

      setSuccess(response.detail);

      // Reset form
      setFormData({
        current_password: '',
        new_password: '',
        confirm_password: '',
      });

      if (response.requires_relogin) {
        setTimeout(() => {
          if (onSuccess) onSuccess();
          // Redirect to login page
          window.location.href = '/salary-checkoff/login';
        }, 2000);
      } else {
        setTimeout(() => {
          if (onClose) onClose();
        }, 2000);
      }
    } catch (error: any) {
      console.error('Change password error:', error);
      setError(error.message || 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength.score <= 2) return 'bg-red-500';
    if (passwordStrength.score === 3) return 'bg-yellow-500';
    if (passwordStrength.score === 4) return 'bg-green-500';
    return 'bg-green-600';
  };

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Lock className="h-6 w-6 text-[#008080]" />
            <h2 className="text-xl font-bold text-slate-900">Change Password</h2>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-800">
            <AlertCircle className="h-5 w-5 mr-2 text-red-600" />
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center text-green-800">
            <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Current Password
            </label>
            <Input
              type="password"
              name="current_password"
              value={formData.current_password}
              onChange={handleChange}
              placeholder="Enter current password"
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              New Password
            </label>
            <Input
              type="password"
              name="new_password"
              value={formData.new_password}
              onChange={handleChange}
              placeholder="Enter new password"
              required
              disabled={isLoading}
            />
            {formData.new_password && (
              <div className="mt-2">
                <div className="flex gap-1 mb-1">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <div
                      key={level}
                      className={`h-1 flex-1 rounded ${
                        level <= passwordStrength.score
                          ? getPasswordStrengthColor()
                          : 'bg-slate-200'
                      }`}
                    />
                  ))}
                </div>
                {passwordStrength.message && (
                  <p className="text-xs text-slate-600">
                    {passwordStrength.message}
                  </p>
                )}
              </div>
            )}
            <div className="mt-2 space-y-1">
              <p className="text-xs text-slate-600">Password must contain:</p>
              <ul className="text-xs text-slate-600 space-y-1 ml-4">
                <li className={formData.new_password.length >= 8 ? 'text-green-600' : ''}>
                  • At least 8 characters
                </li>
                <li className={/[A-Z]/.test(formData.new_password) ? 'text-green-600' : ''}>
                  • One uppercase letter
                </li>
                <li className={/[a-z]/.test(formData.new_password) ? 'text-green-600' : ''}>
                  • One lowercase letter
                </li>
                <li className={/[0-9]/.test(formData.new_password) ? 'text-green-600' : ''}>
                  • One number
                </li>
                <li className={/[^A-Za-z0-9]/.test(formData.new_password) ? 'text-green-600' : ''}>
                  • One special character
                </li>
              </ul>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Confirm New Password
            </label>
            <Input
              type="password"
              name="confirm_password"
              value={formData.confirm_password}
              onChange={handleChange}
              placeholder="Confirm new password"
              required
              disabled={isLoading}
            />
          </div>

          <div className="flex gap-3 pt-4">
            {onClose && (
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
                className="flex-1"
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Changing Password...
                </>
              ) : (
                'Change Password'
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
