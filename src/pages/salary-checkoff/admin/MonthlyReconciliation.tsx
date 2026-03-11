import React, { useState, useEffect } from 'react';
import { Card } from '@/components/salary-checkoff/ui/Card';
import { Select } from '@/components/salary-checkoff/ui/Select';
import { StatCard } from '@/components/salary-checkoff/ui/StatCard';
import { Table } from '@/components/salary-checkoff/ui/Table';
import { Badge } from '@/components/salary-checkoff/ui/Badge';
import { Button } from '@/components/salary-checkoff/ui/Button';
import {
  paymentService,
  MonthlyReconciliationData,
  MonthlyReconciliationSummary,
} from '@/services/salary-checkoff/payment.service';
import { employerService } from '@/services/salary-checkoff/employer.service';
import {
  Download,
  Filter,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Loader2,
} from 'lucide-react';

interface MonthlyReconciliationProps {
  onNavigate: (page: string) => void;
}

export function MonthlyReconciliation({
  onNavigate,
}: MonthlyReconciliationProps) {
  const [month, setMonth] = useState('03');
  const [year, setYear] = useState('2026');
  const [employer, setEmployer] = useState('all');
  const [employers, setEmployers] = useState<Array<{ id: string; name: string }>>(
    []
  );
  const [reconciliationData, setReconciliationData] = useState<
    MonthlyReconciliationData[]
  >([]);
  const [summary, setSummary] = useState<MonthlyReconciliationSummary>({
    expected_collections: 0,
    actual_collections: 0,
    outstanding: 0,
    collection_rate: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    loadEmployers();
    loadReconciliationData();
  }, []);

  const loadEmployers = async () => {
    try {
      const employerList = await employerService.listEmployers();
      setEmployers(
        employerList
          .filter((emp) => emp.is_active)
          .map((emp) => ({ id: emp.id, name: emp.name }))
      );
    } catch (error: any) {
      console.error('Error loading employers:', error);
    }
  };

  const loadReconciliationData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const filters = {
        month: parseInt(month),
        year: parseInt(year),
        employer_id: employer !== 'all' ? employer : undefined,
      };

      const [data, summaryData] = await Promise.all([
        paymentService.getMonthlyReconciliation(filters),
        paymentService.getReconciliationSummary(filters),
      ]);

      setReconciliationData(data);
      setSummary(summaryData);
    } catch (error: any) {
      console.error('Error loading reconciliation data:', error);
      setError(error.message || 'Failed to load reconciliation data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyFilters = () => {
    loadReconciliationData();
  };

  const handleGenerateReport = async () => {
    try {
      setIsExporting(true);
      const filters = {
        month: parseInt(month),
        year: parseInt(year),
        employer_id: employer !== 'all' ? employer : undefined,
      };

      const blob = await paymentService.exportReconciliationData(
        filters,
        'excel'
      );

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reconciliation_${year}_${month}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error: any) {
      setError('Failed to generate report');
    } finally {
      setIsExporting(false);
    }
  };

  const columns = [
    {
      header: 'Employee',
      accessor: 'employee_name',
      className: 'font-medium',
    },
    {
      header: 'Employer',
      accessor: 'employer_name',
    },
    {
      header: 'Expected',
      accessor: (item: MonthlyReconciliationData) =>
        `KES ${item.expected_amount.toLocaleString()}`,
    },
    {
      header: 'Actual',
      accessor: (item: MonthlyReconciliationData) =>
        `KES ${item.actual_amount.toLocaleString()}`,
    },
    {
      header: 'Outstanding',
      accessor: (item: MonthlyReconciliationData) => {
        const diff = item.outstanding_amount;
        return diff > 0 ? (
          <span className="text-red-600 font-medium">
            KES {diff.toLocaleString()}
          </span>
        ) : (
          'KES 0'
        );
      },
    },
    {
      header: 'Status',
      accessor: (item: MonthlyReconciliationData) => {
        const variants: Record<string, any> = {
          Paid: 'approved',
          Partial: 'pending',
          Missed: 'declined',
          Overpaid: 'disbursed',
        };
        return <Badge variant={variants[item.status]}>{item.status}</Badge>;
      },
    },
    {
      header: 'Date',
      accessor: (item: MonthlyReconciliationData) =>
        item.payment_date
          ? new Date(item.payment_date).toLocaleDateString()
          : '-',
    },
    {
      header: 'Actions',
      accessor: (item: MonthlyReconciliationData) => (
        <div className="flex gap-2">
          <button className="text-sm font-medium text-[#008080] hover:underline">
            View
          </button>
          {item.status !== 'Paid' && item.status !== 'Overpaid' && (
            <button
              onClick={() => onNavigate('record-payment')}
              className="text-sm font-medium text-blue-600 hover:underline"
            >
              Record
            </button>
          )}
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
          <h1 className="text-2xl font-bold text-slate-900">
            Monthly Reconciliation
          </h1>
          <p className="text-slate-500">
            Track expected vs actual collections across all employers.
          </p>
        </div>
        <Button
          variant="outline"
          leftIcon={<Download className="h-4 w-4" />}
          onClick={handleGenerateReport}
          isLoading={isExporting}
        >
          Generate Report
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-800">
          <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
          {error}
        </div>
      )}

      {/* Filters */}
      <Card className="bg-white">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="w-full md:w-48">
            <Select
              label="Month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              options={[
                { value: '01', label: 'January' },
                { value: '02', label: 'February' },
                { value: '03', label: 'March' },
                { value: '04', label: 'April' },
                { value: '05', label: 'May' },
                { value: '06', label: 'June' },
                { value: '07', label: 'July' },
                { value: '08', label: 'August' },
                { value: '09', label: 'September' },
                { value: '10', label: 'October' },
                { value: '11', label: 'November' },
                { value: '12', label: 'December' },
              ]}
            />
          </div>
          <div className="w-full md:w-48">
            <Select
              label="Year"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              options={[
                { value: '2024', label: '2024' },
                { value: '2025', label: '2025' },
                { value: '2026', label: '2026' },
              ]}
            />
          </div>
          <div className="w-full md:w-64">
            <Select
              label="Employer"
              value={employer}
              onChange={(e) => setEmployer(e.target.value)}
              options={[
                { value: 'all', label: 'All Employers' },
                ...employers.map((emp) => ({ value: emp.id, label: emp.name })),
              ]}
            />
          </div>
          <Button
            leftIcon={<Filter className="h-4 w-4" />}
            onClick={handleApplyFilters}
          >
            Apply Filters
          </Button>
        </div>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Expected Collections"
          value={`KES ${summary.expected_collections.toLocaleString()}`}
          icon={<DollarSign className="h-6 w-6 text-blue-600" />}
          color="blue"
        />
        <StatCard
          label="Actual Collections"
          value={`KES ${summary.actual_collections.toLocaleString()}`}
          icon={<CheckCircle className="h-6 w-6 text-emerald-600" />}
          color="teal"
        />
        <StatCard
          label="Outstanding"
          value={`KES ${summary.outstanding.toLocaleString()}`}
          icon={<AlertTriangle className="h-6 w-6 text-amber-600" />}
          color="amber"
        />
        <StatCard
          label="Collection Rate"
          value={`${summary.collection_rate.toFixed(1)}%`}
          icon={<DollarSign className="h-6 w-6 text-purple-600" />}
          color="purple"
          trend={
            summary.trend
              ? {
                  value: Math.abs(summary.trend),
                  isPositive: summary.trend > 0,
                }
              : undefined
          }
        />
      </div>

      {/* Detailed Table */}
      <Card title="Reconciliation Details">
        {reconciliationData.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            No reconciliation data available for the selected period
          </div>
        ) : (
          <Table
            data={reconciliationData}
            columns={columns}
            keyExtractor={(item) => item.loan_id}
          />
        )}
      </Card>
    </div>
  );
}
