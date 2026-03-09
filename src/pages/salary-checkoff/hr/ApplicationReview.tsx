import React, { useState, useEffect } from 'react';
import { Card } from '@/components/salary-checkoff/ui/Card';
import { Button } from '@/components/salary-checkoff/ui/Button';
import { Badge } from '@/components/salary-checkoff/ui/Badge';
import { Modal } from '@/components/salary-checkoff/ui/Modal';
import { loanService, LoanApplicationDetail } from '@/services/salary-checkoff/loan.service';
import {
  ArrowLeft,
  Check,
  X,
  FileText,
  Download,
  UserCheck,
  Loader2,
  AlertCircle } from
'lucide-react';
interface ApplicationReviewProps {
  onBack: () => void;
}
export function ApplicationReview({ onBack }: ApplicationReviewProps) {
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isDeclineModalOpen, setIsDeclineModalOpen] = useState(false);
  const [comment, setComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [application, setApplication] = useState<LoanApplicationDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadApplication();
  }, []);

  const loadApplication = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch pending applications
      const pendingResponse = await loanService.hrListPending();

      if (pendingResponse.results.length === 0) {
        setError('No pending applications found.');
        setIsLoading(false);
        return;
      }

      // Get the first pending application's details
      const firstPending = pendingResponse.results[0];
      const applicationDetail = await loanService.getApplication(firstPending.id);

      setApplication(applicationDetail);
    } catch (err: any) {
      console.error('Error loading application:', err);
      setError(err.message || 'Failed to load application');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!application) return;

    try {
      setIsSubmitting(true);
      setError(null);

      await loanService.hrReview(application.id, {
        action: 'approve',
        comment: comment || 'Application approved',
      });

      setIsApproveModalOpen(false);
      onBack();
    } catch (err: any) {
      console.error('Error approving application:', err);
      setError(err.message || 'Failed to approve application');
      setIsSubmitting(false);
    }
  };

  const handleDecline = async () => {
    if (!application) return;

    if (!comment.trim()) {
      setError('Please provide a reason for declining');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      await loanService.hrReview(application.id, {
        action: 'decline',
        comment: comment,
      });

      setIsDeclineModalOpen(false);
      onBack();
    } catch (err: any) {
      console.error('Error declining application:', err);
      setError(err.message || 'Failed to decline application');
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[#008080]" />
      </div>
    );
  }

  if (error && !application) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          leftIcon={<ArrowLeft className="h-4 w-4" />}>
          Back
        </Button>
        <div className="flex items-center justify-center p-12">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!application) {
    return null;
  }

  const employee = {
    name: `${application.employee.first_name} ${application.employee.last_name}`,
    id: application.employee.id,
    department: 'N/A', // Not available in API
    salary: application.employee_profile?.monthly_salary
      ? parseFloat(application.employee_profile.monthly_salary)
      : 0,
    employmentDate: 'N/A', // Not available in API
    type: 'Permanent' // Not available in API
  };

  const loan = {
    amount: parseFloat(application.principal_amount),
    period: application.repayment_months,
    monthly: parseFloat(application.monthly_deduction),
    purpose: application.purpose || 'Not specified',
    date: new Date(application.created_at).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })
  };
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            leftIcon={<ArrowLeft className="h-4 w-4" />}>

            Back
          </Button>
          <h1 className="text-2xl font-bold text-slate-900">
            Review Application #{application.application_number}
          </h1>
          <Badge variant="pending">{application.status.replace('_', ' ').toUpperCase()}</Badge>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="danger"
            onClick={() => setIsDeclineModalOpen(true)}
            leftIcon={<X className="h-4 w-4" />}>

            Decline
          </Button>
          <Button
            variant="primary"
            onClick={() => setIsApproveModalOpen(true)}
            leftIcon={<Check className="h-4 w-4" />}>

            Approve Application
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Employee & Loan Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card title="Employee Details">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-sm text-slate-500">Full Name</label>
                <p className="font-medium text-slate-900">{employee.name}</p>
              </div>
              <div>
                <label className="text-sm text-slate-500">Employee ID</label>
                <p className="font-medium text-slate-900">{employee.id}</p>
              </div>
              <div>
                <label className="text-sm text-slate-500">Department</label>
                <p className="font-medium text-slate-900">
                  {employee.department}
                </p>
              </div>
              <div>
                <label className="text-sm text-slate-500">
                  Employment Type
                </label>
                <p className="font-medium text-slate-900">{employee.type}</p>
              </div>
              <div>
                <label className="text-sm text-slate-500">Gross Salary</label>
                <p className="font-medium text-slate-900">
                  KES {employee.salary.toLocaleString()}
                </p>
              </div>
              <div>
                <label className="text-sm text-slate-500">
                  Employment Date
                </label>
                <p className="font-medium text-slate-900">
                  {employee.employmentDate}
                </p>
              </div>
            </div>
          </Card>

          <Card title="Loan Request Details">
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <label className="text-sm text-slate-500">
                  Requested Amount
                </label>
                <p className="text-xl font-bold text-[#11103a]">
                  KES {loan.amount.toLocaleString()}
                </p>
              </div>
              <div>
                <label className="text-sm text-slate-500">
                  Repayment Period
                </label>
                <p className="text-xl font-bold text-slate-900">
                  {loan.period} Months
                </p>
              </div>
              <div>
                <label className="text-sm text-slate-500">
                  Monthly Deduction
                </label>
                <p className="font-medium text-slate-900">
                  KES {loan.monthly.toLocaleString()}
                </p>
              </div>
              <div>
                <label className="text-sm text-slate-500">
                  Application Date
                </label>
                <p className="font-medium text-slate-900">{loan.date}</p>
              </div>
            </div>
            <div>
              <label className="text-sm text-slate-500">Purpose</label>
              <p className="mt-1 text-slate-900 bg-slate-50 p-3 rounded-lg border border-slate-100">
                {loan.purpose}
              </p>
            </div>
          </Card>

          <Card title="Uploaded Documents">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
              'National ID (Front)',
              'National ID (Back)',
              'Payslip - Dec 2025'].
              map((doc, i) =>
              <div
                key={i}
                className="border border-slate-200 rounded-lg p-4 flex flex-col items-center text-center hover:bg-slate-50 transition-colors cursor-pointer">

                  <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center mb-3 text-slate-500">
                    <FileText className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-medium text-slate-900 mb-2">
                    {doc}
                  </p>
                  <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<Download className="h-3 w-3" />}>

                    Download
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right Column - Verification Checklist */}
        <div className="lg:col-span-1 space-y-6">
          <Card title="Verification Checklist">
            <div className="space-y-4">
              {[
              'Employee is active and confirmed',
              'Salary details match records',
              'No existing loan defaults',
              'Within 1/3 rule borrowing limit',
              'Documents are valid and clear'].
              map((item, i) =>
              <div
                key={i}
                className="flex items-start space-x-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">

                  <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-[#11103a] focus:ring-[#11103a]" />

                  <label className="text-sm text-slate-700">{item}</label>
                </div>
              )}
            </div>
            <div className="mt-6 pt-6 border-t border-slate-100">
              <div className="flex items-center space-x-2 text-amber-600 bg-amber-50 p-3 rounded-lg text-sm">
                <UserCheck className="h-5 w-5 flex-shrink-0" />
                <span>
                  Please ensure all checks are completed before approving.
                </span>
              </div>
            </div>
          </Card>

          <Card title="Loan Calculation">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Principal</span>
                <span>KES {loan.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Interest (5%)</span>
                <span>KES {(loan.amount * 0.05).toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold pt-2 border-t border-slate-100">
                <span>Total Repayment</span>
                <span>KES {(loan.amount * 1.05).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[#008080] font-medium pt-2">
                <span>Monthly Deduction</span>
                <span className="text-[#008080] font-medium">
                  KES {loan.monthly.toLocaleString()}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Modals */}
      <Modal
        isOpen={isApproveModalOpen}
        onClose={() => setIsApproveModalOpen(false)}
        title="Approve Application"
        footer={
        <>
            <Button
            variant="ghost"
            onClick={() => setIsApproveModalOpen(false)}>

              Cancel
            </Button>
            <Button
            onClick={handleApprove}
            isLoading={isSubmitting}>

              Confirm Approval
            </Button>
          </>
        }>

        <p className="text-slate-600 mb-4">
          Are you sure you want to approve this loan application for{' '}
          <strong>{employee.name}</strong>?
        </p>
        <p className="text-slate-600 mb-4">
          This will forward the application to 254 Capital for final
          disbursement processing.
        </p>
        <div className="bg-emerald-50 text-emerald-800 p-3 rounded-lg text-sm">
          Monthly deduction of{' '}
          <strong>KES {loan.monthly.toLocaleString()}</strong> will be scheduled
          starting next payroll cycle.
        </div>
      </Modal>

      <Modal
        isOpen={isDeclineModalOpen}
        onClose={() => setIsDeclineModalOpen(false)}
        title="Decline Application"
        footer={
        <>
            <Button
            variant="ghost"
            onClick={() => setIsDeclineModalOpen(false)}>

              Cancel
            </Button>
            <Button
            variant="danger"
            onClick={handleDecline}
            isLoading={isSubmitting}>

              Decline Application
            </Button>
          </>
        }>

        <p className="text-slate-600 mb-4">
          Please provide a reason for declining this application. This will be
          shared with the employee.
        </p>
        {error && (
          <div className="flex items-start space-x-3 p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
        <textarea
          className="w-full h-32 rounded-lg border border-slate-300 p-3 focus:ring-[#00BCD4] focus:border-[#00BCD4]"
          placeholder="Enter reason for decline..."
          value={comment}
          onChange={(e) => setComment(e.target.value)} />

      </Modal>
    </div>);

}