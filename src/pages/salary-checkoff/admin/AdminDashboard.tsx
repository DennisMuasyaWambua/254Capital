import React, { useState, useEffect } from 'react';
import { Card } from '@/components/salary-checkoff/ui/Card';
import { StatCard } from '@/components/salary-checkoff/ui/StatCard';
import { Table } from '@/components/salary-checkoff/ui/Table';
import { Badge } from '@/components/salary-checkoff/ui/Badge';
import { Button } from '@/components/salary-checkoff/ui/Button';
import { Modal } from '@/components/salary-checkoff/ui/Modal';
import { loanService } from '@/services/salary-checkoff/loan.service';
import { employerService } from '@/services/salary-checkoff/employer.service';
import { reconciliationService } from '@/services/salary-checkoff/reconciliation.service';
import { toast } from '@/hooks/use-toast';
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
  const [historicalApplications, setHistoricalApplications] = useState<any[]>([]);
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
  const [selectedApplicationIds, setSelectedApplicationIds] = useState<Set<string>>(new Set());
  const [isMassDisburseModalOpen, setIsMassDisburseModalOpen] = useState(false);
  const [disbursementDate, setDisbursementDate] = useState('');
  const [disbursementReference, setDisbursementReference] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadAdminDashboardData();
  }, []);

  const loadAdminDashboardData = async () => {
    try {
      setIsLoading(true);

      // Fetch applications from admin queue
      const queueResponse = await loanService.adminListQueue({});

      // Separate pending and historical applications
      const pendingApps = queueResponse.results.filter(
        app => app.status !== 'disbursed'
      );
      const historicalApps = queueResponse.results.filter(
        app => app.status === 'disbursed'
      );

      // Format recent applications (pending only - showing first 4)
      const formattedApplications = pendingApps.slice(0, 4).map((app: any) => {
        const disbursedDate = app.disbursement_date
          ? new Date(app.disbursement_date)
          : null;

        return {
          id: app.application_number,
          fullData: app,
          employer: app.employer_name || app.employer?.name || 'N/A',
          employee: app.employee_name || `${app.employee?.first_name} ${app.employee?.last_name}` || 'N/A',
          amount: `KES ${parseFloat(app.principal_amount).toLocaleString()}`,
          disbursedDate: disbursedDate,
          status: app.status,
        };
      });

      // Format historical applications
      const formattedHistorical = historicalApps.slice(0, 10).map((app: any) => {
        const disbursedDate = app.disbursement_date
          ? new Date(app.disbursement_date)
          : null;

        return {
          id: app.application_number,
          fullData: app,
          employer: app.employer_name || app.employer?.name || 'N/A',
          employee: app.employee_name || `${app.employee?.first_name} ${app.employee?.last_name}` || 'N/A',
          amount: `KES ${parseFloat(app.principal_amount).toLocaleString()}`,
          disbursedDate: disbursedDate,
          status: app.status,
          disbursementMethod: app.disbursement_method,
          disbursementReference: app.disbursement_reference,
        };
      });

      setRecentApplications(formattedApplications);
      setHistoricalApplications(formattedHistorical);

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

  const handleSelectApplication = (appId: string) => {
    const newSelected = new Set(selectedApplicationIds);
    if (newSelected.has(appId)) {
      newSelected.delete(appId);
    } else {
      newSelected.add(appId);
    }
    setSelectedApplicationIds(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedApplicationIds.size === recentApplications.length) {
      setSelectedApplicationIds(new Set());
    } else {
      const allIds = new Set(recentApplications.map(app => app.id));
      setSelectedApplicationIds(allIds);
    }
  };

  const handleApproveAndDisburse = async (application: any) => {
    try {
      setIsProcessing(true);

      // Step 1: Approve if not already approved
      // Valid statuses that need approval: 'submitted', 'under_review_admin', 'under_review_hr'
      // Valid status for disbursement: 'approved'
      const needsApproval = ['submitted', 'under_review_admin', 'under_review_hr'].includes(application.fullData.status);

      if (needsApproval) {
        const approvalResponse = await loanService.adminAssess(application.fullData.id, {
          action: 'approve',
          comment: 'Approved via dashboard',
        });

        // Verify approval was successful before proceeding to disbursement
        if (!approvalResponse.application || approvalResponse.application.status !== 'approved') {
          throw new Error('Approval failed - application status not updated to approved');
        }

        toast({
          title: 'Approved',
          description: 'Application approved successfully, now disbursing...',
        });
      } else if (application.fullData.status !== 'approved') {
        // Validate status before disbursement
        throw new Error(`Invalid status: ${application.fullData.status}. Cannot approve and disburse from this status.`);
      }

      // Step 2: Disburse (only after approval is confirmed)
      await loanService.adminDisburse(application.fullData.id, {
        disbursement_date: disbursementDate || new Date().toISOString().split('T')[0],
        disbursement_method: application.fullData.disbursement_method || 'bank',
        disbursement_reference: disbursementReference || `REF-${application.id}`,
      });

      toast({
        title: 'Success',
        description: 'Application approved and disbursed successfully',
      });

      // Reload data
      await loadAdminDashboardData();

      // Close modal
      setIsModalOpen(false);
      setSelectedApplication(null);
      setDisbursementDate('');
      setDisbursementReference('');
    } catch (error: any) {
      console.error('Error approving and disbursing:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to approve and disburse',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMassDisburse = async () => {
    try {
      setIsProcessing(true);

      const selectedApps = recentApplications.filter(app =>
        selectedApplicationIds.has(app.id)
      );

      const successfulDisbursements: string[] = [];
      const failedDisbursements: Array<{ id: string; error: string }> = [];

      for (const app of selectedApps) {
        try {
          // Step 1: Approve if needed
          // Valid statuses that need approval: 'submitted', 'under_review_admin', 'under_review_hr'
          // Valid status for disbursement: 'approved'
          const needsApproval = ['submitted', 'under_review_admin', 'under_review_hr'].includes(app.fullData.status);

          if (needsApproval) {
            const approvalResponse = await loanService.adminAssess(app.fullData.id, {
              action: 'approve',
              comment: 'Mass approved via dashboard',
            });

            // Verify approval was successful before proceeding to disbursement
            if (!approvalResponse.application || approvalResponse.application.status !== 'approved') {
              failedDisbursements.push({
                id: app.id,
                error: 'Approval failed - application status not updated to approved',
              });
              continue;
            }
          } else if (app.fullData.status !== 'approved') {
            // Skip applications that are not in valid status
            failedDisbursements.push({
              id: app.id,
              error: `Invalid status: ${app.fullData.status}. Cannot approve and disburse from this status.`,
            });
            continue;
          }

          // Step 2: Disburse (only after approval is confirmed)
          await loanService.adminDisburse(app.fullData.id, {
            disbursement_date: disbursementDate || new Date().toISOString().split('T')[0],
            disbursement_method: app.fullData.disbursement_method || 'bank',
            disbursement_reference: `${disbursementReference}-${app.id}`,
          });

          successfulDisbursements.push(app.id);
        } catch (error: any) {
          console.error(`Error processing application ${app.id}:`, error);
          failedDisbursements.push({
            id: app.id,
            error: error.message || 'Unknown error',
          });
        }
      }

      // Show appropriate toast based on results
      if (successfulDisbursements.length > 0 && failedDisbursements.length === 0) {
        toast({
          title: 'Success',
          description: `Successfully approved and disbursed ${successfulDisbursements.length} application(s)`,
        });
      } else if (successfulDisbursements.length > 0 && failedDisbursements.length > 0) {
        toast({
          title: 'Partial Success',
          description: `Successfully processed ${successfulDisbursements.length} application(s). ${failedDisbursements.length} failed.`,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error',
          description: `Failed to process all ${failedDisbursements.length} application(s)`,
          variant: 'destructive',
        });
      }

      // Log failed disbursements for debugging
      if (failedDisbursements.length > 0) {
        console.error('Failed disbursements:', failedDisbursements);
      }

      // Reload data
      await loadAdminDashboardData();

      // Reset state
      setIsMassDisburseModalOpen(false);
      setSelectedApplicationIds(new Set());
      setDisbursementDate('');
      setDisbursementReference('');
    } catch (error: any) {
      console.error('Error mass disbursing:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to mass disburse',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
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
    header: '',
    accessor: (item: any) => (
      <input
        type="checkbox"
        checked={selectedApplicationIds.has(item.id)}
        onChange={() => handleSelectApplication(item.id)}
        className="w-4 h-4 text-[#008080] border-slate-300 rounded focus:ring-[#008080]"
      />
    )
  },
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

      {/* Mass Disburse Button */}
      {selectedApplicationIds.size > 1 && (
        <div className="flex justify-end">
          <Button
            onClick={() => setIsMassDisburseModalOpen(true)}
            className="bg-[#008080] hover:bg-[#006666]">
            <DollarSign className="h-4 w-4 mr-2" />
            Mass Approve & Disburse ({selectedApplicationIds.size} selected)
          </Button>
        </div>
      )}

      {/* Recent Applications with First Deduction Date */}
      <Card
        title="Pending Disbursements"
        action={
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onNavigate('loan-queue')}>

            View All <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        }>

        {/* Select All Checkbox */}
        {recentApplications.length > 0 && (
          <div className="px-6 py-3 border-b border-slate-200 bg-slate-50">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedApplicationIds.size === recentApplications.length && recentApplications.length > 0}
                onChange={handleSelectAll}
                className="w-4 h-4 text-[#008080] border-slate-300 rounded focus:ring-[#008080]"
              />
              Select All
            </label>
          </div>
        )}

        <Table
          data={recentApplications}
          columns={columns}
          keyExtractor={(item) => item.id} />

      </Card>

      {/* Historical Approvals & Disbursements */}
      {historicalApplications.length > 0 && (
        <Card
          title="Historical Approvals & Disbursements"
          action={
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate('disbursements')}>
              View All <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          }>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    App ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Employer
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Method
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Details
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Disbursed
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {historicalApplications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm font-medium text-slate-900">
                      {app.id}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {app.employer}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-900">
                      {app.employee}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-slate-900">
                      {app.amount}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {app.disbursementMethod === 'mpesa' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          M-Pesa
                        </span>
                      ) : app.disbursementMethod === 'bank' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Bank
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {app.disbursementMethod === 'mpesa' ? (
                        <div>
                          <div className="text-xs text-green-700 font-medium">M-Pesa Number:</div>
                          <div className="font-semibold text-slate-900">
                            {app.fullData?.mpesa_number || app.fullData?.employee?.phone_number || 'Not provided'}
                          </div>
                        </div>
                      ) : app.disbursementMethod === 'bank' ? (
                        <div>
                          {app.fullData?.bank_name && (
                            <div>
                              <div className="text-xs text-blue-700 font-medium">Bank:</div>
                              <div className="font-semibold text-slate-900">{app.fullData.bank_name}</div>
                            </div>
                          )}
                          {app.fullData?.bank_account_number && (
                            <div className="mt-1">
                              <div className="text-xs text-blue-700 font-medium">Account:</div>
                              <div className="font-semibold text-slate-900 font-mono text-xs">
                                {app.fullData.bank_account_number}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {app.disbursedDate ? formatDeductionDate(app.disbursedDate) : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <Badge variant={app.status}>{app.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Disbursement Details Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedApplication(null);
          setDisbursementDate('');
          setDisbursementReference('');
        }}
        title="Disbursement Details"
        size="lg">
        {selectedApplication && (
          <div className="space-y-6">
            {/* Application Overview */}
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-3">Application Overview</h3>
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
                  <label className="text-sm font-medium text-slate-500">Loan Amount</label>
                  <p className="mt-1 text-base font-semibold text-slate-900">{selectedApplication.amount}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500">Employer</label>
                  <p className="mt-1 text-base text-slate-900">{selectedApplication.employer}</p>
                </div>
              </div>
            </div>

            {/* Employee Information */}
            <div className="border-t pt-4">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">Employee Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-500">Employee Name</label>
                  <p className="mt-1 text-base font-semibold text-slate-900">{selectedApplication.employee}</p>
                </div>
                {selectedApplication.fullData?.employee?.phone_number && (
                  <div>
                    <label className="text-sm font-medium text-slate-500">Phone Number</label>
                    <p className="mt-1 text-base text-slate-900">{selectedApplication.fullData.employee.phone_number}</p>
                  </div>
                )}
                {selectedApplication.fullData?.department && (
                  <div>
                    <label className="text-sm font-medium text-slate-500">Department</label>
                    <p className="mt-1 text-base text-slate-900">{selectedApplication.fullData.department}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Details - ALWAYS SHOW ALL AVAILABLE INFORMATION */}
            <div className="border-t pt-4">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">Payment Details</h3>

              <div className="space-y-4">
                {/* Disbursement Method Badge */}
                {selectedApplication.fullData?.disbursement_method && (
                  <div>
                    <label className="text-sm font-medium text-slate-500">Preferred Disbursement Method</label>
                    <div className="mt-1">
                      {selectedApplication.fullData.disbursement_method === 'mpesa' ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-600 text-white">
                          M-Pesa
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-600 text-white">
                          Bank Transfer
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* BANK DETAILS - ALWAYS SHOW IF AVAILABLE */}
                {(selectedApplication.fullData?.bank_name || selectedApplication.fullData?.bank_account_number) && (
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      Bank Account Details
                    </h4>
                    <div className="bg-white rounded-md p-4 border border-blue-200 space-y-3">
                      {selectedApplication.fullData?.bank_name && (
                        <div>
                          <label className="text-xs font-medium text-blue-700 uppercase tracking-wide">Bank Name:</label>
                          <p className="mt-1 text-xl font-bold text-blue-900">{selectedApplication.fullData.bank_name}</p>
                        </div>
                      )}
                      {selectedApplication.fullData?.bank_branch && (
                        <div className="border-t border-blue-100 pt-3">
                          <label className="text-xs font-medium text-blue-700 uppercase tracking-wide">Bank Branch:</label>
                          <p className="mt-1 text-lg font-semibold text-blue-900">{selectedApplication.fullData.bank_branch}</p>
                        </div>
                      )}
                      {selectedApplication.fullData?.bank_account_number && (
                        <div className="border-t border-blue-100 pt-3">
                          <label className="text-xs font-medium text-blue-700 uppercase tracking-wide">Account Number:</label>
                          <p className="mt-1 text-2xl font-bold text-blue-900 font-mono tracking-wide">{selectedApplication.fullData.bank_account_number}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* M-PESA DETAILS - ALWAYS SHOW IF AVAILABLE */}
                {(selectedApplication.fullData?.mpesa_number || selectedApplication.fullData?.employee?.phone_number) && (
                  <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-green-900 mb-3 flex items-center gap-2">
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      M-Pesa Details
                    </h4>
                    <div className="bg-white rounded-md p-4 border border-green-200">
                      <label className="text-xs font-medium text-green-700 uppercase tracking-wide">M-Pesa Number:</label>
                      <p className="mt-1 text-2xl font-bold text-green-900 tracking-wide">
                        {selectedApplication.fullData?.mpesa_number || selectedApplication.fullData?.employee?.phone_number}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Disbursement Form */}
            <div className="border-t pt-4 space-y-4">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">Record Disbursement</h3>
              <p className="text-sm text-slate-600 mb-4">Enter the disbursement details to complete the transaction</p>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Disbursement Date
                  </label>
                  <input
                    type="date"
                    value={disbursementDate}
                    onChange={(e) => setDisbursementDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Reference/Transaction ID
                  </label>
                  <input
                    type="text"
                    value={disbursementReference}
                    onChange={(e) => setDisbursementReference(e.target.value)}
                    placeholder={`REF-${selectedApplication.id}`}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080]"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedApplication(null);
                  setDisbursementDate('');
                  setDisbursementReference('');
                }}>
                Cancel
              </Button>
              <Button
                onClick={() => handleApproveAndDisburse(selectedApplication)}
                disabled={isProcessing}>
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Approve and Disburse'
                )}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Mass Disbursement Modal */}
      <Modal
        isOpen={isMassDisburseModalOpen}
        onClose={() => {
          setIsMassDisburseModalOpen(false);
          setDisbursementDate('');
          setDisbursementReference('');
        }}
        title={`Mass Approve & Disburse (${selectedApplicationIds.size} applications)`}
        size="xl">
        <div className="space-y-6">
          {/* Disbursement Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-900">Disbursement Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Disbursement Date
                </label>
                <input
                  type="date"
                  value={disbursementDate}
                  onChange={(e) => setDisbursementDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Reference Prefix
                </label>
                <input
                  type="text"
                  value={disbursementReference}
                  onChange={(e) => setDisbursementReference(e.target.value)}
                  placeholder="BATCH"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080]"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Will be suffixed with application number (e.g., BATCH-APP123)
                </p>
              </div>
            </div>
          </div>

          {/* Selected Applications Table */}
          <div className="border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      App ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Method
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {recentApplications
                    .filter(app => selectedApplicationIds.has(app.id))
                    .map((app) => (
                      <tr key={app.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-sm font-medium text-slate-900">
                          {app.id}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-900">
                          {app.employee}
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-slate-900">
                          {app.amount}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {app.fullData?.disbursement_method === 'mpesa' ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              M-Pesa
                            </span>
                          ) : app.fullData?.disbursement_method === 'bank' ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Bank
                            </span>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {app.fullData?.disbursement_method === 'mpesa' ? (
                            <div>
                              <div className="text-xs text-green-700 font-medium">M-Pesa Number:</div>
                              <div className="font-semibold text-slate-900">
                                {app.fullData?.mpesa_number || app.fullData?.employee?.phone_number || 'Not provided'}
                              </div>
                            </div>
                          ) : app.fullData?.disbursement_method === 'bank' ? (
                            <div>
                              {app.fullData?.bank_name && (
                                <div>
                                  <div className="text-xs text-blue-700 font-medium">Bank:</div>
                                  <div className="font-semibold text-slate-900">{app.fullData.bank_name}</div>
                                </div>
                              )}
                              {app.fullData?.bank_account_number && (
                                <div className="mt-1">
                                  <div className="text-xs text-blue-700 font-medium">Account:</div>
                                  <div className="font-semibold text-slate-900 font-mono text-xs">
                                    {app.fullData.bank_account_number}
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            '—'
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-slate-50 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-slate-700">
                Total Applications:
              </span>
              <span className="text-lg font-bold text-slate-900">
                {selectedApplicationIds.size}
              </span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm font-medium text-slate-700">
                Total Amount:
              </span>
              <span className="text-lg font-bold text-[#008080]">
                KES {recentApplications
                  .filter(app => selectedApplicationIds.has(app.id))
                  .reduce((sum, app) => sum + parseFloat(app.amount.replace('KES ', '').replace(/,/g, '')), 0)
                  .toLocaleString()}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                setIsMassDisburseModalOpen(false);
                setDisbursementDate('');
                setDisbursementReference('');
              }}>
              Cancel
            </Button>
            <Button
              onClick={handleMassDisburse}
              disabled={isProcessing || !disbursementDate}
              className="bg-[#008080] hover:bg-[#006666]">
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <DollarSign className="h-4 w-4 mr-2" />
                  Approve & Disburse All
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>);

}