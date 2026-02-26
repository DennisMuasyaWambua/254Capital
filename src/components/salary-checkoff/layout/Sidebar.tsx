import React from 'react';
import {
  LayoutDashboard,
  FileText,
  Calendar,
  Bell,
  HelpCircle,
  Users,
  Briefcase,
  CreditCard,
  BarChart,
  Settings,
  LogOut,
  Menu,
  X } from
'lucide-react';
interface SidebarProps {
  role: 'employee' | 'hr' | 'admin';
  currentPage: string;
  onNavigate: (page: string) => void;
  isOpen: boolean;
  onClose: () => void;
}
export function Sidebar({
  role,
  currentPage,
  onNavigate,
  isOpen,
  onClose
}: SidebarProps) {
  const employeeLinks = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard
  },
  {
    id: 'apply-loan',
    label: 'Apply for Loan',
    icon: FileText
  },
  {
    id: 'repayment',
    label: 'Repayment Schedule',
    icon: Calendar
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: Bell
  },
  {
    id: 'help',
    label: 'Help & Support',
    icon: HelpCircle
  }];

  const hrLinks = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard
  },
  {
    id: 'pending-applications',
    label: 'Pending Applications',
    icon: FileText
  },
  {
    id: 'active-loans',
    label: 'Active Loans',
    icon: Users
  },
  {
    id: 'payroll',
    label: 'Payroll & Deductions',
    icon: CreditCard
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: BarChart
  }];

  const adminLinks = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard
  },
  {
    id: 'applications',
    label: 'All Applications',
    icon: FileText
  },
  {
    id: 'employers',
    label: 'Employers',
    icon: Briefcase
  },
  {
    id: 'disbursements',
    label: 'Disbursements',
    icon: CreditCard
  },
  {
    id: 'reconciliation',
    label: 'Reconciliation',
    icon: BarChart
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings
  }];

  const links =
  role === 'employee' ? employeeLinks : role === 'hr' ? hrLinks : adminLinks;
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen &&
      <div
        className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
        onClick={onClose} />

      }

      {/* Sidebar */}
      <aside
        className={`
        fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-screen
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>

        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-[#11103a] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">254</span>
              </div>
              <span className="text-lg font-bold text-slate-900">Capital</span>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden text-slate-500 hover:text-slate-700">

              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = currentPage === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => {
                    onNavigate(link.id);
                    onClose();
                  }}
                  className={`
                    nav-item-transition w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg
                    ${isActive ? 'bg-[#E0F2F2] text-[#008080]' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
                  `}>

                  <Icon
                    className={`mr-3 h-5 w-5 ${isActive ? 'text-[#008080]' : 'text-slate-400'}`} />

                  {link.label}
                </button>);

            })}
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-slate-100">
            <div className="flex items-center px-3 py-2 space-x-3">
              <div className="h-9 w-9 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-medium">
                {role === 'employee' ? 'JK' : role === 'hr' ? 'MW' : 'AD'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">
                  {role === 'employee' ?
                  'John Kamau' :
                  role === 'hr' ?
                  'Mary Wanjiku' :
                  'Admin User'}
                </p>
                <p className="text-xs text-slate-500 truncate capitalize">
                  {role}
                </p>
              </div>
              <button className="text-slate-400 hover:text-slate-600">
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>);

}