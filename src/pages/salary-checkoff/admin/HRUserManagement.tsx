import React from 'react';
import { Card } from '@/components/salary-checkoff/ui/Card';
import { Button } from '@/components/salary-checkoff/ui/Button';
import { ArrowLeft } from 'lucide-react';

interface HRUserManagementProps {
  onNavigate: (page: string) => void;
}

export function HRUserManagement({ onNavigate }: HRUserManagementProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => onNavigate('dashboard')}
            className="text-sm text-[#008080] hover:text-[#006666] mb-2 flex items-center group transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1 group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </button>
          <h1 className="text-2xl font-bold text-slate-900">HR User Management</h1>
          <p className="text-slate-600">Manage HR manager accounts and permissions.</p>
        </div>
        <Button onClick={() => {}}>Add HR User</Button>
      </div>

      <Card className="p-12 flex flex-col items-center justify-center text-center">
        <div className="bg-slate-100 p-4 rounded-full mb-4">
          <span className="text-4xl">👥</span>
        </div>
        <h2 className="text-xl font-semibold text-slate-900 mb-2">Component Under Development</h2>
        <p className="text-slate-600 max-w-md mx-auto mb-6">
          The HR User Management interface is currently being updated. 
          All backend services are ready for integration.
        </p>
        <Button variant="outline" onClick={() => onNavigate('dashboard')}>
          Return to Dashboard
        </Button>
      </Card>
    </div>
  );
}
