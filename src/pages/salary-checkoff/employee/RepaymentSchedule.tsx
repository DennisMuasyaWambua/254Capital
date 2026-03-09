import React, { useState, useEffect } from 'react';
import { Card } from '@/components/salary-checkoff/ui/Card';
import { Table } from '@/components/salary-checkoff/ui/Table';
import { Badge } from '@/components/salary-checkoff/ui/Badge';
import { Button } from '@/components/salary-checkoff/ui/Button';
import { Download, Calendar, Info, Loader2 } from 'lucide-react';
import { loanService, LoanApplicationDetail } from '@/services/salary-checkoff/loan.service';
import {
  getFirstDeductionDate,
  formatDeductionDate } from
'@/utils/salary-checkoff/deductionDate';

export function RepaymentSchedule() {
  const [isLoading, setIsLoading] = useState(true);
  const [loanApplication, setLoanApplication] = useState<LoanApplicationDetail | null>(null);
  const [disbursementDate, setDisbursementDate] = useState<Date | null>(null);
  const [firstDeductionDate, setFirstDeductionDate] = useState<Date | null>(null);
  const [isSameMonth, setIsSameMonth] = useState(false);
  const [loanDetails, setLoanDetails] = useState({
    amount: 0,
    interest: 0,
    total: 0,
    monthly: 0,
    disbursedDate: '',
    firstDeduction: ''
  });
  const [scheduleData, setScheduleData] = useState<any[]>([]);

  useEffect(() => {
    loadRepaymentSchedule();
  }, []);

  const loadRepaymentSchedule = async () => {
    try {
      setIsLoading(true);

      // Fetch loan applications to find the active/disbursed loan
      const applicationsResponse = await loanService.listApplications({ page: 1 });

      // Find the most recent disbursed loan
      const disbursedLoans = applicationsResponse.results.filter(
        app => app.status === 'disbursed'
      );

      if (disbursedLoans.length === 0) {
        setIsLoading(false);
        return;
      }

      // Get detailed application with repayment schedule
      const loanDetail = await loanService.getApplication(disbursedLoans[0].id);
      setLoanApplication(loanDetail);

      // Calculate loan details
      const disbDate = new Date(loanDetail.disbursement_date || loanDetail.created_at);
      setDisbursementDate(disbDate);

      const firstDedDate = getFirstDeductionDate(disbDate);
      setFirstDeductionDate(firstDedDate);
      setIsSameMonth(disbDate.getDate() <= 15);

      const principalAmount = parseFloat(loanDetail.principal_amount);
      const totalRepayment = parseFloat(loanDetail.total_repayment);
      const monthlyDeduction = parseFloat(loanDetail.monthly_deduction);
      const interestAmount = totalRepayment - principalAmount;

      setLoanDetails({
        amount: principalAmount,
        interest: interestAmount,
        total: totalRepayment,
        monthly: monthlyDeduction,
        disbursedDate: formatDeductionDate(disbDate),
        firstDeduction: formatDeductionDate(firstDedDate)
      });

      // Use the repayment schedule from API if available
      if (loanDetail.repayment_schedule && loanDetail.repayment_schedule.length > 0) {
        const formattedSchedule = loanDetail.repayment_schedule.map((installment, index) => {
          const dueDate = new Date(installment.due_date);
          const today = new Date();

          let status = 'upcoming';
          if (installment.paid) {
            status = 'paid';
          } else if (dueDate < today) {
            status = 'overdue';
          } else if (dueDate.getMonth() === today.getMonth() && dueDate.getFullYear() === today.getFullYear()) {
            status = 'current';
          }

          // Calculate remaining balance
          const balance = totalRepayment - (monthlyDeduction * (installment.installment_number));

          return {
            month: installment.installment_number,
            dueDate: dueDate.toLocaleDateString('en-KE', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            }),
            amount: parseFloat(installment.amount),
            principal: Math.round(principalAmount / loanDetail.repayment_months),
            interest: Math.round(interestAmount / loanDetail.repayment_months),
            status,
            balance: Math.max(0, balance),
            isFirst: installment.installment_number === 1
          };
        });
        setScheduleData(formattedSchedule);
      } else {
        // Fallback: Generate schedule if not available from API
        generateSchedule(firstDedDate, loanDetail.repayment_months, principalAmount, interestAmount, totalRepayment, monthlyDeduction);
      }
    } catch (error) {
      console.error('Error loading repayment schedule:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateSchedule = (
    firstDedDate: Date,
    totalMonths: number,
    principalAmount: number,
    interestAmount: number,
    totalRepayment: number,
    monthlyDeduction: number
  ) => {
    const schedule = Array.from({ length: totalMonths }, (_, i) => {
      const dueDate = new Date(
        firstDedDate.getFullYear(),
        firstDedDate.getMonth() + i,
        25
      );
      const balance = Math.max(0, totalRepayment - monthlyDeduction * (i + 1));

      const today = new Date();
      let status = 'upcoming';
      if (dueDate < today) {
        status = i < 2 ? 'paid' : 'overdue';
      } else if (dueDate.getMonth() === today.getMonth() && dueDate.getFullYear() === today.getFullYear()) {
        status = 'current';
      }

      return {
        month: i + 1,
        dueDate: dueDate.toLocaleDateString('en-KE', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        }),
        amount: monthlyDeduction,
        principal: Math.round(principalAmount / totalMonths),
        interest: Math.round(interestAmount / totalMonths),
        status,
        balance,
        isFirst: i === 0
      };
    });
    setScheduleData(schedule);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[#008080]" />
      </div>
    );
  }

  if (!loanApplication) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600">No active loan found. Apply for a loan to view your repayment schedule.</p>
      </div>
    );
  }
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