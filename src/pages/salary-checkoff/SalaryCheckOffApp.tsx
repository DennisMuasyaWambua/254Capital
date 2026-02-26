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
  | 'reconciliation';

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
              <div className="p-6">Pending Applications List (Placeholder)</div>
            );
          case 'payroll':
            return <div className="p-6">Payroll & Deductions (Placeholder)</div>;
          default:
            return <HRDashboard onNavigate={handleNavigate} />;
        }
      case 'admin':
        switch (currentPage) {
          case 'dashboard':
            return <AdminDashboard onNavigate={handleNavigate} />;
          case 'employers':
            return <div className="p-6">Employer Management (Placeholder)</div>;
          case 'disbursements':
            return (
              <div className="p-6">Disbursement Tracking (Placeholder)</div>
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
