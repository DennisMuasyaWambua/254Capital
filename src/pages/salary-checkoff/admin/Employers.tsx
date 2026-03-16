import React, { useState, useEffect } from 'react';
import { Card } from '@/components/salary-checkoff/ui/Card';
import { Table } from '@/components/salary-checkoff/ui/Table';
import { Badge } from '@/components/salary-checkoff/ui/Badge';
import { Button } from '@/components/salary-checkoff/ui/Button';
import { Input } from '@/components/salary-checkoff/ui/Input';
import {
  employerService,
  Employer,
} from '@/services/salary-checkoff/employer.service';
import { formatDate } from '@/utils/formatters';
import { Loader2, AlertCircle, X, Building2, Search } from 'lucide-react';

interface EmployersProps {
  onNavigate: (page: string) => void;
}

export function Employers({ onNavigate }: EmployersProps) {
  const [employers, setEmployers] = useState<Employer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadEmployers();
  }, []);

  const loadEmployers = async (search?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await employerService.listEmployers(search);
      setEmployers(response.results);
    } catch (error: any) {
      console.error('Error loading employers:', error);
      setError(error.message || 'Failed to load employers');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    loadEmployers(searchQuery);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    loadEmployers();
  };

  const columns = [
    {
      header: 'Employer Name',
      accessor: 'name',
      className: 'font-medium',
    },
    {
      header: 'Registration Number',
      accessor: 'registration_number',
    },
    {
      header: 'HR Contact',
      accessor: (item: Employer) => item.hr_contact_name,
    },
    {
      header: 'HR Email',
      accessor: (item: Employer) => item.hr_contact_email,
    },
    {
      header: 'HR Phone',
      accessor: (item: Employer) => item.hr_contact_phone,
    },
    {
      header: 'Payroll Cycle Day',
      accessor: (item: Employer) => `Day ${item.payroll_cycle_day}`,
    },
    {
      header: 'Total Employees',
      accessor: (item: Employer) => item.total_employees || 0,
    },
    {
      header: 'Active Loans',
      accessor: (item: Employer) => item.active_loans_count || 0,
    },
    {
      header: 'Status',
      accessor: (item: Employer) => (
        <Badge variant={item.is_active ? 'approved' : 'rejected'}>
          {item.is_active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      header: 'Onboarded Date',
      accessor: (item: Employer) => formatDate(item.onboarded_at),
    },
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
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="h-6 w-6 text-[#008080]" />
            Employer Management
          </h1>
          <p className="text-slate-500">
            View and manage all employers in the system.
          </p>
        </div>
        <Button onClick={() => onNavigate('onboard-employer')}>
          Onboard New Employer
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-800">
          <AlertCircle className="h-5 w-5 mr-2 text-red-600" />
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-600 hover:text-red-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <Card>
        <div className="mb-4 flex justify-between items-center gap-4">
          <div className="flex gap-2 flex-1 max-w-md">
            <Input
              type="text"
              placeholder="Search by employer name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1"
            />
            <Button onClick={handleSearch} variant="outline" size="sm">
              <Search className="h-4 w-4" />
            </Button>
            {searchQuery && (
              <Button onClick={handleClearSearch} variant="outline" size="sm">
                Clear
              </Button>
            )}
          </div>
          <Badge variant="default">{employers.length} Employers</Badge>
        </div>

        {employers.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            {searchQuery
              ? 'No employers found matching your search'
              : 'No employers in the system yet'}
          </div>
        ) : (
          <Table
            data={employers}
            columns={columns}
            keyExtractor={(item) => item.id}
          />
        )}
      </Card>
    </div>
  );
}
