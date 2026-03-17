import React, { useState } from 'react';
import { Card } from '@/components/salary-checkoff/ui/Card';
import { Input } from '@/components/salary-checkoff/ui/Input';
import { MoneyInput } from '@/components/salary-checkoff/ui/MoneyInput';
import { Select } from '@/components/salary-checkoff/ui/Select';
import { Button } from '@/components/salary-checkoff/ui/Button';
import { Badge } from '@/components/salary-checkoff/ui/Badge';
import {
  paymentService,
  LoanSearchResult,
  RecordPaymentRequest,
  EarlyPaymentDiscountCalculation,
} from '@/services/salary-checkoff/payment.service';
import {
  Search,
  Calculator,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';

interface RecordPaymentProps {
  onNavigate: (page: string) => void;
}

export function RecordPayment({ onNavigate }: RecordPaymentProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLoan, setSelectedLoan] = useState<LoanSearchResult | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [paymentMethod, setPaymentMethod] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [applyDiscount, setApplyDiscount] = useState(false);
  const [discountData, setDiscountData] =
    useState<EarlyPaymentDiscountCalculation | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCalculatingDiscount, setIsCalculatingDiscount] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.length < 3) {
      setError('Please enter at least 3 characters to search');
      return;
    }

    try {
      setIsSearching(true);
      setError(null);
      const results = await paymentService.searchLoans(searchQuery);

      if (results.length === 0) {
        setError('No loans found matching your search');
        setSelectedLoan(null);
      } else if (results.length === 1) {
        setSelectedLoan(results[0]);
      } else {
        // If multiple results, take the first one
        // In a real app, you'd show a selection UI
        setSelectedLoan(results[0]);
      }
    } catch (error: any) {
      console.error('Error searching loans:', error);
      setError(error.message || 'Failed to search loans');
      setSelectedLoan(null);
    } finally {
      setIsSearching(false);
    }
  };

  const handleApplyDiscountToggle = async (checked: boolean) => {
    setApplyDiscount(checked);

    if (checked && selectedLoan) {
      try {
        setIsCalculatingDiscount(true);
        setError(null);
        const calculation = await paymentService.calculateEarlyPaymentDiscount(
          selectedLoan.id,
          paymentDate
        );
        setDiscountData(calculation);
      } catch (error: any) {
        console.error('Error calculating discount:', error);
        setError(error.message || 'Failed to calculate discount');
        setApplyDiscount(false);
      } finally {
        setIsCalculatingDiscount(false);
      }
    } else {
      setDiscountData(null);
    }
  };

  const currentOutstanding = discountData
    ? discountData.new_outstanding
    : selectedLoan?.outstanding_balance || 0;

  const paymentAmountNum = parseFloat(paymentAmount.replace(/,/g, '')) || 0;
  const newBalanceAfterPayment = currentOutstanding - paymentAmountNum;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedLoan) {
      setError('Please search for and select a loan first');
      return;
    }

    if (!paymentAmount || paymentAmountNum <= 0) {
      setError('Please enter a valid payment amount');
      return;
    }

    if (paymentAmountNum > currentOutstanding) {
      setError('Payment amount cannot exceed outstanding balance');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const paymentData: RecordPaymentRequest = {
        payment_date: paymentDate,
        amount_received: paymentAmountNum,
        payment_method: paymentMethod as any,
        reference_number: referenceNumber || undefined,
        notes: notes || undefined,
        apply_early_payment_discount: applyDiscount,
      };

      await paymentService.recordPayment(selectedLoan.id, paymentData);

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        // Reset form
        setSelectedLoan(null);
        setSearchQuery('');
        setPaymentAmount('');
        setPaymentMethod('');
        setReferenceNumber('');
        setNotes('');
        setApplyDiscount(false);
        setDiscountData(null);
      }, 3000);
    } catch (error: any) {
      console.error('Error recording payment:', error);
      setError(error.message || 'Failed to record payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Record Payment</h1>
        <p className="text-slate-500">
          Manually record payments received outside of regular payroll deductions.
        </p>
      </div>

      {showSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center text-emerald-800 animate-fade-in">
          <CheckCircle2 className="h-5 w-5 mr-2 text-emerald-600" />
          Payment recorded successfully. Employee portal updated and SMS notification
          sent.
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-800">
          <AlertCircle className="h-5 w-5 mr-2 text-red-600" />
          {error}
        </div>
      )}

      {/* Step 1: Search */}
      <Card title="Step 1: Select Loan">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search by employee name, ID, or mobile number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
            />
          </div>
          <Button type="submit" isLoading={isSearching}>
            Search
          </Button>
        </form>
      </Card>

      {/* Step 2: Payment Details */}
      {selectedLoan && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          <div className="lg:col-span-2 space-y-6">
            <Card title="Step 2: Payment Details">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Payment Date *"
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    required
                  />
                  <MoneyInput
                    label="Amount Received (KES) *"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="0"
                    required
                  />
                  <Select
                    label="Payment Method *"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    options={[
                      { value: 'mpesa', label: 'M-Pesa' },
                      { value: 'bank', label: 'Bank Transfer' },
                      { value: 'cash', label: 'Cash' },
                      { value: 'cheque', label: 'Cheque' },
                    ]}
                    required
                  />
                  <Input
                    label="Reference Number"
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                    placeholder="e.g. QWE123RTY"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-[#008080] focus:ring-1 focus:ring-[#008080] h-24 resize-none"
                  />
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <Button
                    type="submit"
                    isLoading={isSubmitting}
                    disabled={!paymentAmount || paymentAmountNum <= 0}
                  >
                    Record Payment
                  </Button>
                </div>
              </form>
            </Card>
          </div>

          {/* Sidebar Summary & Calculator */}
          <div className="space-y-6">
            <Card className="bg-slate-50 border-slate-200">
              <h3 className="font-semibold text-slate-900 mb-4">Loan Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Employee</span>
                  <span className="font-medium text-slate-900">
                    {selectedLoan.employee_name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Employer</span>
                  <span className="font-medium text-slate-900">
                    {selectedLoan.employer_name}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200">
                  <span className="text-slate-500">Original Amount</span>
                  <span className="font-medium">
                    KES {selectedLoan.original_amount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Due</span>
                  <span className="font-medium">
                    KES {selectedLoan.total_due.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Paid to Date</span>
                  <span className="font-medium text-emerald-600">
                    KES {selectedLoan.amount_paid.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200">
                  <span className="font-semibold text-slate-900">Outstanding</span>
                  <span className="font-bold text-xl text-[#008080]">
                    KES {selectedLoan.outstanding_balance.toLocaleString()}
                  </span>
                </div>
              </div>
            </Card>

            <Card className="border-[#008080]/20">
              <div className="flex items-start gap-3 mb-4">
                <div className="p-2 bg-[#E0F2F2] rounded-lg text-[#008080]">
                  <Calculator className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">
                    Early Payment Discount
                  </h3>
                  <p className="text-xs text-slate-500">
                    Recalculate interest for early settlement
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 mb-4">
                <input
                  type="checkbox"
                  id="applyDiscount"
                  checked={applyDiscount}
                  onChange={(e) => handleApplyDiscountToggle(e.target.checked)}
                  disabled={isCalculatingDiscount}
                  className="h-4 w-4 rounded border-slate-300 text-[#008080] focus:ring-[#008080]"
                />
                <label
                  htmlFor="applyDiscount"
                  className="text-sm font-medium text-slate-700"
                >
                  Apply early payment discount?
                </label>
              </div>

              {isCalculatingDiscount && (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-5 w-5 animate-spin text-[#008080]" />
                  <span className="ml-2 text-sm text-slate-600">
                    Calculating discount...
                  </span>
                </div>
              )}

              {applyDiscount && discountData && !isCalculatingDiscount && (
                <div className="space-y-2 text-sm bg-amber-50 p-3 rounded-lg border border-amber-100 animate-fade-in">
                  <div className="flex justify-between">
                    <span className="text-amber-800">Actual Period</span>
                    <span className="font-medium text-amber-900">
                      {discountData.actual_months} months
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-amber-800">Discount Applied</span>
                    <span className="font-medium text-emerald-600">
                      - KES {discountData.discount_amount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-amber-200">
                    <span className="font-semibold text-amber-900">
                      New Outstanding
                    </span>
                    <span className="font-bold text-amber-900">
                      KES {discountData.new_outstanding.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

              {paymentAmount && paymentAmountNum > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <p className="text-sm text-slate-500 mb-1">
                    Balance After Payment
                  </p>
                  <p
                    className={`text-2xl font-bold ${
                      newBalanceAfterPayment <= 0
                        ? 'text-emerald-600'
                        : 'text-slate-900'
                    }`}
                  >
                    KES {Math.max(0, newBalanceAfterPayment).toLocaleString()}
                  </p>
                  {newBalanceAfterPayment <= 0 && (
                    <Badge variant="approved" className="mt-2">
                      Loan will be marked as Fully Paid
                    </Badge>
                  )}
                </div>
              )}
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
