import React, { useState, useEffect } from 'react';
import { Card } from '@/components/salary-checkoff/ui/Card';
import { Table } from '@/components/salary-checkoff/ui/Table';
import { Badge } from '@/components/salary-checkoff/ui/Badge';
import { Button } from '@/components/salary-checkoff/ui/Button';
import { Modal } from '@/components/salary-checkoff/ui/Modal';
import {
  clientService,
  ExistingClient,
} from '@/services/salary-checkoff/client.service';
import { formatDate, formatNumberWithCommas } from '@/utils/formatters';
import { Check, X, Eye, Edit2, Loader2, AlertCircle } from 'lucide-react';

interface PendingApprovalsProps {
  onNavigate: (page: string) => void;
}

export function PendingApprovals({ onNavigate }: PendingApprovalsProps) {
  const [selectedClient, setSelectedClient] = useState<ExistingClient | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingClients, setPendingClients] = useState<ExistingClient[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isApproving, setIsApproving] = useState(false);

  useEffect(() => {
    loadPendingClients();
  }, []);

  const loadPendingClients = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await clientService.listPendingClients();
      setPendingClients(response.results);
    } catch (error: any) {
      console.error('Error loading pending clients:', error);
      setError(error.message || 'Failed to load pending approvals');
    } finally {
      setIsLoading(false);
    }
  };

  const handleView = (client: ExistingClient) => {
    setSelectedClient(client);
    setIsModalOpen(true);
  };

  const handleApprove = async (clientId: string) => {
    try {
      setIsApproving(true);
      await clientService.approveClient(clientId);
      await loadPendingClients();
      setIsModalOpen(false);
      setSelectedClient(null);
    } catch (error: any) {
      setError(error.message || 'Failed to approve client');
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async (clientId: string) => {
    try {
      setIsApproving(true);
      await clientService.rejectClient(clientId);
      await loadPendingClients();
      setIsModalOpen(false);
      setSelectedClient(null);
    } catch (error: any) {
      setError(error.message || 'Failed to reject client');
    } finally {
      setIsApproving(false);
    }
  };

  const columns = [
    {
      header: 'Name',
      accessor: (item: ExistingClient) => item.full_name,
      className: 'font-medium',
    },
    {
      header: 'ID Number',
      accessor: (item: ExistingClient) => item.national_id,
    },
    {
      header: 'Employer',
      accessor: (item: ExistingClient) => item.employer_name,
    },
    {
      header: 'Loan Amount',
      accessor: (item: ExistingClient) =>
        `KES ${parseFloat(item.loan_amount).toLocaleString()}`,
    },
    {
      header: 'Entry Date',
      accessor: (item: ExistingClient) => formatDate(item.created_at),
    },
    {
      header: 'Entered By',
      accessor: (item: ExistingClient) => item.entered_by || 'Admin',
    },
    {
      header: 'Actions',
      accessor: (item: ExistingClient) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleView(item)}
            className="p-1.5 text-slate-500 hover:text-[#008080] hover:bg-slate-100 rounded-md transition-colors"
            title="View Details"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleApprove(item.id)}
            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
            title="Approve"
          >
            <Check className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleReject(item.id)}
            className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
            title="Reject"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[#008080]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Pending Approvals</h1>
          <p className="text-slate-500">
            Review and approve manually entered or bulk uploaded client records.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-800">
          <AlertCircle className="h-5 w-5 mr-2 text-red-600" />
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-600 hover:text-red-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <Card>
        <div className="mb-4 flex justify-between items-center">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>
              Approve Selected
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-red-600 hover:bg-red-50"
              disabled
            >
              Reject Selected
            </Button>
          </div>
          <Badge variant="pending">{pendingClients.length} Pending</Badge>
        </div>

        {pendingClients.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            No pending approvals at this time
          </div>
        ) : (
          <Table
            data={pendingClients}
            columns={columns}
            keyExtractor={(item) => item.id}
          />
        )}
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Client Approval Details"
        size="lg"
        footer={
          <>
            <Button
              variant="danger"
              onClick={() => selectedClient && handleReject(selectedClient.id)}
              disabled={isApproving}
            >
              Reject
            </Button>
            <Button
              onClick={() => selectedClient && handleApprove(selectedClient.id)}
              isLoading={isApproving}
            >
              Approve & Activate
            </Button>
          </>
        }
      >
        {selectedClient && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-500 mb-1">Full Name</p>
                <p className="font-medium text-slate-900">
                  {selectedClient.full_name}
                </p>
              </div>
              <div>
                <p className="text-slate-500 mb-1">National ID</p>
                <p className="font-medium text-slate-900">
                  {selectedClient.national_id}
                </p>
              </div>
              <div>
                <p className="text-slate-500 mb-1">Mobile</p>
                <p className="font-medium text-slate-900">{selectedClient.mobile}</p>
              </div>
              <div>
                <p className="text-slate-500 mb-1">Email</p>
                <p className="font-medium text-slate-900">
                  {selectedClient.email || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-slate-500 mb-1">Employer</p>
                <p className="font-medium text-slate-900">
                  {selectedClient.employer_name}
                </p>
              </div>
              <div>
                <p className="text-slate-500 mb-1">Employee ID</p>
                <p className="font-medium text-slate-900">
                  {selectedClient.employee_id || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-slate-500 mb-1">Entry Date</p>
                <p className="font-medium text-slate-900">
                  {formatDate(selectedClient.created_at)}
                </p>
              </div>
              <div>
                <p className="text-slate-500 mb-1">Loan Status</p>
                <p className="font-medium text-slate-900">
                  {selectedClient.loan_status}
                </p>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <h4 className="font-medium text-slate-900 mb-3">Loan Summary</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-500">Original Amount</p>
                  <p className="font-bold text-slate-900">
                    KES {parseFloat(selectedClient.loan_amount).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">Interest Rate</p>
                  <p className="font-bold text-slate-900">
                    {selectedClient.interest_rate}%
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">Repayment Period</p>
                  <p className="font-bold text-slate-900">
                    {selectedClient.repayment_period} months
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">Monthly Deduction</p>
                  <p className="font-bold text-slate-900">
                    KES{' '}
                    {parseFloat(selectedClient.monthly_deduction).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">Total Due</p>
                  <p className="font-bold text-slate-900">
                    KES {parseFloat(selectedClient.total_due).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">Outstanding Balance</p>
                  <p className="font-bold text-[#008080]">
                    KES{' '}
                    {parseFloat(selectedClient.outstanding_balance).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800">
              Approving this record will activate the client account and send an SMS
              with login instructions to their mobile number.
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
