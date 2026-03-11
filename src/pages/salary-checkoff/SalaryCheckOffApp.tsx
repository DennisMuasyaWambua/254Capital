import React, { useState } from 'react';
import { Sidebar } from '@/components/salary-checkoff/layout/Sidebar';
import { Header } from '@/components/salary-checkoff/layout/Header';
import { LoginPage } from './auth/LoginPage';
import { RegisterPage } from './auth/RegisterPage';
import { EmployeeDashboard } from './employee/EmployeeDashboard';
import { LoanApplication } from './employee/LoanApplication';
import { RepaymentSchedule } from './employee/RepaymentSchedule';
import { HRDashboard } from './hr/HRDashboard';
import { ApplicationReview } from './hr/ApplicationReview';
import { AdminDashboard } from './admin/AdminDashboard';
import { ExistingClients } from './admin/ExistingClients';
import { PendingApprovals } from './admin/PendingApprovals';
import { RecordPayment } from './admin/RecordPayment';
import { MonthlyReconciliation } from './admin/MonthlyReconciliation';
import { OnboardEmployer } from './admin/OnboardEmployer';

type Role = 'employee' | 'hr' | 'admin' | null;
type Page =
  | 'login'
  | 'register'
  | 'dashboard'
  | 'apply-loan'
  | 'repayment'
  | 'notifications'
  | 'pending-applications'
  | 'application-review'
  | 'payroll'
  | 'applications'
  | 'employers'
  | 'disbursements'
  | 'reconciliation'
  | 'existing-clients'
  | 'pending-approvals'
  | 'record-payment'
  | 'monthly-reconciliation'
  | 'onboard-employer';

export function SalaryCheckOffApp() {
  const [role, setRole] = useState<Role>(null);
  const [currentPage, setCurrentPage] = useState<Page>('login');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogin = (userRole: Role) => {
    setRole(userRole);
    setCurrentPage('dashboard');
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page as Page);
    setIsSidebarOpen(false);
  };

  // Render content based on role and current page
  const renderContent = () => {
    if (!role) {
      if (currentPage === 'register') {
        return (
          <RegisterPage
            onBackToLogin={() => setCurrentPage('login')}
            onRegisterSuccess={() => setCurrentPage('login')}
          />
        );
      }
      return (
        <LoginPage
          onLogin={handleLogin}
          onRegisterClick={() => setCurrentPage('register')}
        />
      );
    }

    // Role-based routing logic
    switch (role) {
      case 'employee':
        switch (currentPage) {
          case 'dashboard':
            return <EmployeeDashboard onNavigate={handleNavigate} />;
          case 'apply-loan':
            return (
              <LoanApplication
                onCancel={() => handleNavigate('dashboard')}
                onSubmitSuccess={() => handleNavigate('dashboard')}
              />
            );
          case 'repayment':
            return <RepaymentSchedule />;
          default:
            return <EmployeeDashboard onNavigate={handleNavigate} />;
        }
      case 'hr':
        switch (currentPage) {
          case 'dashboard':
            return <HRDashboard onNavigate={handleNavigate} />;
          case 'application-review':
            return (
              <ApplicationReview onBack={() => handleNavigate('dashboard')} />
            );
          case 'pending-applications':
            return (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <h2 className="text-xl font-semibold text-slate-900 mb-2">Pending Applications</h2>
                  <p className="text-slate-600">This feature is coming soon. Please use the dashboard to review applications.</p>
                </div>
              </div>
            );
          case 'payroll':
            return (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <h2 className="text-xl font-semibold text-slate-900 mb-2">Payroll & Deductions</h2>
                  <p className="text-slate-600">This feature is coming soon.</p>
                </div>
              </div>
            );
          default:
            return <HRDashboard onNavigate={handleNavigate} />;
        }
      case 'admin':
        switch (currentPage) {
          case 'dashboard':
            return <AdminDashboard onNavigate={handleNavigate} />;
          case 'existing-clients':
            return <ExistingClients onNavigate={handleNavigate} />;
          case 'pending-approvals':
            return <PendingApprovals onNavigate={handleNavigate} />;
          case 'record-payment':
            return <RecordPayment onNavigate={handleNavigate} />;
          case 'monthly-reconciliation':
            return <MonthlyReconciliation onNavigate={handleNavigate} />;
          case 'onboard-employer':
            return <OnboardEmployer onNavigate={handleNavigate} />;
          case 'employers':
            return (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <h2 className="text-xl font-semibold text-slate-900 mb-2">Employer Management</h2>
                  <p className="text-slate-600">This feature is coming soon.</p>
                </div>
              </div>
            );
          case 'disbursements':
            return (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <h2 className="text-xl font-semibold text-slate-900 mb-2">Disbursement Tracking</h2>
                  <p className="text-slate-600">This feature is coming soon.</p>
                </div>
              </div>
            );
          default:
            return <AdminDashboard onNavigate={handleNavigate} />;
        }
      default:
        return <div>Page not found</div>;
    }
  };

  // Auth pages don't have layout
  if (!role) {
    return <div className="min-h-screen">{renderContent()}</div>;
  }

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      <Sidebar
        role={role}
        currentPage={currentPage}
        onNavigate={handleNavigate}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title={
            role === 'employee'
              ? 'Employee Portal'
              : role === 'hr'
              ? 'HR Manager Portal'
              : 'Admin Portal'
          }
          role={role}
          onMenuClick={() => setIsSidebarOpen(true)}
          onRoleChange={(newRole) => {
            setRole(newRole);
            setCurrentPage('dashboard');
          }}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto animate-fade-in">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}
