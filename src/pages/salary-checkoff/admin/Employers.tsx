import React, { useState, useEffect } from 'react';
import { Card } from '@/components/salary-checkoff/ui/Card';
import { Table } from '@/components/salary-checkoff/ui/Table';
import { Badge } from '@/components/salary-checkoff/ui/Badge';
import { Button } from '@/components/salary-checkoff/ui/Button';
import { Input } from '@/components/salary-checkoff/ui/Input';
import { Modal } from '@/components/salary-checkoff/ui/Modal';
import {
  employerService,
  Employer,
  InterestMethod,
} from '@/services/salary-checkoff/employer.service';
import { formatDate } from '@/utils/formatters';
import { EmployerDocuments } from '@/components/salary-checkoff/EmployerDocuments';
import { Loader2, AlertCircle, X, Building2, Search, Settings, Check, FileText } from 'lucide-react';

interface EmployersProps {
  onNavigate: (page: string) => void;
}

export function Employers({ onNavigate }: EmployersProps) {
  const [employers, setEmployers] = useState<Employer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Settings modal state
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [selectedEmployer, setSelectedEmployer] = useState<Employer | null>(null);
  const [selectedInterestMethod, setSelectedInterestMethod] = useState<InterestMethod>('flat');
  const [selectedInterestRate, setSelectedInterestRate] = useState<string>('5'); // Percentage display
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [settingsSuccess, setSettingsSuccess] = useState<string | null>(null);

  // Documents modal state
  const [documentsEmployer, setDocumentsEmployer] = useState<Employer | null>(null);

  useEffect(() => {
    loadEmployers();
  }, []);

  const loadEmployers = async (search?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await employerService.listEmployers(search);
      setEmployers(response.results);
    } catch (error: any) {
      console.error('Error loading employers:', error);
      setError(error.message || 'Failed to load employers');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    loadEmployers(searchQuery);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    loadEmployers();
  };

  const handleOpenSettings = (employer: Employer) => {
    setSelectedEmployer(employer);
    setSelectedInterestMethod(employer.interest_method || 'flat');
    // Convert decimal rate to percentage for display (e.g., 0.05 -> 5)
    const ratePercent = employer.interest_rate ? (Number(employer.interest_rate) * 100).toFixed(2) : '5';
    setSelectedInterestRate(ratePercent);
    setSettingsError(null);
    setSettingsSuccess(null);
    setIsSettingsModalOpen(true);
  };

  const handleSaveSettings = async () => {
    if (!selectedEmployer) return;

    // Validate interest rate
    const ratePercent = parseFloat(selectedInterestRate);
    if (isNaN(ratePercent) || ratePercent < 0.01 || ratePercent > 100) {
      setSettingsError('Interest rate must be between 0.01% and 100%');
      return;
    }

    // Convert percentage to decimal (e.g., 5 -> 0.05)
    const rateDecimal = ratePercent / 100;

    try {
      setIsSavingSettings(true);
      setSettingsError(null);
      setSettingsSuccess(null);

      await employerService.updateInterestSettings(
        selectedEmployer.id,
        selectedInterestMethod,
        rateDecimal
      );

      // Update local state
      setEmployers(prev =>
        prev.map(emp =>
          emp.id === selectedEmployer.id
            ? { ...emp, interest_method: selectedInterestMethod, interest_rate: rateDecimal }
            : emp
        )
      );

      setSettingsSuccess('Interest settings updated successfully');
      setTimeout(() => {
        setIsSettingsModalOpen(false);
        setSettingsSuccess(null);
      }, 1500);
    } catch (err: any) {
      console.error('Error updating employer settings:', err);
      setSettingsError(err.message || 'Failed to update settings');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const getInterestMethodLabel = (method: InterestMethod | undefined): string => {
    switch (method) {
      case 'reducing_balance':
        return 'Reducing Balance';
      case 'flat':
      default:
        return 'Flat Rate';
    }
  };

  const columns = [
    {
      header: 'Employer Name',
      accessor: 'name',
      className: 'font-medium',
    },
    {
      header: 'Registration Number',
      accessor: 'registration_number',
    },
    {
      header: 'HR Contact',
      accessor: (item: Employer) => item.hr_contact_name,
    },
    {
      header: 'HR Email',
      accessor: (item: Employer) => item.hr_contact_email,
    },
    {
      header: 'HR Phone',
      accessor: (item: Employer) => item.hr_contact_phone,
    },
    {
      header: 'Payroll Cycle Day',
      accessor: (item: Employer) => `Day ${item.payroll_cycle_day}`,
    },
    {
      header: 'Total Employees',
      accessor: (item: Employer) => item.total_employees || 0,
    },
    {
      header: 'Active Loans',
      accessor: (item: Employer) => item.active_loans_count || 0,
    },
    {
      header: 'Interest Rate',
      accessor: (item: Employer) => {
        const rate = item.interest_rate ? (Number(item.interest_rate) * 100).toFixed(2) : '5.00';
        return `${rate}%`;
      },
    },
    {
      header: 'Interest Method',
      accessor: (item: Employer) => (
        <Badge variant={item.interest_method === 'reducing_balance' ? 'pending' : 'default'}>
          {getInterestMethodLabel(item.interest_method)}
        </Badge>
      ),
    },
    {
      header: 'Status',
      accessor: (item: Employer) => (
        <Badge variant={item.is_active ? 'approved' : 'rejected'}>
          {item.is_active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      header: 'Onboarded Date',
      accessor: (item: Employer) => formatDate(item.onboarded_at),
    },
    {
      header: 'Documents',
      accessor: (item: Employer) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setDocumentsEmployer(item)}
          leftIcon={<FileText className="h-4 w-4" />}
        >
          View
        </Button>
      ),
    },
    {
      header: 'Settings',
      accessor: (item: Employer) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleOpenSettings(item)}
          leftIcon={<Settings className="h-4 w-4" />}
        >
          Configure
        </Button>
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
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="h-6 w-6 text-[#008080]" />
            Employer Management
          </h1>
          <p className="text-slate-500">
            View and manage all employers in the system.
          </p>
        </div>
        <Button onClick={() => onNavigate('onboard-employer')}>
          Onboard New Employer
        </Button>
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
        <div className="mb-4 flex justify-between items-center gap-4">
          <div className="flex gap-2 flex-1 max-w-md">
            <Input
              type="text"
              placeholder="Search by employer name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1"
            />
            <Button onClick={handleSearch} variant="outline" size="sm">
              <Search className="h-4 w-4" />
            </Button>
            {searchQuery && (
              <Button onClick={handleClearSearch} variant="outline" size="sm">
                Clear
              </Button>
            )}
          </div>
          <Badge variant="default">{employers.length} Employers</Badge>
        </div>

        {employers.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            {searchQuery
              ? 'No employers found matching your search'
              : 'No employers in the system yet'}
          </div>
        ) : (
          <Table
            data={employers}
            columns={columns}
            keyExtractor={(item) => item.id}
          />
        )}
      </Card>

      {/* Documents Modal */}
      <Modal
        isOpen={documentsEmployer !== null}
        onClose={() => setDocumentsEmployer(null)}
        title={`Documents: ${documentsEmployer?.name || ''}`}
        size="xl"
      >
        {documentsEmployer && (
          <EmployerDocuments employerId={documentsEmployer.id} />
        )}
      </Modal>

      {/* Settings Modal */}
      <Modal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        title={`Employer Settings: ${selectedEmployer?.name || ''}`}
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setIsSettingsModalOpen(false)}
              disabled={isSavingSettings}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveSettings}
              isLoading={isSavingSettings}
              leftIcon={<Check className="h-4 w-4" />}
            >
              Save Settings
            </Button>
          </>
        }
      >
        <div className="space-y-6">
          {settingsError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-800">
              <AlertCircle className="h-5 w-5 mr-2 text-red-600" />
              {settingsError}
            </div>
          )}

          {settingsSuccess && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center text-green-800">
              <Check className="h-5 w-5 mr-2 text-green-600" />
              {settingsSuccess}
            </div>
          )}

          {/* Interest Rate Section */}
          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-3">
              Monthly Interest Rate
            </h4>
            <p className="text-sm text-slate-600 mb-4">
              Set the monthly interest rate for loans to employees of this employer.
            </p>
            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-[200px]">
                <Input
                  type="number"
                  min="0.01"
                  max="100"
                  step="0.01"
                  value={selectedInterestRate}
                  onChange={(e) => setSelectedInterestRate(e.target.value)}
                  className="pr-8"
                  placeholder="5"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">
                  %
                </span>
              </div>
              <span className="text-sm text-slate-500">per month</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Common rates: 5% (default), 3%, 4%, 6%, 7%
            </p>
          </div>

          {/* Interest Method Section */}
          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-3">
              Interest Calculation Method
            </h4>
            <p className="text-sm text-slate-600 mb-4">
              Select how interest is calculated for loans to employees of this employer.
            </p>

            <div className="space-y-3">
              <label
                className={`flex items-start p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                  selectedInterestMethod === 'flat'
                    ? 'border-[#008080] bg-[#008080]/5'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="interestMethod"
                  value="flat"
                  checked={selectedInterestMethod === 'flat'}
                  onChange={() => setSelectedInterestMethod('flat')}
                  className="mt-1 h-4 w-4 text-[#008080] focus:ring-[#008080]"
                />
                <div className="ml-3">
                  <span className="block font-medium text-slate-900">Flat Rate (Default)</span>
                  <span className="block text-sm text-slate-500 mt-1">
                    Interest is calculated on the original principal for the entire loan period.
                    <br />
                    <code className="text-xs bg-slate-100 px-1 py-0.5 rounded">
                      Monthly = (Principal + Principal × Rate × Tenure) / Tenure
                    </code>
                  </span>
                </div>
              </label>

              <label
                className={`flex items-start p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                  selectedInterestMethod === 'reducing_balance'
                    ? 'border-[#008080] bg-[#008080]/5'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="interestMethod"
                  value="reducing_balance"
                  checked={selectedInterestMethod === 'reducing_balance'}
                  onChange={() => setSelectedInterestMethod('reducing_balance')}
                  className="mt-1 h-4 w-4 text-[#008080] focus:ring-[#008080]"
                />
                <div className="ml-3">
                  <span className="block font-medium text-slate-900">Reducing Balance (EMI)</span>
                  <span className="block text-sm text-slate-500 mt-1">
                    Interest is calculated on the outstanding principal balance each month.
                    Equal monthly installments with varying interest/principal split.
                    <br />
                    <code className="text-xs bg-slate-100 px-1 py-0.5 rounded">
                      EMI = P × r × (1+r)^n / ((1+r)^n - 1)
                    </code>
                  </span>
                </div>
              </label>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 mr-2 flex-shrink-0" />
              <div className="text-sm text-amber-800">
                <strong>Note:</strong> Changing the interest settings will only affect new loan
                applications. Existing loans will continue using their original settings.
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
