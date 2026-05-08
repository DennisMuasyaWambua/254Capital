import React, { useState } from 'react';
import { Card } from '@/components/salary-checkoff/ui/Card';
import { Button } from '@/components/salary-checkoff/ui/Button';
import { Input } from '@/components/salary-checkoff/ui/Input';
import { Lock, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { authService } from '@/services/salary-checkoff/auth.service';
import { ApiError } from '@/services/salary-checkoff/api';

interface ChangePasswordProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function ChangePassword({ onClose, onSuccess }: ChangePasswordProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Call real API
      await authService.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });

      setIsSuccess(true);
      setIsLoading(false);

      // Wait a bit then logout (tokens are already cleared by service)
      setTimeout(() => {
        onSuccess();
      }, 2000);
    } catch (err: any) {
      setIsLoading(false);
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to change password. Please try again.');
    }
  };

  if (isSuccess) {
    return (
      <div className="max-w-md mx-auto py-12">
        <Card className="p-8 text-center animate-fade-in">
          <div className="flex justify-center mb-6">
            <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Password Changed</h2>
          <p className="text-slate-600 mb-6">
            Your password has been updated successfully. You will be logged out in a moment.
          </p>
          <div className="animate-pulse text-sm text-slate-400">
            Logging out...
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto py-8">
      <button
        onClick={onClose}
        className="text-sm text-[#008080] hover:text-[#006666] mb-6 flex items-center group transition-colors"
      >
        <ArrowLeft className="h-4 w-4 mr-1 group-hover:-translate-x-1 transition-transform" />
        Back to Dashboard
      </button>

      <Card className="p-8 animate-fade-in">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900">Change Password</h2>
          <p className="mt-2 text-slate-600">
            Update your account password to keep it secure.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Current Password"
            type="password"
            placeholder="••••••••"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            leftIcon={<Lock className="h-5 w-5" />}
            required
          />

          <Input
            label="New Password"
            type="password"
            placeholder="••••••••"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            leftIcon={<Lock className="h-5 w-5" />}
            required
            helperText="At least 8 characters"
          />

          <Input
            label="Confirm New Password"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            leftIcon={<Lock className="h-5 w-5" />}
            error={error}
            required
          />

          <div className="pt-2">
            <Button
              type="submit"
              className="w-full"
              isLoading={isLoading}
            >
              Update Password
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full mt-2"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
