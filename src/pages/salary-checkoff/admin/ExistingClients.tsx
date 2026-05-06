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
import { ConfirmDialog } from '@/components/salary-checkoff/ui/ConfirmDialog';
import {
  clientService,
  CreateClientRequest,
  BulkUploadValidationRow,
  ExistingClient,
  UpdateClientRequest,
} from '@/services/salary-checkoff/client.service';
import { employerService } from '@/services/salary-checkoff/employer.service';
import { formatNumberWithCommas, parseFormattedNumber } from '@/utils/formatters';
import {
  Save,
  Download,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Edit2,
  Trash2,
  X,
  RefreshCw,
} from 'lucide-react';

type LoanStatus = 'Active' | 'Fully Paid' | 'Defaulted' | 'Restructured';

interface ExistingClientsProps {
  onNavigate: (page: string) => void;
}

interface ManualFormData {
  fullName: string;
  nationalId: string;
  mobile: string;
  email: string;
  employer: string;
  employeeId: string;
  loanAmount: string;
  interestRate: string;
  startDate: string;
  repaymentPeriod: string;
  disbursementDate: string;
  disbursementMethod: string;
  amountPaid: string;
  loanStatus: LoanStatus;
}

export function ExistingClients({ onNavigate: _onNavigate }: ExistingClientsProps) {
  const [activeTab, setActiveTab] = useState('view');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [employers, setEmployers] = useState<Array<{ id: string; name: string }>>([]);
  const [isLoadingEmployers, setIsLoadingEmployers] = useState(false);

  // View Clients State
  const [clients, setClients] = useState<ExistingClient[]>([]);
  const [isLoadingClients, setIsLoadingClients] = useState(false);
  const [editingClient, setEditingClient] = useState<ExistingClient | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<ExistingClient | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Edit Form State
  const [editFormData, setEditFormData] = useState<UpdateClientRequest>({});

  // Manual Form State
  const [formData, setFormData] = useState<ManualFormData>({
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

  // Load employers and clients on mount
  useEffect(() => {
    loadEmployers();
    if (activeTab === 'view') {
      loadClients();
    }
  }, []);

  // Reload clients when switching to view tab
  useEffect(() => {
    if (activeTab === 'view') {
      loadClients();
    }
  }, [activeTab]);

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

  const loadClients = async () => {
    try {
      setIsLoadingClients(true);
      setError(null);
      const response = await clientService.listClients();
      setClients(response.results || []);
    } catch (error: any) {
      console.error('Error loading clients:', error);
      setError('Failed to load clients: ' + (error.message || 'Unknown error'));
    } finally {
      setIsLoadingClients(false);
    }
  };

  // Derived calculations for manual entry
  const loanAmountNum = parseFormattedNumber(formData.loanAmount) || 0;
  const interestRateNum = Number(formData.interestRate) || 0;
  const periodNum = Number(formData.repaymentPeriod) || 1;
  const amountPaidNum = parseFormattedNumber(formData.amountPaid) || 0;

  const totalInterest = loanAmountNum * (interestRateNum / 100) * periodNum;
  const totalDue = loanAmountNum + totalInterest;
  const monthlyDeduction = totalDue / periodNum;
  const outstandingBalance = totalDue - amountPaidNum;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMoneyInputChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) return 'Full name is required';
    if (!formData.nationalId.trim()) return 'National ID is required';
    if (!formData.mobile.trim()) return 'Mobile number is required';
    if (!formData.employer) return 'Employer is required';
    if (!loanAmountNum || loanAmountNum < 5000)
      return 'Loan amount must be at least KES 5,000';
    if (!formData.startDate) return 'Start date is required';
    if (!formData.disbursementDate) return 'Disbursement date is required';
    if (!formData.disbursementMethod) return 'Disbursement method is required';
    return null;
  };

  const handleManualSubmit = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const requestData: CreateClientRequest = {
        full_name: formData.fullName,
        national_id: formData.nationalId,
        mobile: formData.mobile,
        email: formData.email,
        employer: formData.employer,
        employee_id: formData.employeeId,
        loan_amount: loanAmountNum,
        interest_rate: interestRateNum,
        start_date: formData.startDate,
        repayment_period: periodNum,
        disbursement_date: formData.disbursementDate,
        disbursement_method: formData.disbursementMethod as "mpesa" | "bank" | "cash",
        amount_paid: amountPaidNum,
        loan_status: formData.loanStatus,
      };

      await clientService.createClient(requestData);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);

      // Reset form
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
    } catch (error: any) {
      console.error('Error creating client:', error);
      setError(error.message || 'Failed to create client record');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (files: File[]) => {
    setUploadedFiles(files);
    setPreviewData([]);
    setError(null);
    if (files.length > 0) {
      handleValidate(files[0]);
    }
  };

  const handleValidate = async (file: File) => {
    setIsValidating(true);
    setError(null);

    try {
      const response = await clientService.validateBulkUpload(file);
      setPreviewData(response.preview || []);

      if (response.invalid_rows > 0) {
        setError(
          `${response.invalid_rows} row(s) have errors. Please fix them before importing.`
        );
      }
    } catch (error: any) {
      console.error('Error validating file:', error);
      setError(error.message || 'Failed to validate file');
      setPreviewData([]);
    } finally {
      setIsValidating(false);
    }
  };

  const handleBulkImport = async () => {
    if (uploadedFiles.length === 0) {
      setError('Please select a file first');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await clientService.bulkUploadClients(uploadedFiles[0]);

      if (response.valid_rows > 0) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 5000);
        setUploadedFiles([]);
        setPreviewData([]);
      }

      if (response.invalid_rows > 0) {
        setError(
          `${response.invalid_rows} row(s) failed to import. Please check the errors and try again.`
        );
      }
    } catch (error: any) {
      console.error('Error uploading file:', error);
      setError(error.message || 'Failed to upload file');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      await clientService.downloadTemplate();
    } catch (error: any) {
      console.error('Error downloading template:', error);
      setError(error.message || 'Failed to download template');
    }
  };

  // Edit Client Functions
  const handleEditClick = (client: ExistingClient) => {
    setEditingClient(client);
    setEditFormData({
      full_name: client.full_name,
      national_id: client.national_id,
      mobile: client.mobile,
      email: client.email || '',
      employer: client.employer || '',
      employee_id: client.employee_id || '',
      loan_amount: parseFloat(client.loan_amount),
      interest_rate: parseFloat(client.interest_rate),
      repayment_period: client.repayment_period,
      disbursement_date: client.disbursement_date,
      disbursement_method: client.disbursement_method,
      amount_paid: parseFloat(client.amount_paid),
      loan_status: client.loan_status,
    });
    setShowEditModal(true);
  };

  const handleEditFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditMoneyInputChange = (name: string, value: string) => {
    const numValue = parseFormattedNumber(value);
    setEditFormData((prev) => ({ ...prev, [name]: numValue }));
  };

  const handleSaveEdit = async () => {
    if (!editingClient) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await clientService.updateClient(editingClient.id, editFormData);
      setShowEditModal(false);
      setEditingClient(null);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      loadClients(); // Reload the list
    } catch (error: any) {
      console.error('Error updating client:', error);
      setError(error.message || 'Failed to update client');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Client Functions
  const handleDeleteClick = (client: ExistingClient) => {
    setClientToDelete(client);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!clientToDelete) return;

    setIsDeleting(true);
    setError(null);

    try {
      await clientService.deleteClient(clientToDelete.id, {
        confirm: true,
        reason: 'Deleted via admin panel',
      });
      setShowDeleteDialog(false);
      setClientToDelete(null);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      loadClients(); // Reload the list
    } catch (error: any) {
      console.error('Error deleting client:', error);
      setError(error.message || 'Failed to delete client');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Existing Clients</h1>
          <p className="text-slate-600 mt-1">
            Manage legacy client loan records manually or via bulk upload
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-800">
          <AlertCircle className="h-5 w-5 mr-2 text-red-600 flex-shrink-0" />
          {error}
        </div>
      )}

      {showSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center text-emerald-800 animate-fade-in">
          <CheckCircle2 className="h-5 w-5 mr-2 text-emerald-600" />
          Operation completed successfully!
        </div>
      )}

      <Card className="p-0">
        <div className="px-6 pt-2">
          <Tabs
            tabs={[
              { id: 'view', label: 'View Clients' },
              { id: 'manual', label: 'Manual Entry' },
              { id: 'bulk', label: 'Bulk Upload' },
            ]}
            activeTab={activeTab}
            onChange={setActiveTab}
          />
        </div>

        <div className="p-6">
          {/* View Clients Tab */}
          {activeTab === 'view' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex justify-between items-center">
                <p className="text-sm text-slate-600">
                  Total clients: {clients.length}
                </p>
                <Button
                  variant="outline"
                  onClick={loadClients}
                  disabled={isLoadingClients}
                  size="sm"
                >
                  <RefreshCw
                    className={`h-4 w-4 mr-2 ${isLoadingClients ? 'animate-spin' : ''}`}
                  />
                  Refresh
                </Button>
              </div>

              {isLoadingClients ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-[#008080]" />
                </div>
              ) : clients.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <p>No clients found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table
                    data={clients}
                    keyExtractor={(client) => client.id}
                    columns={[
                      {
                        header: 'Client Name',
                        accessor: (row) => (
                          <div>
                            <div className="font-medium text-slate-900">{row.full_name}</div>
                            <div className="text-xs text-slate-500">
                              ID: {row.national_id}
                            </div>
                          </div>
                        ),
                      },
                      {
                        header: 'Contact',
                        accessor: (row) => (
                          <div>
                            <div>{row.mobile}</div>
                            {row.email && (
                              <div className="text-xs text-slate-500">{row.email}</div>
                            )}
                          </div>
                        ),
                      },
                      {
                        header: 'Employer',
                        accessor: (row) => row.employer_name || 'N/A',
                      },
                      {
                        header: 'Loan Amount',
                        accessor: (row) => `KES ${formatNumberWithCommas(row.loan_amount)}`,
                      },
                      {
                        header: 'Monthly Deduction',
                        accessor: (row) => `KES ${formatNumberWithCommas(row.monthly_deduction)}`,
                      },
                      {
                        header: 'Outstanding',
                        accessor: (row) => (
                          <span
                            className={
                              parseFloat(row.outstanding_balance) > 0 ? 'text-orange-600' : 'text-emerald-600'
                            }
                          >
                            KES {formatNumberWithCommas(row.outstanding_balance)}
                          </span>
                        ),
                      },
                      {
                        header: 'Status',
                        accessor: (row) => (
                          <Badge
                            variant={
                              row.loan_status === 'Active'
                                ? 'success'
                                : row.loan_status === 'Fully Paid'
                                ? 'approved'
                                : 'pending'
                            }
                          >
                            {row.loan_status}
                          </Badge>
                        ),
                      },
                      {
                        header: 'Actions',
                        accessor: (row) => (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditClick(row)}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              title="Edit client"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(row)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Delete client"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ),
                      },
                    ]}
                  />
                </div>
              )}
            </div>
          )}

          {/* Manual Entry Tab */}
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
                    placeholder="254712345678"
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
                    label="Employer *"
                    name="employer"
                    value={formData.employer}
                    onChange={handleInputChange}
                    disabled={isLoadingEmployers}
                    required
                    options={employers.map((emp) => ({
                      value: emp.id,
                      label: emp.name,
                    }))}
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
                    onChange={(e) => handleMoneyInputChange('loanAmount', e.target.value)}
                    placeholder="e.g. 100,000"
                    required
                    helperText="Minimum KES 5,000"
                  />
                  <Input
                    label="Interest Rate (%) *"
                    name="interestRate"
                    type="number"
                    step="0.01"
                    value={formData.interestRate}
                    onChange={handleInputChange}
                    required
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
                    label="Repayment Period (Months) *"
                    name="repaymentPeriod"
                    value={formData.repaymentPeriod}
                    onChange={handleInputChange}
                    required
                    options={[
                      { value: '3', label: '3 Months' },
                      { value: '6', label: '6 Months' },
                      { value: '9', label: '9 Months' },
                      { value: '12', label: '12 Months' },
                    ]}
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
                    required
                    options={[
                      { value: 'mpesa', label: 'M-Pesa' },
                      { value: 'bank', label: 'Bank Transfer' },
                      { value: 'cash', label: 'Cash' },
                    ]}
                  />
                  <MoneyInput
                    label="Amount Paid to Date (KES)"
                    name="amountPaid"
                    value={formData.amountPaid}
                    onChange={(e) => handleMoneyInputChange('amountPaid', e.target.value)}
                    placeholder="0"
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

              {/* Summary */}
              <div className="bg-slate-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                  Loan Summary
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-slate-600">Total Interest</div>
                    <div className="text-lg font-semibold text-slate-900">
                      KES {formatNumberWithCommas(totalInterest.toFixed(2))}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-600">Total Due</div>
                    <div className="text-lg font-semibold text-slate-900">
                      KES {formatNumberWithCommas(totalDue.toFixed(2))}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-600">Monthly Deduction</div>
                    <div className="text-lg font-semibold text-slate-900">
                      KES {formatNumberWithCommas(monthlyDeduction.toFixed(2))}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-600">Outstanding Balance</div>
                    <div className="text-lg font-semibold text-orange-600">
                      KES {formatNumberWithCommas(outstandingBalance.toFixed(2))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <Button variant="outline" onClick={() => window.location.reload()}>
                  Cancel
                </Button>
                <Button
                  onClick={handleManualSubmit}
                  disabled={isSubmitting}
                  isLoading={isSubmitting}
                >
                  <Save className="mr-2 h-4 w-4" />
                  Save Client Record
                </Button>
              </div>
            </form>
          )}

          {/* Bulk Upload Tab */}
          {activeTab === 'bulk' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Instructions</h4>
                <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                  <li>Download the Excel template below</li>
                  <li>Fill in client data (refer to template instructions)</li>
                  <li>Upload the completed file for validation</li>
                  <li>Review errors and fix them</li>
                  <li>Import valid rows</li>
                </ol>
              </div>

              <div>
                <Button onClick={handleDownloadTemplate} variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Download Excel Template
                </Button>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Upload Completed Template
                </label>
                <FileUpload
                  onFilesSelected={handleFileChange}
                  accept=".xlsx,.xls,.csv"
                  multiple={false}
                  maxSizeMB={10}
                />
              </div>

              {isValidating && (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-[#008080]" />
                  <span className="ml-3 text-slate-600">Validating file...</span>
                </div>
              )}

              {previewData.length > 0 && (
                <div>
                  <h3 className="font-semibold text-slate-900 mb-4">
                    Preview ({previewData.length} rows)
                  </h3>
                  <Table
                    data={previewData}
                    keyExtractor={(row) => row.row_number.toString()}
                    columns={[
                      { header: 'Row', accessor: 'row_number' },
                      { header: 'Name', accessor: 'name' },
                      { header: 'ID', accessor: 'national_id' },
                      { header: 'Mobile', accessor: 'mobile' },
                      { header: 'Employer', accessor: 'employer' },
                      {
                        header: 'Amount',
                        accessor: (row) => formatNumberWithCommas(row.loan_amount),
                      },
                      {
                        header: 'Status',
                        accessor: (row) => (
                          <Badge variant={row.status === 'valid' ? 'success' : 'declined'}>
                            {row.status}
                          </Badge>
                        ),
                      },
                      {
                        header: 'Issue',
                        accessor: (row) =>
                          row.issue ? (
                            <span className="text-xs text-red-600">{row.issue}</span>
                          ) : (
                            <span className="text-xs text-emerald-600">OK</span>
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

      {/* Edit Modal */}
      {showEditModal && editingClient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-slide-in-up">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 sticky top-0 bg-white">
              <h3 className="text-lg font-semibold text-slate-900">
                Edit Client: {editingClient.full_name}
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                disabled={isSubmitting}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  name="full_name"
                  value={editFormData.full_name || ''}
                  onChange={handleEditFormChange}
                />
                <Input
                  label="National ID"
                  name="national_id"
                  value={editFormData.national_id || ''}
                  onChange={handleEditFormChange}
                />
                <Input
                  label="Mobile"
                  name="mobile"
                  value={editFormData.mobile || ''}
                  onChange={handleEditFormChange}
                />
                <Input
                  label="Email"
                  name="email"
                  value={editFormData.email || ''}
                  onChange={handleEditFormChange}
                />
                <Select
                  label="Employer"
                  name="employer"
                  value={editFormData.employer || ''}
                  onChange={handleEditFormChange}
                  options={employers.map((emp) => ({
                    value: emp.id,
                    label: emp.name,
                  }))}
                />
                <Input
                  label="Employee ID"
                  name="employee_id"
                  value={editFormData.employee_id || ''}
                  onChange={handleEditFormChange}
                />
                <MoneyInput
                  label="Loan Amount"
                  name="loan_amount"
                  value={
                    editFormData.loan_amount
                      ? formatNumberWithCommas(editFormData.loan_amount)
                      : ''
                  }
                  onChange={(e) => handleEditMoneyInputChange('loan_amount', e.target.value)}
                />
                <Input
                  label="Interest Rate (%)"
                  name="interest_rate"
                  type="number"
                  step="0.01"
                  value={editFormData.interest_rate || ''}
                  onChange={handleEditFormChange}
                />
                <Input
                  label="Repayment Period (Months)"
                  name="repayment_period"
                  type="number"
                  value={editFormData.repayment_period || ''}
                  onChange={handleEditFormChange}
                />
                <Input
                  label="Disbursement Date"
                  name="disbursement_date"
                  type="date"
                  value={editFormData.disbursement_date || ''}
                  onChange={handleEditFormChange}
                />
                <Select
                  label="Disbursement Method"
                  name="disbursement_method"
                  value={editFormData.disbursement_method || ''}
                  onChange={handleEditFormChange}
                  options={[
                    { value: 'mpesa', label: 'M-Pesa' },
                    { value: 'bank', label: 'Bank Transfer' },
                    { value: 'cash', label: 'Cash' },
                  ]}
                />
                <MoneyInput
                  label="Amount Paid"
                  name="amount_paid"
                  value={
                    editFormData.amount_paid
                      ? formatNumberWithCommas(editFormData.amount_paid)
                      : ''
                  }
                  onChange={(e) => handleEditMoneyInputChange('amount_paid', e.target.value)}
                />
                <Select
                  label="Loan Status"
                  name="loan_status"
                  value={editFormData.loan_status || ''}
                  onChange={handleEditFormChange}
                  options={[
                    { value: 'Active', label: 'Active' },
                    { value: 'Fully Paid', label: 'Fully Paid' },
                    { value: 'Defaulted', label: 'Defaulted' },
                    { value: 'Restructured', label: 'Restructured' },
                  ]}
                />
              </div>
            </div>

            <div className="flex gap-3 p-6 bg-slate-50 border-t border-slate-200">
              <Button
                variant="outline"
                onClick={() => setShowEditModal(false)}
                disabled={isSubmitting}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveEdit}
                disabled={isSubmitting}
                isLoading={isSubmitting}
                className="flex-1"
              >
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Client"
        description={
          clientToDelete ? (
            <div>
              <p className="mb-4">
                Are you sure you want to delete{' '}
                <strong>{clientToDelete.full_name}</strong>?
              </p>
              <div className="bg-red-50 border border-red-200 rounded p-3 text-sm">
                <p className="font-semibold text-red-900 mb-2">This action will:</p>
                <ul className="list-disc list-inside text-red-800 space-y-1">
                  <li>Permanently remove this client record</li>
                  <li>Cannot be undone</li>
                </ul>
              </div>
            </div>
          ) : (
            'Are you sure you want to delete this client?'
          )
        }
        confirmText="Delete Client"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
