import React from 'react';
import { Card } from '@/components/salary-checkoff/ui/Card';
import { StatCard } from '@/components/salary-checkoff/ui/StatCard';
import { Button } from '@/components/salary-checkoff/ui/Button';
import { Badge } from '@/components/salary-checkoff/ui/Badge';
import { Table } from '@/components/salary-checkoff/ui/Table';
import {
  Wallet,
  Calendar,
  PiggyBank,
  Clock,
  ArrowRight,
  Download,
  Plus,
  Check } from
'lucide-react';
interface EmployeeDashboardProps {
  onNavigate: (page: string) => void;
}
export function EmployeeDashboard({ onNavigate }: EmployeeDashboardProps) {
  const recentApplications = [
  {
    id: 'LN-2026-001',
    amount: 'KES 150,000',
    date: '15 Jan 2026',
    status: 'approved'
  },
  {
    id: 'LN-2025-089',
    amount: 'KES 50,000',
    date: '10 Nov 2025',
    status: 'disbursed'
  },
  {
    id: 'LN-2025-042',
    amount: 'KES 200,000',
    date: '22 Jun 2025',
    status: 'disbursed'
  }];

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

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome back, John! 👋
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
          value="KES 150,000"
          icon={<Wallet className="h-6 w-6 text-[#00838F]" />}
          color="teal" />

        <StatCard
          label="Monthly Deduction"
          value="KES 13,125"
          icon={<Calendar className="h-6 w-6 text-blue-700" />}
          color="blue" />

        <StatCard
          label="Remaining Balance"
          value="KES 78,750"
          icon={<PiggyBank className="h-6 w-6 text-purple-700" />}
          color="purple" />

        <StatCard
          label="Next Deduction"
          value="25th Feb"
          icon={<Clock className="h-6 w-6 text-amber-700" />}
          color="amber" />

      </div>

      {/* Application Tracker */}
      <Card title="Current Application Status" className="overflow-visible">
        <div className="relative py-8 px-4">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 hidden md:block" />
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 relative">
            {[
            {
              label: 'Submitted',
              status: 'completed',
              date: '15 Jan'
            },
            {
              label: 'HR Review',
              status: 'completed',
              date: '16 Jan'
            },
            {
              label: '254 Review',
              status: 'completed',
              date: '17 Jan'
            },
            {
              label: 'Approved',
              status: 'current',
              date: 'Today'
            },
            {
              label: 'Disbursed',
              status: 'upcoming',
              date: 'Pending'
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

            <Table
              data={recentApplications}
              columns={columns}
              keyExtractor={(item) => item.id} />

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