import React, { useState, useEffect } from 'react';
import { Card } from '@/components/salary-checkoff/ui/Card';
import { EmployerDocuments } from '@/components/salary-checkoff/EmployerDocuments';
import { authService } from '@/services/salary-checkoff/auth.service';
import { Loader2, AlertCircle, FileText } from 'lucide-react';

/**
 * HR view of their own company's documents (e.g. check-off agreements).
 *
 * Resolves the HR's employer from their profile (hr_profile.employer.id) and
 * renders the shared EmployerDocuments list. The backend scopes access so an
 * HR manager can only ever see their own employer's documents.
 */
export function CompanyDocuments() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [employerId, setEmployerId] = useState<string | null>(null);
  const [employerName, setEmployerName] = useState<string>('');

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const profile = await authService.getProfile();
        if (!active) return;
        if (profile.hr_profile?.employer?.id) {
          setEmployerId(profile.hr_profile.employer.id);
          setEmployerName(profile.hr_profile.employer.name || '');
        } else {
          setError('Your account is not linked to a company yet. Please contact 254 Capital.');
        }
      } catch (err: any) {
        if (active) setError(err.message || 'Failed to load your company information');
      } finally {
        if (active) setIsLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[#008080]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <FileText className="h-6 w-6 text-[#008080]" />
          Company Documents
        </h1>
        <p className="text-slate-500 mt-1">
          {employerName ? `Documents for ${employerName}` : 'Your company documents'}
        </p>
      </div>

      {error ? (
        <Card>
          <div className="flex items-center gap-2 p-4 text-amber-700">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            {error}
          </div>
        </Card>
      ) : (
        employerId && (
          <Card>
            <EmployerDocuments employerId={employerId} />
          </Card>
        )
      )}
    </div>
  );
}
