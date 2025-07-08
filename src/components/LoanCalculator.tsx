import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { X, Info, Calculator } from 'lucide-react';
import ModalPortal from './ModalPortal';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

interface LoanCalculatorProps {
  isOpen: boolean;
  onClose: () => void;
  openLoanApplication?: () => void;
}

const LoanCalculator: React.FC<LoanCalculatorProps> = ({ isOpen, onClose, openLoanApplication }) => {
  // State for form inputs
  const [loanType, setLoanType] = useState<string>('bridging');
  const [loanAmount, setLoanAmount] = useState<number>(10000);
  const [duration, setDuration] = useState<string>('10');
  
  // State for validation
  const [error, setError] = useState<string>('');
  
  // Handle validation for Short Term Loan maximum amount
  useEffect(() => {
    if (loanType === 'short-term' && loanAmount > 50000) {
      setError('Short Term Loans have a maximum limit of KES 50,000');
    } else {
      setError('');
    }
  }, [loanType, loanAmount]);

  // Calculate loan details
  const calculateLoan = () => {
    let totalRepayment = 0;
    let monthlyPayment = 0;
    let months = 0;
    let interestRate = 0;
    let interestLabel = '';
    let totalInterest = 0;

    // Skip calculation if there's an error
    if (loanType === 'short-term' && loanAmount > 50000) {
      return { totalRepayment, monthlyPayment, months, interestRate, interestLabel, totalInterest };
    }

    if (loanType === 'bridging') {
      // Bridging Loan logic
      if (duration === '10') {
        // 10 months, 60% interest over the loan period
        interestRate = 0.6;
        months = 10;
        interestLabel = '60% over loan period';
      } else {
        // 12 months, 70% interest over the loan period
        interestRate = 0.7;
        months = 12;
        interestLabel = '70% over loan period';
      }
      
      totalRepayment = loanAmount + (loanAmount * interestRate);
      monthlyPayment = totalRepayment / months;
    } else {
      // Short Term Loan logic
      if (duration === '1') {
        // 1 month, 20% interest per month
        interestRate = 0.2;
        months = 1;
        interestLabel = '20% per month';
        totalRepayment = loanAmount + (loanAmount * interestRate);
        monthlyPayment = totalRepayment; // For 1 month, monthly payment equals total repayment
      } else {
        // 2 months, 30% interest per month
        interestRate = 0.3;
        months = 2;
        interestLabel = '30% per month';
        // Using simple interest formula as specified in calculator.md
        totalRepayment = loanAmount + (loanAmount * interestRate * months);
        monthlyPayment = totalRepayment / months;
      }
    }

    totalInterest = totalRepayment - loanAmount;

    return { totalRepayment, monthlyPayment, months, interestRate, interestLabel, totalInterest };
  };

  // Update duration when loan type changes to ensure valid options
  useEffect(() => {
    // Set default duration for each loan type
    if (loanType === 'bridging') {
      setDuration('10');
    } else {
      setDuration('1');
    }
  }, [loanType]);

  const loanDetails = calculateLoan();

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleProceedToApplication = () => {
    onClose();
    // Open loan application form if provided
    if (openLoanApplication) {
      openLoanApplication();
    } else {
      // Fallback to scrolling to the form
      const loanApplicationForm = document.getElementById('loan-application-form');
      if (loanApplicationForm) {
        loanApplicationForm.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };
  
  const handleKeepCalculator = () => {
    // Keep the calculator open
    // This is for the "Loan Calculator" button that doesn't close the modal
  };

  return (
    <ModalPortal isOpen={isOpen}>
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 backdrop-blur-sm z-[9999] animate-fade-in" style={{animationDuration: '0.3s'}}>
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-auto max-h-[90vh] my-4 animate-fade-in" style={{animationDuration: '0.3s', animationDelay: '0.1s'}}>

          {/* Header */}
          <div className="bg-emerald-600 p-6 text-white">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Calculator className="h-6 w-6" />
                <h2 className="text-2xl font-bold">Loan Calculator</h2>
              </div>
              <button 
                onClick={onClose}
                className="text-white hover:text-emerald-100 transition-colors"
                aria-label="Close"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Calculator Body */}
          <div className="p-6 space-y-6">

            {/* Input Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column - Inputs */}
              <div className="space-y-6">

                {/* Loan Type */}
                <div>
                  <label htmlFor="loanType" className="block text-sm font-medium text-gray-700 mb-2">
                    Loan Type
                  </label>
                  <select
                    id="loanType"
                    value={loanType}
                    onChange={(e) => setLoanType(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  >
                    <option value="bridging">Bridging Loan</option>
                    <option value="short-term">Short Term Loan</option>
                  </select>
                </div>

                {/* Loan Amount */}
                <div>
                  <label htmlFor="loanAmount" className="block text-sm font-medium text-gray-700 mb-2">
                    Loan Amount
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-500">
                      KES
                    </span>
                    <input
                      type="number"
                      id="loanAmount"
                      value={loanAmount}
                      onChange={(e) => setLoanAmount(Number(e.target.value))}
                      min="1000"
                      max={loanType === 'short-term' ? 50000 : undefined}
                      placeholder="Enter amount"
                      className="w-full pl-14 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                    />
                  </div>
                  {error && <p className="mt-2 text-red-600 text-sm">{error}</p>}
                  <p className="mt-1 text-xs text-gray-500">
                    {loanType === 'short-term' 
                      ? 'Min: KES 1,000 | Max: KES 50,000' 
                      : 'Min: KES 1,000'}
                  </p>
                </div>

                {/* Duration */}
                <div>
                  <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                    Duration
                  </label>
                  <select
                    id="duration"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  >
                    {loanType === 'bridging' ? (
                      <>
                        <option value="10">10 months</option>
                        <option value="12">12 months</option>
                      </>
                    ) : (
                      <>
                        <option value="1">1 month</option>
                        <option value="2">2 months</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              {/* Right Column - Results */}
              <div className="bg-gray-50 p-6 rounded-xl space-y-6 border border-gray-100 transition-all duration-200 ease-out hover:shadow-sm">

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Loan Summary</h3>
                  
                  {/* Monthly Payment - Highlighted */}
                  <div className="bg-[#48A7A7]/10 p-4 rounded-lg border border-[#48A7A7]/20 mb-6 transition-all duration-200 ease-in-out hover:shadow-sm">

                    <p className="text-sm font-medium text-[#15133F]">Monthly Payment</p>
                    <p className="text-3xl font-bold text-[#48A7A7]">
                      {formatCurrency(loanDetails.monthlyPayment)}
                    </p>
                  </div>
                  
                  {/* Other Details */}
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <p className="text-sm text-gray-600">Interest Rate:</p>
                      <p className="text-sm font-medium text-gray-900">{loanDetails.interestLabel}</p>
                    </div>
                    
                    <div className="flex justify-between">
                      <p className="text-sm text-gray-600">Loan Amount:</p>
                      <p className="text-sm font-medium text-gray-900">{formatCurrency(loanAmount)}</p>
                    </div>
                    
                    <div className="flex justify-between">
                      <p className="text-sm text-gray-600">Total Interest:</p>
                      <p className="text-sm font-medium text-gray-900">{formatCurrency(loanDetails.totalInterest)}</p>
                    </div>
                    
                    <div className="flex justify-between pt-2 border-t border-gray-200">
                      <p className="text-sm font-medium text-gray-700">Total Repayment:</p>
                      <p className="text-sm font-bold text-gray-900">{formatCurrency(loanDetails.totalRepayment)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Special Notes */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 transition-all duration-200 ease-out hover:shadow-sm">

              <div className="flex gap-3">
                <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-800 mb-1">Special Notes:</p>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>Loans under 2 weeks are issued at 10% per month interest rate</li>
                    <li>5 days grace period available. Late payments incur 5% penalty per week</li>
                  </ul>
                </div>
              </div>
            </div>
            
            {/* Action Buttons - Fixed at the bottom */}
            <div className="sticky bottom-0 left-0 right-0 bg-white pt-2 pb-4 space-y-3 border-t border-gray-100 mt-4">

              <Button 
                onClick={handleProceedToApplication}
                disabled={!!error || loanAmount < 1000}
                className="w-full bg-[#48A7A7] hover:bg-[#48A7A7]/90 text-white rounded-md px-4 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ease-in-out hover:shadow-sm"
              >
                Apply Now
              </Button>
              <Button 
                onClick={handleKeepCalculator}
                disabled={!!error || loanAmount < 1000}
                variant="outline"
                className="w-full bg-white hover:bg-gray-100 text-[#15133F] rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ease-in-out hover:shadow-sm"
              >
                Loan Calculator
              </Button>
            </div>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
};

export default LoanCalculator;
