import React, { useState, useEffect } from 'react';
import { Card } from '@/components/salary-checkoff/ui/Card';
import { Tabs } from '@/components/salary-checkoff/ui/Tabs';
import { Input } from '@/components/salary-checkoff/ui/Input';
import { MoneyInput } from '@/components/salary-checkoff/ui/MoneyInput';
import { Select } from '@/components/salary-checkoff/ui/Select';
import { Button } from '@/components/salary-checkoff/ui/Button';
import { FileUpload } from '@/components/salary-checkoff/ui/FileUpload';
import { Table } from '@/components/salary-checkoff/ui/Table';
import { Badge } from '@/components/salary-checkoff/ui/Badge';
import {
  clientService,
  CreateClientRequest,
  BulkUploadValidationRow,
} from '@/services/salary-checkoff/client.service';
import { employerService } from '@/services/salary-checkoff/employer.service';
import { formatNumberWithCommas, parseFormattedNumber } from '@/utils/formatters';
import {
  Save,
  Send,
  Download,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Loader2,
} from 'lucide-react';

interface ExistingClientsProps {
  onNavigate: (page: string) => void;
}

export function ExistingClients({ onNavigate }: ExistingClientsProps) {
  const [activeTab, setActiveTab] = useState('manual');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [employers, setEmployers] = useState<Array<{ id: string; name: string }>>([]);
  const [isLoadingEmployers, setIsLoadingEmployers] = useState(false);

  // Manual Form State
  const [formData, setFormData] = useState({
    fullName: '',
    nationalId: '',
    mobile: '',
    email: '',
    employer: '',
    employeeId: '',
    loanAmount: '',
    interestRate: '5',
    startDate: '',
    repaymentPeriod: '6',
    disbursementDate: '',
    disbursementMethod: '',
    amountPaid: '0',
    loanStatus: 'Active',
  });

  // Bulk Upload State
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [previewData, setPreviewData] = useState<BulkUploadValidationRow[]>([]);
  const [isValidating, setIsValidating] = useState(false);

  // Load employers on mount
  useEffect(() => {
    loadEmployers();
  }, []);

  const loadEmployers = async () => {
    try {
      setIsLoadingEmployers(true);
      const employerResponse = await employerService.listEmployers();
      setEmployers(
        employerResponse.results
          .filter((emp) => emp.is_active)
          .map((emp) => ({ id: emp.id, name: emp.name }))
      );
    } catch (error: any) {
      console.error('Error loading employers:', error);
      setError('Failed to load employers');
    } finally {
      setIsLoadingEmployers(false);
    }
  };

  // Derived calculations
  const loanAmountNum = parseFormattedNumber(formData.loanAmount) || 0;
  const interestRateNum = Number(formData.interestRate) || 0;
  const periodNum = Number(formData.repaymentPeriod) || 1;
  const amountPaidNum = parseFormattedNumber(formData.amountPaid) || 0;

  // Calculate interest based on number of months (flat interest per month)
  const totalInterest = loanAmountNum * (interestRateNum / 100) * periodNum;
  const totalDue = loanAmountNum + totalInterest;
  const monthlyDeduction = totalDue / periodNum;
  const outstandingBalance = totalDue - amountPaidNum;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent, isDraft: boolean) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.fullName || !formData.nationalId || !formData.mobile) {
      setError('Please fill in all required fields');
      return;
    }

    if (!formData.employer) {
      setError('Please select an employer');
      return;
    }

    if (!formData.loanAmount || !formData.startDate || !formData.disbursementDate || !formData.disbursementMethod) {
      setError('Please fill in all required loan details');
      return;
    }

    setIsSubmitting(true);

    try {
      const clientData: CreateClientRequest = {
        full_name: formData.fullName,
        national_id: formData.nationalId,
        mobile: formData.mobile,
        email: formData.email || undefined,
        employer_id: formData.employer,
        employee_id: formData.employeeId || undefined,
        loan_amount: loanAmountNum,
        interest_rate: interestRateNum,
        start_date: formData.startDate,
        repayment_period: periodNum,
        disbursement_date: formData.disbursementDate,
        disbursement_method: formData.disbursementMethod as 'mpesa' | 'bank' | 'cash',
        amount_paid: amountPaidNum,
        loan_status: formData.loanStatus as any,
      };

      await clientService.createManualClient(clientData);

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);

      if (!isDraft) {
        setFormData({
          fullName: '',
          nationalId: '',
          mobile: '',
          email: '',
          employer: '',
          employeeId: '',
          loanAmount: '',
          interestRate: '5',
          startDate: '',
          repaymentPeriod: '6',
          disbursementDate: '',
          disbursementMethod: '',
          amountPaid: '0',
          loanStatus: 'Active',
        });
      }
    } catch (error: any) {
      setError(error.message || 'Failed to create client record');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = async (files: File[]) => {
    if (files.length === 0) return;

    setUploadedFiles(files);
    setIsValidating(true);
    setError(null);

    try {
      const validation = await clientService.validateBulkData(files[0]);
      setPreviewData(validation.preview);
    } catch (error: any) {
      setError(error.message || 'File validation failed');
      setPreviewData([]);
    } finally {
      setIsValidating(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const blob = await clientService.downloadTemplate();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'client_upload_template.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error: any) {
      setError('Failed to download template');
    }
  };

  const handleBulkImport = async () => {
    if (uploadedFiles.length === 0) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await clientService.bulkUploadClients(uploadedFiles[0]);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setUploadedFiles([]);
        setPreviewData([]);
      }, 3000);
    } catch (error: any) {
      setError(error.message || 'Bulk import failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Existing Clients</h1>
          <p className="text-slate-500">
            Add or import existing client records into the system.
          </p>
        </div>
        <Button variant="outline" onClick={() => onNavigate('pending-approvals')}>
          View Pending Approvals
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-800">
          <AlertCircle className="h-5 w-5 mr-2 text-red-600" />
          {error}
        </div>
      )}

      <Card className="p-0">
        <div className="px-6 pt-2">
          <Tabs
            tabs={[
              { id: 'manual', label: 'Manual Entry' },
              { id: 'bulk', label: 'Bulk Upload' },
            ]}
            activeTab={activeTab}
            onChange={setActiveTab}
          />
        </div>

        <div className="p-6">
          {showSuccess && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center text-emerald-800 animate-fade-in">
              <CheckCircle2 className="h-5 w-5 mr-2 text-emerald-600" />
              Client record created successfully. Pending approval before employee can
              access portal.
            </div>
          )}

          {activeTab === 'manual' && (
            <form className="space-y-8 animate-fade-in">
              {/* Section A: Employee Info */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4 pb-2 border-b border-slate-100">
                  Section A: Employee Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Full Name *"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="e.g. John Kamau"
                    required
                  />
                  <Input
                    label="National ID Number *"
                    name="nationalId"
                    value={formData.nationalId}
                    onChange={handleInputChange}
                    placeholder="8 digit ID"
                    required
                  />
                  <Input
                    label="Mobile Number *"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleInputChange}
                    placeholder="07XX or 01XX"
                    required
                  />
                  <Input
                    label="Email Address (Optional)"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="john@example.com"
                  />
                  <Select
                    label="Employer Name *"
                    name="employer"
                    value={formData.employer}
                    onChange={handleInputChange}
                    options={employers.map((emp) => ({
                      value: emp.id,
                      label: emp.name,
                    }))}
                    required
                    disabled={isLoadingEmployers}
                  />
                  <Input
                    label="Employee ID (Optional)"
                    name="employeeId"
                    value={formData.employeeId}
                    onChange={handleInputChange}
                    placeholder="EMP-1234"
                  />
                </div>
              </div>

              {/* Section B: Loan Details */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4 pb-2 border-b border-slate-100">
                  Section B: Loan Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <MoneyInput
                    label="Loan Amount (KES) *"
                    name="loanAmount"
                    value={formData.loanAmount}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g. 100,000"
                  />
                  <Input
                    label="Interest Rate (%) *"
                    name="interestRate"
                    type="number"
                    value={formData.interestRate}
                    onChange={handleInputChange}
                    required
                    step="0.1"
                    min="0"
                  />
                  <Input
                    label="Loan Start Date *"
                    name="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    required
                  />
                  <Select
                    label="Repayment Period *"
                    name="repaymentPeriod"
                    value={formData.repaymentPeriod}
                    onChange={handleInputChange}
                    options={[
                      { value: '1', label: '1 Month' },
                      { value: '2', label: '2 Months' },
                      { value: '3', label: '3 Months' },
                      { value: '4', label: '4 Months' },
                      { value: '5', label: '5 Months' },
                      { value: '6', label: '6 Months' },
                      { value: '7', label: '7 Months' },
                      { value: '8', label: '8 Months' },
                      { value: '9', label: '9 Months' },
                      { value: '10', label: '10 Months' },
                      { value: '11', label: '11 Months' },
                      { value: '12', label: '12 Months' },
                    ]}
                    required
                  />
                  <Input
                    label="Disbursement Date *"
                    name="disbursementDate"
                    type="date"
                    value={formData.disbursementDate}
                    onChange={handleInputChange}
                    required
                  />
                  <Select
                    label="Disbursement Method *"
                    name="disbursementMethod"
                    value={formData.disbursementMethod}
                    onChange={handleInputChange}
                    options={[
                      { value: 'mpesa', label: 'M-Pesa' },
                      { value: 'bank', label: 'Bank Transfer' },
                      { value: 'cash', label: 'Cash' },
                    ]}
                    required
                  />
                </div>
              </div>

              {/* Section C: Current Loan Status */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4 pb-2 border-b border-slate-100">
                  Section C: Current Loan Status
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <p className="text-sm text-slate-500 mb-1">Total Amount Due</p>
                    <p className="text-xl font-bold text-slate-900">
                      KES {formatNumberWithCommas(totalDue)}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Principal + {formData.interestRate || 0}% Interest
                    </p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <p className="text-sm text-slate-500 mb-1">Monthly Deduction</p>
                    <p className="text-xl font-bold text-slate-900">
                      KES {formatNumberWithCommas(Math.round(monthlyDeduction))}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Over {formData.repaymentPeriod || 0} months
                    </p>
                  </div>
                  <div className="bg-[#E0F2F2] p-4 rounded-lg border border-[#008080]/20">
                    <p className="text-sm text-[#006666] mb-1">Outstanding Balance</p>
                    <p className="text-xl font-bold text-[#008080]">
                      KES {formatNumberWithCommas(outstandingBalance)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <MoneyInput
                    label="Amount Paid to Date (KES)"
                    name="amountPaid"
                    value={formData.amountPaid}
                    onChange={handleInputChange}
                    placeholder="e.g. 25,000"
                  />
                  <Select
                    label="Loan Status"
                    name="loanStatus"
                    value={formData.loanStatus}
                    onChange={handleInputChange}
                    options={[
                      { value: 'Active', label: 'Active' },
                      { value: 'Fully Paid', label: 'Fully Paid' },
                      { value: 'Defaulted', label: 'Defaulted' },
                      { value: 'Restructured', label: 'Restructured' },
                    ]}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-6 border-t border-slate-100">
                <Button
                  variant="outline"
                  onClick={(e) => handleSubmit(e, true)}
                  disabled={isSubmitting}
                  leftIcon={<Save className="h-4 w-4" />}
                >
                  Save as Draft
                </Button>
                <Button
                  onClick={(e) => handleSubmit(e, false)}
                  isLoading={isSubmitting}
                  leftIcon={<Send className="h-4 w-4" />}
                >
                  Submit for Approval
                </Button>
              </div>
            </form>
          )}

          {activeTab === 'bulk' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-center bg-blue-50 p-4 rounded-lg border border-blue-100">
                <div>
                  <h4 className="font-medium text-blue-900">Download Template</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Use our standardized Excel template to ensure your data is
                    formatted correctly.
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="bg-white"
                  onClick={handleDownloadTemplate}
                  leftIcon={<Download className="h-4 w-4" />}
                >
                  Download .XLSX
                </Button>
              </div>

              <FileUpload
                label="Upload Client Data"
                accept=".csv,.xlsx,.xls"
                maxSizeMB={5}
                onFilesSelected={handleFileUpload}
                helperText="Drag and drop your completed template here"
              />

              {isValidating && (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-[#008080]" />
                  <span className="ml-3 text-slate-600">Validating file...</span>
                </div>
              )}

              {uploadedFiles.length > 0 && previewData.length > 0 && !isValidating && (
                <div className="mt-8 space-y-4">
                  <h3 className="text-lg font-semibold text-slate-900">
                    Preview & Validation
                  </h3>
                  <Table
                    data={previewData}
                    keyExtractor={(item) => item.row_number.toString()}
                    columns={[
                      { header: 'Name', accessor: 'name' },
                      { header: 'ID Number', accessor: 'national_id' },
                      { header: 'Mobile', accessor: 'mobile' },
                      { header: 'Employer', accessor: 'employer' },
                      {
                        header: 'Status',
                        accessor: (item: any) => (
                          <div className="flex items-center gap-2">
                            {item.status === 'valid' && (
                              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            )}
                            {item.status === 'warning' && (
                              <AlertCircle className="h-4 w-4 text-amber-500" />
                            )}
                            {item.status === 'error' && (
                              <XCircle className="h-4 w-4 text-red-500" />
                            )}
                            <span
                              className={`text-sm ${
                                item.status === 'valid'
                                  ? 'text-emerald-700'
                                  : item.status === 'warning'
                                  ? 'text-amber-700'
                                  : 'text-red-700'
                              }`}
                            >
                              {item.issue || 'Ready to import'}
                            </span>
                          </div>
                        ),
                      },
                    ]}
                  />

                  <div className="flex justify-end gap-4 pt-4">
                    <Button variant="outline" onClick={() => setUploadedFiles([])}>
                      Cancel
                    </Button>
                    <Button
                      onClick={handleBulkImport}
                      disabled={
                        previewData.some((d) => d.status === 'error') || isSubmitting
                      }
                      isLoading={isSubmitting}
                    >
                      Import Valid Rows
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
