import React, { useState } from 'react';
import { Button } from '@/components/salary-checkoff/ui/Button';
import { Input } from '@/components/salary-checkoff/ui/Input';
import { Card } from '@/components/salary-checkoff/ui/Card';
import { ArrowLeft, Mail, CheckCircle2 } from 'lucide-react';
import { authService } from '@/services/salary-checkoff/auth.service';

interface ForgotPasswordProps {
  onBack: () => void;
  onSuccess: () => void;
}

export function ForgotPassword({ onBack, onSuccess }: ForgotPasswordProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await authService.forgotPassword(email);
      setIsSent(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset link. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSent) {
    return (
      <Card className="max-w-md w-full p-8 text-center animate-fade-in">
        <div className="flex justify-center mb-6">
          <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Check your email</h2>
        <p className="text-slate-600 mb-8">
          We've sent a password reset link to <span className="font-semibold text-slate-900">{email}</span>. 
          Please check your inbox and follow the instructions.
        </p>
        <Button onClick={onSuccess} className="w-full">
          Back to Login
        </Button>
      </Card>
    );
  }

  return (
    <Card className="max-w-md w-full p-8 animate-fade-in">
      <button
        onClick={onBack}
        className="text-sm text-[#008080] hover:text-[#006666] mb-6 flex items-center group transition-colors"
      >
        <ArrowLeft className="h-4 w-4 mr-1 group-hover:-translate-x-1 transition-transform" />
        Back to Login
      </button>

      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900">Forgot Password?</h2>
        <p className="mt-2 text-slate-600">
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Email Address"
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError('');
          }}
          leftIcon={<Mail className="h-5 w-5" />}
          error={error}
          required
        />

        <Button
          type="submit"
          className="w-full"
          size="lg"
          isLoading={isLoading}
        >
          Send Reset Link
        </Button>
      </form>
      
      <div className="mt-8 pt-6 border-t border-slate-100 text-center">
        <p className="text-sm text-slate-500">
          Remember your password?{' '}
          <button
            onClick={onBack}
            className="font-medium text-[#008080] hover:text-[#006666]"
          >
            Sign in
          </button>
        </p>
      </div>
    </Card>
  );
}
