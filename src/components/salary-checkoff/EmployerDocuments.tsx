import React, { useState, useEffect } from 'react';
import { Button } from '@/components/salary-checkoff/ui/Button';
import { Modal } from '@/components/salary-checkoff/ui/Modal';
import {
  documentService,
  Document,
  isImageDocument,
  isPdfDocument,
  isViewableDocument,
} from '@/services/salary-checkoff/document.service';
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
  check_off_agreement: 'Check-off Agreement',
  remittance_proof: 'Remittance Proof',
  disbursement_receipt: 'Disbursement Receipt',
  other: 'Other Document',
};

function getDocumentTypeLabel(type: string): string {
  return DOCUMENT_TYPE_LABELS[type] || type.replace(/_/g, ' ').toUpperCase();
}

interface EmployerDocumentsProps {
  /** Employer whose documents to show. */
  employerId: string;
}

/**
 * Lists and previews an employer's documents (e.g. check-off agreements).
 *
 * Access is enforced by the backend: admins can view any employer's documents,
 * HR managers only their own employer's. This component simply renders whatever
 * the API returns for the given employerId.
 */
export function EmployerDocuments({ employerId }: EmployerDocumentsProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [downloadingDoc, setDownloadingDoc] = useState<string | null>(null);
  const [previewDocument, setPreviewDocument] = useState<Document | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const docs = await documentService.listEmployerDocuments(employerId);
        if (active) setDocuments(Array.isArray(docs) ? docs : []);
      } catch (err: any) {
        if (active) setError(err.message || 'Failed to load documents');
      } finally {
        if (active) setIsLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [employerId]);

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

  const handlePreview = async (doc: Document) => {
    if (!isViewableDocument(doc)) {
      handleDownload(doc.id, doc.original_filename);
      return;
    }

    setPreviewDocument(doc);
    setPreviewError(null);
    setPreviewLoading(true);
    setPreviewUrl(null);

    try {
      const objectUrl = await documentService.getDocumentObjectUrl(doc.id);
      setPreviewUrl(objectUrl);
    } catch (err) {
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-[#008080]" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          {error}
        </div>
      )}

      {documents.length === 0 && !error && (
        <div className="text-center py-12">
          <FolderOpen className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-600 font-medium">No documents for this employer</p>
          <p className="text-slate-500 text-sm mt-1">
            Documents uploaded for this employer will appear here.
          </p>
        </div>
      )}

      {documents.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {documents.map((doc) => {
            const isImage = isImageDocument(doc);
            const canPreview = isViewableDocument(doc);

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
      )}

      {/* Document Preview Modal */}
      <Modal
        isOpen={previewDocument !== null}
        onClose={handleClosePreview}
        title={
          previewDocument
            ? getDocumentTypeLabel(previewDocument.document_type)
            : 'Document Preview'
        }
        size="xl"
      >
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
                  className="max-w-full max-h-[60vh] object-contain rounded-lg border border-slate-200"
                />
              </div>
            ) : previewUrl && isPdfDocument(previewDocument) ? (
              <div className="w-full h-[60vh]">
                <iframe
                  src={previewUrl}
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
