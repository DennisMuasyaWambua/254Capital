import React from 'react';
import { Card } from '@/components/salary-checkoff/ui/Card';
import { Table } from '@/components/salary-checkoff/ui/Table';
import { Badge } from '@/components/salary-checkoff/ui/Badge';
import { Button } from '@/components/salary-checkoff/ui/Button';
import { Download, Calendar, Info } from 'lucide-react';
import {
  getFirstDeductionDate,
  formatDeductionDate } from
'@/utils/salary-checkoff/deductionDate';
export function RepaymentSchedule() {
  // Mock: loan disbursed on Jan 10 (≤ 15th → first deduction same month, Jan 25)
  const disbursementDate = new Date(2026, 0, 10); // Jan 10 2026
  const firstDeductionDate = getFirstDeductionDate(disbursementDate);
  const isSameMonth = disbursementDate.getDate() <= 15;
  const loanDetails = {
    amount: 150000,
    interest: 7500,
    total: 157500,
    monthly: 13125,
    disbursedDate: formatDeductionDate(disbursementDate),
    firstDeduction: formatDeductionDate(firstDeductionDate)
  };
  // Generate schedule from first deduction date
  const totalMonths = 12;
  const scheduleData = Array.from(
    {
      length: totalMonths
    },
    (_, i) => {
      const dueDate = new Date(
        firstDeductionDate.getFullYear(),
        firstDeductionDate.getMonth() + i,
        25
      );
      const balance = Math.max(
        0,
        loanDetails.total - loanDetails.monthly * (i + 1)
      );
      const status = i < 2 ? 'paid' : i === 2 ? 'current' : 'upcoming';
      return {
        month: i + 1,
        dueDate: dueDate.toLocaleDateString('en-KE', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        }),
        amount: loanDetails.monthly,
        principal: Math.round(loanDetails.amount / totalMonths),
        interest: Math.round(loanDetails.interest / totalMonths),
        status,
        balance,
        isFirst: i === 0
      };
    }
  );
  const columns = [
  {
    header: '#',
    accessor: 'month'
  },
  {
    header: 'Due Date',
    accessor: (item: any) =>
    <span className={item.isFirst ? 'font-semibold text-[#00838F]' : ''}>
          {item.dueDate}
          {item.isFirst &&
      <span className="ml-2 text-xs bg-[#E0F2F2] text-[#008080] px-1.5 py-0.5 rounded-full font-medium">
              First
            </span>
      }
        </span>

  },
  {
    header: 'Amount Due',
    accessor: (item: any) => `KES ${item.amount.toLocaleString()}`
  },
  {
    header: 'Principal',
    accessor: (item: any) => `KES ${item.principal.toLocaleString()}`
  },
  {
    header: 'Interest',
    accessor: (item: any) => `KES ${item.interest.toLocaleString()}`
  },
  {
    header: 'Status',
    accessor: (item: any) =>
    <Badge
      variant={
      item.status === 'paid' ?
      'approved' :
      item.status === 'overdue' ?
      'declined' :
      item.status === 'current' ?
      'under-review' :
      'default'
      }>

          {item.status === 'current' ? 'Due Now' : item.status}
        </Badge>

  },
  {
    header: 'Balance',
    accessor: (item: any) => `KES ${item.balance.toLocaleString()}`
  }];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-900">
          Repayment Schedule
        </h1>
        <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>
          Download PDF
        </Button>
      </div>

      {/* Loan Summary Card */}
      <Card className="bg-gradient-to-r from-[#008080] to-[#006666] text-white border-0">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <p className="text-white/80 text-sm mb-1">Total Loan Amount</p>
            <p className="text-2xl font-bold">
              KES {loanDetails.total.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-white/80 text-sm mb-1">Monthly Deduction</p>
            <p className="text-2xl font-bold">
              KES {loanDetails.monthly.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-white/80 text-sm mb-1">Disbursement Date</p>
            <p className="text-lg font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" /> {loanDetails.disbursedDate}
            </p>
          </div>
          <div>
            <p className="text-white/80 text-sm mb-1">First Deduction</p>
            <p className="text-lg font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" /> {loanDetails.firstDeduction}
            </p>
          </div>
        </div>
      </Card>

      {/* Deduction Rule Notice */}
      <div
        className={`flex items-start space-x-3 p-4 rounded-lg border ${isSameMonth ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>

        <Info
          className={`h-5 w-5 flex-shrink-0 mt-0.5 ${isSameMonth ? 'text-emerald-600' : 'text-amber-600'}`} />

        <p
          className={`text-sm ${isSameMonth ? 'text-emerald-800' : 'text-amber-800'}`}>

          <strong>Deduction Rule Applied:</strong>{' '}
          {isSameMonth ?
          `Loan was disbursed on ${loanDetails.disbursedDate} (on or before the 15th), so the first deduction starts on ${loanDetails.firstDeduction} of the same month.` :
          `Loan was disbursed on ${loanDetails.disbursedDate} (after the 15th), so the first deduction starts on ${loanDetails.firstDeduction} of the following month.`}
        </p>
      </div>

      <Card title="Payment Schedule">
        <Table
          data={scheduleData}
          columns={columns}
          keyExtractor={(item) => item.month} />

      </Card>
    </div>);

}