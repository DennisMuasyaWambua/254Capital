import React, { useState, useEffect } from 'react';
import { Card } from '@/components/salary-checkoff/ui/Card';
import { Button } from '@/components/salary-checkoff/ui/Button';
import { Badge } from '@/components/salary-checkoff/ui/Badge';
import { Table } from '@/components/salary-checkoff/ui/Table';
import { Modal } from '@/components/salary-checkoff/ui/Modal';
import { Input } from '@/components/salary-checkoff/ui/Input';
import { loanService, LoanApplication, LoanApplicationDetail } from '@/services/salary-checkoff/loan.service';
import {
  ArrowLeft,
  Check,
  X,
  FileText,
  Download,
  Loader2,
  AlertCircle,
  DollarSign,
  Calendar,
} from 'lucide-react';

interface AdminLoanQueueProps {
  onBack: () => void;
}

export function AdminLoanQueue({ onBack }: AdminLoanQueueProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<LoanApplicationDetail | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isDeclineModalOpen, setIsDeclineModalOpen] = useState(false);
  const [isDisbursementModalOpen, setIsDisbursementModalOpen] = useState(false);
  const [comment, setComment] = useState('');
  const [creditScoreNotes, setCreditScoreNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Disbursement fields
  const [disbursementDate, setDisbursementDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [disbursementReference, setDisbursementReference] = useState('');

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await loanService.adminListQueue({});
      setApplications(response.results);
    } catch (err: any) {
      console.error('Error loading applications:', err);
      setError(err.message || 'Failed to load applications');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewApplication = async (application: LoanApplication) => {
    try {
      setIsLoading(true);
      const detail = await loanService.getApplication(application.id);
      setSelectedApplication(detail);
      setIsViewModalOpen(true);
    } catch (err: any) {
      console.error('Error loading application detail:', err);
      setError(err.message || 'Failed to load application details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedApplication) return;

    try {
      setIsSubmitting(true);
      setError(null);

      await loanService.adminAssess(selectedApplication.id, {
        action: 'approve',
        comment: comment || 'Application approved by admin',
        credit_score_notes: creditScoreNotes,
      });

      setIsApproveModalOpen(false);
      setIsViewModalOpen(false);
      setComment('');
      setCreditScoreNotes('');
      await loadApplications();
    } catch (err: any) {
      console.error('Error approving application:', err);
      setError(err.message || 'Failed to approve application');
      setIsSubmitting(false);
    }
  };

  const handleDecline = async () => {
    if (!selectedApplication) return;

    if (!comment.trim()) {
      setError('Please provide a reason for declining');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      await loanService.adminAssess(selectedApplication.id, {
        action: 'decline',
        comment: comment,
        credit_score_notes: creditScoreNotes,
      });

      setIsDeclineModalOpen(false);
      setIsViewModalOpen(false);
      setComment('');
      setCreditScoreNotes('');
      await loadApplications();
    } catch (err: any) {
      console.error('Error declining application:', err);
      setError(err.message || 'Failed to decline application');
      setIsSubmitting(false);
    }
  };

  const handleDisburse = async () => {
    if (!selectedApplication) return;

    if (!disbursementReference.trim()) {
      setError('Please provide a disbursement reference');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const disbursementMethod = selectedApplication.disbursement_method || 'mpesa';

      await loanService.adminDisburse(selectedApplication.id, {
        disbursement_date: disbursementDate,
        disbursement_method: disbursementMethod,
        disbursement_reference: disbursementReference,
      });

      setIsDisbursementModalOpen(false);
      setIsViewModalOpen(false);
      setDisbursementReference('');
      await loadApplications();
    } catch (err: any) {
      console.error('Error recording disbursement:', err);
      setError(err.message || 'Failed to record disbursement');
      setIsSubmitting(false);
    }
  };

  const columns = [
    {
      header: 'App #',
      accessor: 'application_number',
    },
    {
      header: 'Employer',
      accessor: (item: LoanApplication) => item.employer?.name || 'N/A',
    },
    {
      header: 'Employee',
      accessor: (item: LoanApplication) =>
        `${item.employee?.first_name} ${item.employee?.last_name}`,
    },
    {
      header: 'Amount',
      accessor: (item: LoanApplication) =>
        `KES ${parseFloat(item.principal_amount).toLocaleString()}`,
    },
    {
      header: 'Period',
      accessor: (item: LoanApplication) => `${item.repayment_months} months`,
    },
    {
      header: 'Status',
      accessor: (item: LoanApplication) => (
        <Badge variant={item.status}>{item.status.replace('_', ' ')}</Badge>
      ),
    },
    {
      header: 'Action',
      accessor: (item: LoanApplication) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleViewApplication(item)}
        >
          Review
        </Button>
      ),
    },
  ];

  if (isLoading && applications.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[#008080]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            leftIcon={<ArrowLeft className="h-4 w-4" />}
          >
            Back
          </Button>
          <h1 className="text-2xl font-bold text-slate-900">
            Loan Application Queue
          </h1>
        </div>
      </div>

      {error && !isViewModalOpen && (
        <div className="flex items-start space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-800">Error</p>
            <p className="text-xs text-red-700 mt-1">{error}</p>
          </div>
        </div>
      )}

      <Card>
        {applications.length > 0 ? (
          <Table
            data={applications}
            columns={columns}
            keyExtractor={(item) => item.id}
          />
        ) : (
          <div className="p-12 text-center">
            <AlertCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600">No applications in queue</p>
          </div>
        )}
      </Card>

      {/* View Application Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedApplication(null);
          setError(null);
        }}
        title={`Application #${selectedApplication?.application_number}`}
        size="xl"
      >
        {selectedApplication && (
          <div className="space-y-6">
            {/* Application Status */}
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <p className="text-sm text-slate-500">Status</p>
                <Badge variant={selectedApplication.status}>
                  {selectedApplication.status.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
              <div className="flex space-x-3">
                {selectedApplication.status === 'hr_approved' && (
                  <>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => {
                        setIsViewModalOpen(false);
                        setIsDeclineModalOpen(true);
                      }}
                      leftIcon={<X className="h-4 w-4" />}
                    >
                      Decline
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        setIsViewModalOpen(false);
                        setIsApproveModalOpen(true);
                      }}
                      leftIcon={<Check className="h-4 w-4" />}
                    >
                      Approve
                    </Button>
                  </>
                )}
                {selectedApplication.status === 'approved' && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setIsViewModalOpen(false);
                      setIsDisbursementModalOpen(true);
                    }}
                    leftIcon={<DollarSign className="h-4 w-4" />}
                  >
                    Record Disbursement
                  </Button>
                )}
                {selectedApplication.status !== 'hr_approved' &&
                 selectedApplication.status !== 'approved' &&
                 selectedApplication.status !== 'disbursed' && (
                  <div className="text-sm text-amber-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Awaiting HR approval. Current status: {selectedApplication.status.replace('_', ' ')}
                  </div>
                )}
              </div>
            </div>

            {/* Employee & Loan Details */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-semibold text-slate-900 mb-3">
                  Employee Details
                </h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-slate-500">Name:</span>{' '}
                    <span className="font-medium">
                      {selectedApplication.employee.first_name}{' '}
                      {selectedApplication.employee.last_name}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500">Phone:</span>{' '}
                    <span className="font-medium">
                      {selectedApplication.employee.phone_number}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500">Employer:</span>{' '}
                    <span className="font-medium">
                      {selectedApplication.employer.name}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-slate-900 mb-3">
                  Loan Details
                </h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-slate-500">Amount:</span>{' '}
                    <span className="font-medium">
                      KES{' '}
                      {parseFloat(
                        selectedApplication.principal_amount
                      ).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500">Period:</span>{' '}
                    <span className="font-medium">
                      {selectedApplication.repayment_months} months
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500">Monthly Deduction:</span>{' '}
                    <span className="font-medium">
                      KES{' '}
                      {parseFloat(
                        selectedApplication.monthly_deduction
                      ).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500">Total Repayment:</span>{' '}
                    <span className="font-medium">
                      KES{' '}
                      {parseFloat(
                        selectedApplication.total_repayment
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Disbursement Details */}
            {selectedApplication.disbursement_method && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="text-sm font-semibold text-blue-900 mb-2">
                  Disbursement Method
                </h4>
                <div className="space-y-1 text-sm text-blue-800">
                  <div>
                    <span className="font-medium">Method:</span>{' '}
                    {selectedApplication.disbursement_method === 'bank'
                      ? 'Bank Transfer'
                      : 'M-Pesa'}
                  </div>
                  {selectedApplication.disbursement_method === 'bank' && (
                    <>
                      <div>
                        <span className="font-medium">Bank:</span>{' '}
                        {selectedApplication.bank_name || 'N/A'}
                      </div>
                      <div>
                        <span className="font-medium">Branch:</span>{' '}
                        {selectedApplication.bank_branch || 'N/A'}
                      </div>
                      <div>
                        <span className="font-medium">Account:</span>{' '}
                        {selectedApplication.account_number || 'N/A'}
                      </div>
                    </>
                  )}
                  {selectedApplication.disbursement_method === 'mpesa' && (
                    <div>
                      <span className="font-medium">M-Pesa Number:</span>{' '}
                      {selectedApplication.employee.phone_number || 'N/A'}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Purpose */}
            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-2">
                Purpose
              </h4>
              <p className="text-sm text-slate-600 p-3 bg-slate-50 rounded-lg">
                {selectedApplication.purpose || 'Not specified'}
              </p>
            </div>
          </div>
        )}
      </Modal>

      {/* Approve Modal */}
      <Modal
        isOpen={isApproveModalOpen}
        onClose={() => {
          setIsApproveModalOpen(false);
          setIsViewModalOpen(true);
          setError(null);
        }}
        title="Approve Application"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                setIsApproveModalOpen(false);
                setIsViewModalOpen(true);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleApprove} isLoading={isSubmitting}>
              Confirm Approval
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-slate-600">
            Are you sure you want to approve this loan application?
          </p>

          {error && (
            <div className="flex items-start space-x-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Credit Score Notes (Optional)
            </label>
            <textarea
              className="w-full h-24 rounded-lg border border-slate-300 p-3 focus:ring-[#00BCD4] focus:border-[#00BCD4] resize-none"
              placeholder="Add any credit assessment notes..."
              value={creditScoreNotes}
              onChange={(e) => setCreditScoreNotes(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Comments (Optional)
            </label>
            <textarea
              className="w-full h-24 rounded-lg border border-slate-300 p-3 focus:ring-[#00BCD4] focus:border-[#00BCD4] resize-none"
              placeholder="Add any additional comments..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>
        </div>
      </Modal>

      {/* Decline Modal */}
      <Modal
        isOpen={isDeclineModalOpen}
        onClose={() => {
          setIsDeclineModalOpen(false);
          setIsViewModalOpen(true);
          setError(null);
        }}
        title="Decline Application"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                setIsDeclineModalOpen(false);
                setIsViewModalOpen(true);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDecline}
              isLoading={isSubmitting}
            >
              Decline Application
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-slate-600">
            Please provide a reason for declining this application.
          </p>

          {error && (
            <div className="flex items-start space-x-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Credit Score Notes (Optional)
            </label>
            <textarea
              className="w-full h-24 rounded-lg border border-slate-300 p-3 focus:ring-[#00BCD4] focus:border-[#00BCD4] resize-none"
              placeholder="Add any credit assessment notes..."
              value={creditScoreNotes}
              onChange={(e) => setCreditScoreNotes(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Decline Reason *
            </label>
            <textarea
              className="w-full h-24 rounded-lg border border-slate-300 p-3 focus:ring-[#00BCD4] focus:border-[#00BCD4] resize-none"
              placeholder="Enter reason for declining..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>
        </div>
      </Modal>

      {/* Disbursement Modal */}
      <Modal
        isOpen={isDisbursementModalOpen}
        onClose={() => {
          setIsDisbursementModalOpen(false);
          setIsViewModalOpen(true);
          setError(null);
        }}
        title="Record Disbursement"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                setIsDisbursementModalOpen(false);
                setIsViewModalOpen(true);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleDisburse} isLoading={isSubmitting}>
              Record Disbursement
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-slate-600">
            Record the disbursement details for this approved loan.
          </p>

          {error && (
            <div className="flex items-start space-x-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <Input
            label="Disbursement Date"
            type="date"
            value={disbursementDate}
            onChange={(e) => setDisbursementDate(e.target.value)}
            required
          />

          <Input
            label="Disbursement Reference/Transaction ID"
            value={disbursementReference}
            onChange={(e) => setDisbursementReference(e.target.value)}
            placeholder="e.g. TXN123456789"
            required
          />

          <div className="p-3 bg-emerald-50 rounded-lg text-sm text-emerald-800">
            <strong>Method:</strong>{' '}
            {selectedApplication?.disbursement_method === 'bank'
              ? 'Bank Transfer'
              : 'M-Pesa'}
          </div>
        </div>
      </Modal>
    </div>
  );
}
