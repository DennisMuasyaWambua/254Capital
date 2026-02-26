import React, { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/salary-checkoff/ui/Button';
import { Input } from '@/components/salary-checkoff/ui/Input';
import {
  Phone,
  ArrowRight,
  CheckCircle2,
  RefreshCw,
  Lock,
  Mail,
  Shield } from
'lucide-react';
interface LoginPageProps {
  onLogin: (role: 'employee' | 'hr' | 'admin') => void;
  onRegisterClick: () => void;
}
type AuthStep = 'phone' | 'otp';
type LoginMode = 'employee' | 'staff';
export function LoginPage({ onLogin, onRegisterClick }: LoginPageProps) {
  const [loginMode, setLoginMode] = useState<LoginMode>('employee');
  // Employee OTP state
  const [phone, setPhone] = useState('');
  const [otpStep, setOtpStep] = useState<AuthStep>('phone');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [phoneError, setPhoneError] = useState('');
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  // Staff login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // Countdown timer for OTP resend
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);
  const maskPhone = (p: string) => {
    const digits = p.replace(/\D/g, '');
    if (digits.length < 6) return p;
    return digits.slice(0, 2) + '*'.repeat(digits.length - 5) + digits.slice(-3);
  };
  const handleSendOtp = () => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 9) {
      setPhoneError('Please enter a valid Kenyan mobile number');
      return;
    }
    setPhoneError('');
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setOtpStep('otp');
      setCountdown(60);
    }, 1500);
  };
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };
  const handleVerifyOtp = () => {
    const code = otp.join('');
    if (code.length < 6) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLogin('employee');
    }, 1500);
  };
  const handleResendOtp = () => {
    setOtp(['', '', '', '', '', '']);
    setCountdown(60);
    otpRefs.current[0]?.focus();
  };
  const handleStaffLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLogin('hr');
    }, 1500);
  };
  const otpComplete = otp.every((d) => d !== '');
  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#11103a] relative overflow-hidden flex-col justify-between p-12 text-white">
        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-8">
            <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center">
              <span className="text-[#11103a] font-bold text-xl">254</span>
            </div>
            <span className="text-2xl font-bold">Capital</span>
          </div>
          <h1 className="text-4xl font-bold mb-6 leading-tight">
            Financial Freedom for
            <br />
            Every Employee
          </h1>
          <p className="text-lg text-white/90 max-w-md">
            Access salary advances and loans instantly with our secure check-off
            system. No collateral, no hassle.
          </p>
        </div>

        <div className="relative z-10 space-y-6">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold">OTP Secured Login</h3>
              <p className="text-sm text-white/80">
                No passwords — verify with your phone
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold">Low Interest Rates</h3>
              <p className="text-sm text-white/80">Competitive 5% flat rate</p>
            </div>
          </div>
        </div>

        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-[#008080]/20 rounded-full blur-3xl" />
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center p-8 sm:p-12 lg:p-24 bg-white">
        <div className="max-w-md w-full mx-auto">
          {/* Mode Toggle */}
          <div className="flex bg-slate-100 rounded-lg p-1 mb-8">
            <button
              onClick={() => {
                setLoginMode('employee');
                setOtpStep('phone');
              }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${loginMode === 'employee' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>

              Employee Login
            </button>
            <button
              onClick={() => setLoginMode('staff')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${loginMode === 'staff' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>

              HR / Admin Login
            </button>
          </div>

          {/* Employee OTP Flow */}
          {loginMode === 'employee' &&
          <>
              {otpStep === 'phone' &&
            <div className="space-y-6 animate-fade-in">
                  <div>
                    <h2 className="text-3xl font-bold text-slate-900">
                      Welcome back
                    </h2>
                    <p className="mt-2 text-slate-600">
                      Enter your registered mobile number to receive a one-time
                      code.
                    </p>
                  </div>

                  <Input
                label="Mobile Number"
                type="tel"
                placeholder="0712 345 678"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  setPhoneError('');
                }}
                leftIcon={<Phone className="h-5 w-5" />}
                error={phoneError}
                helperText="Use the number registered with your employer" />


                  <Button
                className="w-full"
                size="lg"
                isLoading={isLoading}
                onClick={handleSendOtp}
                rightIcon={<ArrowRight className="h-5 w-5" />}>

                    Send OTP
                  </Button>

                  <p className="text-center text-sm text-slate-600">
                    Don't have an account?{' '}
                    <button
                  onClick={onRegisterClick}
                  className="font-medium text-[#008080] hover:text-[#006666]">

                      Register here
                    </button>
                  </p>
                </div>
            }

              {otpStep === 'otp' &&
            <div className="space-y-6 animate-slide-in-right">
                  <div>
                    <button
                  onClick={() => setOtpStep('phone')}
                  className="text-sm text-[#008080] hover:text-[#006666] mb-4 flex items-center">

                      ← Change number
                    </button>
                    <h2 className="text-3xl font-bold text-slate-900">
                      Enter OTP
                    </h2>
                    <p className="mt-2 text-slate-600">
                      We sent a 6-digit code to{' '}
                      <span className="font-semibold text-slate-900">
                        {maskPhone(phone)}
                      </span>
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Valid for 5 minutes
                    </p>
                  </div>

                  {/* OTP Input Boxes */}
                  <div className="flex gap-3 justify-center">
                    {otp.map((digit, i) =>
                <input
                  key={i}
                  ref={(el) => otpRefs.current[i] = el}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  className={`
                          otp-input w-12 h-14 text-center text-xl font-bold rounded-lg border-2 
                          transition-all duration-200 focus:outline-none
                          ${digit ? 'border-[#008080] bg-[#E0F2F2] text-[#008080] scale-105' : 'border-slate-300 bg-white text-slate-900'}
                        `} />

                )}
                  </div>

                  <Button
                className="w-full"
                size="lg"
                isLoading={isLoading}
                disabled={!otpComplete}
                onClick={handleVerifyOtp}
                rightIcon={<CheckCircle2 className="h-5 w-5" />}>

                    Verify & Sign In
                  </Button>

                  {/* Resend */}
                  <div className="text-center">
                    {countdown > 0 ?
                <p className="text-sm text-slate-500">
                        Resend code in{' '}
                        <span className="font-semibold text-slate-700">
                          {countdown}s
                        </span>
                      </p> :

                <button
                  onClick={handleResendOtp}
                  className="text-sm font-medium text-[#008080] hover:text-[#006666] flex items-center mx-auto gap-1">

                        <RefreshCw className="h-4 w-4" /> Resend OTP
                      </button>
                }
                  </div>
                </div>
            }
            </>
          }

          {/* Staff Login (HR / Admin) */}
          {loginMode === 'staff' &&
          <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-3xl font-bold text-slate-900">
                  Staff Login
                </h2>
                <p className="mt-2 text-slate-600">
                  HR Managers and Admins sign in with credentials.
                </p>
              </div>

              <form onSubmit={handleStaffLogin} className="space-y-5">
                <Input
                label="Email address"
                type="email"
                placeholder="hr@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="h-5 w-5" />}
                required />

                <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock className="h-5 w-5" />}
                required />

                <Button
                type="submit"
                className="w-full"
                size="lg"
                isLoading={isLoading}
                rightIcon={<ArrowRight className="h-5 w-5" />}>

                  Sign In
                </Button>
              </form>
            </div>
          }

          {/* Demo Access */}
          <div className="mt-10 pt-8 border-t border-slate-100">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider text-center mb-4">
              Demo Access
            </p>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => onLogin('employee')}
                className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors">

                Employee
              </button>
              <button
                onClick={() => onLogin('hr')}
                className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors">

                HR Manager
              </button>
              <button
                onClick={() => onLogin('admin')}
                className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors">

                Admin
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>);

}