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

export function PayrollDeductions() {
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [activeLoans, setActiveLoans] = useState<LoanApplication[]>([]);
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

  useEffect(() => {
    loadPayrollDeductions();
  }, [selectedMonth, selectedYear]);

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

      setActiveLoans(activeLoansList);

      // Calculate stats
      const totalEmployees = activeLoansList.length;
      const totalDeductions = activeLoansList.reduce(
        (sum, app) => sum + parseFloat(app.monthly_deduction),
        0
      );

      // Calculate deductions for selected month
      const selectedDate = new Date(selectedYear, selectedMonth - 1, 1);
      const now = new Date();

      // Deductions for this month
      const thisMonthLoans = activeLoansList.filter((app) => {
        if (!app.disbursement_date) return false;
        const disbDate = new Date(app.disbursement_date);
        const firstDeductionDate = getFirstDeductionDate(disbDate);
        return firstDeductionDate <= now;
      });

      const thisMonthTotal = thisMonthLoans.reduce(
        (sum, app) => sum + parseFloat(app.monthly_deduction),
        0
      );

      // Deductions for next month
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      const nextMonthLoans = activeLoansList.filter((app) => {
        if (!app.disbursement_date) return false;
        const disbDate = new Date(app.disbursement_date);
        const firstDeductionDate = getFirstDeductionDate(disbDate);
        return firstDeductionDate <= nextMonth;
      });

      const nextMonthTotal = nextMonthLoans.reduce(
        (sum, app) => sum + parseFloat(app.monthly_deduction),
        0
      );

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

  // Filter loans based on selected month/year
  const filteredLoans = activeLoans.filter((app) => {
    if (!app.disbursement_date) return false;
    const disbDate = new Date(app.disbursement_date);
    const firstDeductionDate = getFirstDeductionDate(disbDate);
    const selectedDate = new Date(selectedYear, selectedMonth - 1, 25);

    // Include if first deduction is on or before the selected month's deduction date
    return firstDeductionDate <= selectedDate;
  });

  const columns = [
    {
      header: 'Employee Name',
      accessor: (item: LoanApplication) => {
        if (!item.employee || (!item.employee.first_name && !item.employee.last_name)) {
          return 'N/A';
        }
        return `${item.employee.first_name || ''} ${item.employee.last_name || ''}`.trim();
      },
    },
    {
      header: 'Employee ID',
      accessor: (item: LoanApplication) => item.employee?.id || 'N/A',
    },
    {
      header: 'Loan #',
      accessor: 'application_number',
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
      header: 'Disbursement Date',
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
      header: 'First Deduction',
      accessor: (item: LoanApplication) => {
        if (!item.disbursement_date) return 'N/A';
        const disbDate = new Date(item.disbursement_date);
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
      accessor: (item: LoanApplication) => (
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
                    .reduce((sum, app) => sum + parseFloat(app.monthly_deduction), 0)
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
