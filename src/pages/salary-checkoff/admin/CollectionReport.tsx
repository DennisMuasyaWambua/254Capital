import React, { useState, useEffect } from 'react';
import { Card } from '@/components/salary-checkoff/ui/Card';
import { Button } from '@/components/salary-checkoff/ui/Button';
import { Select } from '@/components/salary-checkoff/ui/Select';
import { Download, FileSpreadsheet, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { clientService } from '@/services/salary-checkoff/client.service';
import { employerService, Employer } from '@/services/salary-checkoff/employer.service';

interface CollectionReportProps {
  role: 'hr' | 'admin';
}

export function CollectionReport({ role }: CollectionReportProps) {
  const [isDownloading, setIsDownloading] = useState(false);
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

  // Fetch employers on mount (admin only)
  useEffect(() => {
    if (role === 'admin') {
      fetchEmployers();
    }
  }, [role]);

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
        : 'Report';
      const filename = `${employerName}_${monthName}_${year}_Deductions.xlsx`;

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
              ? 'Download monthly deduction schedule for your employees'
              : 'Download monthly deduction schedules by employer'}
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

      {/* Main Card */}
      <Card>
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Generate Report</h2>
            <p className="text-sm text-slate-600 mb-6">
              Select the period {role === 'admin' ? 'and employer ' : ''}to generate a deduction report.
              The report will be downloaded in Excel format matching the standard template.
            </p>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label="Month *"
              value={month.toString()}
              onChange={(e) => setMonth(parseInt(e.target.value))}
              options={monthOptions}
            />
            <Select
              label="Year *"
              value={year.toString()}
              onChange={(e) => setYear(parseInt(e.target.value))}
              options={yearOptions}
            />
            {role === 'admin' && (
              <Select
                label="Employer *"
                value={selectedEmployerId}
                onChange={(e) => setSelectedEmployerId(e.target.value)}
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

          {/* Download Button */}
          <div className="flex justify-end pt-4 border-t border-slate-200">
            <Button
              onClick={handleDownloadReport}
              disabled={isDownloading || (role === 'admin' && !selectedEmployerId)}
              leftIcon={isDownloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              className="min-w-[200px]"
            >
              {isDownloading ? 'Generating...' : 'Download Report'}
            </Button>
          </div>
        </div>
      </Card>

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
