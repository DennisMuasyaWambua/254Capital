/**
 * Document Service for Salary Check-Off System
 */

import { API_ENDPOINTS, tokenManager } from './api';

export interface Document {
  id: string;
  application: string | null;
  employer: string | null;
  uploaded_by: string;
  document_type:
    | 'national_id_front'
    | 'national_id_back'
    | 'payslip_1'
    | 'payslip_2'
    | 'payslip_3'
    | 'check_off_agreement'
    | 'disbursement_receipt'
    | 'remittance_proof'
    | 'other';
  file: string;
  file_url?: string;
  original_filename: string;
  file_size: number;
  mime_type: string;
  created_at: string;
  updated_at: string;
  is_image?: boolean;
  is_pdf?: boolean;
}

/**
 * Resolve a document's file type from the backend flags when present, falling
 * back to the MIME type and finally the filename extension. This keeps preview
 * working even when the list endpoint does not return is_image/is_pdf/mime_type.
 */
export const getDocumentExtension = (doc: Pick<Document, 'original_filename'>): string => {
  const name = doc.original_filename || '';
  const dot = name.lastIndexOf('.');
  return dot >= 0 ? name.slice(dot + 1).toLowerCase() : '';
};

export const isImageDocument = (doc: Document): boolean => {
  if (doc.is_image) return true;
  if (doc.mime_type?.startsWith('image/')) return true;
  return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(getDocumentExtension(doc));
};

export const isPdfDocument = (doc: Document): boolean => {
  if (doc.is_pdf) return true;
  if (doc.mime_type === 'application/pdf') return true;
  return getDocumentExtension(doc) === 'pdf';
};

export const isViewableDocument = (doc: Document): boolean =>
  isImageDocument(doc) || isPdfDocument(doc);

export interface UploadDocumentRequest {
  file: File;
  document_type: Document['document_type'];
  application_id?: string;
  employer_id?: string;
}

export const documentService = {
  /**
   * Upload a document
   */
  uploadDocument: async (data: UploadDocumentRequest): Promise<Document> => {
    const formData = new FormData();
    formData.append('file', data.file);
    formData.append('document_type', data.document_type);
    if (data.application_id) {
      formData.append('application_id', data.application_id);
    }
    if (data.employer_id) {
      formData.append('employer_id', data.employer_id);
    }

    const token = tokenManager.getAccessToken();
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(API_ENDPOINTS.DOCUMENTS.UPLOAD, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw {
        message: errorData.detail || errorData.message || 'Upload failed',
        status: response.status,
        data: errorData,
      };
    }

    return await response.json();
  },

  /**
   * Get document metadata and download URL
   */
  getDocument: async (id: string): Promise<Document> => {
    const token = tokenManager.getAccessToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(API_ENDPOINTS.DOCUMENTS.DETAIL(id), {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw {
        message: errorData.detail || errorData.message || 'Request failed',
        status: response.status,
        data: errorData,
      };
    }

    return await response.json();
  },

  /**
   * Delete document
   */
  deleteDocument: async (id: string): Promise<void> => {
    const token = tokenManager.getAccessToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(API_ENDPOINTS.DOCUMENTS.DETAIL(id), {
      method: 'DELETE',
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw {
        message: errorData.detail || errorData.message || 'Delete failed',
        status: response.status,
        data: errorData,
      };
    }
  },

  /**
   * List documents for an application
   */
  listApplicationDocuments: async (applicationId: string): Promise<Document[]> => {
    const token = tokenManager.getAccessToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    console.log('Fetching documents for application:', applicationId);
    console.log('Using endpoint:', API_ENDPOINTS.DOCUMENTS.APPLICATION_DOCUMENTS(applicationId));

    const response = await fetch(
      API_ENDPOINTS.DOCUMENTS.APPLICATION_DOCUMENTS(applicationId),
      {
        method: 'GET',
        headers,
      }
    );

    console.log('Document fetch response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Document fetch failed:', {
        status: response.status,
        errorData,
        applicationId
      });
      throw {
        message: errorData.detail || errorData.message || 'Request failed',
        status: response.status,
        data: errorData,
      };
    }

    const documents = await response.json();
    console.log('Documents fetched successfully:', documents);
    return documents;
  },

  /**
   * Fetch a document's file as a Blob.
   *
   * Resolves the file URL from the detail endpoint (which always returns it),
   * preferring file_url (presigned for S3). Only attaches the auth header for
   * same-origin/API URLs - presigned S3 URLs already carry their own signature
   * and must not receive an Authorization header.
   */
  fetchDocumentBlob: async (id: string): Promise<Blob> => {
    const document = await documentService.getDocument(id);
    const fileUrl = document.file_url || document.file;

    if (!fileUrl) {
      throw { message: 'Document file URL is not available', status: 0 };
    }

    const isPresigned = /[?&](X-Amz-Signature|Signature|AWSAccessKeyId)=/.test(fileUrl);
    const token = tokenManager.getAccessToken();
    const headers: HeadersInit = {};
    if (token && !isPresigned) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(fileUrl, { method: 'GET', headers });

    if (!response.ok) {
      throw { message: 'Download failed', status: response.status };
    }

    return await response.blob();
  },

  /**
   * Download document file (alias kept for existing callers).
   */
  downloadDocument: async (id: string): Promise<Blob> => {
    return documentService.fetchDocumentBlob(id);
  },

  /**
   * Get a browser object URL for previewing a document inline.
   * Caller is responsible for revoking the URL with URL.revokeObjectURL().
   */
  getDocumentObjectUrl: async (id: string): Promise<string> => {
    const blob = await documentService.fetchDocumentBlob(id);
    return URL.createObjectURL(blob);
  },
};
