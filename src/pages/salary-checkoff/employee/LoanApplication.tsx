import React, { useState } from 'react';
import { Card } from '@/components/salary-checkoff/ui/Card';
import { Input } from '@/components/salary-checkoff/ui/Input';
import { Button } from '@/components/salary-checkoff/ui/Button';
import { ProgressSteps } from '@/components/salary-checkoff/ui/ProgressSteps';
import { FileUpload } from '@/components/salary-checkoff/ui/FileUpload';
import { TermsModal } from './TermsModal';
import {
  getFirstDeductionDate,
  formatDeductionDate } from
'@/utils/salary-checkoff/deductionDate';
import {
  Calculator,
  ArrowRight,
  ArrowLeft,
  Check,
  Calendar,
  AlertCircle } from
'lucide-react';
interface LoanApplicationProps {
  onCancel: () => void;
  onSubmitSuccess: () => void;
}
export function LoanApplication({
  onCancel,
  onSubmitSuccess
}: LoanApplicationProps) {
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState<number>(50000);
  const [period, setPeriod] = useState<number>(6);
  const [isLoading, setIsLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsTimestamp, setTermsTimestamp] = useState<string | null>(null);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [confirmChecked, setConfirmChecked] = useState(false);
  // Calculations
  const interestRate = 0.05;
  const totalInterest = amount * interestRate;
  const totalRepayment = amount + totalInterest;
  const monthlyDeduction = period > 0 ? totalRepayment / period : 0;
  // Deduction date logic — assume disbursement today for projection
  const today = new Date();
  const firstDeductionDate = getFirstDeductionDate(today);
  const isSameMonth = today.getDate() <= 15;
  const firstDeductionLabel = formatDeductionDate(firstDeductionDate);
  const handleNext = () => {
    if (step === 2 && !termsAccepted) {
      setIsTermsOpen(true);
      return;
    }
    if (step < 3) {
      setStep((prev) => prev + 1);
    } else {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        onSubmitSuccess();
      }, 2000);
    }
  };
  const handleBack = () => {
    if (step > 1) setStep((prev) => prev - 1);else
    onCancel();
  };
  const handleTermsAccept = (timestamp: string) => {
    setTermsAccepted(true);
    setTermsTimestamp(timestamp);
    setStep(3);
  };
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Apply for a Loan</h1>
        <Button variant="ghost" onClick={onCancel}>
          Cancel Application
        </Button>
      </div>

      <ProgressSteps
        steps={[
        {
          id: 1,
          label: 'Loan Details'
        },
        {
          id: 2,
          label: 'Documents'
        },
        {
          id: 3,
          label: 'Review & Submit'
        }]
        }
        currentStep={step} />


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            {step === 1 &&
            <div className="space-y-6 animate-fade-in">
                <h3 className="text-lg font-semibold text-slate-900">
                  Loan Configuration
                </h3>
                <Input
                label="Loan Amount (KES)"
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                min={1000} />

                <Input
                label="Repayment Period (Months)"
                type="number"
                value={period}
                onChange={(e) => setPeriod(Number(e.target.value) || 1)}
                min={1}
                max={60}
                helperText="Enter the number of months (e.g. 3, 6, 12)" />

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Purpose of Loan (Optional)
                  </label>
                  <textarea
                  className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-[#00BCD4] focus:ring-1 focus:ring-[#00BCD4] h-24 resize-none"
                  placeholder="e.g. School fees, Medical emergency..." />

                </div>
              </div>
            }

            {step === 2 &&
            <div className="space-y-6 animate-slide-in-right">
                <h3 className="text-lg font-semibold text-slate-900">
                  Required Documents
                </h3>
                <div className="space-y-4">
                  <FileUpload
                  label="National ID (Front)"
                  onFilesSelected={() => {}}
                  helperText="Clear photo or scan of your ID front side" />

                  <FileUpload
                  label="National ID (Back)"
                  onFilesSelected={() => {}}
                  helperText="Clear photo or scan of your ID back side" />

                  <FileUpload
                  label="Latest 3 Payslips"
                  onFilesSelected={() => {}}
                  helperText="Upload your most recent payslips (PDF preferred)"
                  accept=".pdf" />

                </div>

                {!termsAccepted &&
              <div className="flex items-start space-x-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-amber-800">
                        Terms & Conditions Required
                      </p>
                      <p className="text-xs text-amber-700 mt-1">
                        You must read and accept the Terms & Conditions before
                        proceeding to review. Clicking "Next Step" will open the
                        T&C for your review.
                      </p>
                    </div>
                  </div>
              }

                {termsAccepted && termsTimestamp &&
              <div className="flex items-center space-x-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg animate-success-bounce">
                    <Check className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-emerald-800">
                        Terms & Conditions Accepted
                      </p>
                      <p className="text-xs text-emerald-600 mt-0.5">
                        Accepted on{' '}
                        {new Date(termsTimestamp).toLocaleString('en-KE')}
                      </p>
                    </div>
                  </div>
              }
              </div>
            }

            {step === 3 &&
            <div className="space-y-6 animate-slide-in-right">
                <h3 className="text-lg font-semibold text-slate-900">
                  Review Application
                </h3>
                <div className="bg-slate-50 rounded-lg p-4 space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Loan Amount</span>
                    <span className="font-medium">
                      KES {amount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Repayment Period</span>
                    <span className="font-medium">{period} Months</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Interest Rate</span>
                    <span className="font-medium">5% Flat</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Monthly Deduction</span>
                    <span className="font-medium">
                      KES {Math.round(monthlyDeduction).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 pt-3">
                    <span className="font-semibold text-slate-900">
                      Total Repayment
                    </span>
                    <span className="font-bold text-[#00BCD4]">
                      KES {totalRepayment.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* First Deduction Date */}
                <div
                className={`flex items-start space-x-3 p-4 rounded-lg border ${isSameMonth ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>

                  <Calendar
                  className={`h-5 w-5 flex-shrink-0 mt-0.5 ${isSameMonth ? 'text-emerald-600' : 'text-amber-600'}`} />

                  <div>
                    <p
                    className={`text-sm font-medium ${isSameMonth ? 'text-emerald-800' : 'text-amber-800'}`}>

                      Projected First Deduction:{' '}
                      <strong>{firstDeductionLabel}</strong>
                    </p>
                    <p
                    className={`text-xs mt-1 ${isSameMonth ? 'text-emerald-700' : 'text-amber-700'}`}>

                      {isSameMonth ?
                    'Loan disbursed on or before the 15th — first deduction this month.' :
                    'Loan disbursed after the 15th — first deduction will be next month.'}
                    </p>
                  </div>
                </div>

                {/* T&C Timestamp */}
                {termsTimestamp &&
              <div className="text-xs text-slate-500 flex items-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <Check className="h-4 w-4 text-emerald-500" />
                    Terms & Conditions accepted:{' '}
                    {new Date(termsTimestamp).toLocaleString('en-KE')}
                  </div>
              }

                <div className="flex items-start space-x-3">
                  <input
                  type="checkbox"
                  id="confirm"
                  checked={confirmChecked}
                  onChange={(e) => setConfirmChecked(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-[#00BCD4] focus:ring-[#00BCD4]" />

                  <label htmlFor="confirm" className="text-sm text-slate-600">
                    I confirm that the information provided is accurate and I
                    agree to the monthly salary deductions.
                  </label>
                </div>
              </div>
            }

            <div className="flex justify-between pt-6 mt-6 border-t border-slate-100">
              <Button
                variant="ghost"
                onClick={handleBack}
                leftIcon={<ArrowLeft className="h-4 w-4" />}>

                Back
              </Button>
              <Button
                onClick={handleNext}
                isLoading={isLoading}
                disabled={step === 3 && !confirmChecked}
                rightIcon={
                step === 3 ?
                <Check className="h-4 w-4" /> :

                <ArrowRight className="h-4 w-4" />

                }>

                {step === 2 && !termsAccepted ?
                'Review Terms & Continue' :
                step === 3 ?
                'Submit Application' :
                'Next Step'}
              </Button>
            </div>
          </Card>
        </div>

        {/* Live Calculator Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-[#008080] rounded-xl p-6 text-white sticky top-24 shadow-lg">
            <div className="flex items-center space-x-2 mb-6">
              <Calculator className="h-5 w-5" />
              <h3 className="font-semibold text-lg">Loan Summary</h3>
            </div>

            <div className="space-y-6">
              <div>
                <p className="text-white/80 text-sm mb-1">Monthly Deduction</p>
                <p className="text-3xl font-bold">
                  KES {Math.round(monthlyDeduction).toLocaleString()}
                </p>
              </div>

              <div className="space-y-3 pt-4 border-t border-white/20">
                <div className="flex justify-between text-sm">
                  <span className="text-white/80">Principal</span>
                  <span className="font-medium">
                    KES {amount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/80">Interest (5%)</span>
                  <span className="font-medium">
                    KES {totalInterest.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-white/20">
                  <span className="font-semibold">Total Repayment</span>
                  <span className="font-bold">
                    KES {totalRepayment.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* First Deduction Date in Calculator */}
              <div className="pt-4 border-t border-white/20">
                <p className="text-white/80 text-xs mb-1 uppercase tracking-wide">
                  Projected First Deduction
                </p>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-white/80" />
                  <p className="font-semibold text-sm">{firstDeductionLabel}</p>
                </div>
                <p className="text-white/70 text-xs mt-1">
                  {isSameMonth ?
                  '✓ Disbursed ≤ 15th — same month' :
                  '→ Disbursed > 15th — next month'}
                </p>
              </div>
            </div>

            <div className="mt-6 p-3 bg-white/10 rounded-lg text-xs text-white/90">
              * Estimate only. Final amounts confirmed upon approval.
            </div>
          </div>
        </div>
      </div>

      <TermsModal
        isOpen={isTermsOpen}
        onClose={() => setIsTermsOpen(false)}
        onAccept={handleTermsAccept} />

    </div>);

}