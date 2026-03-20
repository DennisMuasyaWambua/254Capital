import React, { useState, useEffect } from 'react';
import { Card } from '@/components/salary-checkoff/ui/Card';
import { StatCard } from '@/components/salary-checkoff/ui/StatCard';
import { Table } from '@/components/salary-checkoff/ui/Table';
import { Badge } from '@/components/salary-checkoff/ui/Badge';
import { Button } from '@/components/salary-checkoff/ui/Button';
import { Modal } from '@/components/salary-checkoff/ui/Modal';
import { loanService, LoanApplication } from '@/services/salary-checkoff/loan.service';
import { employerService } from '@/services/salary-checkoff/employer.service';
import { reconciliationService } from '@/services/salary-checkoff/reconciliation.service';
import { notificationService } from '@/services/salary-checkoff/notification.service';
import {
  Briefcase,
  Users,
  DollarSign,
  AlertTriangle,
  ArrowRight,
  Calendar,
  Loader2 } from
'lucide-react';
import {
  getFirstDeductionDate,
  formatDeductionDate,
  getDeductionTag } from
'@/utils/salary-checkoff/deductionDate';
interface AdminDashboardProps {
  onNavigate: (page: string) => void;
  userName?: string;
}
export function AdminDashboard({ onNavigate, userName }: AdminDashboardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [recentApplications, setRecentApplications] = useState<any[]>([]);
  const [monthlyDisbursements, setMonthlyDisbursements] = useState<Array<{ month: string; amount: number; height: string }>>([]);
  const [systemAlerts, setSystemAlerts] = useState<Array<{ type: 'error' | 'warning'; title: string; message: string }>>([]);
  const [stats, setStats] = useState({
    totalEmployers: 0,
    activeLoans: 0,
    totalDisbursed: 0,
    defaultRate: 0,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<any>(null);

  useEffect(() => {
    loadAdminDashboardData();
  }, []);

  const loadAdminDashboardData = async () => {
    try {
      setIsLoading(true);

      // Fetch applications from admin queue
      const queueResponse = await loanService.adminListQueue({});

      // Format recent applications
      const formattedApplications = queueResponse.results.slice(0, 4).map((app: any) => {
        const disbursedDate = app.disbursement_date
          ? new Date(app.disbursement_date)
          : null;

        return {
          id: app.application_number,
          employer: app.employer_name || app.employer?.name || 'N/A',
          employee: app.employee_name || `${app.employee?.first_name} ${app.employee?.last_name}` || 'N/A',
          amount: `KES ${parseFloat(app.principal_amount).toLocaleString()}`,
          disbursedDate: disbursedDate,
          status: app.status,
        };
      });

      setRecentApplications(formattedApplications);

      // Calculate stats
      const activeLoans = queueResponse.results.filter(
        app => app.status === 'disbursed'
      ).length;

      const totalDisbursed = queueResponse.results
        .filter(app => app.status === 'disbursed')
        .reduce((sum, app) => sum + parseFloat(app.principal_amount), 0);

      // Fetch total employers
      let totalEmployers = 0;
      try {
        const employersResponse = await employerService.listEmployers();
        totalEmployers = employersResponse.count;
      } catch (error) {
        console.error('Error fetching employers:', error);
      }

      // Calculate monthly disbursements for last 6 months
      const monthlyData = calculateMonthlyDisbursements(queueResponse.results);
      setMonthlyDisbursements(monthlyData);

      // Fetch system alerts
      const alerts = await fetchSystemAlerts();
      setSystemAlerts(alerts);

      setStats({
        totalEmployers,
        activeLoans,
        totalDisbursed,
        defaultRate: 0, // Would need specific calculation
      });
    } catch (error) {
      console.error('Error loading admin dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateMonthlyDisbursements = (applications: any[]) => {
    const now = new Date();
    const monthsData: { [key: string]: { month: string; amount: number } } = {};

    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
      monthsData[monthKey] = { month: monthName, amount: 0 };
    }

    // Sum disbursements by month
    applications
      .filter(app => app.status === 'disbursed' && app.disbursement_date)
      .forEach(app => {
        const disbursementDate = new Date(app.disbursement_date);
        const monthKey = `${disbursementDate.getFullYear()}-${disbursementDate.getMonth()}`;
        if (monthsData[monthKey]) {
          monthsData[monthKey].amount += parseFloat(app.principal_amount);
        }
      });

    // Convert to array and calculate heights
    const dataArray = Object.values(monthsData);
    const maxAmount = Math.max(...dataArray.map(d => d.amount), 1);

    return dataArray.map(data => ({
      month: data.month,
      amount: data.amount,
      height: `${Math.max((data.amount / maxAmount) * 100, 5)}%`,
    }));
  };

  const fetchSystemAlerts = async (): Promise<Array<{ type: 'error' | 'warning'; title: string; message: string }>> => {
    const alerts: Array<{ type: 'error' | 'warning'; title: string; message: string }> = [];

    try {
      // Check for overdue remittances
      const remittances = await reconciliationService.listRemittances({ status: 'pending' });
      const now = new Date();

      remittances.results.forEach(remittance => {
        const dueDate = new Date(remittance.period_year, remittance.period_month, 5); // Assume due on 5th of next month
        const daysOverdue = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

        if (daysOverdue > 0) {
          alerts.push({
            type: 'error',
            title: 'Overdue Remittance',
            message: `${remittance.employer.name} is ${daysOverdue} days late on remittance.`,
          });
        }
      });

      // Check for pending employer approvals
      const employersResponse = await employerService.listEmployers();
      const pendingEmployers = employersResponse.results.filter(emp => !emp.is_active);

      pendingEmployers.forEach(employer => {
        alerts.push({
          type: 'warning',
          title: 'Pending Employer Approval',
          message: `${employer.name} pending onboarding review.`,
        });
      });

    } catch (error) {
      console.error('Error fetching system alerts:', error);
    }

    return alerts;
  };

  const columns = [
  {
    header: 'App ID',
    accessor: 'id'
  },
  {
    header: 'Employer',
    accessor: 'employer'
  },
  {
    header: 'Employee',
    accessor: 'employee'
  },
  {
    header: 'Amount',
    accessor: 'amount'
  },
  {
    header: 'Disbursed',
    accessor: (item: any) =>
    item.disbursedDate ?
    formatDeductionDate(item.disbursedDate) :

    <span className="text-slate-400">—</span>

  },
  {
    header: 'First Deduction',
    accessor: (item: any) => {
      if (!item.disbursedDate)
      return <span className="text-slate-400">—</span>;
      const firstDate = getFirstDeductionDate(item.disbursedDate);
      const tag = getDeductionTag(item.disbursedDate);
      return (
        <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-slate-400" />
            <span className="font-medium">
              {formatDeductionDate(firstDate)}
            </span>
            <span
            className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${tag === 'same-month' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>

              {tag === 'same-month' ? 'Same mo.' : 'Next mo.'}
            </span>
          </div>);

    }
  },
  {
    header: 'Status',
    accessor: (item: any) =>
    <Badge variant={item.status}>{item.status}</Badge>

  },
  {
    header: 'Action',
    accessor: (item: any) =>
    <button
      className="text-[#00BCD4] hover:underline text-sm font-medium"
      onClick={() => {
        setSelectedApplication(item);
        setIsModalOpen(true);
      }}>
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {userName ? `Welcome back, ${userName.split(' ')[0]}!` : 'Admin Dashboard'}
          </h1>
          <p className="text-slate-500">
            System-wide overview of employers, loans, and disbursements.
          </p>
        </div>
        <Button onClick={() => onNavigate('employers')}>
          Manage Employers
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Total Employers"
          value={stats.totalEmployers.toString()}
          icon={<Briefcase className="h-6 w-6 text-blue-600" />}
          color="blue" />

        <StatCard
          label="Active Loans"
          value={stats.activeLoans.toString()}
          icon={<Users className="h-6 w-6 text-emerald-600" />}
          color="teal" />

        <StatCard
          label="Total Disbursed"
          value={`KES ${(stats.totalDisbursed / 1000000).toFixed(2)}M`}
          icon={<DollarSign className="h-6 w-6 text-purple-600" />}
          color="purple" />

        <StatCard
          label="Default Rate"
          value={`${stats.defaultRate.toFixed(1)}%`}
          icon={<AlertTriangle className="h-6 w-6 text-red-600" />}
          color="amber" />

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart */}
        <div className="lg:col-span-2">
          <Card title="Monthly Disbursements (Last 6 Months)">
            <div className="h-64 flex items-end justify-between space-x-2 pt-4">
              {monthlyDisbursements.length > 0 ? (
                monthlyDisbursements.map((item, i) => (
                  <div
                    key={i}
                    className="flex flex-col items-center flex-1 group"
                    title={`${item.month}: KES ${item.amount.toLocaleString()}`}
                  >
                    <div className="relative w-full flex justify-center">
                      <div
                        className="w-full max-w-[40px] bg-[#E0F2F2] rounded-t-lg relative"
                        style={{
                          height: '200px'
                        }}
                      >
                        <div
                          className="absolute bottom-0 w-full bg-[#008080] group-hover:bg-[#006666] rounded-t-lg transition-all duration-300"
                          style={{
                            height: item.height
                          }}
                        />
                      </div>
                    </div>
                    <span className="text-xs text-slate-500 mt-2 font-medium">
                      {item.month}
                    </span>
                  </div>
                ))
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  No disbursement data available
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Alerts */}
        <div className="lg:col-span-1 space-y-6">
          <Card title="System Alerts">
            <div className="space-y-4">
              {systemAlerts.length > 0 ? (
                systemAlerts.slice(0, 3).map((alert, i) => (
                  <div
                    key={i}
                    className={`p-3 border rounded-lg flex items-start space-x-3 ${
                      alert.type === 'error'
                        ? 'bg-red-50 border-red-100'
                        : 'bg-amber-50 border-amber-100'
                    }`}
                  >
                    {alert.type === 'error' ? (
                      <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <Briefcase className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <h4
                        className={`text-sm font-medium ${
                          alert.type === 'error' ? 'text-red-800' : 'text-amber-800'
                        }`}
                      >
                        {alert.title}
                      </h4>
                      <p
                        className={`text-xs mt-1 ${
                          alert.type === 'error' ? 'text-red-600' : 'text-amber-600'
                        }`}
                      >
                        {alert.message}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-slate-400 text-sm">
                  No alerts at this time
                </div>
              )}
            </div>
          </Card>

          <Card title="Quick Actions">
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => onNavigate('disbursements')}>

                <DollarSign className="h-4 w-4 mr-2" /> Process Disbursements
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => onNavigate('reconciliation')}>

                <AlertTriangle className="h-4 w-4 mr-2" /> Reconcile Payments
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Recent Applications with First Deduction Date */}
      <Card
        title="Recent Disbursements"
        action={
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onNavigate('applications')}>

            View All <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        }>

        <Table
          data={recentApplications}
          columns={columns}
          keyExtractor={(item) => item.id} />

      </Card>

      {/* Disbursement Details Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedApplication(null);
        }}
        title="Disbursement Details"
        size="lg">
        {selectedApplication && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-500">Application ID</label>
                <p className="mt-1 text-base font-semibold text-slate-900">{selectedApplication.id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-500">Status</label>
                <div className="mt-1">
                  <Badge variant={selectedApplication.status}>{selectedApplication.status}</Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-500">Employer</label>
                <p className="mt-1 text-base text-slate-900">{selectedApplication.employer}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-500">Employee</label>
                <p className="mt-1 text-base text-slate-900">{selectedApplication.employee}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-500">Amount Disbursed</label>
                <p className="mt-1 text-base font-semibold text-slate-900">{selectedApplication.amount}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-500">Disbursed Date</label>
                <p className="mt-1 text-base text-slate-900">
                  {selectedApplication.disbursedDate ? formatDeductionDate(selectedApplication.disbursedDate) : '—'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-500">First Deduction</label>
                <p className="mt-1 text-base text-slate-900">
                  {selectedApplication.disbursedDate ? (
                    <>
                      {formatDeductionDate(getFirstDeductionDate(selectedApplication.disbursedDate))}
                      <span className={`ml-2 text-xs px-2 py-1 rounded-full ${getDeductionTag(selectedApplication.disbursedDate) === 'same-month' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {getDeductionTag(selectedApplication.disbursedDate) === 'same-month' ? 'Same month' : 'Next month'}
                      </span>
                    </>
                  ) : '—'}
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>);

}