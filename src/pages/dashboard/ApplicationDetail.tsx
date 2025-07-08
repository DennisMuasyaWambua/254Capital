import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Check, Clock, Download, Edit, Mail, Phone, User, X, Save } from 'lucide-react';
import { getLoanApplicationById, updateLoanApplication, LoanApplication, LoanDocument } from '../../lib/loanApplicationsDb';
import { formatCurrency, formatDate, formatPhoneNumber } from '../../utils/formatters';
import { sendEmail, generateLoanStatusUpdateEmail, LoanStatusUpdateData } from '../../lib/emailService';

// Loan types and security types for dropdown options
const loanTypes = [
  'Topup Loan',
  'Sacco lending Loan',
  'Supply chain financing Loan',
  'Salary check off Loans',
  'LPO financing Loans',
  'Invoice discounting loans',
  'Logbook loans',
  'Bridging loans',
  'Bid bonds loans'
];

const securityTypes = [
  'Title Deed',
  'Vehicle Logbook',
  'Shares Certificate',
  'Fixed Deposit',
  'Guarantors',
  'Invoice',
  'LPO/Contract',
  'Salary'
];

const ApplicationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [application, setApplication] = useState<LoanApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<LoanApplication>>({});

  useEffect(() => {
    if (id) {
      const app = getLoanApplicationById(id);
      setApplication(app);
      if (app) {
        setEditFormData({
          name: app.name,
          idNumber: app.idNumber,
          email: app.email,
          phone: app.phone,
          loanType: app.loanType,
          amount: app.amount,
          amountValue: app.amountValue,
          securityType: app.securityType,
          message: app.message || '',
          status: app.status
        });
      }
      setLoading(false);
    }
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^0-9]/g, '');
    const numericValue = parseInt(rawValue, 10) || 0;
    
    setEditFormData(prev => ({
      ...prev,
      amount: `KES ${numericValue.toLocaleString()}`,
      amountValue: numericValue
    }));
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!application || !id) return;
    
    setUpdating(true);
    
    try {
      // Update application
      const updatedApp = updateLoanApplication(id, editFormData);
      
      if (updatedApp) {
        setApplication(updatedApp);
        setIsEditModalOpen(false);
        
        // Send email notification if status changed
        if (editFormData.status && editFormData.status !== application.status) {
          await sendEmail({
            to: updatedApp.email,
            subject: `Your Loan Application Status: ${editFormData.status.toUpperCase()}`,
            body: generateLoanStatusUpdateEmail({
              name: updatedApp.name,
              loanType: updatedApp.loanType,
              amount: updatedApp.amount,
              status: updatedApp.status as 'pending' | 'approved' | 'rejected'
            })
          });
        }
        
        // Show success message
        alert('Application updated successfully');
      } else {
        alert('Failed to update application');
      }
    } catch (error) {
      console.error('Error updating application:', error);
      alert('An error occurred while updating the application');
    } finally {
      setUpdating(false);
    }
  };

  const handleStatusChange = async (newStatus: 'pending' | 'approved' | 'rejected') => {
    if (!application || !id) return;
    
    setUpdating(true);
    
    try {
      // Update application status
      const updatedApp = {
        ...application,
        status: newStatus,
        updatedAt: new Date().toISOString()
      };
      
      updateLoanApplication(id, updatedApp);
      setApplication(updatedApp);
      
      // Send email notification about status change
      await sendEmail({
        to: application.email,
        subject: `Your Loan Application Status: ${newStatus.toUpperCase()}`,
        body: generateLoanStatusUpdateEmail({
          name: application.name,
          loanType: application.loanType,
          amount: application.amount,
          status: newStatus
        })
      });
      
      // Show success message
      alert(`Application status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating application status:', error);
      alert('Failed to update application status');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#48A7A7]"></div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <X className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                Application not found. The application may have been deleted.
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={() => navigate('/dashboard/applications')}
          className="flex items-center text-[#48A7A7] hover:text-[#48A7A7]/80"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Applications
        </button>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">Approved</span>;
      case 'rejected':
        return <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">Rejected</span>;
      default:
        return <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">Pending</span>;
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <button
          onClick={() => navigate('/dashboard/applications')}
          className="flex items-center text-[#48A7A7] hover:text-[#48A7A7]/80"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Applications
        </button>
        <div className="flex space-x-2">
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center bg-[#48A7A7] hover:bg-[#48A7A7]/90 text-white px-3 py-1 rounded-md text-sm"
          >
            <Edit className="mr-1 h-4 w-4" />
            Edit Application
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">{application.name}</h1>
              <p className="text-sm text-gray-500">{application.id}</p>
            </div>
            <div>
              {getStatusBadge(application.status)}
            </div>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Personal Information</h2>
            <div className="space-y-3">
              <div className="flex items-start">
                <User className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-500">ID Number</p>
                  <p className="text-gray-900">{application.idNumber}</p>
                </div>
              </div>
              <div className="flex items-start">
                <Mail className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="text-gray-900">{application.email}</p>
                </div>
              </div>
              <div className="flex items-start">
                <Phone className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Phone</p>
                  <p className="text-gray-900">{formatPhoneNumber(application.phone)}</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Loan Details</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-500">Loan Type</p>
                <p className="text-gray-900">{application.loanType}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Amount</p>
                <p className="text-gray-900 font-semibold">{application.amount}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Security Type</p>
                <p className="text-gray-900">{application.securityType}</p>
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Additional Information</h2>
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-gray-700 whitespace-pre-line">{application.message || 'No additional information provided.'}</p>
            </div>
          </div>

          <div className="md:col-span-2">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Documents</h2>
            <div className="bg-gray-50 p-4 rounded-md">
              {application.documents && application.documents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {application.documents.map((doc: LoanDocument, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white rounded-md border">
                      <span className="text-sm truncate">{doc.name}</span>
                      <button className="text-[#48A7A7] hover:text-[#48A7A7]/80">
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No documents uploaded</p>
              )}
            </div>
          </div>

          <div className="md:col-span-2">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Timeline</h2>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <Clock className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900">Application Created</p>
                  <p className="text-sm text-gray-500">{formatDate(application.createdAt)}</p>
                </div>
              </div>
              {application.createdAt !== application.updatedAt && (
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                      <Calendar className="h-4 w-4 text-purple-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">Last Updated</p>
                    <p className="text-sm text-gray-500">{formatDate(application.updatedAt)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 bg-gray-50 border-t">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Update Status</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => handleStatusChange('pending')}
              disabled={application.status === 'pending' || updating}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                application.status === 'pending'
                  ? 'bg-yellow-100 text-yellow-800 cursor-not-allowed'
                  : 'bg-yellow-500 text-white hover:bg-yellow-600'
              }`}
            >
              Mark as Pending
            </button>
            <button
              onClick={() => handleStatusChange('approved')}
              disabled={application.status === 'approved' || updating}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                application.status === 'approved'
                  ? 'bg-green-100 text-green-800 cursor-not-allowed'
                  : 'bg-green-500 text-white hover:bg-green-600'
              }`}
            >
              <Check className="inline-block mr-1 h-4 w-4" />
              Approve
            </button>
            <button
              onClick={() => handleStatusChange('rejected')}
              disabled={application.status === 'rejected' || updating}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                application.status === 'rejected'
                  ? 'bg-red-100 text-red-800 cursor-not-allowed'
                  : 'bg-red-500 text-white hover:bg-red-600'
              }`}
            >
              <X className="inline-block mr-1 h-4 w-4" />
              Reject
            </button>
          </div>
        </div>
      </div>
      
      {/* Edit Application Modal */}
      {isEditModalOpen && application && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto py-10">
          <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-900">Edit Application</h3>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <h2 className="text-lg font-semibold mb-4 text-gray-800">Personal Information</h2>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={editFormData.name || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#48A7A7] focus:border-[#48A7A7]"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="idNumber" className="block text-sm font-medium text-gray-700 mb-1">ID Number</label>
                      <input
                        type="text"
                        id="idNumber"
                        name="idNumber"
                        value={editFormData.idNumber || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#48A7A7] focus:border-[#48A7A7]"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={editFormData.email || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#48A7A7] focus:border-[#48A7A7]"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={editFormData.phone || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#48A7A7] focus:border-[#48A7A7]"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-lg font-semibold mb-4 text-gray-800">Loan Details</h2>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="loanType" className="block text-sm font-medium text-gray-700 mb-1">Loan Type</label>
                      <select
                        id="loanType"
                        name="loanType"
                        value={editFormData.loanType || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#48A7A7] focus:border-[#48A7A7]"
                        required
                      >
                        <option value="">Select Loan Type</option>
                        {loanTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">Amount (KES)</label>
                      <input
                        type="text"
                        id="amount"
                        name="amount"
                        value={(editFormData.amount?.replace('KES ', '')) || ''}
                        onChange={handleAmountChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#48A7A7] focus:border-[#48A7A7]"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="securityType" className="block text-sm font-medium text-gray-700 mb-1">Security Type</label>
                      <select
                        id="securityType"
                        name="securityType"
                        value={editFormData.securityType || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#48A7A7] focus:border-[#48A7A7]"
                        required
                      >
                        <option value="">Select Security Type</option>
                        {securityTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select
                        id="status"
                        name="status"
                        value={editFormData.status || 'pending'}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#48A7A7] focus:border-[#48A7A7]"
                        required
                      >
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-4 text-gray-800">Additional Information</h2>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    value={editFormData.message || ''}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#48A7A7] focus:border-[#48A7A7]"
                  ></textarea>
                </div>
              </div>

              <div className="flex justify-end border-t pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="mr-3 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-4 py-2 bg-[#48A7A7] text-white rounded-md hover:bg-[#48A7A7]/90 flex items-center"
                >
                  {updating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationDetail;
