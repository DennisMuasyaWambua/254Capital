import React, { useState } from 'react';
import { Card } from '@/components/salary-checkoff/ui/Card';
import { Button } from '@/components/salary-checkoff/ui/Button';
import { Badge } from '@/components/salary-checkoff/ui/Badge';
import { Modal } from '@/components/salary-checkoff/ui/Modal';
import {
  ArrowLeft,
  Check,
  X,
  FileText,
  Download,
  UserCheck } from
'lucide-react';
interface ApplicationReviewProps {
  onBack: () => void;
}
export function ApplicationReview({ onBack }: ApplicationReviewProps) {
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isDeclineModalOpen, setIsDeclineModalOpen] = useState(false);
  const [comment, setComment] = useState('');
  const employee = {
    name: 'Grace Muthoni',
    id: 'EMP-045',
    department: 'Marketing',
    salary: 180000,
    employmentDate: '12 Mar 2022',
    type: 'Permanent'
  };
  const loan = {
    amount: 80000,
    period: 6,
    monthly: 14000,
    purpose: 'Medical emergency for family member',
    date: '16 Jan 2026'
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
            Review Application #LN-2026-005
          </h1>
          <Badge variant="pending">Pending Review</Badge>
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
            onClick={() => {
              setIsApproveModalOpen(false);
              onBack();
            }}>

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
            onClick={() => {
              setIsDeclineModalOpen(false);
              onBack();
            }}>

              Decline Application
            </Button>
          </>
        }>

        <p className="text-slate-600 mb-4">
          Please provide a reason for declining this application. This will be
          shared with the employee.
        </p>
        <textarea
          className="w-full h-32 rounded-lg border border-slate-300 p-3 focus:ring-[#00BCD4] focus:border-[#00BCD4]"
          placeholder="Enter reason for decline..."
          value={comment}
          onChange={(e) => setComment(e.target.value)} />

      </Modal>
    </div>);

}