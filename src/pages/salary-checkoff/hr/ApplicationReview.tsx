import React, { useState, useEffect } from 'react';
import { Card } from '@/components/salary-checkoff/ui/Card';
import { Button } from '@/components/salary-checkoff/ui/Button';
import { Badge } from '@/components/salary-checkoff/ui/Badge';
import { Modal } from '@/components/salary-checkoff/ui/Modal';
import { loanService, LoanApplicationDetail } from '@/services/salary-checkoff/loan.service';
import {
  documentService,
  Document,
  isImageDocument,
  isPdfDocument,
  isViewableDocument,
} from '@/services/salary-checkoff/document.service';
import {
  ArrowLeft,
  Check,
  X,
  FileText,
  Download,
  UserCheck,
  Loader2,
  AlertCircle,
  Eye,
  Image } from
'lucide-react';
interface ApplicationReviewProps {
  onBack: () => void;
  applicationId?: string;
}
export function ApplicationReview({ onBack, applicationId }: ApplicationReviewProps) {
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isDeclineModalOpen, setIsDeclineModalOpen] = useState(false);
  const [comment, setComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [application, setApplication] = useState<LoanApplicationDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [downloadingDoc, setDownloadingDoc] = useState<string | null>(null);
  const [previewDocument, setPreviewDocument] = useState<Document | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  useEffect(() => {
    loadApplication();
  }, [applicationId]);

  const loadApplication = async () => {
    try {
      setIsLoading(true);
      setError(null);

      let targetId: string;

      if (applicationId) {
        // Load the specific application passed by the caller
        targetId = applicationId;
      } else {
        // Fallback: load the first pending application
        const pendingResponse = await loanService.hrListPending();
        if (pendingResponse.results.length === 0) {
          setError('No pending applications found.');
          setIsLoading(false);
          return;
        }
        targetId = pendingResponse.results[0].id;
      }

      const applicationDetail = await loanService.getApplication(targetId);
      setApplication(applicationDetail);

      // Fetch documents for this application
      try {
        const docs = await documentService.listApplicationDocuments(applicationDetail.id);
        setDocuments(Array.isArray(docs) ? docs : []);
      } catch (docError: any) {
        console.error('Error loading documents:', docError);
        setDocuments([]);
      }
    } catch (err: any) {
      console.error('Error loading application:', err);
      setError(err.message || 'Failed to load application');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!application) return;

    try {
      setIsSubmitting(true);
      setError(null);

      console.log('Attempting HR approval for application:', application.id);
      console.log('Application current status:', application.status);

      const result = await loanService.hrReview(application.id, {
        action: 'approve',
        comment: comment || 'Application approved',
      });

      console.log('HR approval result:', result);

      setIsApproveModalOpen(false);
      onBack();
    } catch (err: any) {
      console.error('Error approving application:', err);
      console.error('Approval error details:', {
        message: err.message,
        status: err.status,
        data: err.data,
        applicationId: application.id,
        applicationStatus: application.status
      });

      // Provide more specific error messages
      let errorMessage = err.data?.comment || err.message || 'Failed to approve application';
      if (err.status === 403) {
        errorMessage = 'You do not have permission to approve this application. Please contact your administrator.';
      } else if (err.status === 404) {
        errorMessage = 'Application not found. It may have already been processed.';
      } else if (err.status === 400) {
        errorMessage = err.data?.comment || err.data?.detail || err.message || 'Invalid application status. The application may have already been approved or processed.';
      }

      setError(errorMessage);
      setIsSubmitting(false);
    }
  };

  const handleDecline = async () => {
    if (!application) return;

    if (!comment.trim()) {
      setError('Please provide a reason for declining');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      console.log('Attempting HR decline for application:', application.id);

      const result = await loanService.hrReview(application.id, {
        action: 'decline',
        comment: comment,
      });

      console.log('HR decline result:', result);

      setIsDeclineModalOpen(false);
      onBack();
    } catch (err: any) {
      console.error('Error declining application:', err);
      console.error('Decline error details:', {
        message: err.message,
        status: err.status,
        data: err.data
      });

      // Provide more specific error messages
      let errorMessage = err.message || 'Failed to decline application';
      if (err.status === 403) {
        errorMessage = 'You do not have permission to decline this application. Please contact your administrator.';
      } else if (err.status === 404) {
        errorMessage = 'Application not found. It may have already been processed.';
      } else if (err.status === 400) {
        errorMessage = err.data?.detail || err.message || 'Invalid application status. The application may have already been processed.';
      }

      setError(errorMessage);
      setIsSubmitting(false);
    }
  };

  const handleDownloadDocument = async (docId: string, filename: string) => {
    try {
      setDownloadingDoc(docId);
      const blob = await documentService.downloadDocument(docId);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      console.error('Error downloading document:', err);
      setError('Failed to download document');
      setTimeout(() => setError(null), 3000);
    } finally {
      setDownloadingDoc(null);
    }
  };

  const handlePreviewDocument = async (doc: Document) => {
    // Non-previewable types fall back to a download.
    if (!isViewableDocument(doc)) {
      handleDownloadDocument(doc.id, doc.original_filename);
      return;
    }

    setPreviewDocument(doc);
    setPreviewError(null);
    setPreviewLoading(true);
    setPreviewUrl(null);

    try {
      // Fetch the file through the authenticated path and render it as a blob
      // object URL, so preview works regardless of storage backend (local/S3).
      const objectUrl = await documentService.getDocumentObjectUrl(doc.id);
      setPreviewUrl(objectUrl);
    } catch (err: any) {
      console.error('Error loading document preview:', err);
      setPreviewError('Unable to load preview. Try downloading the file instead.');
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleClosePreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setPreviewDocument(null);
    setPreviewError(null);
  };

  const getDocumentTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      national_id_front: 'National ID (Front)',
      national_id_back: 'National ID (Back)',
      payslip_1: 'Payslip 1',
      payslip_2: 'Payslip 2',
      payslip_3: 'Payslip 3',
      check_off_agreement: 'Check-off Agreement',
      disbursement_receipt: 'Disbursement Receipt',
      remittance_proof: 'Remittance Proof',
      other: 'Other Document',
    };
    return labels[type] || type.replace(/_/g, ' ').toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[#008080]" />
      </div>
    );
  }

  if (error && !application) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          leftIcon={<ArrowLeft className="h-4 w-4" />}>
          Back
        </Button>
        <div className="flex items-center justify-center p-12">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!application) {
    return null;
  }

  // The detail endpoint nests the employee object (unlike list endpoints,
  // which flatten it to a UUID plus an employee_name field).
  const employee = {
    name:
      application.employee?.full_name ||
      `${application.employee?.first_name || ''} ${application.employee?.last_name || ''}`.trim() ||
      (application as any).employee_name ||
      'N/A',
    id: application.employee.employee_profile?.employee_id || 'N/A',
    department: application.employee.employee_profile?.department || 'N/A',
    salary: application.employee.employee_profile?.monthly_gross_salary
      ? parseFloat(application.employee.employee_profile.monthly_gross_salary)
      : 0,
    employmentDate: application.employee.employee_profile?.employment_start_date
      ? new Date(application.employee.employee_profile.employment_start_date).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })
      : 'N/A',
    type: application.employee.employee_profile?.employment_type === 'confirmed' ? 'Permanent' : 'Contract'
  };

  const loan = {
    amount: parseFloat(application.principal_amount),
    period: application.repayment_months,
    monthly: parseFloat(application.monthly_deduction),
    purpose: application.purpose || 'Not specified',
    date: new Date(application.created_at).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' }),
    // Use the figures already calculated by the backend (which applies the
    // employer's configured interest method - flat or reducing balance)
    // rather than re-deriving them, so HR always sees the correct terms.
    totalRepayment: parseFloat(application.total_repayment),
    interestRate: parseFloat(application.interest_rate),
  };
  const loanInterestAmount = loan.totalRepayment - loan.amount;
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            leftIcon={<ArrowLeft className="h-4 w-4" />}>

            Back
          </Button>
          <h1 className="text-2xl font-bold text-slate-900">
            Review Application #{application.application_number}
          </h1>
          <Badge variant="pending">{application.status.replace('_', ' ').toUpperCase()}</Badge>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="danger"
            onClick={() => {
              setError(null);
              setComment('');
              setIsDeclineModalOpen(true);
            }}
            leftIcon={<X className="h-4 w-4" />}>

            Decline
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              setError(null);
              setComment('');
              setIsApproveModalOpen(true);
            }}
            leftIcon={<Check className="h-4 w-4" />}>

            Approve Application
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Employee & Loan Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card title="Employee Details">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-sm text-slate-500">Full Name</label>
                <p className="font-medium text-slate-900">{employee.name}</p>
              </div>
              <div>
                <label className="text-sm text-slate-500">Employee ID</label>
                <p className="font-medium text-slate-900">{employee.id}</p>
              </div>
              <div>
                <label className="text-sm text-slate-500">Department</label>
                <p className="font-medium text-slate-900">
                  {employee.department}
                </p>
              </div>
              <div>
                <label className="text-sm text-slate-500">
                  Employment Type
                </label>
                <p className="font-medium text-slate-900">{employee.type}</p>
              </div>
              <div>
                <label className="text-sm text-slate-500">Gross Salary</label>
                <p className="font-medium text-slate-900">
                  KES {employee.salary.toLocaleString()}
                </p>
              </div>
              <div>
                <label className="text-sm text-slate-500">
                  Employment Date
                </label>
                <p className="font-medium text-slate-900">
                  {employee.employmentDate}
                </p>
              </div>
            </div>
          </Card>

          <Card title="Loan Request Details">
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <label className="text-sm text-slate-500">
                  Requested Amount
                </label>
                <p className="text-xl font-bold text-[#11103a]">
                  KES {loan.amount.toLocaleString()}
                </p>
              </div>
              <div>
                <label className="text-sm text-slate-500">
                  Repayment Period
                </label>
                <p className="text-xl font-bold text-slate-900">
                  {loan.period} Months
                </p>
              </div>
              <div>
                <label className="text-sm text-slate-500">
                  Monthly Deduction
                </label>
                <p className="font-medium text-slate-900">
                  KES {loan.monthly.toLocaleString()}
                </p>
              </div>
              <div>
                <label className="text-sm text-slate-500">
                  Application Date
                </label>
                <p className="font-medium text-slate-900">{loan.date}</p>
              </div>
            </div>
            <div>
              <label className="text-sm text-slate-500">Purpose</label>
              <p className="mt-1 text-slate-900 bg-slate-50 p-3 rounded-lg border border-slate-100">
                {loan.purpose}
              </p>
            </div>
          </Card>

          <Card title="Uploaded Documents">
            {documents.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="border border-slate-200 rounded-lg p-4 flex flex-col items-center text-center hover:bg-slate-50 transition-colors">
                    <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center mb-3 text-slate-500">
                      {isImageDocument(doc) ? (
                        <Image className="h-5 w-5" />
                      ) : (
                        <FileText className="h-5 w-5" />
                      )}
                    </div>
                    <p className="text-sm font-medium text-slate-900 mb-1">
                      {getDocumentTypeLabel(doc.document_type)}
                    </p>
                    <p className="text-xs text-slate-500 mb-2 truncate w-full px-2">
                      {doc.original_filename}
                    </p>
                    <div className="flex items-center gap-1">
                      {isViewableDocument(doc) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          leftIcon={<Eye className="h-3 w-3" />}
                          onClick={() => handlePreviewDocument(doc)}>
                          Preview
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={downloadingDoc === doc.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3" />}
                        onClick={() => handleDownloadDocument(doc.id, doc.original_filename)}
                        disabled={downloadingDoc === doc.id}>
                        {downloadingDoc === doc.id ? 'Downloading...' : 'Download'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">No documents uploaded for this application</p>
              </div>
            )}
          </Card>
        </div>

        {/* Right Column - Verification Checklist */}
        <div className="lg:col-span-1 space-y-6">
          <Card title="Verification Checklist">
            <div className="space-y-4">
              {[
              'Employee is active and confirmed',
              'Salary details match records',
              'No existing loan defaults',
              'Within 1/3 rule borrowing limit',
              'Documents are valid and clear'].
              map((item, i) =>
              <div
                key={i}
                className="flex items-start space-x-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">

                  <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-[#11103a] focus:ring-[#11103a]" />

                  <label className="text-sm text-slate-700">{item}</label>
                </div>
              )}
            </div>
            <div className="mt-6 pt-6 border-t border-slate-100">
              <div className="flex items-center space-x-2 text-amber-600 bg-amber-50 p-3 rounded-lg text-sm">
                <UserCheck className="h-5 w-5 flex-shrink-0" />
                <span>
                  Please ensure all checks are completed before approving.
                </span>
              </div>
            </div>
          </Card>

          <Card title="Loan Calculation">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Principal</span>
                <span>KES {loan.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">
                  Interest ({(loan.interestRate * 100).toFixed(0)}%
                  {(application as any).employer?.interest_method === 'reducing_balance' ? ', reducing balance' : ', flat'})
                </span>
                <span>KES {loanInterestAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold pt-2 border-t border-slate-100">
                <span>Total Repayment</span>
                <span>KES {loan.totalRepayment.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[#008080] font-medium pt-2">
                <span>Monthly Deduction</span>
                <span className="text-[#008080] font-medium">
                  KES {loan.monthly.toLocaleString()}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Modals */}
      <Modal
        isOpen={isApproveModalOpen}
        onClose={() => setIsApproveModalOpen(false)}
        title="Approve Application"
        footer={
        <>
            <Button
            variant="ghost"
            onClick={() => setIsApproveModalOpen(false)}>

              Cancel
            </Button>
            <Button
            onClick={handleApprove}
            isLoading={isSubmitting}>

              Confirm Approval
            </Button>
          </>
        }>

        <p className="text-slate-600 mb-4">
          Are you sure you want to approve this loan application for{' '}
          <strong>{employee.name}</strong>?
        </p>
        <p className="text-slate-600 mb-4">
          This will forward the application to 254 Capital for final
          disbursement processing.
        </p>
        {error && (
          <div className="flex items-start space-x-3 p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
        <div className="bg-emerald-50 text-emerald-800 p-3 rounded-lg text-sm">
          Monthly deduction of{' '}
          <strong>KES {loan.monthly.toLocaleString()}</strong> will be scheduled
          starting next payroll cycle.
        </div>
      </Modal>

      <Modal
        isOpen={isDeclineModalOpen}
        onClose={() => setIsDeclineModalOpen(false)}
        title="Decline Application"
        footer={
        <>
            <Button
            variant="ghost"
            onClick={() => setIsDeclineModalOpen(false)}>

              Cancel
            </Button>
            <Button
            variant="danger"
            onClick={handleDecline}
            isLoading={isSubmitting}>

              Decline Application
            </Button>
          </>
        }>

        <p className="text-slate-600 mb-4">
          Please provide a reason for declining this application. This will be
          shared with the employee.
        </p>
        {error && (
          <div className="flex items-start space-x-3 p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
        <textarea
          className="w-full h-32 rounded-lg border border-slate-300 p-3 focus:ring-[#00BCD4] focus:border-[#00BCD4]"
          placeholder="Enter reason for decline..."
          value={comment}
          onChange={(e) => setComment(e.target.value)} />

      </Modal>

      {/* Document Preview Modal */}
      <Modal
        isOpen={previewDocument !== null}
        onClose={handleClosePreview}
        title={previewDocument ? getDocumentTypeLabel(previewDocument.document_type) : 'Document Preview'}
        size="xl">
        {previewDocument && (
          <div className="space-y-4">
            {previewLoading ? (
              <div className="flex items-center justify-center h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-[#008080]" />
              </div>
            ) : previewError ? (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-3" />
                <p className="text-slate-600">{previewError}</p>
              </div>
            ) : previewUrl && isImageDocument(previewDocument) ? (
              <div className="flex justify-center">
                <img
                  src={previewUrl}
                  alt={previewDocument.original_filename}
                  className="max-w-full max-h-[60vh] object-contain rounded-lg border border-slate-200" />
              </div>
            ) : previewUrl && isPdfDocument(previewDocument) ? (
              <div className="w-full h-[60vh]">
                <iframe
                  src={previewUrl}
                  className="w-full h-full rounded-lg border border-slate-200"
                  title={previewDocument.original_filename} />
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-600">Preview not available for this file type</p>
              </div>
            )}
            <div className="flex justify-between items-center pt-4 border-t border-slate-200">
              <p className="text-sm text-slate-500">{previewDocument.original_filename}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownloadDocument(previewDocument.id, previewDocument.original_filename)}
                leftIcon={<Download className="h-4 w-4" />}>
                Download
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>);

}