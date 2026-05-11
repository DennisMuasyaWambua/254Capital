import React, { useState, useEffect } from 'react';
import { Card } from '@/components/salary-checkoff/ui/Card';
import { Table } from '@/components/salary-checkoff/ui/Table';
import { Button } from '@/components/salary-checkoff/ui/Button';
import { Input } from '@/components/salary-checkoff/ui/Input';
import { Badge } from '@/components/salary-checkoff/ui/Badge';
import { Loader2, Plus, Building2, Mail, Phone, Edit, Trash2, Search } from 'lucide-react';
import { organizationService, Organization } from '@/services/salary-checkoff/company-management.service';

interface OrganizationsProps {
  onNavigate?: (page: string) => void;
}

export function Organizations({ onNavigate }: OrganizationsProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [filteredOrganizations, setFilteredOrganizations] = useState<Organization[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);

  useEffect(() => {
    console.log('[Organizations] Component mounted, loading organizations...');
    loadOrganizations();
  }, []);

  useEffect(() => {
    // Filter organizations based on search query
    if (searchQuery) {
      const filtered = organizations.filter(org =>
        org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        org.contact_email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredOrganizations(filtered);
    } else {
      setFilteredOrganizations(organizations);
    }
  }, [searchQuery, organizations]);

  const loadOrganizations = async () => {
    try {
      console.log('[Organizations] Loading organizations...');
      setIsLoading(true);
      setError(null);
      const response = await organizationService.list({ page_size: 100 });
      console.log('[Organizations] Response received:', response);

      // Defensive: ensure response and results exist
      if (!response || !Array.isArray(response.results)) {
        console.error('[Organizations] Invalid response format:', response);
        setError('Invalid data format received from server');
        setOrganizations([]);
        setFilteredOrganizations([]);
        return;
      }

      console.log('[Organizations] Loaded', response.results.length, 'organizations');
      setOrganizations(response.results);
      setFilteredOrganizations(response.results);
    } catch (err: any) {
      console.error('[Organizations] Error loading organizations:', err);
      setError(err.message || 'Failed to load organizations');
      // Set empty arrays on error to prevent blank screen
      setOrganizations([]);
      setFilteredOrganizations([]);
    } finally {
      setIsLoading(false);
      console.log('[Organizations] Loading complete');
    }
  };

  const handleCreateOrEdit = (org?: Organization) => {
    setEditingOrg(org || null);
    setShowModal(true);
  };

  const handleDeactivate = async (id: string) => {
    if (!confirm('Are you sure you want to deactivate this organization? All associated users will lose access.')) {
      return;
    }

    try {
      await organizationService.deactivate(id);
      await loadOrganizations();
    } catch (err: any) {
      alert(err.message || 'Failed to deactivate organization');
    }
  };

  const columns = [
    {
      header: 'Organization Name',
      accessor: (item: Organization) => (
        <div className="flex items-center space-x-2">
          <Building2 className="h-4 w-4 text-slate-400" />
          <span className="font-medium">{item.name}</span>
        </div>
      )
    },
    {
      header: 'Contact Email',
      accessor: (item: Organization) => item.contact_email ? (
        <div className="flex items-center space-x-2 text-sm">
          <Mail className="h-4 w-4 text-slate-400" />
          <span>{item.contact_email}</span>
        </div>
      ) : <span className="text-slate-400">—</span>
    },
    {
      header: 'Contact Phone',
      accessor: (item: Organization) => item.contact_phone ? (
        <div className="flex items-center space-x-2 text-sm">
          <Phone className="h-4 w-4 text-slate-400" />
          <span>{item.contact_phone}</span>
        </div>
      ) : <span className="text-slate-400">—</span>
    },
    {
      header: 'Active Users',
      accessor: (item: Organization) => (
        <span className="text-sm font-medium">{item.active_users_count || 0}</span>
      )
    },
    {
      header: 'Active Roles',
      accessor: (item: Organization) => (
        <span className="text-sm font-medium">{item.active_roles_count || 0}</span>
      )
    },
    {
      header: 'Status',
      accessor: (item: Organization) => (
        <Badge variant={item.is_active ? 'success' : 'danger'}>
          {item.is_active ? 'Active' : 'Inactive'}
        </Badge>
      )
    },
    {
      header: 'Created',
      accessor: (item: Organization) => {
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
      accessor: (item: Organization) => (
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
              onClick={() => handleDeactivate(item.id)}
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          )}
        </div>
      )
    }
  ];

  console.log('[Organizations] Rendering:', { isLoading, organizationsCount: organizations.length, filteredCount: filteredOrganizations.length, error });

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
          <h1 className="text-3xl font-bold text-slate-900">Organizations</h1>
          <p className="mt-1 text-slate-600">Manage company organizations and their settings</p>
        </div>
        <Button onClick={() => handleCreateOrEdit()}>
          <Plus className="h-4 w-4 mr-2" />
          Create Organization
        </Button>
      </div>

      {/* Search Bar */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input
            placeholder="Search organizations by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {/* Error State */}
      {error && (
        <Card className="p-4 bg-red-50 border-red-200">
          <p className="text-red-600">{error}</p>
        </Card>
      )}

      {/* Organizations Table */}
      <Card>
        {filteredOrganizations.length === 0 ? (
          <div className="p-12 text-center">
            <Building2 className="h-12 w-12 mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No organizations found</h3>
            <p className="text-slate-600 mb-6">
              {searchQuery ? 'Try adjusting your search query.' : 'Get started by creating your first organization.'}
            </p>
            {!searchQuery && (
              <Button onClick={() => handleCreateOrEdit()}>
                <Plus className="h-4 w-4 mr-2" />
                Create Organization
              </Button>
            )}
          </div>
        ) : (
          <Table
            columns={columns}
            data={filteredOrganizations}
            keyExtractor={(item) => item.id}
          />
        )}
      </Card>

      {/* Create/Edit Modal */}
      {showModal && (
        <OrganizationModal
          organization={editingOrg}
          onClose={() => {
            setShowModal(false);
            setEditingOrg(null);
          }}
          onSuccess={() => {
            setShowModal(false);
            setEditingOrg(null);
            loadOrganizations();
          }}
        />
      )}
    </div>
  );
}

// Organization Create/Edit Modal Component
interface OrganizationModalProps {
  organization?: Organization | null;
  onClose: () => void;
  onSuccess: () => void;
}

function OrganizationModal({ organization, onClose, onSuccess }: OrganizationModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: organization?.name || '',
    address: organization?.address || '',
    contact_email: organization?.contact_email || '',
    contact_phone: organization?.contact_phone || '',
    tax_id: organization?.tax_id || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      if (organization) {
        await organizationService.update(organization.id, formData);
      } else {
        await organizationService.create(formData);
      }
      onSuccess();
    } catch (err: any) {
      if (err.data) {
        setErrors(err.data);
      } else {
        alert(err.message || 'Failed to save organization');
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
            {organization ? 'Edit Organization' : 'Create Organization'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Organization Name *"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              error={errors.name}
              placeholder="e.g., Acme Financial Corp"
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Contact Email"
                type="email"
                value={formData.contact_email}
                onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                error={errors.contact_email}
                placeholder="hr@company.com"
                leftIcon={<Mail className="h-5 w-5" />}
              />

              <Input
                label="Contact Phone"
                type="tel"
                value={formData.contact_phone}
                onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                error={errors.contact_phone}
                placeholder="+254712345678"
                leftIcon={<Phone className="h-5 w-5" />}
              />
            </div>

            <Input
              label="Address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              error={errors.address}
              placeholder="123 Main St, Nairobi"
            />

            <Input
              label="Tax ID"
              value={formData.tax_id}
              onChange={(e) => setFormData({ ...formData, tax_id: e.target.value })}
              error={errors.tax_id}
              placeholder="P051234567X"
            />

            <div className="flex justify-end space-x-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" isLoading={isLoading}>
                {organization ? 'Update' : 'Create'} Organization
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}
