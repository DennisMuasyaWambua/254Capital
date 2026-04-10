import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/salary-checkoff/ui/Card';
import { Input } from '@/components/salary-checkoff/ui/Input';
import { MoneyInput } from '@/components/salary-checkoff/ui/MoneyInput';
import { Button } from '@/components/salary-checkoff/ui/Button';
import { ProgressSteps } from '@/components/salary-checkoff/ui/ProgressSteps';
import { FileUpload } from '@/components/salary-checkoff/ui/FileUpload';
import { TermsModal } from './TermsModal';
import { Modal } from '@/components/salary-checkoff/ui/Modal';
import { loanService, LoanCalculatorResponse } from '@/services/salary-checkoff/loan.service';
import { documentService, Document } from '@/services/salary-checkoff/document.service';
import { authService } from '@/services/salary-checkoff/auth.service';
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
  AlertCircle,
  Loader2 } from
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
  const [amount, setAmount] = useState<string>('50000');
  const [period, setPeriod] = useState<number>(6);
  const [purpose, setPurpose] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsTimestamp, setTermsTimestamp] = useState<string | null>(null);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [confirmChecked, setConfirmChecked] = useState(false);
  const [calculationResult, setCalculationResult] = useState<LoanCalculatorResponse | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [employeeSalary, setEmployeeSalary] = useState<number>(0);
  const [showDisqualificationModal, setShowDisqualificationModal] = useState(false);

  // Disbursement details state
  const [disbursementMethod, setDisbursementMethod] = useState<'bank' | 'mpesa'>('mpesa');
  const [bankName, setBankName] = useState<string>('');
  const [bankBranch, setBankBranch] = useState<string>('');
  const [accountNumber, setAccountNumber] = useState<string>('');

  // Document upload state
  const [uploadedDocuments, setUploadedDocuments] = useState<{
    nationalIdFront?: Document;
    nationalIdBack?: Document;
    payslips?: Document[];
  }>({});
  const [uploadingDocs, setUploadingDocs] = useState<{
    nationalIdFront?: boolean;
    nationalIdBack?: boolean;
    payslips?: boolean;
  }>({});

  const calculateLoan = useCallback(async () => {
    const amountNum = parseFloat(amount.replace(/,/g, ''));
    if (amountNum < 1000 || period < 1) {
      setCalculationResult(null);
      return;
    }

    try {
      setIsCalculating(true);
      setError(null);

      const result = await loanService.calculateLoan({
        principal: amountNum,
        months: period,
        calculation_type: 'flat',
      });

      setCalculationResult(result);
    } catch (err: any) {
      console.error('Error calculating loan:', err);
      // Don't set error for calculation failures, just use fallback
      setCalculationResult(null);
    } finally {
      setIsCalculating(false);
    }
  }, [amount, period]);

  // Fetch employee profile to get salary on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await authService.getProfile();
        if (profile.employee_profile?.monthly_salary) {
          setEmployeeSalary(parseFloat(profile.employee_profile.monthly_salary));
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      }
    };
    fetchProfile();
  }, []);

  // Debounced calculation - runs whenever amount or period changes
  useEffect(() => {
    const timer = setTimeout(() => {
      calculateLoan();
    }, 500);

    return () => clearTimeout(timer);
  }, [calculateLoan]);

  // Calculate loan details - these update dynamically when amount/period changes
  const amountNum = parseFloat(amount.replace(/,/g, '')) || 0;
  const interestRate = calculationResult ? parseFloat(calculationResult.interest_rate) : 0.05;

  // For flat rate: 5% interest on principal for the entire loan (not per month)
  // Total interest = principal * 5%
  const totalInterest = calculationResult
    ? parseFloat(calculationResult.interest_amount)
    : amountNum * interestRate;

  // Total repayment = principal + total interest
  const totalRepayment = calculationResult
    ? parseFloat(calculationResult.total_repayment)
    : amountNum + totalInterest;

  // Monthly deduction = total repayment / number of months
  // This changes dynamically as amount or period changes
  const monthlyDeduction = calculationResult
    ? parseFloat(calculationResult.monthly_deduction)
    : period > 0 ? totalRepayment / period : 0;
  // Deduction date logic — assume disbursement today for projection
  const today = new Date();
  const firstDeductionDate = getFirstDeductionDate(today);
  const isSameMonth = today.getDate() <= 15;
  const firstDeductionLabel = formatDeductionDate(firstDeductionDate);
  const handleNext = async () => {
    // Step 1: Validate disbursement details and check salary eligibility
    if (step === 1) {
      if (disbursementMethod === 'bank') {
        if (!bankName.trim() || !bankBranch.trim() || !accountNumber.trim()) {
          setError('Please fill in all bank account details');
          return;
        }
      }

      // Validate monthly deduction doesn't exceed 2/3 of salary
      if (employeeSalary > 0) {
        const maxAllowedDeduction = (employeeSalary * 2) / 3;
        if (monthlyDeduction > maxAllowedDeduction) {
          setShowDisqualificationModal(true);
          return;
        }
      }

      setError(null);
    }

    // Step 2: Check if still uploading documents
    if (step === 2) {
      const isUploading = Object.values(uploadingDocs).some(status => status);
      if (isUploading) {
        setError('Please wait for document uploads to complete');
        return;
      }

      if (!termsAccepted) {
        setIsTermsOpen(true);
        return;
      }
    }

    if (step < 3) {
      setStep((prev) => prev + 1);
    } else {
      // Submit loan application via API
      try {
        setIsLoading(true);
        setError(null);

        const amountNum = parseFloat(amount.replace(/,/g, ''));
        const applicationData: any = {
          principal_amount: amountNum,
          repayment_months: period,
          purpose: purpose || 'Personal loan',
          terms_accepted: termsAccepted,
          disbursement_method: disbursementMethod,
        };

        // Add bank details if bank method is selected
        if (disbursementMethod === 'bank') {
          applicationData.bank_name = bankName;
          applicationData.bank_branch = bankBranch;
          applicationData.account_number = accountNumber;
        }

        await loanService.createApplication(applicationData);

        onSubmitSuccess();
      } catch (err: any) {
        console.error('Error submitting loan application:', err);
        setError(err.message || 'Failed to submit loan application. Please try again.');
        setIsLoading(false);
      }
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

  const handleDocumentUpload = async (files: File[], documentType: 'nationalIdFront' | 'nationalIdBack' | 'payslips') => {
    if (files.length === 0) return;

    try {
      setUploadingDocs(prev => ({ ...prev, [documentType]: true }));
      setError(null);

      if (documentType === 'payslips') {
        // Upload multiple payslips
        const uploadPromises = files.slice(0, 3).map((file, index) =>
          documentService.uploadDocument({
            file,
            document_type: `payslip_${index + 1}` as any,
          })
        );
        const uploadedPayslips = await Promise.all(uploadPromises);
        setUploadedDocuments(prev => ({ ...prev, payslips: uploadedPayslips }));
      } else {
        // Upload single document
        const apiDocType = documentType === 'nationalIdFront' ? 'national_id_front' : 'national_id_back';
        const uploadedDoc = await documentService.uploadDocument({
          file: files[0],
          document_type: apiDocType,
        });
        setUploadedDocuments(prev => ({ ...prev, [documentType]: uploadedDoc }));
      }
    } catch (err: any) {
      console.error('Error uploading document:', err);
      setError(err.message || `Failed to upload ${documentType}. Please try again.`);
    } finally {
      setUploadingDocs(prev => ({ ...prev, [documentType]: false }));
    }
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
                {error && (
                  <div className="flex items-start space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-red-800">
                        Error
                      </p>
                      <p className="text-xs text-red-700 mt-1">
                        {error}
                      </p>
                    </div>
                  </div>
                )}
                <MoneyInput
                label="Loan Amount (KES)"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="50,000"
                helperText="Minimum amount: KES 1,000" />

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
                  placeholder="e.g. School fees, Medical emergency..."
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)} />

                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Disbursement Method
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setDisbursementMethod('mpesa')}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        disbursementMethod === 'mpesa'
                          ? 'border-[#00BCD4] bg-[#00BCD4]/5 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-lg font-semibold text-slate-900">M-Pesa</div>
                        <div className="text-xs text-slate-500 mt-1">Instant mobile transfer</div>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDisbursementMethod('bank')}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        disbursementMethod === 'bank'
                          ? 'border-[#00BCD4] bg-[#00BCD4]/5 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-lg font-semibold text-slate-900">Bank Transfer</div>
                        <div className="text-xs text-slate-500 mt-1">Direct to bank account</div>
                      </div>
                    </button>
                  </div>
                </div>

                {disbursementMethod === 'bank' && (
                  <div className="space-y-4 p-4 bg-slate-50 rounded-lg border border-slate-200 animate-fade-in">
                    <h4 className="text-sm font-medium text-slate-700">Bank Account Details</h4>
                    <Input
                      label="Bank Name"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      placeholder="e.g. Equity Bank"
                      required
                    />
                    <Input
                      label="Bank Branch"
                      value={bankBranch}
                      onChange={(e) => setBankBranch(e.target.value)}
                      placeholder="e.g. Westlands Branch"
                      required
                    />
                    <Input
                      label="Account Number"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder="Enter your account number"
                      required
                    />
                  </div>
                )}
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
                    onFilesSelected={(files) => handleDocumentUpload(files, 'nationalIdFront')}
                    helperText={
                      uploadedDocuments.nationalIdFront
                        ? `✓ Uploaded: ${uploadedDocuments.nationalIdFront.original_filename}`
                        : uploadingDocs.nationalIdFront
                        ? "Uploading..."
                        : "Clear photo or scan of your ID front side"
                    }
                    isLoading={uploadingDocs.nationalIdFront}
                  />

                  <FileUpload
                    label="National ID (Back)"
                    onFilesSelected={(files) => handleDocumentUpload(files, 'nationalIdBack')}
                    helperText={
                      uploadedDocuments.nationalIdBack
                        ? `✓ Uploaded: ${uploadedDocuments.nationalIdBack.original_filename}`
                        : uploadingDocs.nationalIdBack
                        ? "Uploading..."
                        : "Clear photo or scan of your ID back side"
                    }
                    isLoading={uploadingDocs.nationalIdBack}
                  />

                  <FileUpload
                    label="Latest 3 Payslips"
                    onFilesSelected={(files) => handleDocumentUpload(files, 'payslips')}
                    helperText={
                      uploadedDocuments.payslips && uploadedDocuments.payslips.length > 0
                        ? `✓ Uploaded ${uploadedDocuments.payslips.length} payslip(s)`
                        : uploadingDocs.payslips
                        ? "Uploading..."
                        : "Upload your most recent payslips (PDF preferred)"
                    }
                    accept=".pdf"
                    multiple
                    isLoading={uploadingDocs.payslips}
                  />

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
                      KES {amountNum.toLocaleString()}
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
                    <span className="font-medium flex items-center gap-2">
                      {isCalculating ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin text-[#008080]" />
                          Calculating...
                        </>
                      ) : (
                        <>KES {Math.round(monthlyDeduction).toLocaleString()}</>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 pt-3">
                    <span className="font-semibold text-slate-900">
                      Total Repayment
                    </span>
                    <span className="font-bold text-[#00BCD4] flex items-center gap-2">
                      {isCalculating ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Calculating...
                        </>
                      ) : (
                        <>KES {Math.round(totalRepayment).toLocaleString()}</>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 pt-3">
                    <span className="text-slate-500">Disbursement Method</span>
                    <span className="font-medium">
                      {disbursementMethod === 'bank' ? 'Bank Transfer' : 'M-Pesa'}
                    </span>
                  </div>
                  {disbursementMethod === 'bank' && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Bank Name</span>
                        <span className="font-medium">{bankName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Bank Branch</span>
                        <span className="font-medium">{bankBranch}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Account Number</span>
                        <span className="font-medium">{accountNumber}</span>
                      </div>
                    </>
                  )}
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

                {error && (
                  <div className="flex items-start space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-red-800">
                        Error
                      </p>
                      <p className="text-xs text-red-700 mt-1">
                        {error}
                      </p>
                    </div>
                  </div>
                )}

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
                <p className="text-3xl font-bold flex items-center gap-2">
                  {isCalculating ? (
                    <>
                      <Loader2 className="h-6 w-6 animate-spin" />
                      <span className="text-2xl">Calculating...</span>
                    </>
                  ) : (
                    <>KES {Math.round(monthlyDeduction).toLocaleString()}</>
                  )}
                </p>
              </div>

              <div className="space-y-3 pt-4 border-t border-white/20">
                <div className="flex justify-between text-sm">
                  <span className="text-white/80">Principal</span>
                  <span className="font-medium">
                    KES {amountNum.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/80">Interest (5%) per month</span>
                  <span className="font-medium">
                    {isCalculating ? (
                      <span className="flex items-center gap-1">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        ...
                      </span>
                    ) : (
                      <>KES {Math.round(totalInterest).toLocaleString()}</>
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-white/20">
                  <span className="font-semibold">Total Repayment</span>
                  <span className="font-bold">
                    {isCalculating ? (
                      <span className="flex items-center gap-1">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        ...
                      </span>
                    ) : (
                      <>KES {Math.round(totalRepayment).toLocaleString()}</>
                    )}
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

      {/* Disqualification Modal */}
      <Modal
        isOpen={showDisqualificationModal}
        onClose={() => setShowDisqualificationModal(false)}
        title="Loan Application - Not Eligible"
        size="md">
        <div className="space-y-4">
          <div className="flex items-start space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800">
                Monthly Deduction Exceeds Limit
              </p>
              <p className="text-xs text-red-700 mt-1">
                Your requested loan amount would result in monthly deductions that exceed two-thirds (2/3) of your salary.
              </p>
            </div>
          </div>

          <div className="bg-slate-50 rounded-lg p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600">Your Monthly Salary:</span>
              <span className="font-semibold text-slate-900">
                KES {employeeSalary.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Maximum Allowed Deduction (2/3):</span>
              <span className="font-semibold text-slate-900">
                KES {Math.floor((employeeSalary * 2) / 3).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-2">
              <span className="text-slate-600">Your Requested Monthly Deduction:</span>
              <span className="font-semibold text-red-600">
                KES {Math.round(monthlyDeduction).toLocaleString()}
              </span>
            </div>
          </div>

          <p className="text-sm text-slate-600">
            Please reduce your loan amount or extend the repayment period to lower your monthly deduction.
          </p>

          <div className="flex justify-end pt-4 border-t">
            <Button
              onClick={() => setShowDisqualificationModal(false)}>
              Adjust Loan Amount
            </Button>
          </div>
        </div>
      </Modal>

    </div>);

}