import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/salary-checkoff/layout/Sidebar';
import { Header } from '@/components/salary-checkoff/layout/Header';
import { LoginPage } from './auth/LoginPage';
import { RegisterPage } from './auth/RegisterPage';
import { ForgotPassword } from './auth/ForgotPassword';
import { EmployeeDashboard } from './employee/EmployeeDashboard';
import { LoanApplication } from './employee/LoanApplication';
import { RepaymentSchedule } from './employee/RepaymentSchedule';
import { HelpPage } from './employee/HelpPage';
import { HRDashboard } from './hr/HRDashboard';
import { ApplicationReview } from './hr/ApplicationReview';
import { HRActiveLoans } from './hr/HRActiveLoans';
import { PayrollDeductions } from './hr/PayrollDeductions';
import { PendingApplications } from './hr/PendingApplications';
import { AdminDashboard } from './admin/AdminDashboard';
import { AdminLoanQueue } from './admin/AdminLoanQueue';
import { DisbursementHistory } from './admin/DisbursementHistory';
import { ExistingClients } from './admin/ExistingClients';
import { PendingApprovals } from './admin/PendingApprovals';
import { RecordPayment } from './admin/RecordPayment';
import { OnboardEmployer } from './admin/OnboardEmployer';
import { Employers } from './admin/Employers';
import { CollectionReport } from './admin/CollectionReport';
import { RepaymentManagement } from './admin/RepaymentManagement';
import { HRUserManagement } from './admin/HRUserManagement';
import { MonthlyReconciliation } from './admin/MonthlyReconciliation';
import { ChangePassword } from './settings/ChangePassword';
import { Organizations, Roles, UsersManagement, AuditLogs } from './hr/company-management';
import { authService } from '@/services/salary-checkoff/auth.service';
import { Loader2 } from 'lucide-react';

type Role = 'employee' | 'hr' | 'admin' | null;
type Page =
  | 'login'
  | 'register'
  | 'forgot-password'
  | 'dashboard'
  | 'apply-loan'
  | 'repayment'
  | 'notifications'
  | 'help'
  | 'pending-applications'
  | 'application-review'
  | 'active-loans'
  | 'payroll'
  | 'applications'
  | 'loan-queue'
  | 'employers'
  | 'disbursements'
  | 'reconciliation'
  | 'existing-clients'
  | 'pending-approvals'
  | 'record-payment'
  | 'onboard-employer'
  | 'collection-report'
  | 'repayment-management'
  | 'change-password'
  | 'hr-users'
  | 'company-management-organizations'
  | 'company-management-roles'
  | 'company-management-users'
  | 'company-management-audit-logs';

export function SalaryCheckOffApp() {
  const [role, setRole] = useState<Role>(null);
  const [currentPage, setCurrentPage] = useState<Page>('login');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isRestoring, setIsRestoring] = useState(true);
  const [userName, setUserName] = useState<string | undefined>(undefined);

  // Restore session from localStorage on mount
  useEffect(() => {
    const restoreSession = async () => {
      try {
        // Check if user is authenticated
        if (authService.isAuthenticated()) {
          // Fetch user profile to get role
          const profile = await authService.getProfile();

          // Map backend role to frontend role
          let userRole: Role;
          if (profile.role === 'admin') {
            userRole = 'admin';
          } else if (profile.role === 'hr_manager') {
            userRole = 'hr';
          } else if (profile.role === 'employee') {
            userRole = 'employee';
          } else {
            userRole = null;
          }

          if (userRole) {
            setRole(userRole);

            // Set user name from profile
            const fullName = `${profile.first_name} ${profile.last_name}`.trim();
            setUserName(fullName || undefined);

            // Restore last visited page or default to dashboard
            const savedPage = localStorage.getItem('salary_checkoff_current_page') as Page;
            setCurrentPage(savedPage && savedPage !== 'login' && savedPage !== 'register' ? savedPage : 'dashboard');
          }
        }
      } catch (error) {
        console.error('Failed to restore session:', error);
        // Clear tokens if restoration fails
        authService.logout();
      } finally {
        setIsRestoring(false);
      }
    };

    restoreSession();
  }, []);

  // Save session state to localStorage whenever it changes
  useEffect(() => {
    if (role) {
      localStorage.setItem('salary_checkoff_current_page', currentPage);
    } else {
      localStorage.removeItem('salary_checkoff_current_page');
    }
  }, [role, currentPage]);

  const handleLogin = (userRole: Role) => {
    setRole(userRole);
    setCurrentPage('dashboard');
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page as Page);
    setIsSidebarOpen(false);
  };

  const handleLogout = () => {
    authService.logout();
    setRole(null);
    setCurrentPage('login');
    localStorage.removeItem('salary_checkoff_current_page');
  };

  // Show loading screen while restoring session
  if (isRestoring) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-[#008080]" />
      </div>
    );
  }

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
      if (currentPage === 'forgot-password') {
        return (
          <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <ForgotPassword
              onBack={() => setCurrentPage('login')}
              onSuccess={() => setCurrentPage('login')}
            />
          </div>
        );
      }
      return (
        <LoginPage
          onLogin={handleLogin}
          onRegisterClick={() => setCurrentPage('register')}
          onForgotPassword={() => setCurrentPage('forgot-password')}
        />
      );
    }

    // Role-based routing logic
    switch (role) {
      case 'employee':
        switch (currentPage) {
          case 'dashboard':
            return <EmployeeDashboard onNavigate={handleNavigate} userName={userName} />;
          case 'apply-loan':
            return (
              <LoanApplication
                onCancel={() => handleNavigate('dashboard')}
                onSubmitSuccess={() => handleNavigate('dashboard')}
              />
            );
          case 'repayment':
            return <RepaymentSchedule />;
          case 'help':
            return <HelpPage />;
          case 'change-password':
            return (
              <ChangePassword
                onClose={() => handleNavigate('dashboard')}
                onSuccess={() => handleLogout()}
              />
            );
          default:
            return <EmployeeDashboard onNavigate={handleNavigate} userName={userName} />;
        }
      case 'hr':
        switch (currentPage) {
          case 'dashboard':
            return <HRDashboard onNavigate={handleNavigate} userName={userName} />;
          case 'application-review':
            return (
              <ApplicationReview onBack={() => handleNavigate('dashboard')} />
            );
          case 'pending-applications':
            return <PendingApplications onNavigate={handleNavigate} />;
          case 'active-loans':
            return <HRActiveLoans onNavigate={handleNavigate} />;
          case 'payroll':
            return <PayrollDeductions />;
          case 'disbursements':
            return <DisbursementHistory onBack={() => handleNavigate('dashboard')} role="hr" />;
          case 'company-management-organizations':
            return <Organizations onNavigate={handleNavigate} />;
          case 'company-management-roles':
            return <Roles onNavigate={handleNavigate} />;
          case 'company-management-users':
            return <UsersManagement onNavigate={handleNavigate} />;
          case 'company-management-audit-logs':
            return <AuditLogs onNavigate={handleNavigate} />;
          case 'change-password':
            return (
              <ChangePassword
                onClose={() => handleNavigate('dashboard')}
                onSuccess={() => handleLogout()}
              />
            );
          default:
            return <HRDashboard onNavigate={handleNavigate} userName={userName} />;
        }
      case 'admin':
        switch (currentPage) {
          case 'dashboard':
            return <AdminDashboard onNavigate={handleNavigate} userName={userName} />;
          case 'loan-queue':
            return <AdminLoanQueue onBack={() => handleNavigate('dashboard')} />;
          case 'existing-clients':
            return <ExistingClients onNavigate={handleNavigate} />;
          case 'pending-approvals':
            return <PendingApprovals onNavigate={handleNavigate} />;
          case 'record-payment':
            return <RecordPayment onNavigate={handleNavigate} />;
          case 'onboard-employer':
            return <OnboardEmployer onNavigate={handleNavigate} />;
          case 'employers':
            return <Employers onNavigate={handleNavigate} />;
          case 'collection-report':
            return <CollectionReport role="admin" />;
          case 'disbursements':
            return <DisbursementHistory onBack={() => handleNavigate('dashboard')} role="admin" />;
          case 'repayment-management':
            return <RepaymentManagement onNavigate={handleNavigate} />;
          case 'hr-users':
            return <HRUserManagement onNavigate={handleNavigate} />;
          case 'reconciliation':
            return <MonthlyReconciliation onNavigate={handleNavigate} />;
          case 'change-password':
            return (
              <ChangePassword
                onClose={() => handleNavigate('dashboard')}
                onSuccess={() => handleLogout()}
              />
            );
          default:
            return <AdminDashboard onNavigate={handleNavigate} userName={userName} />;
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
        onLogout={handleLogout}
        userName={userName}
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
          userName={userName}
          onMenuClick={() => setIsSidebarOpen(true)}
          onRoleChange={(newRole) => {
            setRole(newRole);
            setCurrentPage('dashboard');
          }}
          onLogout={handleLogout}
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
