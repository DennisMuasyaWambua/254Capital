import React, { useState, useEffect } from 'react';
import { Button } from '@/components/salary-checkoff/ui/Button';
import { Input } from '@/components/salary-checkoff/ui/Input';
import { Select } from '@/components/salary-checkoff/ui/Select';
import { ProgressSteps } from '@/components/salary-checkoff/ui/ProgressSteps';
import { Card } from '@/components/salary-checkoff/ui/Card';
import { ArrowLeft, ArrowRight, Check, Phone } from 'lucide-react';
import { authService } from '@/services/salary-checkoff/auth.service';
import { employerService, Employer } from '@/services/salary-checkoff/employer.service';
import { ApiError } from '@/services/salary-checkoff/api';

interface RegisterPageProps {
  onBackToLogin: () => void;
  onRegisterSuccess: () => void;
}
export function RegisterPage({
  onBackToLogin,
  onRegisterSuccess
}: RegisterPageProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 0: Phone verification
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpStep, setOtpStep] = useState<'phone' | 'otp'>('phone');
  const [countdown, setCountdown] = useState(0);
  const [maskedPhone, setMaskedPhone] = useState('');
  const otpRefs = React.useRef<(HTMLInputElement | null)[]>([]);

  // Step 1: Personal Info (required by backend)
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [email, setEmail] = useState('');

  // Step 2: Employment Info (required by backend)
  const [employeeNumber, setEmployeeNumber] = useState('');
  const [employerCode, setEmployerCode] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [mpesaNumber, setMpesaNumber] = useState('');
  const [monthlySalary, setMonthlySalary] = useState('');

  // Employer dropdown
  const [employers, setEmployers] = useState<Employer[]>([]);
  const [loadingEmployers, setLoadingEmployers] = useState(false);

  const steps = [
  {
    id: 0,
    label: 'Phone Verification'
  },
  {
    id: 1,
    label: 'Personal Info'
  },
  {
    id: 2,
    label: 'Employment'
  },
  {
    id: 3,
    label: 'Review'
  }];

  // Countdown timer for OTP resend
  React.useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  // Fetch employers when user reaches step 2
  useEffect(() => {
    if (currentStep === 2 && employers.length === 0 && !loadingEmployers) {
      const fetchEmployers = async () => {
        setLoadingEmployers(true);
        try {
          const response = await employerService.listEmployers();
          setEmployers(response.results);
        } catch (error) {
          console.error('Failed to fetch employers:', error);
          // If fetching fails, we'll allow manual entry via employer code
          setError('Unable to load employer list. Please enter your employer code manually.');
        } finally {
          setLoadingEmployers(false);
        }
      };

      fetchEmployers();
    }
  }, [currentStep, employers.length, loadingEmployers]);

  const normalizePhone = (phoneNumber: string) => {
    const digits = phoneNumber.replace(/\D/g, '');
    if (digits.startsWith('0')) {
      return '+254' + digits.substring(1);
    } else if (!digits.startsWith('+')) {
      return '+254' + digits;
    }
    return digits;
  };

  const handleSendOtp = async () => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 9) {
      setPhoneError('Please enter a valid Kenyan mobile number');
      return;
    }

    const normalizedPhone = normalizePhone(phone);
    setPhoneError('');
    setIsLoading(true);

    try {
      const response = await authService.sendOTP(normalizedPhone);
      setIsLoading(false);
      setOtpStep('otp');
      setCountdown(response.expires_in || 300);
      setMaskedPhone(response.masked_phone);
    } catch (error) {
      setIsLoading(false);
      const apiError = error as ApiError;
      setPhoneError(apiError.message || 'Failed to send OTP. Please try again.');
    }
  };

  const handleVerifyOtp = async () => {
    const code = otp.join('');
    if (code.length < 6) return;

    const normalizedPhone = normalizePhone(phone);
    setIsLoading(true);
    setError('');

    try {
      const response = await authService.verifyOTP(normalizedPhone, code);

      if (response.is_new_user && response.phone_verified) {
        // Phone verified, move to next step
        setIsLoading(false);
        setCurrentStep(1);
      } else {
        // User already exists
        setIsLoading(false);
        setError('This phone number is already registered. Please login instead.');
      }
    } catch (error) {
      setIsLoading(false);
      const apiError = error as ApiError;
      setError(apiError.message || 'Invalid OTP. Please try again.');
    }
  };

  const handleResendOtp = async () => {
    setOtp(['', '', '', '', '', '']);
    setError('');

    const normalizedPhone = normalizePhone(phone);

    try {
      const response = await authService.sendOTP(normalizedPhone);
      setCountdown(response.expires_in || 300);
      setMaskedPhone(response.masked_phone);
      otpRefs.current[0]?.focus();
    } catch (error) {
      const apiError = error as ApiError;
      setError(apiError.message || 'Failed to resend OTP. Please try again.');
    }
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

  const handleRegister = async () => {
    setIsLoading(true);
    setError('');

    try {
      const normalizedPhone = normalizePhone(phone);
      const normalizedMpesa = mpesaNumber ? normalizePhone(mpesaNumber) : undefined;

      await authService.registerEmployee({
        phone_number: normalizedPhone,
        first_name: firstName,
        last_name: lastName,
        national_id: nationalId,
        employee_id: employeeNumber,
        employer_id: employerCode,
        email: email || undefined,
        bank_name: bankName || undefined,
        bank_account_number: bankAccountNumber,
        mpesa_number: normalizedMpesa,
        monthly_gross_salary: monthlySalary,
      });

      setIsLoading(false);
      onRegisterSuccess();
    } catch (error) {
      setIsLoading(false);
      const apiError = error as ApiError;
      setError(apiError.message || 'Registration failed. Please try again.');
    }
  };

  const handleNext = () => {
    // Clear any previous errors
    setError('');

    if (currentStep === 0 && otpStep === 'phone') {
      handleSendOtp();
      return;
    }

    if (currentStep === 0 && otpStep === 'otp') {
      handleVerifyOtp();
      return;
    }

    // Validate step 1 (Personal Info)
    if (currentStep === 1) {
      if (!firstName || !lastName || !nationalId) {
        setError('Please fill in all required fields');
        return;
      }
    }

    // Validate step 2 (Employment & Banking)
    if (currentStep === 2) {
      if (!employeeNumber || !employerCode || !bankName || !bankAccountNumber || !mpesaNumber || !monthlySalary) {
        setError('Please fill in all required fields');
        return;
      }
      // Validate salary is a positive number
      const salaryNum = parseFloat(monthlySalary);
      if (isNaN(salaryNum) || salaryNum <= 0) {
        setError('Please enter a valid monthly salary');
        return;
      }
    }

    if (currentStep < 3) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleRegister();
    }
  };

  const handleBack = () => {
    setError('');

    if (currentStep === 0 && otpStep === 'otp') {
      setOtpStep('phone');
      return;
    }

    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    } else {
      onBackToLogin();
    }
  };

  const otpComplete = otp.every((d) => d !== '');
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-900">
            Create your account
          </h2>
          <p className="mt-2 text-slate-600">
            Join 254 Capital to access salary advances instantly
          </p>
        </div>

        <div className="mb-8">
          <ProgressSteps steps={steps} currentStep={currentStep} />
        </div>

        <Card className="shadow-lg border-0">
          <div className="space-y-6">
            {/* Step 0: Phone Verification */}
            {currentStep === 0 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                {otpStep === 'phone' ? (
                  <>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">
                        Verify Your Phone Number
                      </h3>
                      <p className="mt-2 text-slate-600 text-sm">
                        Enter your mobile number to receive a verification code
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
                      helperText="Your personal mobile number"
                    />
                  </>
                ) : (
                  <>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">
                        Enter Verification Code
                      </h3>
                      <p className="mt-2 text-slate-600 text-sm">
                        We sent a 6-digit code to{' '}
                        <span className="font-semibold">{maskedPhone}</span>
                      </p>
                    </div>

                    <div className="flex gap-3 justify-center">
                      {otp.map((digit, i) => (
                        <input
                          key={i}
                          ref={(el) => (otpRefs.current[i] = el)}
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
                          `}
                        />
                      ))}
                    </div>

                    {error && (
                      <div className="text-sm text-red-600 text-center">{error}</div>
                    )}

                    <div className="text-center">
                      {countdown > 0 ? (
                        <p className="text-sm text-slate-500">
                          Resend code in{' '}
                          <span className="font-semibold text-slate-700">{countdown}s</span>
                        </p>
                      ) : (
                        <button
                          onClick={handleResendOtp}
                          className="text-sm font-medium text-[#008080] hover:text-[#006666]"
                        >
                          Resend OTP
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Step 1: Personal Info */}
            {currentStep === 1 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="First Name"
                    placeholder="John"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                  <Input
                    label="Last Name"
                    placeholder="Kamau"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                  <Input
                    label="National ID"
                    placeholder="12345678"
                    value={nationalId}
                    onChange={(e) => setNationalId(e.target.value)}
                    required
                  />
                  <Input
                    label="Email Address (Optional)"
                    type="email"
                    placeholder="john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    helperText="Your personal or work email"
                  />
                </div>

                {error && (
                  <div className="text-sm text-red-600 text-center">{error}</div>
                )}
              </div>
            )}

            {/* Step 2: Employment */}
            {currentStep === 2 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">
                  Employment & Banking Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Employee Number"
                    placeholder="EMP-001"
                    value={employeeNumber}
                    onChange={(e) => setEmployeeNumber(e.target.value)}
                    helperText="Your unique employee ID"
                    required
                  />
{employers.length > 0 ? (
                    <Select
                      label="Employer"
                      value={employerCode}
                      onChange={(e) => setEmployerCode(e.target.value)}
                      required
                      disabled={loadingEmployers}
                      options={employers.map((employer) => ({
                        value: employer.id,
                        label: employer.name
                      }))}
                    />
                  ) : (
                    <Input
                      label="Employer Code"
                      placeholder="e.g., SAFARICOM"
                      value={employerCode}
                      onChange={(e) => setEmployerCode(e.target.value)}
                      helperText="Your company's registration code"
                      required
                    />
                  )}
                  <Input
                    label="Bank Name"
                    placeholder="e.g., KCB Bank, Equity Bank"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    helperText="Your primary bank for disbursements"
                    required
                  />
                  <Input
                    label="Bank Account Number"
                    placeholder="e.g., 1234567890"
                    value={bankAccountNumber}
                    onChange={(e) => setBankAccountNumber(e.target.value)}
                    helperText="Your bank account number"
                    required
                  />
                  <Input
                    label="M-Pesa Number"
                    type="tel"
                    placeholder="0712 345 678"
                    value={mpesaNumber}
                    onChange={(e) => setMpesaNumber(e.target.value)}
                    helperText="For M-Pesa disbursements"
                    required
                  />
                  <Input
                    label="Monthly Gross Salary (KES)"
                    type="number"
                    placeholder="50000"
                    value={monthlySalary}
                    onChange={(e) => setMonthlySalary(e.target.value)}
                    helperText="Your total monthly salary before deductions"
                    required
                  />
                </div>

                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> Please contact your HR department for your employee
                    number if you don't have it. Ensure all banking and salary details are accurate as they will be used for loan eligibility verification and disbursements.
                  </p>
                </div>

                {error && (
                  <div className="text-sm text-red-600 text-center">{error}</div>
                )}
              </div>
            )}

            {/* Step 3: Review */}
            {currentStep === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">
                  Review & Submit
                </h3>

                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="block text-slate-500">Full Name</span>
                      <span className="font-medium">{firstName} {lastName}</span>
                    </div>
                    <div>
                      <span className="block text-slate-500">National ID</span>
                      <span className="font-medium">{nationalId}</span>
                    </div>
                    <div>
                      <span className="block text-slate-500">Email</span>
                      <span className="font-medium">{email || 'Not provided'}</span>
                    </div>
                    <div>
                      <span className="block text-slate-500">Phone Number</span>
                      <span className="font-medium">{phone}</span>
                    </div>
                    <div>
                      <span className="block text-slate-500">Employer</span>
                      <span className="font-medium">{employers.find(e => e.id === employerCode)?.name || employerCode}</span>
                    </div>
                    <div>
                      <span className="block text-slate-500">Employee Number</span>
                      <span className="font-medium">{employeeNumber}</span>
                    </div>
                    <div>
                      <span className="block text-slate-500">Bank</span>
                      <span className="font-medium">{bankName}</span>
                    </div>
                    <div>
                      <span className="block text-slate-500">Account Number</span>
                      <span className="font-medium">{bankAccountNumber}</span>
                    </div>
                    <div>
                      <span className="block text-slate-500">M-Pesa</span>
                      <span className="font-medium">{mpesaNumber}</span>
                    </div>
                    <div>
                      <span className="block text-slate-500">Monthly Salary</span>
                      <span className="font-medium">KES {parseFloat(monthlySalary || '0').toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <input
                  type="checkbox"
                  id="terms"
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-[#008080] focus:ring-[#008080]" />

                  <label htmlFor="terms" className="text-sm text-slate-600">
                    I agree to the{' '}
                    <a href="#" className="text-[#008080] hover:text-[#006666]">
                      Terms and Conditions
                    </a>{' '}
                    and authorize 254 Capital to verify my employment details.
                  </label>
                </div>

                {error && (
                  <div className="text-sm text-red-600 text-center">{error}</div>
                )}
              </div>
            )}

            <div className="flex justify-between pt-6 border-t border-slate-100 mt-6">
              <Button
                variant="ghost"
                onClick={handleBack}
                disabled={isLoading}
                leftIcon={<ArrowLeft className="h-4 w-4" />}
              >
                {currentStep === 0 && otpStep === 'phone' ? 'Back to Login' : 'Previous'}
              </Button>
              <Button
                onClick={handleNext}
                isLoading={isLoading}
                disabled={
                  (currentStep === 0 && otpStep === 'otp' && !otpComplete) ||
                  isLoading
                }
                rightIcon={
                  currentStep === 3 ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <ArrowRight className="h-4 w-4" />
                  )
                }
              >
                {currentStep === 0 && otpStep === 'phone'
                  ? 'Send OTP'
                  : currentStep === 0 && otpStep === 'otp'
                  ? 'Verify OTP'
                  : currentStep === 3
                  ? 'Submit Application'
                  : 'Next Step'}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>);

}