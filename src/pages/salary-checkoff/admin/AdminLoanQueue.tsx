import React, { useState, useEffect } from 'react';
import { Card } from '@/components/salary-checkoff/ui/Card';
import { Button } from '@/components/salary-checkoff/ui/Button';
import { Badge } from '@/components/salary-checkoff/ui/Badge';
import { Table } from '@/components/salary-checkoff/ui/Table';
import { Modal } from '@/components/salary-checkoff/ui/Modal';
import { Input } from '@/components/salary-checkoff/ui/Input';
import { Checkbox } from '@/components/salary-checkoff/ui/Checkbox';
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
  CheckSquare,
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
  const [isMassDisbursementModalOpen, setIsMassDisbursementModalOpen] = useState(false);
  const [comment, setComment] = useState('');
  const [creditScoreNotes, setCreditScoreNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Selection state
  const [selectedApplications, setSelectedApplications] = useState<Set<string>>(new Set());
  const [showHistoricalApprovals, setShowHistoricalApprovals] = useState(false);

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

  const handleApproveAndDisburse = async () => {
    if (!selectedApplication) return;

    if (!disbursementReference.trim()) {
      setError('Please provide a disbursement reference');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      // If not yet approved, approve first
      if (selectedApplication.status === 'hr_approved') {
        await loanService.adminAssess(selectedApplication.id, {
          action: 'approve',
          comment: comment || 'Application approved by admin',
          credit_score_notes: creditScoreNotes,
        });
      }

      // Then disburse
      const disbursementMethod = selectedApplication.disbursement_method || 'mpesa';
      await loanService.adminDisburse(selectedApplication.id, {
        disbursement_date: disbursementDate,
        disbursement_method: disbursementMethod,
        disbursement_reference: disbursementReference,
      });

      setIsDisbursementModalOpen(false);
      setIsViewModalOpen(false);
      setDisbursementReference('');
      setComment('');
      setCreditScoreNotes('');
      await loadApplications();
    } catch (err: any) {
      console.error('Error approving and disbursing:', err);
      setError(err.message || 'Failed to approve and disburse');
      setIsSubmitting(false);
    }
  };

  const handleSelectApplication = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedApplications);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedApplications(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const approvedIds = applications
        .filter(app => app.status === 'approved' || app.status === 'hr_approved')
        .map(app => app.id);
      setSelectedApplications(new Set(approvedIds));
    } else {
      setSelectedApplications(new Set());
    }
  };

  const handleMassDisbursement = async () => {
    if (selectedApplications.size === 0) return;

    if (!disbursementReference.trim()) {
      setError('Please provide a disbursement reference');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const selectedApps = applications.filter(app => selectedApplications.has(app.id));

      // Process each disbursement
      for (const app of selectedApps) {
        // If not yet approved, approve first
        if (app.status === 'hr_approved') {
          await loanService.adminAssess(app.id, {
            action: 'approve',
            comment: 'Batch approved by admin',
            credit_score_notes: '',
          });
        }

        // Then disburse
        const disbursementMethod = app.disbursement_method || 'mpesa';
        await loanService.adminDisburse(app.id, {
          disbursement_date: disbursementDate,
          disbursement_method: disbursementMethod,
          disbursement_reference: `${disbursementReference}-${app.application_number}`,
        });
      }

      setIsMassDisbursementModalOpen(false);
      setSelectedApplications(new Set());
      setDisbursementReference('');
      await loadApplications();
    } catch (err: any) {
      console.error('Error processing mass disbursement:', err);
      setError(err.message || 'Failed to process mass disbursement');
      setIsSubmitting(false);
    }
  };

  const approvedApplications = applications.filter(
    app => app.status === 'approved' || app.status === 'hr_approved'
  );
  const allApprovedSelected = approvedApplications.length > 0 &&
    approvedApplications.every(app => selectedApplications.has(app.id));

  const columns = [
    {
      header: (
        <Checkbox
          checked={allApprovedSelected}
          onChange={handleSelectAll}
        />
      ),
      accessor: (item: LoanApplication) => {
        const canSelect = item.status === 'approved' || item.status === 'hr_approved';
        return canSelect ? (
          <Checkbox
            checked={selectedApplications.has(item.id)}
            onChange={(checked) => handleSelectApplication(item.id, checked)}
          />
        ) : null;
      },
    },
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
        <div className="flex items-center space-x-3">
          {selectedApplications.size > 1 && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsMassDisbursementModalOpen(true)}
              leftIcon={<CheckSquare className="h-4 w-4" />}
            >
              Mass Disbursement ({selectedApplications.size})
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowHistoricalApprovals(!showHistoricalApprovals)}
          >
            {showHistoricalApprovals ? 'Hide' : 'Show'} History
          </Button>
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

      <Card title="Application Queue">
        {applications.filter(app => app.status !== 'disbursed').length > 0 ? (
          <Table
            data={applications.filter(app => app.status !== 'disbursed')}
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

      {/* Historical Approvals */}
      {showHistoricalApprovals && (
        <Card title="Historical Approvals & Disbursements">
          {applications.filter(app => app.status === 'disbursed').length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Date Disbursed
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      App #
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Employer
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Method
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Reference
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {applications
                    .filter(app => app.status === 'disbursed')
                    .map((app) => (
                      <tr key={app.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-sm text-slate-900">
                          {app.disbursement_date
                            ? new Date(app.disbursement_date).toLocaleDateString('en-KE', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })
                            : 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-900">
                          {app.application_number}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-900">
                          {app.employer?.name || 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-900">
                          {app.employee?.first_name} {app.employee?.last_name}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-900">
                          KES {parseFloat(app.principal_amount).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <Badge
                            variant={app.disbursement_method === 'bank' ? 'pending' : 'approved'}
                          >
                            {app.disbursement_method === 'bank' ? 'Bank' : 'M-Pesa'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm font-mono text-slate-600">
                          {app.disbursement_reference || 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewApplication(app)}
                          >
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <AlertCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600">No historical disbursements found</p>
            </div>
          )}
        </Card>
      )}

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
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setIsViewModalOpen(false);
                        setIsApproveModalOpen(true);
                      }}
                      leftIcon={<Check className="h-4 w-4" />}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        setIsViewModalOpen(false);
                        setIsDisbursementModalOpen(true);
                      }}
                      leftIcon={<DollarSign className="h-4 w-4" />}
                    >
                      Approve & Disburse
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

            {/* Disbursement Method & Details - Prominently Displayed */}
            {selectedApplication.disbursement_method === 'mpesa' && (
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-600 text-white">
                    M-Pesa
                  </span>
                  <span className="text-sm text-green-700 font-medium">Disbursement Method</span>
                </div>
                <div className="bg-white rounded-md p-3 border border-green-200">
                  <label className="text-xs font-medium text-green-700 uppercase tracking-wide">M-Pesa Number to Send Money To:</label>
                  <p className="mt-1 text-lg font-bold text-green-900">
                    {selectedApplication.employee.phone_number || 'Not provided'}
                  </p>
                </div>
              </div>
            )}
            {selectedApplication.disbursement_method === 'bank' && (
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-600 text-white">
                    Bank Transfer
                  </span>
                  <span className="text-sm text-blue-700 font-medium">Disbursement Method</span>
                </div>
                <div className="bg-white rounded-md p-3 border border-blue-200 space-y-3">
                  <div>
                    <label className="text-xs font-medium text-blue-700 uppercase tracking-wide">Bank Name:</label>
                    <p className="mt-1 text-lg font-bold text-blue-900">{selectedApplication.bank_name || 'Not provided'}</p>
                  </div>
                  {selectedApplication.bank_branch && (
                    <div className="border-t border-blue-100 pt-2">
                      <label className="text-xs font-medium text-blue-700 uppercase tracking-wide">Branch:</label>
                      <p className="mt-1 text-base font-semibold text-blue-900">{selectedApplication.bank_branch}</p>
                    </div>
                  )}
                  <div className="border-t border-blue-100 pt-2">
                    <label className="text-xs font-medium text-blue-700 uppercase tracking-wide">Account Number:</label>
                    <p className="mt-1 text-lg font-bold text-blue-900 font-mono">{selectedApplication.account_number || 'Not provided'}</p>
                  </div>
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

      {/* Mass Disbursement Modal */}
      <Modal
        isOpen={isMassDisbursementModalOpen}
        onClose={() => {
          setIsMassDisbursementModalOpen(false);
          setError(null);
        }}
        title="Mass Disbursement Confirmation"
        size="xl"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setIsMassDisbursementModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleMassDisbursement} isLoading={isSubmitting}>
              Approve & Disburse All
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-slate-600">
            You are about to approve and disburse {selectedApplications.size} loan{selectedApplications.size > 1 ? 's' : ''}. Please review the details below and provide a disbursement reference.
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
            label="Disbursement Reference Prefix"
            value={disbursementReference}
            onChange={(e) => setDisbursementReference(e.target.value)}
            placeholder="e.g. BATCH-001"
            helperText="Will be suffixed with application number for each disbursement"
            required
          />

          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    App #
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Method
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {applications
                  .filter(app => selectedApplications.has(app.id))
                  .map((app) => (
                    <tr key={app.id}>
                      <td className="px-4 py-3 text-sm text-slate-900">
                        {app.application_number}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-900">
                        {app.employee?.first_name} {app.employee?.last_name}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-900">
                        KES {parseFloat(app.principal_amount).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <Badge
                          variant={app.disbursement_method === 'bank' ? 'pending' : 'approved'}
                        >
                          {app.disbursement_method === 'bank' ? 'Bank' : 'M-Pesa'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {app.disbursement_method === 'bank' ? (
                          <div>
                            <div className="text-xs text-blue-700 font-medium">Bank:</div>
                            <div className="font-semibold text-slate-900">{app.bank_name || 'Not provided'}</div>
                            <div className="text-xs text-blue-700 font-medium mt-1">Account:</div>
                            <div className="font-semibold text-slate-900 font-mono text-xs">{app.account_number || 'Not provided'}</div>
                          </div>
                        ) : (
                          <div>
                            <div className="text-xs text-green-700 font-medium">M-Pesa Number:</div>
                            <div className="font-semibold text-slate-900">{app.employee?.phone_number || 'Not provided'}</div>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
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
        title={selectedApplication?.status === 'hr_approved' ? 'Approve and Disburse' : 'Record Disbursement'}
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
            <Button
              onClick={selectedApplication?.status === 'hr_approved' ? handleApproveAndDisburse : handleDisburse}
              isLoading={isSubmitting}
            >
              {selectedApplication?.status === 'hr_approved' ? 'Approve & Disburse' : 'Record Disbursement'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-slate-600">
            {selectedApplication?.status === 'hr_approved'
              ? 'This will approve the loan and immediately disburse it.'
              : 'Record the disbursement details for this approved loan.'}
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

          {selectedApplication?.disbursement_method === 'mpesa' && (
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-600 text-white">
                  M-Pesa
                </span>
                <span className="text-sm text-green-700 font-medium">Disbursement Method</span>
              </div>
              <div className="bg-white rounded-md p-3 border border-green-200">
                <label className="text-xs font-medium text-green-700 uppercase tracking-wide">M-Pesa Number to Send Money To:</label>
                <p className="mt-1 text-lg font-bold text-green-900">
                  {selectedApplication.employee.phone_number || 'Not provided'}
                </p>
              </div>
            </div>
          )}
          {selectedApplication?.disbursement_method === 'bank' && (
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-600 text-white">
                  Bank Transfer
                </span>
                <span className="text-sm text-blue-700 font-medium">Disbursement Method</span>
              </div>
              <div className="bg-white rounded-md p-3 border border-blue-200 space-y-3">
                <div>
                  <label className="text-xs font-medium text-blue-700 uppercase tracking-wide">Bank Name:</label>
                  <p className="mt-1 text-lg font-bold text-blue-900">{selectedApplication.bank_name || 'Not provided'}</p>
                </div>
                {selectedApplication.bank_branch && (
                  <div className="border-t border-blue-100 pt-2">
                    <label className="text-xs font-medium text-blue-700 uppercase tracking-wide">Branch:</label>
                    <p className="mt-1 text-base font-semibold text-blue-900">{selectedApplication.bank_branch}</p>
                  </div>
                )}
                <div className="border-t border-blue-100 pt-2">
                  <label className="text-xs font-medium text-blue-700 uppercase tracking-wide">Account Number:</label>
                  <p className="mt-1 text-lg font-bold text-blue-900 font-mono">{selectedApplication.account_number || 'Not provided'}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
