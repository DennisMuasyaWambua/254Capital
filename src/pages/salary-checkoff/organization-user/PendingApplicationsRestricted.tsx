import React, { useState, useEffect } from 'react';
import { Card } from '@/components/salary-checkoff/ui/Card';
import { Table } from '@/components/salary-checkoff/ui/Table';
import { Button } from '@/components/salary-checkoff/ui/Button';
import { Badge } from '@/components/salary-checkoff/ui/Badge';
import { Input } from '@/components/salary-checkoff/ui/Input';
import { Loader2, Eye, ThumbsUp, ThumbsDown, FileText, AlertCircle } from 'lucide-react';
import { loanService } from '@/services/salary-checkoff/loan.service';

interface PendingApplicationsRestrictedProps {
  userPermissions: {
    can_view_loan_application: boolean;
    can_approve_loan_application: boolean;
    can_decline_loan_application: boolean;
  };
  organizationId: string;
  onNavigate?: (page: string) => void;
}

export function PendingApplicationsRestricted({
  userPermissions,
  organizationId,
  onNavigate
}: PendingApplicationsRestrictedProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [applications, setApplications] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showDeclineModal, setShowDeclineModal] = useState(false);

  useEffect(() => {
    loadPendingApplications();
  }, []);

  const loadPendingApplications = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch pending applications for the organization
      const response = await loanService.hrListPending();

      // Filter by organization and status
      const filtered = response.results.filter(
        (app: any) => app.status === 'submitted' || app.status === 'pending'
      );

      setApplications(filtered);
    } catch (err: any) {
      console.error('Error loading applications:', err);
      setError(err.message || 'Failed to load pending applications');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = (app: any) => {
    setSelectedApp(app);
    setShowDetailsModal(true);
  };

  const handleApprove = (app: any) => {
    setSelectedApp(app);
    setShowApproveModal(true);
  };

  const handleDecline = (app: any) => {
    setSelectedApp(app);
    setShowDeclineModal(true);
  };

  // Check if user has any permissions
  const hasAnyPermission = userPermissions.can_view_loan_application ||
    userPermissions.can_approve_loan_application ||
    userPermissions.can_decline_loan_application;

  const columns = [
    {
      header: 'Application ID',
      accessor: (item: any) => (
        <span className="font-mono text-sm">{item.application_number}</span>
      )
    },
    {
      header: 'Applicant',
      accessor: (item: any) => (
        <div>
          <div className="font-medium">
            {item.employee?.first_name} {item.employee?.last_name}
          </div>
          <div className="text-sm text-slate-500">
            {item.employee?.phone_number}
          </div>
        </div>
      )
    },
    {
      header: 'Loan Amount',
      accessor: (item: any) => (
        <span className="font-medium">
          KES {Number(item.principal_amount).toLocaleString()}
        </span>
      )
    },
    {
      header: 'Monthly Repayment',
      accessor: (item: any) => (
        <div className="text-sm">
          <div>KES {Number(item.monthly_deduction).toLocaleString()}</div>
          <div className="text-slate-500">{item.repayment_months} months</div>
        </div>
      )
    },
    {
      header: 'Application Date',
      accessor: (item: any) => new Date(item.created_at).toLocaleDateString('en-KE', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    },
    {
      header: 'Status',
      accessor: (item: any) => (
        <Badge variant="warning">Pending Review</Badge>
      )
    },
    {
      header: 'Actions',
      accessor: (item: any) => (
        <div className="flex items-center space-x-2">
          {userPermissions.can_view_loan_application && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleViewDetails(item)}
            >
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
          )}
          {userPermissions.can_approve_loan_application && (
            <Button
              variant="default"
              size="sm"
              onClick={() => handleApprove(item)}
            >
              <ThumbsUp className="h-4 w-4 mr-1" />
              Approve
            </Button>
          )}
          {userPermissions.can_decline_loan_application && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDecline(item)}
            >
              <ThumbsDown className="h-4 w-4 mr-1 text-red-500" />
              Decline
            </Button>
          )}
        </div>
      )
    }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[#008080]" />
      </div>
    );
  }

  // No permissions state
  if (!hasAnyPermission) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md p-8 text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-yellow-500 mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No Permissions Assigned</h3>
          <p className="text-slate-600">
            Your role does not have any permissions to perform actions on loan applications.
            Please contact your administrator for assistance.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Pending Loan Applications</h1>
        <p className="mt-1 text-slate-600">
          Review and process pending loan applications for your organization
        </p>
      </div>

      {/* Permissions Info */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 mb-1">Your Permissions</h4>
            <div className="flex flex-wrap gap-2">
              {userPermissions.can_view_loan_application && (
                <Badge variant="info" className="flex items-center space-x-1">
                  <Eye className="h-3 w-3" />
                  <span>View Applications</span>
                </Badge>
              )}
              {userPermissions.can_approve_loan_application && (
                <Badge variant="success" className="flex items-center space-x-1">
                  <ThumbsUp className="h-3 w-3" />
                  <span>Approve Applications</span>
                </Badge>
              )}
              {userPermissions.can_decline_loan_application && (
                <Badge variant="warning" className="flex items-center space-x-1">
                  <ThumbsDown className="h-3 w-3" />
                  <span>Decline Applications</span>
                </Badge>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Error State */}
      {error && (
        <Card className="p-4 bg-red-50 border-red-200">
          <p className="text-red-600">{error}</p>
        </Card>
      )}

      {/* Applications Table */}
      <Card>
        {applications.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No pending applications</h3>
            <p className="text-slate-600">
              There are currently no loan applications pending review for your organization.
            </p>
          </div>
        ) : (
          <Table columns={columns} data={applications} />
        )}
      </Card>

      {/* Modals */}
      {showDetailsModal && selectedApp && (
        <ViewDetailsModal
          application={selectedApp}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedApp(null);
          }}
          canApprove={userPermissions.can_approve_loan_application}
          canDecline={userPermissions.can_decline_loan_application}
          onApprove={() => {
            setShowDetailsModal(false);
            handleApprove(selectedApp);
          }}
          onDecline={() => {
            setShowDetailsModal(false);
            handleDecline(selectedApp);
          }}
        />
      )}

      {showApproveModal && selectedApp && (
        <ApproveModal
          application={selectedApp}
          onClose={() => {
            setShowApproveModal(false);
            setSelectedApp(null);
          }}
          onSuccess={() => {
            setShowApproveModal(false);
            setSelectedApp(null);
            loadPendingApplications();
          }}
        />
      )}

      {showDeclineModal && selectedApp && (
        <DeclineModal
          application={selectedApp}
          onClose={() => {
            setShowDeclineModal(false);
            setSelectedApp(null);
          }}
          onSuccess={() => {
            setShowDeclineModal(false);
            setSelectedApp(null);
            loadPendingApplications();
          }}
        />
      )}
    </div>
  );
}

// View Details Modal
interface ViewDetailsModalProps {
  application: any;
  onClose: () => void;
  canApprove: boolean;
  canDecline: boolean;
  onApprove: () => void;
  onDecline: () => void;
}

function ViewDetailsModal({ application, onClose, canApprove, canDecline, onApprove, onDecline }: ViewDetailsModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Loan Application Details</h2>

          <div className="space-y-6">
            {/* Applicant Information */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Applicant Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <DetailRow label="Name" value={`${application.employee?.first_name} ${application.employee?.last_name}`} />
                <DetailRow label="Phone" value={application.employee?.phone_number} />
                <DetailRow label="Email" value={application.employee?.email || '—'} />
                <DetailRow label="Employee ID" value={application.employee?.employee_id || '—'} />
              </div>
            </div>

            {/* Loan Details */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Loan Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <DetailRow label="Loan Amount" value={`KES ${Number(application.principal_amount).toLocaleString()}`} />
                <DetailRow label="Interest Rate" value={`${application.interest_rate}%`} />
                <DetailRow label="Repayment Period" value={`${application.repayment_months} months`} />
                <DetailRow label="Monthly Deduction" value={`KES ${Number(application.monthly_deduction).toLocaleString()}`} />
                <DetailRow label="Total Repayment" value={`KES ${Number(application.total_repayment).toLocaleString()}`} />
                <DetailRow label="Purpose" value={application.purpose || '—'} />
              </div>
            </div>

            {/* Disbursement Information */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Disbursement Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <DetailRow label="Method" value={application.disbursement_method === 'bank' ? 'Bank Transfer' : 'M-Pesa'} />
                {application.disbursement_method === 'bank' && (
                  <>
                    <DetailRow label="Bank" value={application.bank_name || '—'} />
                    <DetailRow label="Account Number" value={application.bank_account_number || '—'} />
                  </>
                )}
                {application.disbursement_method === 'mpesa' && (
                  <DetailRow label="M-Pesa Number" value={application.mpesa_number || '—'} />
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-slate-200">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            {canDecline && (
              <Button variant="outline" onClick={onDecline}>
                <ThumbsDown className="h-4 w-4 mr-2 text-red-500" />
                Decline
              </Button>
            )}
            {canApprove && (
              <Button onClick={onApprove}>
                <ThumbsUp className="h-4 w-4 mr-2" />
                Approve
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

// Approve Modal
interface ApproveModalProps {
  application: any;
  onClose: () => void;
  onSuccess: () => void;
}

function ApproveModal({ application, onClose, onSuccess }: ApproveModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [notes, setNotes] = useState('');

  const handleApprove = async () => {
    setIsLoading(true);
    try {
      await loanService.hrReviewApplication(application.id, 'approve', notes);
      onSuccess();
    } catch (err: any) {
      alert(err.message || 'Failed to approve application');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="max-w-md w-full mx-4">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Approve Loan Application</h2>

          <div className="mb-6">
            <p className="text-slate-600 mb-4">
              Are you sure you want to approve the loan application for{' '}
              <span className="font-semibold">
                {application.employee?.first_name} {application.employee?.last_name}
              </span>{' '}
              for <span className="font-semibold">KES {Number(application.principal_amount).toLocaleString()}</span>?
            </p>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any comments or notes..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080] focus:border-transparent"
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleApprove} isLoading={isLoading}>
              <ThumbsUp className="h-4 w-4 mr-2" />
              Approve Application
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

// Decline Modal
interface DeclineModalProps {
  application: any;
  onClose: () => void;
  onSuccess: () => void;
}

function DeclineModal({ application, onClose, onSuccess }: DeclineModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const handleDecline = async () => {
    if (!reason.trim()) {
      setError('Please provide a reason for declining this application');
      return;
    }

    setIsLoading(true);
    try {
      await loanService.hrReviewApplication(application.id, 'reject', reason);
      onSuccess();
    } catch (err: any) {
      alert(err.message || 'Failed to decline application');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="max-w-md w-full mx-4">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Decline Loan Application</h2>

          <div className="mb-6">
            <p className="text-slate-600 mb-4">
              Please provide a reason for declining the loan application for{' '}
              <span className="font-semibold">
                {application.employee?.first_name} {application.employee?.last_name}
              </span>.
            </p>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Reason for Decline *
              </label>
              <textarea
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  setError('');
                }}
                placeholder="e.g., Insufficient documentation, Does not meet eligibility criteria..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080] focus:border-transparent"
                rows={4}
                required
              />
              {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleDecline} isLoading={isLoading} variant="outline">
              <ThumbsDown className="h-4 w-4 mr-2 text-red-500" />
              Decline Application
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

// Detail Row Component
function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-sm text-slate-500">{label}</div>
      <div className="font-medium text-slate-900">{value}</div>
    </div>
  );
}
