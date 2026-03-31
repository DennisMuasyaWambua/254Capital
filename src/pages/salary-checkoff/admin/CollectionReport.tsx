import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/salary-checkoff/ui/Card';
import { Button } from '@/components/salary-checkoff/ui/Button';
import { Select } from '@/components/salary-checkoff/ui/Select';
import { Download, FileSpreadsheet, Loader2, AlertCircle, CheckCircle2, Eye, RefreshCw } from 'lucide-react';
import { clientService, CollectionReportData, CollectionReportItem } from '@/services/salary-checkoff/client.service';
import { employerService, Employer } from '@/services/salary-checkoff/employer.service';

interface CollectionReportProps {
  role: 'hr' | 'admin';
}

export function CollectionReport({ role }: CollectionReportProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Filters
  const currentDate = new Date();
  const [month, setMonth] = useState<number>(currentDate.getMonth() + 1);
  const [year, setYear] = useState<number>(currentDate.getFullYear());
  const [selectedEmployerId, setSelectedEmployerId] = useState<string>('');

  // Employer data (for admin)
  const [employers, setEmployers] = useState<Employer[]>([]);
  const [loadingEmployers, setLoadingEmployers] = useState(false);

  // Preview data
  const [previewData, setPreviewData] = useState<CollectionReportData | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Fetch employers on mount (admin only)
  useEffect(() => {
    if (role === 'admin') {
      fetchEmployers();
    }
  }, [role]);

  // Auto-load preview for HR users
  useEffect(() => {
    if (role === 'hr') {
      handleLoadPreview();
    }
  }, [role, handleLoadPreview]);

  const fetchEmployers = async () => {
    setLoadingEmployers(true);
    try {
      const response = await employerService.listEmployers();
      setEmployers(response.results.filter(e => e.is_active));
    } catch (error: any) {
      console.error('Failed to fetch employers:', error);
      setError('Failed to load employers');
    } finally {
      setLoadingEmployers(false);
    }
  };

  const handleLoadPreview = useCallback(async () => {
    // Validation for admin
    if (role === 'admin' && !selectedEmployerId) {
      setError('Please select an employer to view the report');
      return;
    }

    setIsLoadingPreview(true);
    setError(null);
    setShowPreview(true);

    try {
      const params: { employer_id?: string; month: number; year: number } = {
        month,
        year,
      };

      if (role === 'admin') {
        params.employer_id = selectedEmployerId;
      }

      const data = await clientService.getCollectionReportData(params);
      setPreviewData(data);
    } catch (error: any) {
      console.error('Failed to load preview:', error);
      setError(error.message || 'Failed to load report data. Please check if there are active clients for the selected period.');
      setPreviewData(null);
    } finally {
      setIsLoadingPreview(false);
    }
  }, [role, selectedEmployerId, month, year]);

  const handleDownloadReport = async () => {
    // Validation
    if (role === 'admin' && !selectedEmployerId) {
      setError('Please select an employer');
      return;
    }

    setIsDownloading(true);
    setError(null);
    setSuccess(null);

    try {
      const params: { employer_id?: string; month: number; year: number } = {
        month,
        year,
      };

      if (role === 'admin') {
        params.employer_id = selectedEmployerId;
      }

      const blob = await clientService.downloadCollectionReport(params);

      // Generate filename
      const monthName = new Date(year, month - 1).toLocaleString('en-US', { month: 'long' });
      const employerName = selectedEmployerId
        ? employers.find(e => e.id === selectedEmployerId)?.name || 'Report'
        : previewData?.employer_name || 'Report';
      const filename = `${employerName} ${monthName} ${year} Deductions.xlsx`;

      // Download file
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setSuccess('Report downloaded successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error: any) {
      console.error('Failed to download report:', error);
      setError(error.message || 'Failed to download report. Please check if there are active clients for the selected period.');
    } finally {
      setIsDownloading(false);
    }
  };

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-KE', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
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

  const getMonthName = (m: number) => {
    return new Date(year, m - 1).toLocaleString('en-US', { month: 'long' });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Collection Report</h1>
          <p className="text-slate-600 mt-1">
            {role === 'hr'
              ? 'View and download monthly deduction schedule for your employees'
              : 'View and download monthly deduction schedules by employer'}
          </p>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg flex items-center animate-fade-in">
          <CheckCircle2 className="h-5 w-5 mr-2" />
          {success}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}

      {/* Filters Card */}
      <Card>
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Select Report Period</h2>
            <p className="text-sm text-slate-600 mb-6">
              Select the period {role === 'admin' ? 'and employer ' : ''}to generate a deduction report.
            </p>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label="Month *"
              value={month.toString()}
              onChange={(e) => {
                setMonth(parseInt(e.target.value));
                setShowPreview(false);
                setPreviewData(null);
              }}
              options={monthOptions}
            />
            <Select
              label="Year *"
              value={year.toString()}
              onChange={(e) => {
                setYear(parseInt(e.target.value));
                setShowPreview(false);
                setPreviewData(null);
              }}
              options={yearOptions}
            />
            {role === 'admin' && (
              <Select
                label="Employer *"
                value={selectedEmployerId}
                onChange={(e) => {
                  setSelectedEmployerId(e.target.value);
                  setShowPreview(false);
                  setPreviewData(null);
                }}
                disabled={loadingEmployers}
              >
                <option value="">Select Employer</option>
                {employers.map((employer) => (
                  <option key={employer.id} value={employer.id}>
                    {employer.name}
                  </option>
                ))}
              </Select>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            {role === 'admin' && (
              <Button
                variant="outline"
                onClick={handleLoadPreview}
                disabled={isLoadingPreview || !selectedEmployerId}
                leftIcon={isLoadingPreview ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
              >
                {isLoadingPreview ? 'Loading...' : 'Preview Report'}
              </Button>
            )}
            <Button
              onClick={handleDownloadReport}
              disabled={isDownloading || (role === 'admin' && !selectedEmployerId)}
              leftIcon={isDownloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              className="min-w-[180px]"
            >
              {isDownloading ? 'Generating...' : 'Download Excel'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Preview Table */}
      {showPreview && (
        <Card>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  {previewData?.employer_name || 'Loading...'} - {getMonthName(month)} {year} Deductions
                </h2>
                {previewData && (
                  <p className="text-sm text-slate-500 mt-1">
                    {previewData.items.length} active {previewData.items.length === 1 ? 'client' : 'clients'} with outstanding balance
                  </p>
                )}
              </div>
              {previewData && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLoadPreview}
                  leftIcon={<RefreshCw className="h-4 w-4" />}
                >
                  Refresh
                </Button>
              )}
            </div>

            {isLoadingPreview ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-[#008080]" />
              </div>
            ) : previewData && previewData.items.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 border-y border-slate-200">
                      <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700 w-12">#</th>
                      <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">Name</th>
                      <th className="text-right px-4 py-3 text-sm font-semibold text-slate-700">Amount Borrowed</th>
                      <th className="text-right px-4 py-3 text-sm font-semibold text-slate-700">Installment Due</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.items.map((item, index) => (
                      <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="px-4 py-3 text-sm text-slate-600">{index + 1}</td>
                        <td className="px-4 py-3 text-sm font-medium text-slate-900">{item.full_name}</td>
                        <td className="px-4 py-3 text-sm text-slate-700 text-right">{formatCurrency(item.loan_amount)}</td>
                        <td className="px-4 py-3 text-sm text-slate-700 text-right">{formatCurrency(item.monthly_deduction)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-100 border-t-2 border-slate-300">
                      <td colSpan={2} className="px-4 py-3 text-sm font-bold text-slate-900">Total</td>
                      <td className="px-4 py-3 text-sm font-bold text-slate-900 text-right">
                        {formatCurrency(previewData.total_amount_borrowed)}
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-slate-900 text-right">
                        {formatCurrency(previewData.total_installment_due)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : previewData && previewData.items.length === 0 ? (
              <div className="text-center py-12">
                <FileSpreadsheet className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600">No active clients with outstanding balance for this period.</p>
              </div>
            ) : null}
          </div>
        </Card>
      )}

      {/* Info Card */}
      <Card>
        <div className="flex items-start space-x-3">
          <FileSpreadsheet className="h-5 w-5 text-[#008080] flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-2">Report Format</h3>
            <p className="text-sm text-slate-600 mb-2">
              The generated Excel file includes:
            </p>
            <ul className="text-sm text-slate-600 space-y-1 list-disc list-inside">
              <li>Employee names</li>
              <li>Amount borrowed (principal loan amount)</li>
              <li>Installment due (monthly deduction)</li>
              <li>Totals for all employees</li>
            </ul>
            <p className="text-sm text-slate-500 mt-3">
              Only active clients with outstanding balances are included in the report.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
