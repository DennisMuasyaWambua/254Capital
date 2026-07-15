import React, { useState, useEffect } from 'react';
import { Card } from '@/components/salary-checkoff/ui/Card';
import { Button } from '@/components/salary-checkoff/ui/Button';
import { Badge } from '@/components/salary-checkoff/ui/Badge';
import { Table } from '@/components/salary-checkoff/ui/Table';
import { Select } from '@/components/salary-checkoff/ui/Select';
import {
  Download,
  Loader2,
  AlertCircle,
  Calendar,
  DollarSign,
  Users,
  Filter,
  RefreshCw,
} from 'lucide-react';
import { loanService, LoanApplication } from '@/services/salary-checkoff/loan.service';
import { exportService } from '@/services/salary-checkoff/export.service';
import { clientService, ExistingClient } from '@/services/salary-checkoff/client.service';
import { authService, employerRefId } from '@/services/salary-checkoff/auth.service';

// Unified shape covering both portal-originated loan applications and
// bulk-uploaded existing clients, so HR sees deductions for everyone under
// their employer regardless of how the loan was entered into the system.
interface DeductionRow {
  id: string;
  source: 'portal' | 'bulk_upload';
  employeeName: string;
  employeeIdLabel: string;
  applicationNumber: string;
  principalAmount: number;
  monthlyDeduction: number;
  disbursementDate: string | null;
  repaymentMonths: number;
}

export function PayrollDeductions() {
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [deductionRows, setDeductionRows] = useState<DeductionRow[]>([]);
  const [employerId, setEmployerId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());

  // Stats
  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalDeductions: 0,
    thisMonthDeductions: 0,
    nextMonthDeductions: 0,
  });

  // Resolve the HR user's employer once, so bulk-uploaded clients for that
  // employer can be merged into the deduction view.
  useEffect(() => {
    const fetchEmployerId = async () => {
      try {
        const profile = await authService.getProfile();
        const id = employerRefId(profile.hr_profile?.employer);
        if (id) {
          setEmployerId(id);
        }
      } catch (err) {
        console.error('Failed to fetch employer ID:', err);
      }
    };
    fetchEmployerId();
  }, []);

  useEffect(() => {
    loadPayrollDeductions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMonth, selectedYear, employerId]);

  const loadPayrollDeductions = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch all loans from HR
      const response = await loanService.hrListAll({});

      // Filter only disbursed loans (active loans with deductions)
      const activeLoansList = response.results.filter(
        (app: LoanApplication) => app.status === 'disbursed'
      );

      // Fetch bulk-uploaded clients for this employer so HR's deduction
      // view covers everyone, not just loans applied through the portal.
      let bulkClients: ExistingClient[] = [];
      if (employerId) {
        try {
          const clientResponse = await clientService.listClientsByEmployer(employerId, {
            status: 'Active',
          });
          bulkClients = clientResponse.results;
        } catch (clientErr) {
          console.warn('Could not fetch bulk-uploaded clients for payroll deductions:', clientErr);
        }
      }

      const combined: DeductionRow[] = [
        ...activeLoansList.map((app) => ({
          id: app.id,
          source: 'portal' as const,
          employeeName: (app as any).employee_name || 'N/A',
          employeeIdLabel: app.employee?.id || 'N/A',
          applicationNumber: app.application_number,
          principalAmount: parseFloat(app.principal_amount),
          monthlyDeduction: parseFloat(app.monthly_deduction),
          disbursementDate: app.disbursement_date || null,
          repaymentMonths: app.repayment_months,
        })),
        ...bulkClients.map((client) => ({
          id: client.id,
          source: 'bulk_upload' as const,
          employeeName: client.full_name,
          employeeIdLabel: client.employee_id || 'N/A',
          applicationNumber: `BULK-${client.id.slice(0, 8).toUpperCase()}`,
          principalAmount: parseFloat(client.loan_amount),
          monthlyDeduction: parseFloat(client.monthly_deduction),
          disbursementDate: client.disbursement_date || null,
          repaymentMonths: client.repayment_period,
        })),
      ];

      setDeductionRows(combined);

      // Calculate stats
      const totalEmployees = combined.length;
      const totalDeductions = combined.reduce((sum, row) => sum + row.monthlyDeduction, 0);

      // Calculate deductions for selected month
      const now = new Date();

      // Deductions for this month
      const thisMonthRows = combined.filter((row) => {
        if (!row.disbursementDate) return false;
        const disbDate = new Date(row.disbursementDate);
        const firstDeductionDate = getFirstDeductionDate(disbDate);
        return firstDeductionDate <= now;
      });

      const thisMonthTotal = thisMonthRows.reduce((sum, row) => sum + row.monthlyDeduction, 0);

      // Deductions for next month
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      const nextMonthRows = combined.filter((row) => {
        if (!row.disbursementDate) return false;
        const disbDate = new Date(row.disbursementDate);
        const firstDeductionDate = getFirstDeductionDate(disbDate);
        return firstDeductionDate <= nextMonth;
      });

      const nextMonthTotal = nextMonthRows.reduce((sum, row) => sum + row.monthlyDeduction, 0);

      setStats({
        totalEmployees,
        totalDeductions,
        thisMonthDeductions: thisMonthTotal,
        nextMonthDeductions: nextMonthTotal,
      });
    } catch (err: any) {
      console.error('Error loading payroll deductions:', err);
      setError(err.message || 'Failed to load deductions');
    } finally {
      setIsLoading(false);
    }
  };

  const getFirstDeductionDate = (disbursementDate: Date): Date => {
    const disbDate = new Date(disbursementDate);
    const day = disbDate.getDate();

    if (day <= 15) {
      // Deduct in same month
      return new Date(disbDate.getFullYear(), disbDate.getMonth(), 25);
    } else {
      // Deduct in next month
      return new Date(disbDate.getFullYear(), disbDate.getMonth() + 1, 25);
    }
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      // Note: this calls the server-generated export. The on-screen table
      // above already merges bulk-uploaded clients into the deduction view;
      // confirm with backend that this export endpoint does the same so the
      // downloaded file matches what HR sees on screen.
      const blob = await exportService.exportDeductions({
        month: selectedMonth,
        year: selectedYear,
      });
      exportService.downloadFile(
        blob,
        `Payroll_Deductions_${selectedYear}_${selectedMonth.toString().padStart(2, '0')}.xlsx`
      );
    } catch (err: any) {
      console.error('Error exporting deductions:', err);
      setError('Failed to export deductions. Please try again.');
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsExporting(false);
    }
  };

  // Filter loans based on selected month/year (covers portal + bulk-uploaded)
  const filteredLoans = deductionRows.filter((row) => {
    if (!row.disbursementDate) return false;

    const disbDate = new Date(row.disbursementDate);
    const firstDeductionDate = getFirstDeductionDate(disbDate);
    const selectedDate = new Date(selectedYear, selectedMonth - 1, 25);

    // Calculate loan end date (disbursement date + repayment months)
    const loanEndDate = new Date(disbDate);
    loanEndDate.setMonth(loanEndDate.getMonth() + row.repaymentMonths);

    // Exclude if loan period has ended before the selected month
    if (loanEndDate < selectedDate) {
      return false;
    }

    // Include if first deduction is on or before the selected month's deduction date
    return firstDeductionDate <= selectedDate;
  });

  const columns = [
    {
      header: 'Employee Name',
      accessor: (item: DeductionRow) => item.employeeName,
    },
    {
      header: 'Employee ID',
      accessor: (item: DeductionRow) => item.employeeIdLabel,
    },
    {
      header: 'Loan #',
      accessor: (item: DeductionRow) => item.applicationNumber,
    },
    {
      header: 'Source',
      accessor: (item: DeductionRow) => (
        <Badge variant={item.source === 'portal' ? 'default' : 'pending'}>
          {item.source === 'portal' ? 'Portal' : 'Bulk Upload'}
        </Badge>
      ),
    },
    {
      header: 'Loan Amount',
      accessor: (item: DeductionRow) => `KES ${item.principalAmount.toLocaleString()}`,
    },
    {
      header: 'Monthly Deduction',
      accessor: (item: DeductionRow) => `KES ${item.monthlyDeduction.toLocaleString()}`,
    },
    {
      header: 'Disbursement Date',
      accessor: (item: DeductionRow) =>
        item.disbursementDate
          ? new Date(item.disbursementDate).toLocaleDateString('en-KE', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })
          : 'N/A',
    },
    {
      header: 'First Deduction',
      accessor: (item: DeductionRow) => {
        if (!item.disbursementDate) return 'N/A';
        const disbDate = new Date(item.disbursementDate);
        const firstDeduction = getFirstDeductionDate(disbDate);
        return firstDeduction.toLocaleDateString('en-KE', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        });
      },
    },
    {
      header: 'Status',
      accessor: (item: DeductionRow) => (
        <Badge variant="approved">Active</Badge>
      ),
    },
  ];

  const monthOptions = [
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ];

  const yearOptions = Array.from({ length: 5 }, (_, i) => {
    const y = currentDate.getFullYear() - 2 + i;
    return { value: y.toString(), label: y.toString() };
  });

  if (isLoading) {
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
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Payroll & Deductions</h1>
          <p className="text-slate-600 mt-1">
            Manage and track monthly salary deductions for active loans
          </p>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={loadPayrollDeductions}
            leftIcon={<RefreshCw className="h-4 w-4" />}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleExport}
            disabled={isExporting || filteredLoans.length === 0}
            leftIcon={
              isExporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )
            }
          >
            {isExporting ? 'Exporting...' : 'Export Excel'}
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
              <p className="text-sm text-slate-500">Total Employees</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {stats.totalEmployees}
              </p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Total Monthly Deductions</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                KES {(stats.totalDeductions / 1000).toFixed(0)}K
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
              <p className="text-sm text-slate-500">This Month</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                KES {(stats.thisMonthDeductions / 1000).toFixed(0)}K
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
              <p className="text-sm text-slate-500">Next Month</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                KES {(stats.nextMonthDeductions / 1000).toFixed(0)}K
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
        <div className="flex items-center space-x-4">
          <Filter className="h-5 w-5 text-slate-400" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
            <Select
              label="Month"
              value={selectedMonth.toString()}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              options={monthOptions}
            />
            <Select
              label="Year"
              value={selectedYear.toString()}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              options={yearOptions}
            />
          </div>
        </div>
      </Card>

      {/* Deductions Table */}
      <Card
        title={`Deductions for ${monthOptions[selectedMonth - 1].label} ${selectedYear}`}
      >
        {filteredLoans.length > 0 ? (
          <>
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>{filteredLoans.length}</strong> employee
                {filteredLoans.length !== 1 ? 's' : ''} with deductions scheduled for this
                month. Total amount:{' '}
                <strong>
                  KES{' '}
                  {filteredLoans
                    .reduce((sum, row) => sum + row.monthlyDeduction, 0)
                    .toLocaleString()}
                </strong>
              </p>
            </div>
            <Table
              data={filteredLoans}
              columns={columns}
              keyExtractor={(item) => item.id}
            />
          </>
        ) : (
          <div className="text-center py-12">
            <DollarSign className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600">
              No deductions scheduled for {monthOptions[selectedMonth - 1].label}{' '}
              {selectedYear}
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
