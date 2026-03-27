import React, { useState, useEffect } from 'react';
import { Card } from '@/components/salary-checkoff/ui/Card';
import { StatCard } from '@/components/salary-checkoff/ui/StatCard';
import { Button } from '@/components/salary-checkoff/ui/Button';
import { Badge } from '@/components/salary-checkoff/ui/Badge';
import { Table } from '@/components/salary-checkoff/ui/Table';
import { authService } from '@/services/salary-checkoff/auth.service';
import { loanService, LoanApplication } from '@/services/salary-checkoff/loan.service';
import {
  Wallet,
  Calendar,
  PiggyBank,
  Clock,
  ArrowRight,
  Download,
  Plus,
  Check,
  Loader2 } from
'lucide-react';
interface EmployeeDashboardProps {
  onNavigate: (page: string) => void;
  userName?: string;
}
export function EmployeeDashboard({ onNavigate, userName: propUserName }: EmployeeDashboardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState(propUserName || '');
  const [recentApplications, setRecentApplications] = useState<any[]>([]);
  const [activeLoan, setActiveLoan] = useState<LoanApplication | null>(null);
  const [stats, setStats] = useState({
    activeLoanAmount: 0,
    monthlyDeduction: 0,
    remainingBalance: 0,
    nextDeduction: '',
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);

      // Fetch user profile only if userName not provided
      if (!propUserName) {
        const profile = await authService.getProfile();
        const fullName = `${profile.first_name} ${profile.last_name}`.trim();
        setUserName(fullName || profile.first_name);
      }

      // Fetch loan applications
      const applicationsResponse = await loanService.listApplications({ page: 1 });

      // Get recent applications (last 3)
      const formattedApplications = applicationsResponse.results.slice(0, 3).map(app => ({
        id: app.application_number,
        amount: `KES ${parseFloat(app.principal_amount).toLocaleString()}`,
        date: new Date(app.created_at).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' }),
        status: app.status,
      }));
      setRecentApplications(formattedApplications);

      // Find active/disbursed loan for stats
      const activeLoans = applicationsResponse.results.filter(
        app => app.status === 'disbursed' || app.status === 'approved'
      );

      if (activeLoans.length > 0) {
        const loan = activeLoans[0];
        setActiveLoan(loan);

        // Calculate remaining balance (simplified - would need repayment data from API)
        const totalRepayment = parseFloat(loan.total_repayment);
        const monthlyDeduction = parseFloat(loan.monthly_deduction);

        // Estimate months elapsed (simplified calculation)
        const disbursementDate = new Date(loan.disbursement_date || loan.created_at);
        const today = new Date();
        const monthsElapsed = Math.max(0,
          (today.getFullYear() - disbursementDate.getFullYear()) * 12 +
          (today.getMonth() - disbursementDate.getMonth())
        );
        const paidAmount = monthlyDeduction * monthsElapsed;
        const remainingBalance = Math.max(0, totalRepayment - paidAmount);

        // Calculate next deduction date (25th of current or next month)
        const nextDeduction = new Date();
        if (today.getDate() >= 25) {
          nextDeduction.setMonth(nextDeduction.getMonth() + 1);
        }
        nextDeduction.setDate(25);

        setStats({
          activeLoanAmount: parseFloat(loan.principal_amount),
          monthlyDeduction: monthlyDeduction,
          remainingBalance: remainingBalance,
          nextDeduction: nextDeduction.toLocaleDateString('en-KE', { day: 'numeric', month: 'short' }),
        });
      }
    } catch (error: any) {
      console.error('Error loading dashboard data:', error);
      setError(error.message || 'Failed to load dashboard data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const columns = [
  {
    header: 'Application ID',
    accessor: 'id'
  },
  {
    header: 'Amount',
    accessor: 'amount'
  },
  {
    header: 'Date',
    accessor: 'date'
  },
  {
    header: 'Status',
    accessor: (item: any) =>
    <Badge variant={item.status}>{item.status}</Badge>

  },
  {
    header: 'Action',
    accessor: () =>
    <button className="text-[#00BCD4] hover:underline text-sm font-medium">
          View
        </button>

  }];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[#008080]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="text-red-600 text-center">
          <p className="font-semibold">Error Loading Dashboard</p>
          <p className="text-sm mt-2">{error}</p>
        </div>
        <Button onClick={loadDashboardData}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome back, {userName || 'User'}! 👋
          </h1>
          <p className="text-slate-500">
            Here's what's happening with your loans today.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            leftIcon={<Download className="h-4 w-4" />}
            onClick={() => onNavigate('repayment')}>

            Statement
          </Button>
          <Button
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => onNavigate('apply-loan')}>

            Apply for Loan
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 stagger-children">
        <StatCard
          label="Active Loan Amount"
          value={stats.activeLoanAmount > 0 ? `KES ${stats.activeLoanAmount.toLocaleString()}` : 'No Active Loan'}
          icon={<Wallet className="h-6 w-6 text-[#00838F]" />}
          color="teal" />

        <StatCard
          label="Monthly Deduction"
          value={stats.monthlyDeduction > 0 ? `KES ${Math.round(stats.monthlyDeduction).toLocaleString()}` : 'N/A'}
          icon={<Calendar className="h-6 w-6 text-blue-700" />}
          color="blue" />

        <StatCard
          label="Remaining Balance"
          value={stats.remainingBalance > 0 ? `KES ${Math.round(stats.remainingBalance).toLocaleString()}` : 'N/A'}
          icon={<PiggyBank className="h-6 w-6 text-purple-700" />}
          color="purple" />

        <StatCard
          label="Next Deduction"
          value={stats.nextDeduction || 'N/A'}
          icon={<Clock className="h-6 w-6 text-amber-700" />}
          color="amber" />

      </div>

      {/* Application Tracker */}
      {activeLoan && (
        <Card title="Current Application Status" className="overflow-visible">
          <div className="relative py-8 px-4">
            <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 hidden md:block" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
              {[
              {
                label: 'Submitted',
                status: activeLoan.status === 'submitted' ? 'current' : ['approved', 'disbursed'].includes(activeLoan.status) ? 'completed' : 'upcoming',
                date: new Date(activeLoan.created_at).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' })
              },
              {
                label: '254 Review',
                status: activeLoan.status === 'submitted' ? 'current' : ['approved', 'disbursed'].includes(activeLoan.status) ? 'completed' : 'upcoming',
                date: activeLoan.status === 'submitted' ? 'In Review' : activeLoan.status === 'approved' || activeLoan.status === 'disbursed' ? 'Reviewed' : 'Pending'
              },
              {
                label: 'Approved',
                status: activeLoan.status === 'approved' ? 'current' : activeLoan.status === 'disbursed' ? 'completed' : 'upcoming',
                date: activeLoan.status === 'approved' || activeLoan.status === 'disbursed' ? 'Approved' : 'Pending'
              },
              {
                label: 'Disbursed',
                status: activeLoan.status === 'disbursed' ? 'completed' : 'upcoming',
                date: activeLoan.status === 'disbursed' && activeLoan.disbursement_date ? new Date(activeLoan.disbursement_date).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' }) : 'Pending'
              }].
              map((step, index) =>
              <div
                key={index}
                className="flex flex-col items-center relative z-10">

                  <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center border-4 mb-3 transition-all duration-300
                    ${step.status === 'completed' ? 'bg-[#008080] border-[#E0F2F2] text-white animate-check-in' : step.status === 'current' ? 'bg-white border-[#008080] text-[#008080]' : 'bg-white border-slate-200 text-slate-300'}
                  `}>

                    {step.status === 'completed' ?
                  <Check className="h-5 w-5" /> :

                  <span className="font-bold">{index + 1}</span>
                  }
                  </div>
                  <h4
                  className={`font-medium text-sm ${step.status === 'upcoming' ? 'text-slate-400' : 'text-slate-900'}`}>

                    {step.label}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">{step.date}</p>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Recent Applications Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card
            title="Recent Applications"
            action={
            <button className="text-sm text-[#008080] font-medium hover:underline flex items-center">
                View All <ArrowRight className="h-4 w-4 ml-1" />
              </button>
            }>

{recentApplications.length > 0 ? (
              <Table
                data={recentApplications}
                columns={columns}
                keyExtractor={(item) => item.id} />
            ) : (
              <div className="text-center py-8">
                <p className="text-slate-600">No loan applications yet</p>
                <Button
                  onClick={() => onNavigate('apply-loan')}
                  className="mt-4"
                  size="sm"
                >
                  Apply for your first loan
                </Button>
              </div>
            )}

          </Card>
        </div>

        {/* Quick Help / FAQ */}
        <Card title="Need Help?">
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
              <h4 className="font-medium text-slate-900 mb-1">
                How is interest calculated?
              </h4>
              <p className="text-sm text-slate-600">
                We charge a flat rate of 5% on the principal amount for the
                entire loan duration.
              </p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
              <h4 className="font-medium text-slate-900 mb-1">
                When is the repayment due?
              </h4>
              <p className="text-sm text-slate-600">
                Deductions are made automatically from your salary on the 25th
                of every month.
              </p>
            </div>
            <Button variant="outline" className="w-full">
              Contact Support
            </Button>
          </div>
        </Card>
      </div>
    </div>);

}