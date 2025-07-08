import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FileText, Download, ExternalLink, ArrowLeft, Edit } from 'lucide-react';
import { Button } from "@/components/ui/button";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { LoanApplication, getLoanApplicationById } from '../../lib/loanApplicationsDb';
import { formatDate } from '../../utils/formatters';

const ApplicationDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [application, setApplication] = useState<LoanApplication | null>(null);
  const [activeTab, setActiveTab] = useState('details');
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const appData = getLoanApplicationById(id);
      setApplication(appData);
      setLoading(false);
    }
  }, [id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#48A7A7]"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!application) {
    return (
      <DashboardLayout>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Application Not Found</h2>
          <p className="text-gray-500 mb-4">The application you're looking for doesn't exist or has been removed.</p>
          <Button 
            onClick={() => navigate('/dashboard/applications')}
            className="bg-[#48A7A7] hover:bg-[#48A7A7]/90 text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Applications
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center">
          <Button 
            onClick={() => navigate('/dashboard/applications')}
            variant="outline"
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Application {application.id}</h1>
            <div className="flex items-center mt-1">
              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(application.status)}`}>
                {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
              </span>
              <span className="ml-2 text-sm text-gray-500">
                Submitted on {formatDate(application.createdAt)}
              </span>
            </div>
          </div>
        </div>
        
        <Button 
          onClick={() => navigate(`/dashboard/applications/edit/${application.id}`)}
          className="bg-[#48A7A7] hover:bg-[#48A7A7]/90 text-white"
        >
          <Edit className="h-4 w-4 mr-2" /> Edit Application
        </Button>
      </div>
      
      {selectedDocument ? (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-6 flex justify-between items-center">
            <button
              onClick={() => setSelectedDocument(null)}
              className="flex items-center text-sm text-[#48A7A7] hover:text-[#48A7A7]/80 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-1" /> Back to documents
            </button>
            
            <a
              href={selectedDocument}
              download
              className="text-sm text-[#48A7A7] hover:text-[#48A7A7]/80 flex items-center transition-colors"
            >
              <Download className="h-4 w-4 mr-1" /> Download
            </a>
          </div>
          
          <div className="border rounded-lg overflow-hidden">
            <img 
              src={selectedDocument} 
              alt="Document preview" 
              className="w-full h-auto"
              onError={(e) => {
                // If image fails to load, show a link to open in new tab
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  const link = document.createElement('div');
                  link.className = 'p-8 text-center';
                  link.innerHTML = `
                    <p class="text-gray-500 mb-4">Unable to preview this document type</p>
                    <a 
                      href="${selectedDocument}" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#48A7A7] hover:bg-[#48A7A7]/90"
                    >
                      <span class="mr-2">Open in new tab</span>
                    </a>
                  `;
                  parent.appendChild(link);
                }
              }}
            />
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'details'
                    ? 'border-[#48A7A7] text-[#48A7A7]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('details')}
              >
                Application Details
              </button>
              <button
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'documents'
                    ? 'border-[#48A7A7] text-[#48A7A7]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('documents')}
              >
                Documents
                {application.documents && application.documents.length > 0 && (
                  <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-100">
                    {application.documents.length}
                  </span>
                )}
              </button>
            </nav>
          </div>
          
          <div className="p-6">
            {activeTab === 'details' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Full Name</p>
                      <p className="mt-1 text-sm text-gray-900">{application.name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">ID Number</p>
                      <p className="mt-1 text-sm text-gray-900">{application.idNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Email Address</p>
                      <p className="mt-1 text-sm text-gray-900">{application.email}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Phone Number</p>
                      <p className="mt-1 text-sm text-gray-900">{application.phone || 'Not provided'}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Loan Information</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Loan Type</p>
                      <p className="mt-1 text-sm text-gray-900">{application.loanType}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Loan Amount</p>
                      <p className="mt-1 text-sm text-gray-900">{application.amount}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Security Type</p>
                      <p className="mt-1 text-sm text-gray-900">{application.securityType}</p>
                    </div>
                    {application.message && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">Additional Message</p>
                        <p className="mt-1 text-sm text-gray-900">{application.message}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div>
                {!application.documents || application.documents.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No documents</h3>
                    <p className="mt-1 text-sm text-gray-500">No documents were uploaded with this application.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {application.documents.map((doc, index) => (
                      <div
                        key={index}
                        className="border rounded-lg p-4 hover:shadow-md cursor-pointer transition-all duration-200 hover:-translate-y-1"
                        onClick={() => setSelectedDocument(doc.url)}
                      >
                        <div className="flex items-center">
                          <FileText className="h-8 w-8 text-[#48A7A7]" />
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">
                              {doc.name || `Document ${index + 1}`}
                            </p>
                            <p className="text-xs text-gray-500">
                              {doc.type || 'Unknown type'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default ApplicationDetails;
