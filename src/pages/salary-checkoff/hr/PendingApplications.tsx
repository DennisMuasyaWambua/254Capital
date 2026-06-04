import React, { useState, useEffect } from 'react';
import { Card } from '@/components/salary-checkoff/ui/Card';
import { Table } from '@/components/salary-checkoff/ui/Table';
import { Button } from '@/components/salary-checkoff/ui/Button';
import { Badge } from '@/components/salary-checkoff/ui/Badge';
import { loanService } from '@/services/salary-checkoff/loan.service';
import { getDeductionTag } from '@/utils/salary-checkoff/deductionDate';
import { Loader2, FileText } from 'lucide-react';

interface PendingApplicationsProps {
  onNavigate: (page: string) => void;
}

export function PendingApplications({ onNavigate }: PendingApplicationsProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [pendingApplications, setPendingApplications] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPendingApplications();
  }, []);

  const loadPendingApplications = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch all pending applications
      const pendingResponse = await loanService.hrListPending();

      // Format pending applications
      const formattedPending = pendingResponse.results.map(app => {
        const disbursementDate = app.disbursement_date
          ? new Date(app.disbursement_date)
          : new Date(app.created_at);

        // Use employee_name from API response
        const employeeName = (app as any).employee_name || 'N/A';

        return {
          id: app.application_number,
          employee: employeeName,
          empId: (app as any).employee || 'N/A',
          amount: `KES ${parseFloat(app.principal_amount).toLocaleString()}`,
          monthlyDeduction: `KES ${parseFloat(app.monthly_deduction).toLocaleString()}`,
          repaymentMonths: app.repayment_months,
          date: new Date(app.created_at).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' }),
          status: app.status,
          disbursementDate: disbursementDate,
          fullApplication: app,
        };
      });

      setPendingApplications(formattedPending);
    } catch (err: any) {
      console.error('Error loading pending applications:', err);
      setError(err.message || 'Failed to load pending applications');
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
      header: 'Employee',
      accessor: 'employee'
    },
    {
      header: 'Employee ID',
      accessor: 'empId'
    },
    {
      header: 'Loan Amount',
      accessor: 'amount'
    },
    {
      header: 'Monthly Deduction',
      accessor: 'monthlyDeduction'
    },
    {
      header: 'Period (Months)',
      accessor: 'repaymentMonths'
    },
    {
      header: 'Date Applied',
      accessor: 'date'
    },
    {
      header: 'Status',
      accessor: (item: any) => (
        <Badge variant={item.status}>{item.status}</Badge>
      )
    },
    {
      header: 'Deduction Schedule',
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
    }
  ];

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
          <h1 className="text-2xl font-bold text-slate-900">Pending Loan Applications</h1>
          <p className="text-slate-500 mt-1">
            Review and process employee loan applications awaiting your approval
          </p>
        </div>
        <Button variant="outline" onClick={() => onNavigate('dashboard')}>
          Back to Dashboard
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Total Pending</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {pendingApplications.length}
              </p>
            </div>
            <div className="h-12 w-12 bg-amber-100 rounded-full flex items-center justify-center">
              <FileText className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div>
            <p className="text-sm text-slate-500">Total Amount Requested</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              KES {pendingApplications.reduce((sum, app) => {
                const amount = parseFloat(app.amount.replace('KES ', '').replace(/,/g, ''));
                return sum + amount;
              }, 0).toLocaleString()}
            </p>
          </div>
        </Card>

        <Card>
          <div>
            <p className="text-sm text-slate-500">Total Monthly Deductions</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              KES {pendingApplications.reduce((sum, app) => {
                const amount = parseFloat(app.monthlyDeduction.replace('KES ', '').replace(/,/g, ''));
                return sum + amount;
              }, 0).toLocaleString()}
            </p>
          </div>
        </Card>
      </div>

      {/* Applications Table */}
      <Card title={`All Pending Applications (${pendingApplications.length})`}>
        {pendingApplications.length > 0 ? (
          <Table
            data={pendingApplications}
            columns={columns}
            keyExtractor={(item) => item.id}
          />
        ) : (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600">No pending applications at this time</p>
          </div>
        )}
      </Card>
    </div>
  );
}
