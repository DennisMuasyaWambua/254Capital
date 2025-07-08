import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Upload, Info, CheckCircle } from 'lucide-react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { createLoanApplication } from '../lib/loanApplicationsDb';
import { sendEmail, generateLoanApplicationEmail } from '../lib/emailService';
import { formatCurrency } from '../utils/formatters';

interface LoanApplicationFormProps {
  onSuccess?: () => void;
}

const LoanApplicationForm: React.FC<LoanApplicationFormProps> = ({ onSuccess }) => {
  const { ref, isVisible } = useScrollAnimation();
  const [formData, setFormData] = useState({
    name: '',
    idNumber: '',
    email: '',
    phone: '',
    loanType: '',
    amount: '',
    securityType: '',
    message: '',
    agreeToTerms: false
  });

  const [documents, setDocuments] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [applicationId, setApplicationId] = useState('');

  const [activeTab, setActiveTab] = useState('personal');

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileList = Array.from(e.target.files);
      setDocuments(prev => [...prev, ...fileList]);
    }
  };

  const removeDocument = (index: number) => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Convert documents to base64 strings if needed
      const documentPromises = documents.map(file => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve(reader.result as string);
          };
          reader.readAsDataURL(file);
        });
      });
      
      const documentStrings = await Promise.all(documentPromises);
      
      // Create the loan application in the database
      const newApplication = createLoanApplication({
        ...formData,
        documents: documentStrings,
        amountValue: parseFloat(formData.amount.replace(/[^0-9.-]+/g, '')) || 0
      });
      
      // Send confirmation email
      await sendEmail(generateLoanApplicationEmail(
        formData.name,
        formData.email,
        formData.loanType,
        formatCurrency(parseFloat(formData.amount) || 0),
        newApplication.id
      ));
      
      // Reset form and show success message
      setApplicationId(newApplication.id);
      setIsSubmitted(true);
      
      // Reset form after 3 seconds and call onSuccess if provided
      setTimeout(() => {
        setFormData({
          name: '',
          idNumber: '',
          email: '',
          phone: '',
          loanType: '',
          amount: '',
          securityType: '',
          message: '',
          agreeToTerms: false
        });
        setDocuments([]);
        setActiveTab('personal');
        setIsSubmitted(false);
        
        if (onSuccess) {
          onSuccess();
        }
      }, 3000);
    } catch (error) {
      console.error('Error submitting loan application:', error);
      alert('There was an error submitting your application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'personal':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#48A7A7] focus:border-[#48A7A7]"
                />
              </div>
              
              <div>
                <label htmlFor="idNumber" className="block text-sm font-medium text-gray-700 mb-1">ID Number *</label>
                <input
                  type="text"
                  id="idNumber"
                  name="idNumber"
                  value={formData.idNumber}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#48A7A7] focus:border-[#48A7A7]"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#48A7A7] focus:border-[#48A7A7]"
                />
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#48A7A7] focus:border-[#48A7A7]"
                />
              </div>
            </div>
          </div>
        );
      case 'loan':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="loanType" className="block text-sm font-medium text-gray-700 mb-1">Loan Type *</label>
                <select
                  id="loanType"
                  name="loanType"
                  value={formData.loanType}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#48A7A7] focus:border-[#48A7A7]"
                >
                  <option value="">Select a loan type</option>
                  {loanTypes.map((type, index) => (
                    <option key={index} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">Loan Amount (KES) *</label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  required
                  min="10000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#48A7A7] focus:border-[#48A7A7]"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="securityType" className="block text-sm font-medium text-gray-700 mb-1">Security Type *</label>
              <select
                id="securityType"
                name="securityType"
                value={formData.securityType}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="">Select security type</option>
                {securityTypes.map((type, index) => (
                  <option key={index} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Additional Information</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Any additional details about your loan request"
              />
            </div>
          </div>
        );
      case 'documents':
        return (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center">
              <div className="text-center">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-600 mb-1">Drag and drop your documents here, or click to browse</p>
                <p className="text-xs text-gray-500 mb-4">Accepted file types: PDF, JPG, PNG (Max 5MB each)</p>
              </div>
              <label className="cursor-pointer bg-white hover:bg-gray-100 text-[#15133F] rounded-md px-4 py-2 text-sm font-medium border border-gray-300 inline-flex items-center">
                <Upload size={16} className="mr-2" />
                Upload Documents
                <input 
                  type="file" 
                  multiple 
                  className="hidden" 
                  onChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png"
                />
              </label>
            </div>
            
            {/* Uploaded documents list */}
            {documents.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Uploaded Documents:</h4>
                <ul className="space-y-2">
                  {documents.map((file, index) => (
                    <li key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                      <span className="text-sm text-gray-700 truncate flex-1">{file.name}</span>
                      <span className="text-xs text-gray-500 mx-2">{(file.size / 1024).toFixed(0)} KB</span>
                      <button 
                        type="button" 
                        onClick={() => removeDocument(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="flex items-start">
                <Info size={16} className="text-[#48A7A7] mt-0.5 mr-2 flex-shrink-0" />
                <div className="text-sm text-gray-600">
                  <p className="font-medium mb-1">Required Documents:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Copy of ID/Passport</li>
                    <li>Proof of security (title deed, logbook, etc.)</li>
                    <li>Bank statements (last 6 months)</li>
                    <li>Any other supporting documents</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div 
      ref={ref as React.RefObject<HTMLDivElement>}
      className="w-full"
    >
      <div className="mb-6">
        <h2 className={`text-2xl font-bold text-gray-900 mb-6 transition-opacity duration-300 ease-out ${isVisible ? 'opacity-100' : 'opacity-0'}`}>Apply for a Loan</h2>
        <p className={`text-gray-700 mb-6 transition-opacity duration-300 ease-out ${isVisible ? 'opacity-100' : 'opacity-0'}`} style={{transitionDelay: '0.05s'}}>
          Complete the form below to apply for financing. Our team will review your application and contact you within 24 hours.  
        </p>

        <form onSubmit={handleSubmit} className={`space-y-6 transition-opacity duration-300 ease-out ${isVisible ? 'opacity-100' : 'opacity-0'}`} style={{transitionDelay: '0.1s'}}>
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 mb-6">
            <button
              className={`py-2 px-4 font-medium transition-colors duration-200 ease-in-out ${activeTab === 'personal' ? 'text-[#48A7A7] border-b-2 border-[#48A7A7]' : 'text-gray-500 hover:text-[#48A7A7]'}`}
              onClick={() => setActiveTab('personal')}
            >
              Personal Information
            </button>
            <button
              className={`py-2 px-4 font-medium transition-colors duration-200 ease-in-out ${activeTab === 'loan' ? 'text-[#48A7A7] border-b-2 border-[#48A7A7]' : 'text-gray-500 hover:text-[#48A7A7]'}`}
              onClick={() => setActiveTab('loan')}
            >
              Loan Details
            </button>
            <button
              className={`py-2 px-4 font-medium transition-colors duration-200 ease-in-out ${activeTab === 'documents' ? 'text-[#48A7A7] border-b-2 border-[#48A7A7]' : 'text-gray-500 hover:text-[#48A7A7]'}`}
              onClick={() => setActiveTab('documents')}
            >
              Documents
            </button>
          </div>

          {/* Tab Content */}
          <div className="py-4 transition-opacity duration-200 ease-out">
            {renderTabContent()}
          </div>
          
          {/* Custom Loan Message */}
          <div className="bg-gray-50 p-4 rounded-md transition-all duration-200 ease-out hover:shadow-sm">
            <p className="text-gray-700">
              Need a custom loan? Email us at:{' '}
              <a href="mailto:loans@254-capital.com" className="text-[#48A7A7] hover:underline">
                loans@254-capital.com
              </a>
            </p>
          </div>
          
          {/* Terms and Conditions */}
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="agreeToTerms"
                name="agreeToTerms"
                type="checkbox"
                checked={formData.agreeToTerms}
                onChange={handleChange}
                required
                className="h-4 w-4 text-[#48A7A7] focus:ring-[#48A7A7] border-gray-300 rounded"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="agreeToTerms" className="font-medium text-gray-700">
                I agree to the{' '}
                <a href="#" className="text-[#48A7A7] hover:underline">
                  Terms and Conditions
                </a>
                {' '}and{' '}
                <a href="#" className="text-[#48A7A7] hover:underline">
                  Privacy Policy
                </a>
              </label>
            </div>
          </div>
          
          {/* Success message */}
          {isSubmitted && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4 mt-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-5 w-5 text-green-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">Application Submitted Successfully</h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>Your application (ID: {applicationId}) has been received. We will review it and get back to you shortly.</p>
                    <p className="mt-1">A confirmation email has been sent to {formData.email}.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Navigation Buttons */}
          <div className="pt-4 flex justify-between">
            {activeTab !== 'personal' && (
              <Button 
                type="button" 
                onClick={() => setActiveTab(activeTab === 'loan' ? 'personal' : 'loan')}
                variant="outline"
                className="bg-white hover:bg-gray-100 text-[#15133F] rounded-md px-4 py-2 text-sm font-medium transition-all duration-200 ease-in-out hover:shadow-sm"
                disabled={isSubmitting}
              >
                Previous
              </Button>
            )}
            
            {activeTab !== 'documents' ? (
              <Button 
                type="button" 
                onClick={() => setActiveTab(activeTab === 'personal' ? 'loan' : 'documents')}
                className="ml-auto bg-[#48A7A7] hover:bg-[#48A7A7]/90 text-white rounded-md px-4 py-2 text-sm transition-all duration-200 ease-in-out hover:shadow-sm"
                disabled={isSubmitting}
              >
                Next
              </Button>
            ) : (
              <Button 
                type="submit" 
                disabled={!formData.agreeToTerms || isSubmitting}
                className="ml-auto bg-[#48A7A7] hover:bg-[#48A7A7]/90 text-white rounded-md px-4 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ease-in-out hover:shadow-sm flex items-center"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoanApplicationForm;
