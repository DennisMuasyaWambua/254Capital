import React, { useState, useEffect } from 'react';
import { Card } from '@/components/salary-checkoff/ui/Card';
import { Table } from '@/components/salary-checkoff/ui/Table';
import { Button } from '@/components/salary-checkoff/ui/Button';
import { Badge, BadgeVariant } from '@/components/salary-checkoff/ui/Badge';
import { Input } from '@/components/salary-checkoff/ui/Input';
import { Select } from '@/components/salary-checkoff/ui/Select';
import { loanService, LoanApplication } from '@/services/salary-checkoff/loan.service';
import { Loader2, History, Search } from 'lucide-react';

interface ApplicationHistoryProps {
  onNavigate: (page: string) => void;
  onReviewApplication?: (applicationId: string) => void;
}

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'under_review_admin', label: 'With 254 Capital' },
  { value: 'approved', label: 'Approved' },
  { value: 'declined', label: 'Declined' },
  { value: 'disbursed', label: 'Disbursed' },
];

const STATUS_BADGE: Record<string, BadgeVariant> = {
  submitted: 'pending',
  under_review_admin: 'under-review',
  approved: 'approved',
  declined: 'declined',
  disbursed: 'disbursed',
};

export function ApplicationHistory({ onNavigate, onReviewApplication }: ApplicationHistoryProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    loadApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, statusFilter, searchQuery, fromDate, toDate]);

  const loadApplications = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await loanService.hrListAll({
        status: statusFilter || undefined,
        search: searchQuery || undefined,
        from_date: fromDate || undefined,
        to_date: toDate || undefined,
        page: currentPage,
      });

      setApplications(response.results);
      setTotalCount(response.count);
      setTotalPages(response.total_pages || 1);
    } catch (err) {
      console.error('Error loading application history:', err);
      setError((err as Error).message || 'Failed to load application history');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (setter: (value: string) => void) => (value: string) => {
    setter(value);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setStatusFilter('');
    setSearchQuery('');
    setFromDate('');
    setToDate('');
    setCurrentPage(1);
  };

  const hasFilters = statusFilter || searchQuery || fromDate || toDate;

  const columns = [
    {
      header: 'Application ID',
      accessor: 'application_number' as const,
    },
    {
      header: 'Employee',
      accessor: (item: LoanApplication) => item.employee_name || 'N/A',
    },
    {
      header: 'Loan Amount',
      accessor: (item: LoanApplication) =>
        `KES ${parseFloat(item.principal_amount).toLocaleString()}`,
    },
    {
      header: 'Monthly Deduction',
      accessor: (item: LoanApplication) =>
        `KES ${parseFloat(item.monthly_deduction).toLocaleString()}`,
    },
    {
      header: 'Period (Months)',
      accessor: 'repayment_months' as const,
    },
    {
      header: 'Date Applied',
      accessor: (item: LoanApplication) =>
        new Date(item.created_at).toLocaleDateString('en-KE', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }),
    },
    {
      header: 'Status',
      accessor: (item: LoanApplication) => (
        <Badge variant={STATUS_BADGE[item.status] || 'default'}>
          {item.status_display || item.status}
        </Badge>
      ),
    },
    {
      header: 'Disbursed On',
      accessor: (item: LoanApplication) =>
        item.disbursement_date
          ? new Date(item.disbursement_date).toLocaleDateString('en-KE', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })
          : '—',
    },
    {
      header: 'Action',
      accessor: (item: LoanApplication) =>
        item.status === 'submitted' && onReviewApplication ? (
          <Button size="sm" variant="outline" onClick={() => onReviewApplication(item.id)}>
            Review
          </Button>
        ) : null,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Application History</h1>
          <p className="text-slate-500 mt-1">
            All loan applications made by your company's employees
          </p>
        </div>
        <Button variant="outline" onClick={() => onNavigate('dashboard')}>
          Back to Dashboard
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          <div className="lg:col-span-2">
            <Input
              label="Search"
              placeholder="Name, application ID or phone"
              value={searchQuery}
              onChange={(e) => handleFilterChange(setSearchQuery)(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
            />
          </div>
          <Select
            label="Status"
            options={STATUS_OPTIONS}
            value={statusFilter}
            onChange={(e) => handleFilterChange(setStatusFilter)(e.target.value)}
          />
          <Input
            label="From"
            type="date"
            value={fromDate}
            onChange={(e) => handleFilterChange(setFromDate)(e.target.value)}
          />
          <Input
            label="To"
            type="date"
            value={toDate}
            onChange={(e) => handleFilterChange(setToDate)(e.target.value)}
          />
        </div>
        {hasFilters && (
          <div className="mt-3">
            <Button size="sm" variant="ghost" onClick={resetFilters}>
              Clear filters
            </Button>
          </div>
        )}
      </Card>

      {/* Applications Table */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-[#008080]" />
        </div>
      ) : (
        <Card title={`Applications (${totalCount})`}>
          {applications.length > 0 ? (
            <>
              <Table
                data={applications}
                columns={columns}
                keyExtractor={(item) => item.id}
              />
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-slate-500">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <History className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600">
                {hasFilters
                  ? 'No applications match your filters'
                  : 'No loan applications have been made yet'}
              </p>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
