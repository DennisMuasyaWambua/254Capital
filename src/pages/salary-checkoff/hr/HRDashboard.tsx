import React from 'react';
import { Card } from '@/components/salary-checkoff/ui/Card';
import { StatCard } from '@/components/salary-checkoff/ui/StatCard';
import { Table } from '@/components/salary-checkoff/ui/Table';
import { Badge } from '@/components/salary-checkoff/ui/Badge';
import { Button } from '@/components/salary-checkoff/ui/Button';
import {
  Users,
  FileText,
  CheckCircle,
  DollarSign,
  Calendar } from
'lucide-react';
import { getDeductionTag } from '@/utils/salary-checkoff/deductionDate';
interface HRDashboardProps {
  onNavigate: (page: string) => void;
}
export function HRDashboard({ onNavigate }: HRDashboardProps) {
  // Mock disbursement dates to demonstrate the deduction tag logic
  const pendingApplications = [
  {
    id: 'LN-2026-005',
    employee: 'Grace Muthoni',
    empId: 'EMP-045',
    amount: 'KES 80,000',
    date: 'Today',
    department: 'Marketing',
    disbursementDate: new Date(2026, 0, 10) // Jan 10 — ≤ 15th → same month
  },
  {
    id: 'LN-2026-004',
    employee: 'Peter Ochieng',
    empId: 'EMP-023',
    amount: 'KES 120,000',
    date: 'Yesterday',
    department: 'IT',
    disbursementDate: new Date(2026, 0, 18) // Jan 18 — > 15th → next month
  },
  {
    id: 'LN-2026-003',
    employee: 'Sarah Kimani',
    empId: 'EMP-089',
    amount: 'KES 50,000',
    date: '14 Jan',
    department: 'HR',
    disbursementDate: new Date(2026, 0, 14) // Jan 14 — ≤ 15th → same month
  }];

  const columns = [
  {
    header: 'Employee',
    accessor: 'employee'
  },
  {
    header: 'ID',
    accessor: 'empId'
  },
  {
    header: 'Department',
    accessor: 'department'
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
    header: 'Deduction',
    accessor: (item: any) => {
      const tag = getDeductionTag(item.disbursementDate);
      return tag === 'same-month' ?
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
            ✓ Deduct This Month
          </span> :

      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
            → Deduct Next Month
          </span>;

    }
  },
  {
    header: 'Action',
    accessor: () =>
    <Button
      size="sm"
      variant="outline"
      onClick={() => onNavigate('application-review')}>

          Review
        </Button>

  }];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">HR Dashboard</h1>
          <p className="text-slate-500">
            Overview of employee loan applications and deductions.
          </p>
        </div>
        <Button onClick={() => onNavigate('payroll')}>Process Payroll</Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Pending Applications"
          value="8"
          icon={<FileText className="h-6 w-6 text-amber-600" />}
          color="amber"
          trend={{
            value: 12,
            isPositive: true
          }} />

        <StatCard
          label="Approved This Month"
          value="23"
          icon={<CheckCircle className="h-6 w-6 text-emerald-600" />}
          color="teal"
          trend={{
            value: 5,
            isPositive: true
          }} />

        <StatCard
          label="Active Loans"
          value="156"
          icon={<Users className="h-6 w-6 text-blue-600" />}
          color="blue" />

        <StatCard
          label="Monthly Remittance"
          value="KES 2.45M"
          icon={<DollarSign className="h-6 w-6 text-purple-600" />}
          color="purple"
          trend={{
            value: 2.1,
            isPositive: true
          }} />

      </div>

      {/* Deduction Filter Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex items-center space-x-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
          <div className="h-10 w-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold text-lg">
            {
            pendingApplications.filter(
              (a) => getDeductionTag(a.disbursementDate) === 'same-month'
            ).length
            }
          </div>
          <div>
            <p className="font-semibold text-emerald-800">Deduct This Month</p>
            <p className="text-xs text-emerald-600">
              Disbursed on or before the 15th
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <div className="h-10 w-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 font-bold text-lg">
            {
            pendingApplications.filter(
              (a) => getDeductionTag(a.disbursementDate) === 'next-month'
            ).length
            }
          </div>
          <div>
            <p className="font-semibold text-amber-800">Deduct Next Month</p>
            <p className="text-xs text-amber-600">Disbursed after the 15th</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Applications */}
        <div className="lg:col-span-2">
          <Card
            title="Pending Applications"
            action={
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate('pending-applications')}>

                View All
              </Button>
            }>

            <Table
              data={pendingApplications}
              columns={columns}
              keyExtractor={(item) => item.id} />

          </Card>
        </div>

        {/* Upcoming Deductions Summary */}
        <div className="lg:col-span-1 space-y-6">
          <Card title="Upcoming Deductions">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <p className="text-sm text-slate-500">Next Deduction Date</p>
                  <p className="text-lg font-bold text-slate-900">
                    25th Jan 2026
                  </p>
                </div>
                <div className="h-10 w-10 bg-[#E0F2F2] rounded-full flex items-center justify-center text-[#008080]">
                  <Calendar className="h-5 w-5" />
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Total Employees</span>
                  <span className="font-medium">156</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Total Amount</span>
                  <span className="font-medium">KES 2,450,000</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 mt-2 overflow-hidden">
                  <div
                    className="bg-[#008080] h-2 rounded-full progress-bar-animated"
                    style={
                    {
                      '--bar-width': '65%'
                    } as React.CSSProperties
                    } />

                </div>
                <p className="text-xs text-slate-500 text-right">
                  65% Processed
                </p>
              </div>
              <Button
                className="w-full"
                variant="outline"
                onClick={() => onNavigate('payroll')}>

                View Deduction List
              </Button>
            </div>
          </Card>

          <Card title="Recent Activity">
            <div className="space-y-4">
              {[
              {
                text: 'Approved loan for John Kamau',
                time: '2 hours ago',
                type: 'approve'
              },
              {
                text: 'New application from Sarah Kimani',
                time: '5 hours ago',
                type: 'new'
              },
              {
                text: 'Payroll list exported',
                time: 'Yesterday',
                type: 'system'
              }].
              map((activity, i) =>
              <div key={i} className="flex items-start space-x-3 text-sm">
                  <div
                  className={`mt-1.5 h-2 w-2 rounded-full flex-shrink-0 ${activity.type === 'approve' ? 'bg-emerald-500' : activity.type === 'new' ? 'bg-blue-500' : 'bg-slate-400'}`} />

                  <div>
                    <p className="text-slate-900">{activity.text}</p>
                    <p className="text-slate-500 text-xs">{activity.time}</p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>);

}