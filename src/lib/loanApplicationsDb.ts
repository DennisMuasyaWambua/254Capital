// Local database implementation for loan applications using localStorage
import { v4 as uuidv4 } from 'uuid';

// Database key
const LOAN_APPLICATIONS_KEY = '254_capital_loan_applications';

// Types
export interface LoanDocument {
  name: string;
  url: string;
  type?: string;
}

export interface LoanApplication {
  id: string;
  name: string;
  idNumber: string;
  email: string;
  phone: string;
  loanType: string;
  amount: string;
  amountValue: number; // Numeric value for calculations
  securityType: string;
  message?: string;
  documents?: LoanDocument[];
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

// Helper functions for database operations
export function getLoanApplications(): LoanApplication[] {
  try {
    const applications = localStorage.getItem(LOAN_APPLICATIONS_KEY);
    if (!applications) {
      return [];
    }
    
    const parsedApps = JSON.parse(applications);
    return Array.isArray(parsedApps) ? parsedApps : [];
  } catch (error) {
    console.error('Error retrieving applications from localStorage:', error);
    return [];
  }
}

export function saveLoanApplications(applications: LoanApplication[]): void {
  localStorage.setItem(LOAN_APPLICATIONS_KEY, JSON.stringify(applications));
}

// CRUD operations for loan applications
export const createLoanApplication = (applicationData: Omit<LoanApplication, 'id' | 'status' | 'createdAt' | 'updatedAt'>): LoanApplication => {
  const applications = getLoanApplications();
  
  // Format the amount for display
  const amountValue = applicationData.amountValue;
  const formattedAmount = `KES ${amountValue.toLocaleString()}`; // Format currency manually
  
  // Create new application
  const newApplication: LoanApplication = {
    id: `APP-${String(applications.length + 1).padStart(3, '0')}`,
    ...applicationData,
    amount: formattedAmount,
    amountValue,
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  // Save application
  applications.push(newApplication);
  saveLoanApplications(applications);
  
  return newApplication;
}

export function getLoanApplicationById(id: string): LoanApplication | null {
  const applications = getLoanApplications();
  return applications.find(app => app.id === id) || null;
}

export function updateLoanApplication(id: string, applicationData: Partial<LoanApplication>): LoanApplication | null {
  const applications = getLoanApplications();
  const index = applications.findIndex(app => app.id === id);
  
  if (index === -1) return null;
  
  // If amount is being updated, format it
  let formattedAmount = applications[index].amount;
  let amountValue = applications[index].amountValue;
  
  if (applicationData.amount) {
    amountValue = parseFloat(applicationData.amount.replace(/[^0-9.-]+/g, ''));
    formattedAmount = `KES ${amountValue.toLocaleString()}`;
  }
  
  // Update application
  applications[index] = {
    ...applications[index],
    ...applicationData,
    amount: formattedAmount,
    amountValue,
    updatedAt: new Date().toISOString()
  };
  
  saveLoanApplications(applications);
  return applications[index];
}

export function deleteLoanApplication(id: string): boolean {
  // Get current applications
  const applications = getLoanApplications();
  
  // Filter out the application to delete
  const filteredApplications = applications.filter(app => app.id !== id);
  
  // If no application was removed, return false
  if (filteredApplications.length === applications.length) {
    return false;
  }
  
  // Save the filtered applications directly to localStorage
  localStorage.setItem(LOAN_APPLICATIONS_KEY, JSON.stringify(filteredApplications));
  return true;
}

// Analytics functions
export function getLoanApplicationStats(): { total: number, pending: number, approved: number, rejected: number, totalAmount: string, avgAmount: string } {
  const applications = getLoanApplications();
  
  const pending = applications.filter(app => app.status === 'pending').length;
  const approved = applications.filter(app => app.status === 'approved').length;
  const rejected = applications.filter(app => app.status === 'rejected').length;
  
  // Calculate total and average loan amounts
  const totalAmountValue = applications.reduce((sum, app) => sum + app.amountValue, 0);
  const avgAmountValue = applications.length > 0 ? totalAmountValue / applications.length : 0;
  
  return {
    total: applications.length,
    pending,
    approved,
    rejected,
    totalAmount: `KES ${totalAmountValue.toLocaleString()}`,
    avgAmount: `KES ${avgAmountValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
  };
}

// Search and filter functions
export function searchLoanApplications(query: string): LoanApplication[] {
  if (!query) return getLoanApplications();
  
  const applications = getLoanApplications();
  const lowerCaseQuery = query.toLowerCase();
  
  return applications.filter(app => 
    app.id.toLowerCase().includes(lowerCaseQuery) ||
    app.name.toLowerCase().includes(lowerCaseQuery) ||
    app.email.toLowerCase().includes(lowerCaseQuery) ||
    app.loanType.toLowerCase().includes(lowerCaseQuery)
  );
}

export function filterLoanApplicationsByStatus(status: 'all' | 'pending' | 'approved' | 'rejected'): LoanApplication[] {
  if (status === 'all') return getLoanApplications();
  
  const applications = getLoanApplications();
  return applications.filter(app => app.status === status);
}
