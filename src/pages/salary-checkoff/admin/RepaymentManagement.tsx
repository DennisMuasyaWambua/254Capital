import React, { useState } from 'react';
import { Card } from '@/components/salary-checkoff/ui/Card';
import { Button } from '@/components/salary-checkoff/ui/Button';
import { Input } from '@/components/salary-checkoff/ui/Input';
import { Select } from '@/components/salary-checkoff/ui/Select';
import { Table } from '@/components/salary-checkoff/ui/Table';
import { Badge } from '@/components/salary-checkoff/ui/Badge';
import { MoneyInput } from '@/components/salary-checkoff/ui/MoneyInput';
import { ConfirmDialog } from '@/components/salary-checkoff/ui/ConfirmDialog';
import {
  loanService,
  Repayment,
  LoanRepaymentsResponse,
} from '@/services/salary-checkoff/loan.service';
import { repaymentService } from '@/services/salary-checkoff/repayment.service';
import { formatNumberWithCommas, parseFormattedNumber } from '@/utils/formatters';
import {
  Search,
  Edit2,
  Trash2,
  Plus,
  X,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Calendar,
  DollarSign,
} from 'lucide-react';

interface RepaymentManagementProps {
  onBack: () => void;
}

export function RepaymentManagement({ onBack }: RepaymentManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [loanData, setLoanData] = useState<LoanRepaymentsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Edit Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRepayment, setEditingRepayment] = useState<Repayment | null>(null);
  const [editFormData, setEditFormData] = useState({
    amount: '',
    due_date: '',
    paid: false,
    payment_date: '',
    payment_method: '',
    reference: '',
  });
  const [isUpdating, setIsUpdating] = useState(false);

  // Delete Dialog State
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [repaymentToDelete, setRepaymentToDelete] = useState<Repayment | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Manual Payment Modal State
  const [showManualPaymentModal, setShowManualPaymentModal] = useState(false);
  const [manualPaymentData, setManualPaymentData] = useState({
    amount: '',
    payment_date: new Date().toISOString().split('T')[0],
    payment_method: 'manual',
    reference: '',
    notes: '',
  });
  const [isPostingPayment, setIsPostingPayment] = useState(false);

  // Search for loan by application number
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setError('Please enter a loan application number');
      return;
    }

    setIsSearching(true);
    setError(null);
    setLoanData(null);

    try {
      // Search for loan by application number
      const searchResponse = await loanService.searchLoans(searchTerm);

      if (searchResponse.results.length === 0) {
        setError('No loan found with that application number');
        return;
      }

      const loan = searchResponse.results[0];

      // Get repayments for this loan
      const repaymentsResponse = await loanService.getLoanRepayments(loan.id);
      setLoanData(repaymentsResponse);
    } catch (err: any) {
      console.error('Error searching for loan:', err);
      setError(err.message || 'Failed to find loan');
    } finally {
      setIsSearching(false);
    }
  };

  // Edit Repayment Functions
  const handleEditClick = (repayment: Repayment) => {
    setEditingRepayment(repayment);
    setEditFormData({
      amount: repayment.amount,
      due_date: repayment.due_date || '',
      paid: repayment.paid,
      payment_date: repayment.payment_date || '',
      payment_method: repayment.payment_method || '',
      reference: repayment.reference || '',
    });
    setShowEditModal(true);
  };

  const handleEditFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setEditFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleEditMoneyChange = (value: string) => {
    const numValue = parseFormattedNumber(value);
    setEditFormData((prev) => ({ ...prev, amount: numValue.toString() }));
  };

  const handleSaveEdit = async () => {
    if (!editingRepayment || !loanData) return;

    setIsUpdating(true);
    setError(null);

    try {
      await repaymentService.updateRepayment(editingRepayment.id, {
        amount: parseFloat(editFormData.amount),
        due_date: editFormData.due_date,
        paid: editFormData.paid,
        payment_date: editFormData.payment_date || undefined,
        payment_method: editFormData.payment_method || undefined,
        reference: editFormData.reference || undefined,
      });

      setShowEditModal(false);
      setEditingRepayment(null);
      setSuccess('Repayment updated successfully');
      setTimeout(() => setSuccess(null), 3000);

      // Reload repayments
      const repaymentsResponse = await loanService.getLoanRepayments(loanData.loan_id);
      setLoanData(repaymentsResponse);
    } catch (err: any) {
      console.error('Error updating repayment:', err);
      setError(err.message || 'Failed to update repayment');
    } finally {
      setIsUpdating(false);
    }
  };

  // Delete Repayment Functions
  const handleDeleteClick = (repayment: Repayment) => {
    setRepaymentToDelete(repayment);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!repaymentToDelete || !loanData) return;

    setIsDeleting(true);
    setError(null);

    try {
      await repaymentService.deleteRepayment(repaymentToDelete.id, {
        confirm: true,
        reason: 'Deleted via admin panel',
      });

      setShowDeleteDialog(false);
      setRepaymentToDelete(null);
      setSuccess('Repayment deleted successfully');
      setTimeout(() => setSuccess(null), 3000);

      // Reload repayments
      const repaymentsResponse = await loanService.getLoanRepayments(loanData.loan_id);
      setLoanData(repaymentsResponse);
    } catch (err: any) {
      console.error('Error deleting repayment:', err);
      setError(err.message || 'Failed to delete repayment');
    } finally {
      setIsDeleting(false);
    }
  };

  // Manual Payment Functions
  const handleManualPaymentChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setManualPaymentData((prev) => ({ ...prev, [name]: value }));
  };

  const handleManualPaymentMoneyChange = (value: string) => {
    const numValue = parseFormattedNumber(value);
    setManualPaymentData((prev) => ({ ...prev, amount: numValue.toString() }));
  };

  const handlePostManualPayment = async () => {
    if (!loanData) return;

    if (!manualPaymentData.amount || parseFloat(manualPaymentData.amount) <= 0) {
      setError('Please enter a valid payment amount');
      return;
    }

    setIsPostingPayment(true);
    setError(null);

    try {
      await loanService.manualRepayment(loanData.loan_id, {
        amount: parseFloat(manualPaymentData.amount),
        payment_date: manualPaymentData.payment_date,
        payment_method: manualPaymentData.payment_method,
        reference: manualPaymentData.reference,
        notes: manualPaymentData.notes,
      });

      setShowManualPaymentModal(false);
      setManualPaymentData({
        amount: '',
        payment_date: new Date().toISOString().split('T')[0],
        payment_method: 'manual',
        reference: '',
        notes: '',
      });
      setSuccess('Payment posted successfully');
      setTimeout(() => setSuccess(null), 3000);

      // Reload repayments
      const repaymentsResponse = await loanService.getLoanRepayments(loanData.loan_id);
      setLoanData(repaymentsResponse);
    } catch (err: any) {
      console.error('Error posting payment:', err);
      setError(err.message || 'Failed to post payment');
    } finally {
      setIsPostingPayment(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Repayment Management</h1>
          <p className="text-slate-600 mt-1">
            View, edit, and manage loan repayment schedules
          </p>
        </div>
        <Button variant="outline" onClick={onBack}>
          Back to Dashboard
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-800">
          <AlertCircle className="h-5 w-5 mr-2 text-red-600 flex-shrink-0" />
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center text-emerald-800 animate-fade-in">
          <CheckCircle2 className="h-5 w-5 mr-2 text-emerald-600" />
          {success}
        </div>
      )}

      {/* Search Section */}
      <Card className="p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Search for Loan</h3>
        <div className="flex gap-4">
          <div className="flex-1">
            <Input
              placeholder="Enter loan application number (e.g., LN-2026-001234)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Button
            onClick={handleSearch}
            disabled={isSearching}
            isLoading={isSearching}
          >
            <Search className="mr-2 h-4 w-4" />
            Search
          </Button>
        </div>
      </Card>

      {/* Loan Details and Repayments */}
      {loanData && (
        <>
          {/* Loan Summary Card */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900">Loan Details</h3>
              <Button
                onClick={() => setShowManualPaymentModal(true)}
                size="sm"
              >
                <Plus className="mr-2 h-4 w-4" />
                Post Manual Payment
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <div className="text-sm text-slate-600 mb-1">Application Number</div>
                <div className="font-semibold text-slate-900">
                  {loanData.loan_details.application_number}
                </div>
              </div>
              <div>
                <div className="text-sm text-slate-600 mb-1">Employee Name</div>
                <div className="font-semibold text-slate-900">
                  {loanData.loan_details.employee_name}
                </div>
              </div>
              <div>
                <div className="text-sm text-slate-600 mb-1">Total Repayment</div>
                <div className="font-semibold text-slate-900">
                  KES {formatNumberWithCommas(loanData.loan_details.total_repayment)}
                </div>
              </div>
              <div>
                <div className="text-sm text-slate-600 mb-1">Monthly Deduction</div>
                <div className="font-semibold text-slate-900">
                  KES {formatNumberWithCommas(loanData.loan_details.monthly_deduction)}
                </div>
              </div>
            </div>

            {/* Summary Statistics */}
            <div className="mt-6 pt-6 border-t border-slate-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <div className="text-sm text-slate-600 mb-1">Total Installments</div>
                  <div className="text-2xl font-bold text-slate-900">
                    {loanData.summary.total_installments}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-slate-600 mb-1">Paid Installments</div>
                  <div className="text-2xl font-bold text-emerald-600">
                    {loanData.summary.paid_installments}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-slate-600 mb-1">Pending Installments</div>
                  <div className="text-2xl font-bold text-orange-600">
                    {loanData.summary.pending_installments}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-slate-600 mb-1">Outstanding Balance</div>
                  <div className="text-2xl font-bold text-red-600">
                    KES {formatNumberWithCommas(loanData.summary.outstanding_balance)}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Repayment Schedule Table */}
          <Card className="p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Repayment Schedule</h3>

            <div className="overflow-x-auto">
              <Table
                data={loanData.repayments}
                columns={[
                  {
                    key: 'installment_number',
                    header: '#',
                    render: (value) => <span className="font-mono">{value}</span>,
                  },
                  {
                    key: 'due_date',
                    header: 'Due Date',
                    render: (value) => (
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-slate-400" />
                        {value ? new Date(value).toLocaleDateString() : 'N/A'}
                      </div>
                    ),
                  },
                  {
                    key: 'amount',
                    header: 'Amount',
                    render: (value) => (
                      <div className="flex items-center font-semibold">
                        <DollarSign className="h-4 w-4 mr-1 text-slate-400" />
                        KES {formatNumberWithCommas(value)}
                      </div>
                    ),
                  },
                  {
                    key: 'paid',
                    header: 'Status',
                    render: (value) => (
                      <Badge variant={value ? 'success' : 'warning'}>
                        {value ? 'Paid' : 'Pending'}
                      </Badge>
                    ),
                  },
                  {
                    key: 'payment_date',
                    header: 'Payment Date',
                    render: (value) =>
                      value ? new Date(value).toLocaleDateString() : '-',
                  },
                  {
                    key: 'payment_method',
                    header: 'Method',
                    render: (value) => value || '-',
                  },
                  {
                    key: 'reference',
                    header: 'Reference',
                    render: (value) => (
                      <span className="font-mono text-xs">{value || '-'}</span>
                    ),
                  },
                  {
                    key: 'id',
                    header: 'Actions',
                    render: (value, row) => (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditClick(row)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Edit repayment"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(row)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete repayment"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ),
                  },
                ]}
              />
            </div>
          </Card>
        </>
      )}

      {/* Edit Repayment Modal */}
      {showEditModal && editingRepayment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full animate-slide-in-up">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">
                Edit Repayment #{editingRepayment.installment_number}
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                disabled={isUpdating}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <MoneyInput
                  label="Amount"
                  value={formatNumberWithCommas(editFormData.amount)}
                  onChange={handleEditMoneyChange}
                />
                <Input
                  label="Due Date"
                  name="due_date"
                  type="date"
                  value={editFormData.due_date}
                  onChange={handleEditFormChange}
                />
                <Input
                  label="Payment Date"
                  name="payment_date"
                  type="date"
                  value={editFormData.payment_date}
                  onChange={handleEditFormChange}
                />
                <Select
                  label="Payment Method"
                  name="payment_method"
                  value={editFormData.payment_method}
                  onChange={handleEditFormChange}
                >
                  <option value="">Select method</option>
                  <option value="mpesa">M-Pesa</option>
                  <option value="bank">Bank Transfer</option>
                  <option value="cash">Cash</option>
                  <option value="manual">Manual</option>
                </Select>
                <Input
                  label="Reference Number"
                  name="reference"
                  value={editFormData.reference}
                  onChange={handleEditFormChange}
                  placeholder="e.g., MPX123456"
                />
                <div className="flex items-center pt-8">
                  <input
                    type="checkbox"
                    name="paid"
                    id="paid"
                    checked={editFormData.paid}
                    onChange={handleEditFormChange}
                    className="h-4 w-4 text-[#008080] focus:ring-[#008080] border-slate-300 rounded"
                  />
                  <label htmlFor="paid" className="ml-2 text-sm text-slate-700">
                    Mark as paid
                  </label>
                </div>
              </div>
            </div>

            <div className="flex gap-3 p-6 bg-slate-50 border-t border-slate-200">
              <Button
                variant="outline"
                onClick={() => setShowEditModal(false)}
                disabled={isUpdating}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveEdit}
                disabled={isUpdating}
                isLoading={isUpdating}
                className="flex-1"
              >
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Payment Modal */}
      {showManualPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full animate-slide-in-up">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">
                Post Manual Payment
              </h3>
              <button
                onClick={() => setShowManualPaymentModal(false)}
                disabled={isPostingPayment}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <MoneyInput
                  label="Payment Amount *"
                  value={manualPaymentData.amount ? formatNumberWithCommas(manualPaymentData.amount) : ''}
                  onChange={handleManualPaymentMoneyChange}
                  required
                />
                <Input
                  label="Payment Date *"
                  name="payment_date"
                  type="date"
                  value={manualPaymentData.payment_date}
                  onChange={handleManualPaymentChange}
                  required
                />
                <Select
                  label="Payment Method *"
                  name="payment_method"
                  value={manualPaymentData.payment_method}
                  onChange={handleManualPaymentChange}
                  required
                >
                  <option value="manual">Manual</option>
                  <option value="mpesa">M-Pesa</option>
                  <option value="bank">Bank Transfer</option>
                  <option value="cash">Cash</option>
                </Select>
                <Input
                  label="Reference Number"
                  name="reference"
                  value={manualPaymentData.reference}
                  onChange={handleManualPaymentChange}
                  placeholder="e.g., MPX123456"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={manualPaymentData.notes}
                  onChange={handleManualPaymentChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080] focus:border-transparent"
                  placeholder="Add any notes about this payment..."
                />
              </div>
            </div>

            <div className="flex gap-3 p-6 bg-slate-50 border-t border-slate-200">
              <Button
                variant="outline"
                onClick={() => setShowManualPaymentModal(false)}
                disabled={isPostingPayment}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handlePostManualPayment}
                disabled={isPostingPayment}
                isLoading={isPostingPayment}
                className="flex-1"
              >
                Post Payment
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
        title="Delete Repayment Record"
        description={
          repaymentToDelete ? (
            <div>
              <p className="mb-4">
                Are you sure you want to delete repayment{' '}
                <strong>#{repaymentToDelete.installment_number}</strong>?
              </p>
              <div className="bg-red-50 border border-red-200 rounded p-3 text-sm">
                <p className="font-semibold text-red-900 mb-2">This action will:</p>
                <ul className="list-disc list-inside text-red-800 space-y-1">
                  <li>Permanently remove this repayment record</li>
                  <li>Update the loan's outstanding balance</li>
                  <li>Cannot be undone</li>
                </ul>
              </div>
            </div>
          ) : (
            'Are you sure you want to delete this repayment?'
          )
        }
        confirmText="Delete Repayment"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
