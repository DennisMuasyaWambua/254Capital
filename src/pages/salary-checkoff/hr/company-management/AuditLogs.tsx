import React, { useState, useEffect } from 'react';
import { Card } from '@/components/salary-checkoff/ui/Card';
import { Table } from '@/components/salary-checkoff/ui/Table';
import { Badge } from '@/components/salary-checkoff/ui/Badge';
import { Loader2, FileText, CheckCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { auditLogService, organizationService, AuditLog, Organization } from '@/services/salary-checkoff/company-management.service';

interface AuditLogsProps {
  onNavigate?: (page: string) => void;
}

export function AuditLogs({ onNavigate }: AuditLogsProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<string>('');
  const [selectedEventType, setSelectedEventType] = useState<string>('');
  const [selectedResult, setSelectedResult] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadLogs();
  }, [selectedOrgId, selectedEventType, selectedResult]);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load organizations
      const orgsResponse = await organizationService.list({ is_active: true, page_size: 100 });
      setOrganizations(orgsResponse.results);

      // Load initial logs
      await loadLogs();
    } catch (err: any) {
      console.error('Error loading data:', err);
      setError(err.message || 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const loadLogs = async () => {
    try {
      const params: any = { page_size: 100 };

      if (selectedOrgId) params.organization = selectedOrgId;
      if (selectedEventType) params.event_type = selectedEventType;
      if (selectedResult) params.result = selectedResult;

      const response = await auditLogService.list(params);
      setLogs(response.results);
    } catch (err: any) {
      console.error('Error loading logs:', err);
      setError(err.message || 'Failed to load audit logs');
    }
  };

  const eventTypes = [
    { value: 'organization_created', label: 'Organization Created' },
    { value: 'organization_updated', label: 'Organization Updated' },
    { value: 'organization_deactivated', label: 'Organization Deactivated' },
    { value: 'role_created', label: 'Role Created' },
    { value: 'role_updated', label: 'Role Updated' },
    { value: 'role_deleted', label: 'Role Deleted' },
    { value: 'user_created', label: 'User Created' },
    { value: 'user_updated', label: 'User Updated' },
    { value: 'user_deactivated', label: 'User Deactivated' },
    { value: 'login_success', label: 'Login Success' },
    { value: 'login_failed', label: 'Login Failed' },
    { value: 'password_changed', label: 'Password Changed' },
    { value: 'loan_application_viewed', label: 'Loan Application Viewed' },
    { value: 'loan_application_approved', label: 'Loan Application Approved' },
    { value: 'loan_application_declined', label: 'Loan Application Declined' },
    { value: 'authorization_failed', label: 'Authorization Failed' },
  ];

  const formatEventType = (eventType: string) => {
    return eventType
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const columns = [
    {
      header: 'Event',
      accessor: (item: AuditLog) => (
        <div>
          <div className="font-medium text-slate-900">{formatEventType(item.event_type)}</div>
          {item.target_resource_type && (
            <div className="text-xs text-slate-500 mt-1">
              {item.target_resource_type}: {item.target_resource_id?.slice(0, 8)}...
            </div>
          )}
        </div>
      )
    },
    {
      header: 'User',
      accessor: (item: AuditLog) => (
        <div className="text-sm">
          {item.user_name || <span className="text-slate-400">System</span>}
        </div>
      )
    },
    {
      header: 'Target',
      accessor: (item: AuditLog) => (
        item.target_user_name ? (
          <div className="text-sm">{item.target_user_name}</div>
        ) : <span className="text-slate-400">—</span>
      )
    },
    {
      header: 'Organization',
      accessor: (item: AuditLog) => (
        item.organization_name ? (
          <div className="text-sm">{item.organization_name}</div>
        ) : <span className="text-slate-400">—</span>
      )
    },
    {
      header: 'Result',
      accessor: (item: AuditLog) => (
        <Badge variant={item.result === 'success' ? 'success' : 'danger'} className="flex items-center space-x-1 w-fit">
          {item.result === 'success' ? (
            <>
              <CheckCircle className="h-3 w-3" />
              <span>Success</span>
            </>
          ) : (
            <>
              <XCircle className="h-3 w-3" />
              <span>Failed</span>
            </>
          )}
        </Badge>
      )
    },
    {
      header: 'Timestamp',
      accessor: (item: AuditLog) => (
        <div className="text-sm">
          <div>{new Date(item.created_at).toLocaleDateString('en-KE', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          })}</div>
          <div className="text-xs text-slate-500">
            {new Date(item.created_at).toLocaleTimeString('en-KE', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        </div>
      )
    },
    {
      header: 'Details',
      accessor: (item: AuditLog) => (
        <button
          onClick={() => setExpandedLogId(expandedLogId === item.id ? null : item.id)}
          className="text-[#008080] hover:text-[#006666] flex items-center space-x-1"
        >
          {expandedLogId === item.id ? (
            <>
              <ChevronUp className="h-4 w-4" />
              <span>Hide</span>
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4" />
              <span>Show</span>
            </>
          )}
        </button>
      )
    }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[#008080]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Audit Logs</h1>
        <p className="mt-1 text-slate-600">Complete audit trail of all system activities</p>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Organization Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Organization
            </label>
            <select
              value={selectedOrgId}
              onChange={(e) => setSelectedOrgId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080] focus:border-transparent"
            >
              <option value="">All Organizations</option>
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name}
                </option>
              ))}
            </select>
          </div>

          {/* Event Type Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Event Type
            </label>
            <select
              value={selectedEventType}
              onChange={(e) => setSelectedEventType(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080] focus:border-transparent"
            >
              <option value="">All Events</option>
              {eventTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Result Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Result
            </label>
            <select
              value={selectedResult}
              onChange={(e) => setSelectedResult(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080] focus:border-transparent"
            >
              <option value="">All Results</option>
              <option value="success">Success</option>
              <option value="failure">Failed</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Error State */}
      {error && (
        <Card className="p-4 bg-red-50 border-red-200">
          <p className="text-red-600">{error}</p>
        </Card>
      )}

      {/* Logs Table */}
      <Card>
        {logs.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No audit logs found</h3>
            <p className="text-slate-600">
              {selectedOrgId || selectedEventType || selectedResult
                ? 'Try adjusting your filter criteria.'
                : 'Audit logs will appear here as activities occur.'}
            </p>
          </div>
        ) : (
          <div>
            <Table
              columns={columns}
              data={logs}
              keyExtractor={(item) => item.id}
            />

            {/* Expanded Log Details */}
            {expandedLogId && logs.find(log => log.id === expandedLogId) && (
              <div className="border-t border-slate-200 p-6 bg-slate-50">
                <LogDetails log={logs.find(log => log.id === expandedLogId)!} />
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}

// Log Details Component
interface LogDetailsProps {
  log: AuditLog;
}

function LogDetails({ log }: LogDetailsProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Event Details</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Basic Information */}
        <div className="space-y-3">
          <DetailItem label="Event Type" value={log.event_type.replace(/_/g, ' ').toUpperCase()} />
          <DetailItem label="Result" value={log.result} />
          <DetailItem label="User" value={log.user_name || 'System'} />
          <DetailItem label="Target User" value={log.target_user_name || '—'} />
        </div>

        <div className="space-y-3">
          <DetailItem label="Organization" value={log.organization_name || '—'} />
          <DetailItem label="Resource Type" value={log.target_resource_type || '—'} />
          <DetailItem label="Resource ID" value={log.target_resource_id || '—'} />
          <DetailItem label="IP Address" value={log.ip_address || '—'} />
        </div>
      </div>

      {/* Error Message */}
      {log.error_message && (
        <div className="mt-4">
          <label className="block text-sm font-medium text-slate-700 mb-2">Error Message</label>
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-700">{log.error_message}</p>
          </div>
        </div>
      )}

      {/* Metadata */}
      {log.metadata && Object.keys(log.metadata).length > 0 && (
        <div className="mt-4">
          <label className="block text-sm font-medium text-slate-700 mb-2">Additional Metadata</label>
          <div className="bg-white border border-slate-200 rounded-lg p-3">
            <pre className="text-xs text-slate-700 overflow-x-auto">
              {JSON.stringify(log.metadata, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* User Agent */}
      {log.user_agent && (
        <div className="mt-4">
          <DetailItem label="User Agent" value={log.user_agent} />
        </div>
      )}

      {/* Timestamp */}
      <div className="mt-4 pt-4 border-t border-slate-200">
        <DetailItem
          label="Timestamp"
          value={new Date(log.created_at).toLocaleString('en-KE', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          })}
        />
      </div>
    </div>
  );
}

// Detail Item Component
interface DetailItemProps {
  label: string;
  value: string;
}

function DetailItem({ label, value }: DetailItemProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      <p className="text-sm text-slate-900 break-all">{value}</p>
    </div>
  );
}
