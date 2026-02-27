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
  original_filename: string;
  file_size: number;
  mime_type: string;
  created_at: string;
  updated_at: string;
  is_image?: boolean;
  is_pdf?: boolean;
}

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

    const response = await fetch(
      API_ENDPOINTS.DOCUMENTS.APPLICATION_DOCUMENTS(applicationId),
      {
        method: 'GET',
        headers,
      }
    );

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
   * Download document file
   */
  downloadDocument: async (id: string): Promise<Blob> => {
    const document = await documentService.getDocument(id);
    const token = tokenManager.getAccessToken();
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(document.file, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw {
        message: 'Download failed',
        status: response.status,
      };
    }

    return await response.blob();
  },
};
