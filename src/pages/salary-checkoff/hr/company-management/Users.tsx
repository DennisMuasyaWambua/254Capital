import React, { useState, useEffect } from 'react';
import { Card } from '@/components/salary-checkoff/ui/Card';
import { Table } from '@/components/salary-checkoff/ui/Table';
import { Button } from '@/components/salary-checkoff/ui/Button';
import { Input } from '@/components/salary-checkoff/ui/Input';
import { Badge } from '@/components/salary-checkoff/ui/Badge';
import { Loader2, Plus, Users, Mail, Phone, Search, Trash2, CheckCircle, Clock } from 'lucide-react';
import { organizationUserService, roleService, organizationService, OrganizationUser, Role, Organization } from '@/services/salary-checkoff/company-management.service';

interface UsersManagementProps {
  onNavigate?: (page: string) => void;
}

export function UsersManagement({ onNavigate }: UsersManagementProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<OrganizationUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<OrganizationUser[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    // Filter users based on search query and selected organization
    let filtered = users;

    if (selectedOrgId) {
      filtered = filtered.filter(user => user.organization === selectedOrgId);
    }

    if (searchQuery) {
      filtered = filtered.filter(user =>
        user.user_details?.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.user_details?.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.user_details?.last_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredUsers(filtered);
  }, [searchQuery, selectedOrgId, users]);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load organizations and users in parallel
      const [orgsResponse, usersResponse] = await Promise.all([
        organizationService.list({ is_active: true, page_size: 100 }),
        organizationUserService.list({ page_size: 100 })
      ]);

      setOrganizations(orgsResponse.results);
      setUsers(usersResponse.results);
      setFilteredUsers(usersResponse.results);
    } catch (err: any) {
      console.error('Error loading data:', err);
      setError(err.message || 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeactivate = async (id: string, userName: string) => {
    if (!confirm(`Are you sure you want to deactivate ${userName}? They will lose access to the system.`)) {
      return;
    }

    try {
      await organizationUserService.deactivate(id);
      await loadInitialData();
    } catch (err: any) {
      alert(err.message || 'Failed to deactivate user');
    }
  };

  const columns = [
    {
      header: 'User',
      accessor: (item: OrganizationUser) => (
        <div>
          <div className="font-medium text-slate-900">
            {item.user_details?.first_name} {item.user_details?.last_name}
          </div>
          <div className="flex items-center space-x-1 text-sm text-slate-600">
            <Mail className="h-3 w-3" />
            <span>{item.user_details?.email}</span>
          </div>
        </div>
      )
    },
    {
      header: 'Phone',
      accessor: (item: OrganizationUser) => item.user_details?.phone_number ? (
        <div className="flex items-center space-x-1 text-sm">
          <Phone className="h-3 w-3 text-slate-400" />
          <span>{item.user_details.phone_number}</span>
        </div>
      ) : <span className="text-slate-400">—</span>
    },
    {
      header: 'Organization',
      accessor: (item: OrganizationUser) => (
        <span className="text-sm">{item.organization_name}</span>
      )
    },
    {
      header: 'Role',
      accessor: (item: OrganizationUser) => (
        <Badge variant="info">{item.role_details?.name}</Badge>
      )
    },
    {
      header: 'Permissions',
      accessor: (item: OrganizationUser) => {
        const perms = item.permissions || [];
        return (
          <div className="flex flex-wrap gap-1">
            {perms.length === 0 ? (
              <span className="text-xs text-slate-400">None</span>
            ) : (
              perms.map((perm) => (
                <Badge key={perm} variant="default" className="text-xs">
                  {perm.replace('_', ' ').replace('loan application', 'loan')}
                </Badge>
              ))
            )}
          </div>
        );
      }
    },
    {
      header: 'Password',
      accessor: (item: OrganizationUser) => (
        item.force_password_change ? (
          <Badge variant="warning" className="flex items-center space-x-1">
            <Clock className="h-3 w-3" />
            <span>Pending change</span>
          </Badge>
        ) : (
          <Badge variant="success" className="flex items-center space-x-1">
            <CheckCircle className="h-3 w-3" />
            <span>Changed</span>
          </Badge>
        )
      )
    },
    {
      header: 'Last Login',
      accessor: (item: OrganizationUser) => item.last_login_at ? (
        <span className="text-sm">{new Date(item.last_login_at).toLocaleDateString('en-KE', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        })}</span>
      ) : <span className="text-slate-400">Never</span>
    },
    {
      header: 'Status',
      accessor: (item: OrganizationUser) => (
        <Badge variant={item.is_active ? 'success' : 'danger'}>
          {item.is_active ? 'Active' : 'Inactive'}
        </Badge>
      )
    },
    {
      header: 'Actions',
      accessor: (item: OrganizationUser) => (
        item.is_active && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDeactivate(
              item.id,
              `${item.user_details?.first_name} ${item.user_details?.last_name}`
            )}
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        )
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
          <h1 className="text-3xl font-bold text-slate-900">Users Management</h1>
          <p className="mt-1 text-slate-600">Create and manage organization users with role-based access</p>
        </div>
        <Button onClick={() => setShowModal(true)} disabled={organizations.length === 0}>
          <Plus className="h-4 w-4 mr-2" />
          Create User
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
              Search Users
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                placeholder="Search by name or email..."
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
            No organizations found. Please create an organization first before creating users.
          </p>
        </Card>
      )}

      {/* Users Table */}
      <Card>
        {filteredUsers.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="h-12 w-12 mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No users found</h3>
            <p className="text-slate-600 mb-6">
              {searchQuery || selectedOrgId
                ? 'Try adjusting your search or filter criteria.'
                : 'Get started by creating your first user.'}
            </p>
            {!searchQuery && !selectedOrgId && organizations.length > 0 && (
              <Button onClick={() => setShowModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create User
              </Button>
            )}
          </div>
        ) : (
          <Table columns={columns} data={filteredUsers} />
        )}
      </Card>

      {/* Create User Modal */}
      {showModal && (
        <CreateUserModal
          organizations={organizations}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            loadInitialData();
          }}
        />
      )}
    </div>
  );
}

// Create User Modal Component
interface CreateUserModalProps {
  organizations: Organization[];
  onClose: () => void;
  onSuccess: () => void;
}

function CreateUserModal({ organizations, onClose, onSuccess }: CreateUserModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [formData, setFormData] = useState({
    organization_id: '',
    email: '',
    first_name: '',
    last_name: '',
    phone_number: '',
    role_id: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState('');

  // Load roles when organization changes
  useEffect(() => {
    if (formData.organization_id) {
      loadRoles(formData.organization_id);
    } else {
      setRoles([]);
    }
  }, [formData.organization_id]);

  const loadRoles = async (orgId: string) => {
    try {
      setLoadingRoles(true);
      const response = await roleService.list({ organization_id: orgId, is_active: true, page_size: 100 });
      setRoles(response.results);
    } catch (err: any) {
      console.error('Error loading roles:', err);
    } finally {
      setLoadingRoles(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});
    setSuccessMessage('');

    try {
      const response = await organizationUserService.createWithEmail(formData);

      // Show success message
      setSuccessMessage(
        `User created successfully! Onboarding email sent to ${formData.email} with login credentials and role information.`
      );

      // Reset form
      setFormData({
        organization_id: '',
        email: '',
        first_name: '',
        last_name: '',
        phone_number: '',
        role_id: '',
      });

      // Close modal after 3 seconds
      setTimeout(() => {
        onSuccess();
      }, 3000);
    } catch (err: any) {
      if (err.data) {
        setErrors(err.data);
      } else {
        alert(err.message || 'Failed to create user');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (successMessage) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <Card className="max-w-md w-full mx-4">
          <div className="p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">User Created Successfully!</h2>
            <p className="text-slate-600 mb-6">{successMessage}</p>
            <Button onClick={onSuccess} className="w-full">
              Done
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Create New User</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Organization Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Organization *
              </label>
              <select
                value={formData.organization_id}
                onChange={(e) => setFormData({ ...formData, organization_id: e.target.value, role_id: '' })}
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
              {errors.organization_id && (
                <p className="mt-1 text-sm text-red-600">{errors.organization_id}</p>
              )}
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Role *
              </label>
              <select
                value={formData.role_id}
                onChange={(e) => setFormData({ ...formData, role_id: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080] focus:border-transparent"
                required
                disabled={!formData.organization_id || loadingRoles}
              >
                <option value="">
                  {loadingRoles ? 'Loading roles...' : formData.organization_id ? 'Select a role' : 'Select organization first'}
                </option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
              {errors.role_id && (
                <p className="mt-1 text-sm text-red-600">{errors.role_id}</p>
              )}
            </div>

            {/* User Information */}
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name *"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                error={errors.first_name}
                placeholder="John"
                required
              />

              <Input
                label="Last Name *"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                error={errors.last_name}
                placeholder="Doe"
                required
              />
            </div>

            <Input
              label="Email Address *"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              error={errors.email}
              placeholder="john.doe@company.com"
              leftIcon={<Mail className="h-5 w-5" />}
              required
            />

            <Input
              label="Phone Number"
              type="tel"
              value={formData.phone_number}
              onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
              error={errors.phone_number}
              placeholder="+254712345678"
              leftIcon={<Phone className="h-5 w-5" />}
            />

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">What happens next?</h4>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li>System will generate a secure temporary password</li>
                <li>User will receive an email with login credentials</li>
                <li>User must change password on first login</li>
                <li>Access will be restricted based on assigned role permissions</li>
              </ul>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" isLoading={isLoading}>
                Create User & Send Email
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}
