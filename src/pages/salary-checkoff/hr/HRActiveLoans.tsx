import React, { useState, useEffect } from 'react';
import { Card } from '@/components/salary-checkoff/ui/Card';
import { Button } from '@/components/salary-checkoff/ui/Button';
import { Input } from '@/components/salary-checkoff/ui/Input';
import { Badge } from '@/components/salary-checkoff/ui/Badge';
import {
  Search,
  Loader2,
  AlertCircle,
  Users,
  DollarSign,
  Calendar,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  FileText,
  Upload,
} from 'lucide-react';
import { loanService, LoanApplication, PaginatedResponse } from '@/services/salary-checkoff/loan.service';
import { clientService, ExistingClient, CollectionReportData } from '@/services/salary-checkoff/client.service';
import { authService } from '@/services/salary-checkoff/auth.service';

interface HRActiveLoansProps {
  onNavigate: (page: string) => void;
}

// Combined loan type for display
interface CombinedLoan {
  id: string;
  type: 'application' | 'bulk_upload';
  employeeName: string;
  phoneNumber: string;
  applicationNumber: string;
  principalAmount: number;
  monthlyDeduction: number;
  repaymentMonths: number;
  disbursementDate: string | null;
  firstDeductionDate: string | null;
  outstandingBalance: number;
  loanStatus: string;
  originalData: LoanApplication | ExistingClient;
}

export function HRActiveLoans({ onNavigate }: HRActiveLoansProps) {
  const [loans, setLoans] = useState<LoanApplication[]>([]);
  const [bulkUploadedClients, setBulkUploadedClients] = useState<ExistingClient[]>([]);
  const [combinedLoans, setCombinedLoans] = useState<CombinedLoan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [employerId, setEmployerId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'portal' | 'bulk'>('all');

  // Summary stats
  const [stats, setStats] = useState({
    totalLoans: 0,
    totalDisbursed: 0,
    totalMonthlyDeductions: 0,
    bulkUploadCount: 0,
    portalLoanCount: 0,
  });

  // Fetch employer ID on mount
  useEffect(() => {
    const fetchEmployerId = async () => {
      try {
        const profile = await authService.getProfile();
        if (profile.hr_profile?.employer?.id) {
          setEmployerId(profile.hr_profile.employer.id);
        }
      } catch (err) {
        console.error('Failed to fetch employer ID:', err);
      }
    };
    fetchEmployerId();
  }, []);

  useEffect(() => {
    fetchActiveLoans();
  }, [currentPage, searchQuery, employerId]);

  const fetchActiveLoans = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch disbursed loans from portal (active)
      const loanResponse = await loanService.hrListAll({
        status: 'disbursed',
        search: searchQuery || undefined,
        page: currentPage,
      });

      setLoans(loanResponse.results);

      // Fetch bulk-uploaded clients for this employer
      let bulkClients: ExistingClient[] = [];
      if (employerId) {
        try {
          const clientResponse = await clientService.listClientsByEmployer(employerId, {
            search: searchQuery || undefined,
            status: 'Active',
          });
          bulkClients = clientResponse.results;
          setBulkUploadedClients(bulkClients);
        } catch (clientErr) {
          console.warn('Could not fetch bulk-uploaded clients:', clientErr);
          setBulkUploadedClients([]);
        }
      }

      // Combine both sources into unified list
      const combined: CombinedLoan[] = [];

      // Add portal loans
      loanResponse.results.forEach((loan) => {
        combined.push({
          id: loan.id,
          type: 'application',
          employeeName: `${loan.employee?.first_name || ''} ${loan.employee?.last_name || ''}`.trim() || (loan as any).employee_name || 'N/A',
          phoneNumber: loan.employee?.phone_number || '',
          applicationNumber: loan.application_number,
          principalAmount: parseFloat(loan.principal_amount),
          monthlyDeduction: parseFloat(loan.monthly_deduction),
          repaymentMonths: loan.repayment_months,
          disbursementDate: loan.disbursement_date || null,
          firstDeductionDate: loan.first_deduction_date || null,
          outstandingBalance: 0, // Not available in loan application
          loanStatus: 'Active',
          originalData: loan,
        });
      });

      // Add bulk-uploaded clients
      bulkClients.forEach((client) => {
        combined.push({
          id: client.id,
          type: 'bulk_upload',
          employeeName: client.full_name,
          phoneNumber: client.mobile,
          applicationNumber: `BULK-${client.id.slice(0, 8).toUpperCase()}`,
          principalAmount: parseFloat(client.loan_amount),
          monthlyDeduction: parseFloat(client.monthly_deduction),
          repaymentMonths: client.repayment_period,
          disbursementDate: client.disbursement_date,
          firstDeductionDate: null,
          outstandingBalance: parseFloat(client.outstanding_balance),
          loanStatus: client.loan_status,
          originalData: client,
        });
      });

      setCombinedLoans(combined);

      // Calculate total counts
      const totalPortalLoans = loanResponse.count;
      const totalBulkClients = bulkClients.length;
      const totalAll = totalPortalLoans + totalBulkClients;

      setTotalCount(totalAll);
      setTotalPages(Math.ceil(totalAll / 20)); // Combined pagination

      // Calculate stats
      const totalDisbursed = combined.reduce((sum, loan) => sum + loan.principalAmount, 0);
      const totalMonthly = combined.reduce((sum, loan) => sum + loan.monthlyDeduction, 0);

      setStats({
        totalLoans: totalAll,
        totalDisbursed,
        totalMonthlyDeductions: totalMonthly,
        bulkUploadCount: totalBulkClients,
        portalLoanCount: totalPortalLoans,
      });
    } catch (error: any) {
      console.error('Failed to fetch active loans:', error);
      setError(error.message || 'Failed to load active loans');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter combined loans based on active tab
  const filteredLoans = combinedLoans.filter((loan) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'portal') return loan.type === 'application';
    if (activeTab === 'bulk') return loan.type === 'bulk_upload';
    return true;
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchActiveLoans();
  };

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getEmployeeName = (loan: LoanApplication) => {
    return (loan as any).employee_name || 'N/A';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Active Loans</h1>
          <p className="text-slate-600 mt-1">
            View all active loans for your organization's employees
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => onNavigate('collection-report')}
          leftIcon={<FileText className="h-4 w-4" />}
        >
          Collection Report
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-blue-700">Total Active Loans</p>
              <p className="text-2xl font-bold text-blue-900">{stats.totalLoans}</p>
              <p className="text-xs text-blue-600 mt-1">
                {stats.portalLoanCount} portal + {stats.bulkUploadCount} bulk
              </p>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-500 rounded-lg">
              <DollarSign className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-emerald-700">Total Disbursed</p>
              <p className="text-2xl font-bold text-emerald-900">{formatCurrency(stats.totalDisbursed)}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-500 rounded-lg">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-purple-700">Monthly Deductions</p>
              <p className="text-2xl font-bold text-purple-900">{formatCurrency(stats.totalMonthlyDeductions)}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-amber-500 rounded-lg">
              <Upload className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-amber-700">Bulk Uploaded</p>
              <p className="text-2xl font-bold text-amber-900">{stats.bulkUploadCount}</p>
              <p className="text-xs text-amber-600 mt-1">
                Existing clients
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs for filtering */}
      <Card>
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'all'
                ? 'border-[#008080] text-[#008080]'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            All Loans ({stats.totalLoans})
          </button>
          <button
            onClick={() => setActiveTab('portal')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'portal'
                ? 'border-[#008080] text-[#008080]'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Portal Applications ({stats.portalLoanCount})
          </button>
          <button
            onClick={() => setActiveTab('bulk')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'bulk'
                ? 'border-[#008080] text-[#008080]'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Bulk Uploaded ({stats.bulkUploadCount})
          </button>
        </div>
      </Card>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}

      {/* Search and Filters */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <form onSubmit={handleSearch} className="flex gap-2 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Search by employee name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button type="submit" variant="outline">
              Search
            </Button>
          </form>
          <Button
            variant="ghost"
            onClick={fetchActiveLoans}
            leftIcon={<RefreshCw className="h-4 w-4" />}
          >
            Refresh
          </Button>
        </div>
      </Card>

      {/* Loans Table */}
      <Card>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#008080]" />
          </div>
        ) : filteredLoans.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600">No active loans found</p>
            {searchQuery && (
              <p className="text-sm text-slate-500 mt-1">
                Try adjusting your search criteria
              </p>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-y border-slate-200">
                    <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">Employee</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">Reference #</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">Source</th>
                    <th className="text-right px-4 py-3 text-sm font-semibold text-slate-700">Principal</th>
                    <th className="text-right px-4 py-3 text-sm font-semibold text-slate-700">Monthly Deduction</th>
                    <th className="text-center px-4 py-3 text-sm font-semibold text-slate-700">Tenure</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">Disbursement Date</th>
                    <th className="text-right px-4 py-3 text-sm font-semibold text-slate-700">Outstanding</th>
                    <th className="text-center px-4 py-3 text-sm font-semibold text-slate-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLoans.map((loan) => (
                    <tr key={loan.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-slate-900">{loan.employeeName}</p>
                          <p className="text-xs text-slate-500">{loan.phoneNumber}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600 font-mono">
                        {loan.applicationNumber}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={loan.type === 'application' ? 'default' : 'pending'}
                        >
                          {loan.type === 'application' ? 'Portal' : 'Bulk Upload'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700 text-right">
                        {formatCurrency(loan.principalAmount)}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-slate-900 text-right">
                        {formatCurrency(loan.monthlyDeduction)}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600 text-center">
                        {loan.repaymentMonths} months
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {formatDate(loan.disbursementDate)}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700 text-right">
                        {loan.outstandingBalance > 0 ? formatCurrency(loan.outstandingBalance) : '-'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge
                          variant={
                            loan.loanStatus === 'Active' ? 'success' :
                            loan.loanStatus === 'Fully Paid' ? 'approved' :
                            loan.loanStatus === 'Defaulted' ? 'rejected' : 'default'
                          }
                        >
                          {loan.loanStatus}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200">
                <div className="text-sm text-slate-600">
                  Showing {filteredLoans.length} of {totalCount} total loans
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    leftIcon={<ChevronLeft className="h-4 w-4" />}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-slate-600 px-2">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    rightIcon={<ChevronRight className="h-4 w-4" />}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      {/* Summary Footer */}
      {combinedLoans.length > 0 && (
        <Card className="bg-slate-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-600">
              <span className="font-medium text-slate-900">{totalCount}</span> active loans with total monthly deductions of{' '}
              <span className="font-medium text-slate-900">{formatCurrency(stats.totalMonthlyDeductions)}</span>
              {stats.bulkUploadCount > 0 && (
                <span className="ml-2 text-xs text-amber-600">
                  (Includes {stats.bulkUploadCount} bulk-uploaded clients)
                </span>
              )}
            </div>
            <Button
              variant="primary"
              onClick={() => onNavigate('collection-report')}
              leftIcon={<FileText className="h-4 w-4" />}
            >
              Generate Collection Report
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
