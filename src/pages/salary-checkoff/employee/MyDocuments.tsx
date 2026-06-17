import React, { useState, useEffect } from 'react';
import { Card } from '@/components/salary-checkoff/ui/Card';
import { Button } from '@/components/salary-checkoff/ui/Button';
import { Badge } from '@/components/salary-checkoff/ui/Badge';
import { Modal } from '@/components/salary-checkoff/ui/Modal';
import { loanService, LoanApplication } from '@/services/salary-checkoff/loan.service';
import { documentService, Document } from '@/services/salary-checkoff/document.service';
import {
  FileText,
  Image,
  Download,
  Eye,
  Loader2,
  AlertCircle,
  FolderOpen,
} from 'lucide-react';

const DOCUMENT_TYPE_LABELS: Record<string, string> = {
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

function getDocumentTypeLabel(type: string): string {
  return DOCUMENT_TYPE_LABELS[type] || type.replace(/_/g, ' ').toUpperCase();
}

interface ApplicationGroup {
  application: LoanApplication;
  documents: Document[];
}

export function MyDocuments() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [groups, setGroups] = useState<ApplicationGroup[]>([]);
  const [downloadingDoc, setDownloadingDoc] = useState<string | null>(null);
  const [previewDocument, setPreviewDocument] = useState<Document | null>(null);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { results: applications } = await loanService.listApplications({ page: 1 });

      const grouped = await Promise.all(
        applications.map(async (app) => {
          try {
            const docs = await documentService.listApplicationDocuments(app.id);
            return { application: app, documents: Array.isArray(docs) ? docs : [] };
          } catch {
            return { application: app, documents: [] };
          }
        })
      );

      setGroups(grouped.filter((g) => g.documents.length > 0));
    } catch (err: any) {
      setError(err.message || 'Failed to load documents');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (docId: string, filename: string) => {
    try {
      setDownloadingDoc(docId);
      const blob = await documentService.downloadDocument(docId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      setError('Failed to download document');
      setTimeout(() => setError(null), 3000);
    } finally {
      setDownloadingDoc(null);
    }
  };

  const handlePreview = (doc: Document) => {
    if (
      doc.is_image ||
      doc.is_pdf ||
      doc.mime_type?.startsWith('image/') ||
      doc.mime_type === 'application/pdf'
    ) {
      setPreviewDocument(doc);
    } else {
      handleDownload(doc.id, doc.original_filename);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[#008080]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Documents</h1>
        <p className="text-slate-500 mt-1">Documents you have uploaded with your loan applications</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          {error}
        </div>
      )}

      {groups.length === 0 && !error && (
        <Card>
          <div className="text-center py-16">
            <FolderOpen className="h-14 w-14 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 font-medium">No documents uploaded yet</p>
            <p className="text-slate-500 text-sm mt-1">
              Documents you upload during a loan application will appear here.
            </p>
          </div>
        </Card>
      )}

      {groups.map(({ application, documents }) => (
        <Card key={application.id}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-4 border-b border-slate-100">
            <div>
              <span className="text-sm font-semibold text-slate-900">
                Application #{application.application_number}
              </span>
              <span className="mx-2 text-slate-300">·</span>
              <span className="text-sm text-slate-600">
                KES {parseFloat(application.principal_amount).toLocaleString()}
              </span>
              <span className="mx-2 text-slate-300">·</span>
              <span className="text-sm text-slate-500">
                {new Date(application.created_at).toLocaleDateString('en-KE', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            </div>
            <Badge variant={application.status}>{application.status.replace('_', ' ')}</Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {documents.map((doc) => {
              const isImage =
                doc.is_image || doc.mime_type?.startsWith('image/');
              const isPdf =
                doc.is_pdf || doc.mime_type === 'application/pdf';
              const canPreview = isImage || isPdf;

              return (
                <div
                  key={doc.id}
                  className="border border-slate-200 rounded-lg p-4 flex flex-col hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="h-9 w-9 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0">
                      {isImage ? (
                        <Image className="h-5 w-5 text-blue-500" />
                      ) : (
                        <FileText className="h-5 w-5 text-slate-500" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-900 leading-snug">
                        {getDocumentTypeLabel(doc.document_type)}
                      </p>
                      <p className="text-xs text-slate-500 truncate mt-0.5">
                        {doc.original_filename}
                      </p>
                      {doc.file_size > 0 && (
                        <p className="text-xs text-slate-400 mt-0.5">
                          {(doc.file_size / 1024).toFixed(1)} KB
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-auto">
                    {canPreview && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePreview(doc)}
                        leftIcon={<Eye className="h-3.5 w-3.5" />}
                      >
                        View
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownload(doc.id, doc.original_filename)}
                      disabled={downloadingDoc === doc.id}
                      leftIcon={
                        downloadingDoc === doc.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Download className="h-3.5 w-3.5" />
                        )
                      }
                    >
                      {downloadingDoc === doc.id ? 'Downloading...' : 'Download'}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      ))}

      {/* Document Preview Modal */}
      <Modal
        isOpen={previewDocument !== null}
        onClose={() => setPreviewDocument(null)}
        title={
          previewDocument
            ? getDocumentTypeLabel(previewDocument.document_type)
            : 'Document Preview'
        }
        size="xl"
      >
        {previewDocument && (
          <div className="space-y-4">
            {previewDocument.is_image ||
            previewDocument.mime_type?.startsWith('image/') ? (
              <div className="flex justify-center">
                <img
                  src={previewDocument.file}
                  alt={previewDocument.original_filename}
                  className="max-w-full max-h-[60vh] object-contain rounded-lg border border-slate-200"
                />
              </div>
            ) : previewDocument.is_pdf ||
              previewDocument.mime_type === 'application/pdf' ? (
              <div className="w-full h-[60vh]">
                <iframe
                  src={previewDocument.file}
                  className="w-full h-full rounded-lg border border-slate-200"
                  title={previewDocument.original_filename}
                />
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
                onClick={() =>
                  handleDownload(previewDocument.id, previewDocument.original_filename)
                }
                leftIcon={<Download className="h-4 w-4" />}
              >
                Download
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
