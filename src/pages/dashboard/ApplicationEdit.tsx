import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { getLoanApplicationById, updateLoanApplication, LoanApplication } from '../../lib/loanApplicationsDb';
import { formatCurrency, formatDate, formatPhoneNumber } from '../../utils/formatters';
import { sendEmail, generateLoanStatusUpdateEmail, LoanStatusUpdateData } from '../../lib/emailService';
import DashboardLayout from '../../components/dashboard/DashboardLayout';

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

const ApplicationEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<LoanApplication>>({
    name: '',
    idNumber: '',
    email: '',
    phone: '',
    loanType: '',
    amount: '',
    securityType: '',
    message: '',
    status: 'pending'
  });

  useEffect(() => {
    if (id) {
      const app = getLoanApplicationById(id);
      if (app) {
        setFormData({
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
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^0-9]/g, '');
    const numericValue = parseInt(rawValue, 10) || 0;
    
    setFormData(prev => ({
      ...prev,
      amount: `KES ${numericValue.toLocaleString()}`,
      amountValue: numericValue
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!id) return;
    
    setSaving(true);
    
    try {
      // Update application
      const updatedApp = updateLoanApplication(id, formData);
      
      if (updatedApp) {
        // Show success message
        alert('Application updated successfully');
        navigate(`/dashboard/applications/${id}`);
      } else {
        alert('Failed to update application');
      }
    } catch (error) {
      console.error('Error updating application:', error);
      alert('An error occurred while updating the application');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#48A7A7]"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6 flex justify-between items-center">
          <button
            onClick={() => navigate(`/dashboard/applications/${id}`)}
            className="flex items-center text-[#48A7A7] hover:text-[#48A7A7]/80"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Application
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b">
            <h1 className="text-2xl font-semibold text-gray-900">Edit Application</h1>
            <p className="text-sm text-gray-500">{id}</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
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
                      value={formData.name}
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
                      value={formData.idNumber}
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
                      value={formData.email}
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
                      value={formData.phone}
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
                      value={formData.loanType}
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
                      value={formData.amount?.replace('KES ', '') || ''}
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
                      value={formData.securityType}
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
                      value={formData.status}
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
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#48A7A7] focus:border-[#48A7A7]"
                ></textarea>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => navigate(`/dashboard/applications/${id}`)}
                className="mr-3 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-[#48A7A7] text-white rounded-md hover:bg-[#48A7A7]/90 flex items-center"
              >
                {saving ? (
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
    </DashboardLayout>
  );
};

export default ApplicationEdit;
