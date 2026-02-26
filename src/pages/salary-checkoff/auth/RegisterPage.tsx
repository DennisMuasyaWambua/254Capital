import React, { useState } from 'react';
import { Button } from '@/components/salary-checkoff/ui/Button';
import { Input } from '@/components/salary-checkoff/ui/Input';
import { Select } from '@/components/salary-checkoff/ui/Select';
import { ProgressSteps } from '@/components/salary-checkoff/ui/ProgressSteps';
import { Card } from '@/components/salary-checkoff/ui/Card';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
interface RegisterPageProps {
  onBackToLogin: () => void;
  onRegisterSuccess: () => void;
}
export function RegisterPage({
  onBackToLogin,
  onRegisterSuccess
}: RegisterPageProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const steps = [
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
    label: 'Banking'
  },
  {
    id: 4,
    label: 'Review'
  }];

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep((prev) => prev + 1);
    } else {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        onRegisterSuccess();
      }, 2000);
    }
  };
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    } else {
      onBackToLogin();
    }
  };
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
            {currentStep === 1 &&
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Full Name" placeholder="John Kamau" />
                  <Input label="National ID" placeholder="12345678" />
                  <Input
                  label="Email Address"
                  type="email"
                  placeholder="john@example.com" />

                  <Input label="Phone Number" placeholder="0712 345 678" />
                  <Input
                  label="Password"
                  type="password"
                  placeholder="••••••••" />

                  <Input
                  label="Confirm Password"
                  type="password"
                  placeholder="••••••••" />

                </div>
              </div>
            }

            {currentStep === 2 &&
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">
                  Employment Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                  label="Employer"
                  options={[
                  {
                    value: 'safaricom',
                    label: 'Safaricom PLC'
                  },
                  {
                    value: 'kplc',
                    label: 'Kenya Power'
                  },
                  {
                    value: 'kcb',
                    label: 'KCB Bank'
                  },
                  {
                    value: 'equity',
                    label: 'Equity Bank'
                  }]
                  } />

                  <Input label="Employee ID" placeholder="EMP-001" />
                  <Input label="Department" placeholder="Engineering" />
                  <Input
                  label="Monthly Gross Salary (KES)"
                  type="number"
                  placeholder="150000" />

                  <Input label="Date of Employment" type="date" />
                  <Select
                  label="Employment Type"
                  options={[
                  {
                    value: 'permanent',
                    label: 'Permanent'
                  },
                  {
                    value: 'contract',
                    label: 'Contract'
                  }]
                  } />

                </div>
              </div>
            }

            {currentStep === 3 &&
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">
                  Banking Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                  label="Bank Name"
                  options={[
                  {
                    value: 'kcb',
                    label: 'KCB Bank'
                  },
                  {
                    value: 'equity',
                    label: 'Equity Bank'
                  },
                  {
                    value: 'coop',
                    label: 'Co-operative Bank'
                  },
                  {
                    value: 'ncba',
                    label: 'NCBA Bank'
                  }]
                  } />

                  <Input label="Account Number" placeholder="1234567890" />
                  <Input label="Branch Name" placeholder="Nairobi CBD" />
                  <Input
                  label="M-Pesa Number"
                  placeholder="0712 345 678"
                  helperText="For mobile disbursements" />

                </div>
              </div>
            }

            {currentStep === 4 &&
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">
                  Review & Submit
                </h3>

                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="block text-slate-500">Full Name</span>
                      <span className="font-medium">John Kamau</span>
                    </div>
                    <div>
                      <span className="block text-slate-500">National ID</span>
                      <span className="font-medium">12345678</span>
                    </div>
                    <div>
                      <span className="block text-slate-500">Employer</span>
                      <span className="font-medium">Safaricom PLC</span>
                    </div>
                    <div>
                      <span className="block text-slate-500">Gross Salary</span>
                      <span className="font-medium">KES 150,000</span>
                    </div>
                    <div>
                      <span className="block text-slate-500">Bank</span>
                      <span className="font-medium">KCB Bank</span>
                    </div>
                    <div>
                      <span className="block text-slate-500">M-Pesa</span>
                      <span className="font-medium">0712 345 678</span>
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
              </div>
            }

            <div className="flex justify-between pt-6 border-t border-slate-100 mt-6">
              <Button
                variant="ghost"
                onClick={handleBack}
                leftIcon={<ArrowLeft className="h-4 w-4" />}>

                {currentStep === 1 ? 'Back to Login' : 'Previous'}
              </Button>
              <Button
                onClick={handleNext}
                isLoading={isLoading}
                rightIcon={
                currentStep === 4 ?
                <Check className="h-4 w-4" /> :

                <ArrowRight className="h-4 w-4" />

                }>

                {currentStep === 4 ? 'Submit Application' : 'Next Step'}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>);

}