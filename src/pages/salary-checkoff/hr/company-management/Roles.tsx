import React, { useState, useEffect } from 'react';
import { Card } from '@/components/salary-checkoff/ui/Card';
import { Table } from '@/components/salary-checkoff/ui/Table';
import { Button } from '@/components/salary-checkoff/ui/Button';
import { Input } from '@/components/salary-checkoff/ui/Input';
import { Badge } from '@/components/salary-checkoff/ui/Badge';
import { Loader2, Plus, Shield, Edit, Trash2, Search, CheckCircle, XCircle, Eye, ThumbsUp, ThumbsDown } from 'lucide-react';
import { roleService, organizationService, Role, Organization } from '@/services/salary-checkoff/company-management.service';

interface RolesProps {
  onNavigate?: (page: string) => void;
}

export function Roles({ onNavigate }: RolesProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [roles, setRoles] = useState<Role[]>([]);
  const [filteredRoles, setFilteredRoles] = useState<Role[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    // Filter roles based on search query and selected organization
    let filtered = roles;

    if (selectedOrgId) {
      filtered = filtered.filter(role => role.organization === selectedOrgId);
    }

    if (searchQuery) {
      filtered = filtered.filter(role =>
        role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        role.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredRoles(filtered);
  }, [searchQuery, selectedOrgId, roles]);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load organizations and roles in parallel
      const [orgsResponse, rolesResponse] = await Promise.all([
        organizationService.list({ is_active: true, page_size: 100 }),
        roleService.list({ page_size: 100 })
      ]);

      // Defensive: ensure responses are valid
      if (!orgsResponse || !Array.isArray(orgsResponse.results)) {
        console.error('Invalid organizations response:', orgsResponse);
        setError('Invalid data format received from server');
        setOrganizations([]);
        setRoles([]);
        setFilteredRoles([]);
        return;
      }

      if (!rolesResponse || !Array.isArray(rolesResponse.results)) {
        console.error('Invalid roles response:', rolesResponse);
        setError('Invalid data format received from server');
        setOrganizations([]);
        setRoles([]);
        setFilteredRoles([]);
        return;
      }

      setOrganizations(orgsResponse.results);
      setRoles(rolesResponse.results);
      setFilteredRoles(rolesResponse.results);
    } catch (err: any) {
      console.error('Error loading data:', err);
      setError(err.message || 'Failed to load data');
      // Set empty arrays on error to prevent blank screen
      setOrganizations([]);
      setRoles([]);
      setFilteredRoles([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateOrEdit = (role?: Role) => {
    setEditingRole(role || null);
    setShowModal(true);
  };

  const handleDelete = async (id: string, roleName: string) => {
    if (!confirm(`Are you sure you want to delete the role "${roleName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await roleService.delete(id);
      await loadInitialData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete role');
    }
  };

  const columns = [
    {
      header: 'Role Name',
      accessor: (item: Role) => (
        <div className="flex items-center space-x-2">
          <Shield className="h-4 w-4 text-[#008080]" />
          <span className="font-medium">{item.name}</span>
        </div>
      )
    },
    {
      header: 'Organization',
      accessor: (item: Role) => (
        <span className="text-sm">{item.organization_name}</span>
      )
    },
    {
      header: 'Permissions',
      accessor: (item: Role) => (
        <div className="flex items-center space-x-2">
          {item.can_view_loan_application && (
            <Badge variant="info" className="flex items-center space-x-1">
              <Eye className="h-3 w-3" />
              <span>View</span>
            </Badge>
          )}
          {item.can_approve_loan_application && (
            <Badge variant="success" className="flex items-center space-x-1">
              <ThumbsUp className="h-3 w-3" />
              <span>Approve</span>
            </Badge>
          )}
          {item.can_decline_loan_application && (
            <Badge variant="warning" className="flex items-center space-x-1">
              <ThumbsDown className="h-3 w-3" />
              <span>Decline</span>
            </Badge>
          )}
          {!item.can_view_loan_application && !item.can_approve_loan_application && !item.can_decline_loan_application && (
            <Badge variant="default">No permissions</Badge>
          )}
        </div>
      )
    },
    {
      header: 'Users Assigned',
      accessor: (item: Role) => (
        <span className="text-sm font-medium">{item.assigned_users_count || 0}</span>
      )
    },
    {
      header: 'Status',
      accessor: (item: Role) => (
        <Badge variant={item.is_active ? 'success' : 'danger'}>
          {item.is_active ? 'Active' : 'Inactive'}
        </Badge>
      )
    },
    {
      header: 'Created',
      accessor: (item: Role) => {
        try {
          if (!item.created_at) return '—';
          return new Date(item.created_at).toLocaleDateString('en-KE', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          });
        } catch (e) {
          console.error('Date formatting error:', e);
          return '—';
        }
      }
    },
    {
      header: 'Actions',
      accessor: (item: Role) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleCreateOrEdit(item)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          {item.is_active && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDelete(item.id, item.name)}
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          )}
        </div>
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Roles & Permissions</h1>
          <p className="mt-1 text-slate-600">Manage role-based access control for loan applications</p>
        </div>
        <Button onClick={() => handleCreateOrEdit()} disabled={organizations.length === 0}>
          <Plus className="h-4 w-4 mr-2" />
          Create Role
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Organization Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Filter by Organization
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

          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Search Roles
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                placeholder="Search by role name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Error State */}
      {error && (
        <Card className="p-4 bg-red-50 border-red-200">
          <p className="text-red-600">{error}</p>
        </Card>
      )}

      {/* No Organizations Warning */}
      {organizations.length === 0 && (
        <Card className="p-6 bg-yellow-50 border-yellow-200">
          <p className="text-yellow-800">
            No organizations found. Please create an organization first before creating roles.
          </p>
        </Card>
      )}

      {/* Roles Table */}
      <Card>
        {filteredRoles.length === 0 ? (
          <div className="p-12 text-center">
            <Shield className="h-12 w-12 mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No roles found</h3>
            <p className="text-slate-600 mb-6">
              {searchQuery || selectedOrgId
                ? 'Try adjusting your search or filter criteria.'
                : 'Get started by creating your first role.'}
            </p>
            {!searchQuery && !selectedOrgId && organizations.length > 0 && (
              <Button onClick={() => handleCreateOrEdit()}>
                <Plus className="h-4 w-4 mr-2" />
                Create Role
              </Button>
            )}
          </div>
        ) : (
          <Table columns={columns} data={filteredRoles} />
        )}
      </Card>

      {/* Create/Edit Modal */}
      {showModal && (
        <RoleModal
          role={editingRole}
          organizations={organizations}
          onClose={() => {
            setShowModal(false);
            setEditingRole(null);
          }}
          onSuccess={() => {
            setShowModal(false);
            setEditingRole(null);
            loadInitialData();
          }}
        />
      )}
    </div>
  );
}

// Role Create/Edit Modal Component
interface RoleModalProps {
  role?: Role | null;
  organizations: Organization[];
  onClose: () => void;
  onSuccess: () => void;
}

function RoleModal({ role, organizations, onClose, onSuccess }: RoleModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    organization: role?.organization || '',
    name: role?.name || '',
    description: role?.description || '',
    can_view_loan_application: role?.can_view_loan_application || false,
    can_approve_loan_application: role?.can_approve_loan_application || false,
    can_decline_loan_application: role?.can_decline_loan_application || false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      if (role) {
        await roleService.update(role.id, formData);
      } else {
        await roleService.create(formData);
      }
      onSuccess();
    } catch (err: any) {
      if (err.data) {
        setErrors(err.data);
      } else {
        alert(err.message || 'Failed to save role');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            {role ? 'Edit Role' : 'Create Role'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Organization Selection */}
            {!role && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Organization *
                </label>
                <select
                  value={formData.organization}
                  onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080] focus:border-transparent"
                  required
                >
                  <option value="">Select an organization</option>
                  {organizations.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.name}
                    </option>
                  ))}
                </select>
                {errors.organization && (
                  <p className="mt-1 text-sm text-red-600">{errors.organization}</p>
                )}
              </div>
            )}

            <Input
              label="Role Name *"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              error={errors.name}
              placeholder="e.g., Loan Officer"
              required
            />

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional description of role responsibilities"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080] focus:border-transparent"
                rows={3}
              />
            </div>

            {/* Permissions */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Loan Application Permissions
              </label>
              <div className="space-y-3 bg-slate-50 p-4 rounded-lg">
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.can_view_loan_application}
                    onChange={(e) => setFormData({ ...formData, can_view_loan_application: e.target.checked })}
                    className="mt-1 h-4 w-4 text-[#008080] border-slate-300 rounded focus:ring-[#008080]"
                  />
                  <div>
                    <div className="flex items-center space-x-2">
                      <Eye className="h-4 w-4 text-[#008080]" />
                      <span className="font-medium text-slate-900">Can view loan applications</span>
                    </div>
                    <p className="text-sm text-slate-600 mt-1">
                      View pending loan application details and documents
                    </p>
                  </div>
                </label>

                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.can_approve_loan_application}
                    onChange={(e) => setFormData({ ...formData, can_approve_loan_application: e.target.checked })}
                    className="mt-1 h-4 w-4 text-[#008080] border-slate-300 rounded focus:ring-[#008080]"
                  />
                  <div>
                    <div className="flex items-center space-x-2">
                      <ThumbsUp className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-slate-900">Can approve loan applications</span>
                    </div>
                    <p className="text-sm text-slate-600 mt-1">
                      Approve pending loan applications for disbursement
                    </p>
                  </div>
                </label>

                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.can_decline_loan_application}
                    onChange={(e) => setFormData({ ...formData, can_decline_loan_application: e.target.checked })}
                    className="mt-1 h-4 w-4 text-[#008080] border-slate-300 rounded focus:ring-[#008080]"
                  />
                  <div>
                    <div className="flex items-center space-x-2">
                      <ThumbsDown className="h-4 w-4 text-red-600" />
                      <span className="font-medium text-slate-900">Can decline loan applications</span>
                    </div>
                    <p className="text-sm text-slate-600 mt-1">
                      Decline pending loan applications with reason
                    </p>
                  </div>
                </label>

                {!formData.can_view_loan_application && !formData.can_approve_loan_application && !formData.can_decline_loan_application && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-3">
                    <p className="text-sm text-yellow-800">
                      ⚠️ This role has no permissions. Users with this role can log in but cannot perform any loan-related actions.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" isLoading={isLoading}>
                {role ? 'Update' : 'Create'} Role
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}
