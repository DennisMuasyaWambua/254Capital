import React, { useState, useEffect } from 'react';
import { Card } from '@/components/salary-checkoff/ui/Card';
import { Button } from '@/components/salary-checkoff/ui/Button';
import { Select } from '@/components/salary-checkoff/ui/Select';
import { Input } from '@/components/salary-checkoff/ui/Input';
import { Download, FileSpreadsheet, Loader2 } from 'lucide-react';
import { exportService, CollectionSheetData, CollectionSheetFilters } from '@/services/salary-checkoff/export.service';
import { employerService, Employer } from '@/services/salary-checkoff/employer.service';
import { authService } from '@/services/salary-checkoff/auth.service';

interface CollectionReportProps {
  role: 'hr' | 'admin';
}

export function CollectionReport({ role }: CollectionReportProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [collectionData, setCollectionData] = useState<CollectionSheetData | null>(null);

  // Filters
  const currentDate = new Date();
  const [month, setMonth] = useState<number>(currentDate.getMonth() + 1);
  const [year, setYear] = useState<number>(currentDate.getFullYear());
  const [selectedEmployerId, setSelectedEmployerId] = useState<string>('');

  // Employer data (for admin)
  const [employers, setEmployers] = useState<Employer[]>([]);
  const [loadingEmployers, setLoadingEmployers] = useState(false);

  // Fetch employers on mount (admin only)
  useEffect(() => {
    if (role === 'admin') {
      fetchEmployers();
    }
  }, [role]);

  // Fetch collection report when filters change
  useEffect(() => {
    fetchCollectionReport();
  }, [month, year, selectedEmployerId]);

  const fetchEmployers = async () => {
    setLoadingEmployers(true);
    try {
      const response = await employerService.listEmployers();
      setEmployers(response.results);
    } catch (error: any) {
      console.error('Failed to fetch employers:', error);
      setError('Failed to load employers');
    } finally {
      setLoadingEmployers(false);
    }
  };

  const fetchCollectionReport = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const filters: CollectionSheetFilters = {
        month,
        year,
      };

      // Add employer filter for admin
      if (role === 'admin' && selectedEmployerId) {
        filters.employer_id = selectedEmployerId;
      }

      const data = await exportService.getCollectionSheet(filters);
      setCollectionData(data);
    } catch (error: any) {
      console.error('Failed to fetch collection report:', error);
      setError(error.message || 'Failed to load collection report');
      setCollectionData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportToExcel = async () => {
    setIsExporting(true);
    setError(null);

    try {
      const filters: CollectionSheetFilters = {
        month,
        year,
      };

      if (role === 'admin' && selectedEmployerId) {
        filters.employer_id = selectedEmployerId;
      }

      const blob = await exportService.exportDeductions(filters);

      // Generate filename
      const monthName = new Date(year, month - 1).toLocaleString('en-US', { month: 'long' });
      const employerName = selectedEmployerId
        ? employers.find(e => e.id === selectedEmployerId)?.name || 'All'
        : 'All';
      const filename = `${employerName}_${monthName}_${year}_Deductions.xlsx`;

      exportService.downloadFile(blob, filename);
    } catch (error: any) {
      console.error('Failed to export:', error);
      setError(error.message || 'Failed to export report');
    } finally {
      setIsExporting(false);
    }
  };

  const formatCurrency = (amount: string) => {
    return parseFloat(amount).toLocaleString('en-KE', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Collection Report</h1>
          <p className="text-slate-600 mt-1">
            {role === 'hr'
              ? 'View deduction schedule for your employees'
              : 'View and manage deduction schedules'}
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Select
            label="Month"
            value={month.toString()}
            onChange={(e) => setMonth(parseInt(e.target.value))}
            options={monthOptions}
          />
          <Select
            label="Year"
            value={year.toString()}
            onChange={(e) => setYear(parseInt(e.target.value))}
            options={yearOptions}
          />
          {role === 'admin' && (
            <Select
              label="Employer"
              value={selectedEmployerId}
              onChange={(e) => setSelectedEmployerId(e.target.value)}
              disabled={loadingEmployers}
            >
              <option value="">All Employers</option>
              {employers.map((employer) => (
                <option key={employer.id} value={employer.id}>
                  {employer.name}
                </option>
              ))}
            </Select>
          )}
          <div className="flex items-end">
            <Button
              onClick={handleExportToExcel}
              disabled={isExporting || !collectionData}
              leftIcon={isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              className="w-full"
            >
              {isExporting ? 'Exporting...' : 'Export to Excel'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#008080]" />
        </div>
      )}

      {/* Collection Report Table */}
      {!isLoading && collectionData && (
        <Card>
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  {collectionData.period} - {collectionData.employer || 'All Employers'}
                </h2>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-600">
                  Collection Rate: <span className="font-bold text-[#008080]">{collectionData.collection_rate}</span>
                </p>
                <p className="text-sm text-slate-600">
                  Expected: KES {formatCurrency(collectionData.total_expected)} |
                  Collected: KES {formatCurrency(collectionData.total_collected)}
                </p>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      S/N
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Employee ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Loan Number
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Amount Due
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {collectionData.deductions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                        No deductions found for the selected period
                      </td>
                    </tr>
                  ) : (
                    collectionData.deductions.map((deduction, index) => (
                      <tr key={index} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-sm text-slate-900">
                          {index + 1}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-slate-900">
                          {deduction.employee_name}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {deduction.employee_id}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {deduction.loan_number}
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-medium text-slate-900">
                          KES {formatCurrency(deduction.amount)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                              ${
                                deduction.status === 'collected'
                                  ? 'bg-green-100 text-green-800'
                                  : deduction.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }
                            `}
                          >
                            {deduction.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                {collectionData.deductions.length > 0 && (
                  <tfoot className="bg-slate-50">
                    <tr className="font-bold">
                      <td colSpan={4} className="px-4 py-3 text-sm text-slate-900">
                        Total
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-slate-900">
                        KES {formatCurrency(collectionData.total_expected)}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        </Card>
      )}

      {/* Empty State */}
      {!isLoading && !collectionData && !error && (
        <Card>
          <div className="text-center py-12">
            <FileSpreadsheet className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No Data Available</h3>
            <p className="text-slate-600">
              Select a period {role === 'admin' ? 'and employer ' : ''}to view the collection report
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
