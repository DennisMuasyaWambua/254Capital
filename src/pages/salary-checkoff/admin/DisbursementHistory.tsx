import React, { useState, useEffect } from 'react';
import { Card } from '@/components/salary-checkoff/ui/Card';
import { Button } from '@/components/salary-checkoff/ui/Button';
import { Badge } from '@/components/salary-checkoff/ui/Badge';
import { Table } from '@/components/salary-checkoff/ui/Table';
import { Modal } from '@/components/salary-checkoff/ui/Modal';
import { loanService, LoanApplication } from '@/services/salary-checkoff/loan.service';
import {
  ArrowLeft,
  Download,
  Loader2,
  AlertCircle,
  Calendar,
  DollarSign,
  Filter,
  RefreshCw,
} from 'lucide-react';

interface DisbursementHistoryProps {
  onBack: () => void;
  role?: 'admin' | 'hr';
}

export function DisbursementHistory({ onBack, role = 'admin' }: DisbursementHistoryProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [disbursements, setDisbursements] = useState<LoanApplication[]>([]);
  const [selectedDisbursement, setSelectedDisbursement] = useState<LoanApplication | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterEmployer, setFilterEmployer] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Stats
  const [stats, setStats] = useState({
    totalDisbursed: 0,
    count: 0,
    thisMonth: 0,
    thisMonthCount: 0,
  });

  useEffect(() => {
    loadDisbursements();
  }, []);

  const loadDisbursements = async () => {
    try {
      setIsLoading(true);
      setError(null);

      let response;
      if (role === 'admin') {
        response = await loanService.adminListQueue({});
      } else {
        response = await loanService.hrListAll({});
      }

      // Filter only disbursed loans
      const disbursedLoans = response.results.filter(
        (app: LoanApplication) => app.status === 'disbursed'
      );

      setDisbursements(disbursedLoans);

      // Calculate stats
      const totalDisbursed = disbursedLoans.reduce(
        (sum, app) => sum + parseFloat(app.principal_amount),
        0
      );

      const now = new Date();
      const thisMonthLoans = disbursedLoans.filter((app) => {
        if (!app.disbursement_date) return false;
        const disbDate = new Date(app.disbursement_date);
        return (
          disbDate.getMonth() === now.getMonth() &&
          disbDate.getFullYear() === now.getFullYear()
        );
      });

      const thisMonthTotal = thisMonthLoans.reduce(
        (sum, app) => sum + parseFloat(app.principal_amount),
        0
      );

      setStats({
        totalDisbursed,
        count: disbursedLoans.length,
        thisMonth: thisMonthTotal,
        thisMonthCount: thisMonthLoans.length,
      });
    } catch (err: any) {
      console.error('Error loading disbursements:', err);
      setError(err.message || 'Failed to load disbursements');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = (disbursement: LoanApplication) => {
    setSelectedDisbursement(disbursement);
    setIsViewModalOpen(true);
  };

  const filteredDisbursements = disbursements.filter((item) => {
    const matchesSearch =
      searchQuery === '' ||
      item.application_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `${item.employee?.first_name} ${item.employee?.last_name}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    const matchesEmployer =
      filterEmployer === '' ||
      item.employer?.name.toLowerCase().includes(filterEmployer.toLowerCase());

    return matchesSearch && matchesEmployer;
  });

  const columns = [
    {
      header: 'Date',
      accessor: (item: LoanApplication) =>
        item.disbursement_date
          ? new Date(item.disbursement_date).toLocaleDateString('en-KE', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })
          : 'N/A',
    },
    {
      header: 'App #',
      accessor: 'application_number',
    },
    ...(role === 'admin'
      ? [
          {
            header: 'Employer',
            accessor: (item: LoanApplication) => item.employer?.name || 'N/A',
          },
        ]
      : []),
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
      header: 'Method',
      accessor: (item: LoanApplication) => (
        <Badge
          variant={item.disbursement_method === 'bank' ? 'pending' : 'approved'}
        >
          {item.disbursement_method === 'bank' ? 'Bank' : 'M-Pesa'}
        </Badge>
      ),
    },
    {
      header: 'Reference',
      accessor: (item: LoanApplication) => (
        <span className="text-sm font-mono">
          {item.disbursement_reference || 'N/A'}
        </span>
      ),
    },
    {
      header: 'Action',
      accessor: (item: LoanApplication) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleViewDetails(item)}
        >
          View
        </Button>
      ),
    },
  ];

  if (isLoading && disbursements.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[#008080]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
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
            Disbursement History
          </h1>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={loadDisbursements}
            leftIcon={<RefreshCw className="h-4 w-4" />}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Download className="h-4 w-4" />}
          >
            Export
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-start space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-800">Error</p>
            <p className="text-xs text-red-700 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Total Disbursed</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                KES {(stats.totalDisbursed / 1000000).toFixed(2)}M
              </p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Total Count</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {stats.count}
              </p>
            </div>
            <div className="h-12 w-12 bg-emerald-100 rounded-full flex items-center justify-center">
              <Calendar className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">This Month</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                KES {(stats.thisMonth / 1000).toFixed(0)}K
              </p>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">This Month Count</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {stats.thisMonthCount}
              </p>
            </div>
            <div className="h-12 w-12 bg-amber-100 rounded-full flex items-center justify-center">
              <Calendar className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by app # or employee name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-[#00BCD4] focus:ring-1 focus:ring-[#00BCD4]"
            />
          </div>
          {role === 'admin' && (
            <div className="flex-1">
              <input
                type="text"
                placeholder="Filter by employer..."
                value={filterEmployer}
                onChange={(e) => setFilterEmployer(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-[#00BCD4] focus:ring-1 focus:ring-[#00BCD4]"
              />
            </div>
          )}
        </div>
      </Card>

      {/* Disbursements Table */}
      <Card>
        {filteredDisbursements.length > 0 ? (
          <Table
            data={filteredDisbursements}
            columns={columns}
            keyExtractor={(item) => item.id}
          />
        ) : (
          <div className="p-12 text-center">
            <AlertCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600">
              {disbursements.length === 0
                ? 'No disbursements found'
                : 'No disbursements match your filters'}
            </p>
          </div>
        )}
      </Card>

      {/* View Details Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedDisbursement(null);
        }}
        title={`Disbursement Details - ${selectedDisbursement?.application_number}`}
        size="lg"
      >
        {selectedDisbursement && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-semibold text-slate-900 mb-3">
                  Disbursement Information
                </h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-slate-500">Date:</span>{' '}
                    <span className="font-medium">
                      {selectedDisbursement.disbursement_date
                        ? new Date(
                            selectedDisbursement.disbursement_date
                          ).toLocaleDateString('en-KE', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })
                        : 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500">Method:</span>{' '}
                    <span className="font-medium">
                      {selectedDisbursement.disbursement_method === 'bank'
                        ? 'Bank Transfer'
                        : 'M-Pesa'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500">Reference:</span>{' '}
                    <span className="font-medium font-mono">
                      {selectedDisbursement.disbursement_reference || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500">Amount:</span>{' '}
                    <span className="font-medium">
                      KES{' '}
                      {parseFloat(
                        selectedDisbursement.principal_amount
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-slate-900 mb-3">
                  Employee Details
                </h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-slate-500">Name:</span>{' '}
                    <span className="font-medium">
                      {selectedDisbursement.employee?.first_name}{' '}
                      {selectedDisbursement.employee?.last_name}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500">Phone:</span>{' '}
                    <span className="font-medium">
                      {selectedDisbursement.employee?.phone_number}
                    </span>
                  </div>
                  {role === 'admin' && (
                    <div>
                      <span className="text-slate-500">Employer:</span>{' '}
                      <span className="font-medium">
                        {selectedDisbursement.employer?.name}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {selectedDisbursement.disbursement_method === 'bank' && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="text-sm font-semibold text-blue-900 mb-2">
                  Bank Account Details
                </h4>
                <div className="space-y-1 text-sm text-blue-800">
                  <div>
                    <span className="font-medium">Bank:</span>{' '}
                    {(selectedDisbursement as any).bank_name || 'N/A'}
                  </div>
                  <div>
                    <span className="font-medium">Branch:</span>{' '}
                    {(selectedDisbursement as any).bank_branch || 'N/A'}
                  </div>
                  <div>
                    <span className="font-medium">Account:</span>{' '}
                    {(selectedDisbursement as any).account_number || 'N/A'}
                  </div>
                </div>
              </div>
            )}

            <div className="p-4 bg-slate-50 rounded-lg">
              <h4 className="text-sm font-semibold text-slate-900 mb-2">
                Loan Details
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-500">Repayment Period:</span>{' '}
                  <span className="font-medium">
                    {selectedDisbursement.repayment_months} months
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">Monthly Deduction:</span>{' '}
                  <span className="font-medium">
                    KES{' '}
                    {parseFloat(
                      selectedDisbursement.monthly_deduction
                    ).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">Total Repayment:</span>{' '}
                  <span className="font-medium">
                    KES{' '}
                    {parseFloat(
                      selectedDisbursement.total_repayment
                    ).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">First Deduction:</span>{' '}
                  <span className="font-medium">
                    {selectedDisbursement.first_deduction_date
                      ? new Date(
                          selectedDisbursement.first_deduction_date
                        ).toLocaleDateString('en-KE')
                      : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
