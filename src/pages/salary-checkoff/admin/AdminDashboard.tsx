import React from 'react';
import { Card } from '@/components/salary-checkoff/ui/Card';
import { StatCard } from '@/components/salary-checkoff/ui/StatCard';
import { Table } from '@/components/salary-checkoff/ui/Table';
import { Badge } from '@/components/salary-checkoff/ui/Badge';
import { Button } from '@/components/salary-checkoff/ui/Button';
import {
  Briefcase,
  Users,
  DollarSign,
  AlertTriangle,
  ArrowRight,
  Calendar } from
'lucide-react';
import {
  getFirstDeductionDate,
  formatDeductionDate,
  getDeductionTag } from
'@/utils/salary-checkoff/deductionDate';
interface AdminDashboardProps {
  onNavigate: (page: string) => void;
}
export function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const recentApplications = [
  {
    id: 'LN-2026-005',
    employer: 'Safaricom PLC',
    employee: 'Grace Muthoni',
    amount: 'KES 80,000',
    disbursedDate: new Date(2026, 0, 10),
    status: 'disbursed'
  },
  {
    id: 'LN-2026-004',
    employer: 'Kenya Power',
    employee: 'Peter Ochieng',
    amount: 'KES 120,000',
    disbursedDate: new Date(2026, 0, 18),
    status: 'disbursed'
  },
  {
    id: 'LN-2026-003',
    employer: 'KCB Bank',
    employee: 'John Kamau',
    amount: 'KES 50,000',
    disbursedDate: new Date(2026, 0, 5),
    status: 'disbursed'
  },
  {
    id: 'LN-2026-002',
    employer: 'Equity Bank',
    employee: 'Mary Wanjiku',
    amount: 'KES 200,000',
    disbursedDate: null,
    status: 'under-review'
  }];

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
    accessor: () =>
    <button className="text-[#00BCD4] hover:underline text-sm font-medium">
          View
        </button>

  }];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
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
          value="12"
          icon={<Briefcase className="h-6 w-6 text-blue-600" />}
          color="blue"
          trend={{
            value: 2,
            isPositive: true
          }} />

        <StatCard
          label="Active Loans"
          value="450"
          icon={<Users className="h-6 w-6 text-emerald-600" />}
          color="teal"
          trend={{
            value: 15,
            isPositive: true
          }} />

        <StatCard
          label="Total Disbursed"
          value="KES 67.5M"
          icon={<DollarSign className="h-6 w-6 text-purple-600" />}
          color="purple"
          trend={{
            value: 8.5,
            isPositive: true
          }} />

        <StatCard
          label="Default Rate"
          value="2.3%"
          icon={<AlertTriangle className="h-6 w-6 text-red-600" />}
          color="amber"
          trend={{
            value: 0.1,
            isPositive: false
          }} />

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart */}
        <div className="lg:col-span-2">
          <Card title="Monthly Disbursements (Last 6 Months)">
            <div className="h-64 flex items-end justify-between space-x-2 pt-4">
              {[
              {
                month: 'Aug',
                height: '45%'
              },
              {
                month: 'Sep',
                height: '52%'
              },
              {
                month: 'Oct',
                height: '48%'
              },
              {
                month: 'Nov',
                height: '65%'
              },
              {
                month: 'Dec',
                height: '85%'
              },
              {
                month: 'Jan',
                height: '72%'
              }].
              map((item, i) =>
              <div
                key={i}
                className="flex flex-col items-center flex-1 group">

                  <div className="relative w-full flex justify-center">
                    <div
                    className="w-full max-w-[40px] bg-[#E0F2F2] rounded-t-lg relative"
                    style={{
                      height: '200px'
                    }}>

                      <div
                      className="absolute bottom-0 w-full bg-[#008080] group-hover:bg-[#006666] rounded-t-lg transition-all duration-300"
                      style={{
                        height: item.height
                      }} />

                    </div>
                  </div>
                  <span className="text-xs text-slate-500 mt-2 font-medium">
                    {item.month}
                  </span>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Alerts */}
        <div className="lg:col-span-1 space-y-6">
          <Card title="System Alerts">
            <div className="space-y-4">
              <div className="p-3 bg-red-50 border border-red-100 rounded-lg flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-red-800">
                    Overdue Remittance
                  </h4>
                  <p className="text-xs text-red-600 mt-1">
                    Kenya Power is 3 days late on remittance.
                  </p>
                </div>
              </div>
              <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg flex items-start space-x-3">
                <Briefcase className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-amber-800">
                    Pending Employer Approval
                  </h4>
                  <p className="text-xs text-amber-600 mt-1">
                    TechCorp Ltd pending onboarding review.
                  </p>
                </div>
              </div>
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
    </div>);

}