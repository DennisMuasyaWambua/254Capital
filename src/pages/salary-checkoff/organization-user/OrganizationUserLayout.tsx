import React, { useState } from 'react';
import { FileText, Lock, LogOut } from 'lucide-react';
import { Button } from '@/components/salary-checkoff/ui/Button';
import { PendingApplicationsRestricted } from './PendingApplicationsRestricted';
import { ChangePasswordPage } from './ChangePasswordPage';

interface OrganizationUserLayoutProps {
  user: {
    first_name: string;
    last_name: string;
    email: string;
    organization_name: string;
    role_name: string;
    permissions: {
      can_view_loan_application: boolean;
      can_approve_loan_application: boolean;
      can_decline_loan_application: boolean;
    };
    organization_id: string;
    force_password_change: boolean;
  };
  onLogout: () => void;
}

type Tab = 'pending-applications' | 'change-password';

export function OrganizationUserLayout({ user, onLogout }: OrganizationUserLayoutProps) {
  const [activeTab, setActiveTab] = useState<Tab>(
    user.force_password_change ? 'change-password' : 'pending-applications'
  );

  const tabs = [
    {
      id: 'pending-applications' as Tab,
      label: 'Pending Applications',
      icon: FileText,
      disabled: user.force_password_change,
    },
    {
      id: 'change-password' as Tab,
      label: 'Change Password',
      icon: Lock,
      disabled: false,
    },
  ];

  const handlePasswordChangeSuccess = () => {
    // After successful password change, allow access to pending applications
    setActiveTab('pending-applications');
    // Note: You should also update the user object in your auth context
    // to set force_password_change = false
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo / Brand */}
            <div>
              <h1 className="text-xl font-bold text-slate-900">254 Capital</h1>
              <p className="text-xs text-slate-500">Loan Management System</p>
            </div>

            {/* User Info */}
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-slate-900">
                  {user.first_name} {user.last_name}
                </p>
                <p className="text-xs text-slate-500">{user.role_name}</p>
              </div>
              <Button variant="outline" size="sm" onClick={onLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Warning Banner for Password Change */}
      {user.force_password_change && activeTab !== 'change-password' && (
        <div className="bg-yellow-500 text-white py-3">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Lock className="h-5 w-5" />
                <span className="font-medium">
                  You must change your password before accessing loan applications
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveTab('change-password')}
                className="bg-white text-yellow-600 hover:bg-yellow-50"
              >
                Change Password Now
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const isDisabled = tab.disabled;

              return (
                <button
                  key={tab.id}
                  onClick={() => !isDisabled && setActiveTab(tab.id)}
                  disabled={isDisabled}
                  className={`
                    flex items-center space-x-2 px-3 py-4 border-b-2 text-sm font-medium transition-colors
                    ${isActive
                      ? 'border-[#008080] text-[#008080]'
                      : isDisabled
                      ? 'border-transparent text-slate-400 cursor-not-allowed'
                      : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                    }
                  `}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'pending-applications' && (
          <PendingApplicationsRestricted
            userPermissions={user.permissions}
            organizationId={user.organization_id}
          />
        )}

        {activeTab === 'change-password' && (
          <ChangePasswordPage
            forceChange={user.force_password_change}
            onSuccess={handlePasswordChangeSuccess}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">
                <span className="font-medium">{user.organization_name}</span> • {user.role_name}
              </p>
            </div>
            <p className="text-sm text-slate-500">
              © 2026 254 Capital. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
