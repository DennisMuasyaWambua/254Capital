import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { LoanApplication, getLoanApplicationById, updateLoanApplication } from '../../lib/loanApplicationsDb';

const EditApplication = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [application, setApplication] = useState<LoanApplication | null>(null);
  const [formData, setFormData] = useState<Partial<LoanApplication>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const appData = getLoanApplicationById(id);
      setApplication(appData);
      
      if (appData) {
        setFormData({
          name: appData.name,
          idNumber: appData.idNumber,
          email: appData.email,
          phone: appData.phone || '',
          loanType: appData.loanType,
          amount: appData.amount,
          securityType: appData.securityType,
          message: appData.message || '',
          status: appData.status
        });
      }
      
      setLoading(false);
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!application || !id) return;
    
    setIsSubmitting(true);
    
    try {
      // Update the application
      updateLoanApplication(id, formData);
      
      // Show success message
      setIsSuccess(true);
      
      // Navigate back after a delay
      setTimeout(() => {
        navigate(`/dashboard/applications/${id}`);
      }, 1500);
    } catch (error) {
      console.error('Error updating application:', error);
      alert('There was an error updating the application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const loanTypes = [
    "Topup Loan",
    "Sacco lending Loan",
    "Supply chain financing Loan",
    "Salary check off Loans",
    "LPO financing Loans",
    "Invoice discounting loans",
    "Logbook loans",
    "Bridging loans",
    "Bid bonds loans"
  ];

  const securityTypes = [
    "Title Deed",
    "Vehicle Logbook",
    "Shares Certificate",
    "Fixed Deposit",
    "Guarantors",
    "Invoice",
    "LPO/Contract",
    "Salary"
  ];

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
      <div className="mb-6 flex items-center">
        <Button 
          onClick={() => navigate(`/dashboard/applications/${id}`)}
          variant="outline"
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">Edit Application {application.id}</h1>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        {isSuccess ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-10 w-10 text-green-500" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">Application Updated</h3>
            <p className="text-gray-500">The application has been successfully updated.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#48A7A7] focus:border-[#48A7A7]"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="idNumber" className="block text-sm font-medium text-gray-700 mb-1">
                      ID Number
                    </label>
                    <input
                      type="text"
                      id="idNumber"
                      name="idNumber"
                      value={formData.idNumber || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#48A7A7] focus:border-[#48A7A7]"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#48A7A7] focus:border-[#48A7A7]"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#48A7A7] focus:border-[#48A7A7]"
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Loan Information</h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="loanType" className="block text-sm font-medium text-gray-700 mb-1">
                      Loan Type
                    </label>
                    <select
                      id="loanType"
                      name="loanType"
                      value={formData.loanType || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#48A7A7] focus:border-[#48A7A7]"
                      required
                    >
                      <option value="">Select Loan Type</option>
                      {loanTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                      Loan Amount
                    </label>
                    <input
                      type="text"
                      id="amount"
                      name="amount"
                      value={formData.amount || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#48A7A7] focus:border-[#48A7A7]"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="securityType" className="block text-sm font-medium text-gray-700 mb-1">
                      Security Type
                    </label>
                    <select
                      id="securityType"
                      name="securityType"
                      value={formData.securityType || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#48A7A7] focus:border-[#48A7A7]"
                      required
                    >
                      <option value="">Select Security Type</option>
                      {securityTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                      Application Status
                    </label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#48A7A7] focus:border-[#48A7A7]"
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
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                Additional Message
              </label>
              <textarea
                id="message"
                name="message"
                rows={4}
                value={formData.message || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#48A7A7] focus:border-[#48A7A7]"
              />
            </div>
            
            <div className="flex justify-end">
              <Button
                type="button"
                onClick={() => navigate(`/dashboard/applications/${id}`)}
                className="bg-white hover:bg-gray-100 text-[#15133F] rounded-md px-4 py-2 text-sm font-medium mr-3"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#48A7A7] hover:bg-[#48A7A7]/90 text-white rounded-md px-4 py-2 text-sm flex items-center"
              >
                {isSubmitting ? 'Saving...' : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
};

export default EditApplication;
