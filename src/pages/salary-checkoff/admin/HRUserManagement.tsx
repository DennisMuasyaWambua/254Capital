import React, { useState, useEffect } from 'react';
import { Card } from '@/components/salary-checkoff/ui/Card';
import { Button } from '@/components/salary-checkoff/ui/Button';
import { Input } from '@/components/salary-checkoff/ui/Input';
import { Select } from '@/components/salary-checkoff/ui/Select';
import { Table } from '@/components/salary-checkoff/ui/Table';
import { Badge } from '@/components/salary-checkoff/ui/Badge';
import { ConfirmDialog } from '@/components/salary-checkoff/ui/ConfirmDialog';
import {
  hrUserService,
  HRUser,
  CreateHRUserRequest,
  UpdateHRUserRequest,
} from '@/services/salary-checkoff/hruser.service';
import { employerService } from '@/services/salary-checkoff/employer.service';
import {
  UserPlus,
  Edit2,
  Trash2,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Power,
  Eye,
  EyeOff,
} from 'lucide-react';

interface HRUserManagementProps {
  onNavigate: (page: string) => void;
}

export function HRUserManagement({ onNavigate: _onNavigate }: HRUserManagementProps) {
  const [hrUsers, setHrUsers] = useState<HRUser[]>([]);
  const [employers, setEmployers] = useState<Array<{ id: string; name: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingEmployers, setIsLoadingEmployers] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<HRUser | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    position: '',
    employer_id: '',
    password: '',
  });

  const [editFormData, setEditFormData] = useState<UpdateHRUserRequest>({});
  const [showPassword, setShowPassword] = useState(false);
  const [generatedCredentials, setGeneratedCredentials] = useState<{
    email: string;
    password: string;
  } | null>(null);

  // Search and filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filterEmployer, setFilterEmployer] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    loadHRUsers();
    loadEmployers();
  }, []);

  const loadHRUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await hrUserService.listHRUsers({
        search: searchQuery || undefined,
        employer_id: filterEmployer || undefined,
        is_active: filterStatus ? filterStatus === 'active' : undefined,
      });
      setHrUsers(response.results || []);
    } catch (error: any) {
      console.error('Error loading HR users:', error);
      setError('Failed to load HR users: ' + (error.message || 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  const loadEmployers = async () => {
    try {
      setIsLoadingEmployers(true);
      const employerResponse = await employerService.listEmployers();
      setEmployers(
        employerResponse.results
          .filter((emp) => emp.is_active)
          .map((emp) => ({ id: emp.id, name: emp.name }))
      );
    } catch (error: any) {
      console.error('Error loading employers:', error);
    } finally {
      setIsLoadingEmployers(false);
    }
  };

  const handleSearch = () => {
    loadHRUsers();
  };

  const resetForm = () => {
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      phone_number: '',
      position: '',
      employer_id: '',
      password: '',
    });
    setGeneratedCredentials(null);
    setShowPassword(false);
  };

  const handleAddUser = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Normalize phone number
      const normalizedPhone = formData.phone_number.replace(/\s+/g, '').replace(/[^\d+]/g, '');

      const requestData: CreateHRUserRequest = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone_number: normalizedPhone,
        position: formData.position,
        employer_id: formData.employer_id,
        password: formData.password,
      };

      const response = await hrUserService.createHRUser(requestData);

      setGeneratedCredentials(response.credentials);
      setSuccessMessage('HR user created successfully!');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);

      loadHRUsers();

      // Keep modal open to show credentials
    } catch (error: any) {
      console.error('Error creating HR user:', error);
      setError(error.message || 'Failed to create HR user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (user: HRUser) => {
    setSelectedUser(user);
    setEditFormData({
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      phone_number: user.phone_number,
      position: user.position,
      employer_id: user.employer.id,
    });
    setShowEditModal(true);
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // Normalize phone number if changed
      const updateData: UpdateHRUserRequest = { ...editFormData };
      if (updateData.phone_number) {
        updateData.phone_number = updateData.phone_number.replace(/\s+/g, '').replace(/[^\d+]/g, '');
      }

      await hrUserService.updateHRUser(selectedUser.id, updateData);

      setSuccessMessage('HR user updated successfully!');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);

      setShowEditModal(false);
      setSelectedUser(null);
      loadHRUsers();
    } catch (error: any) {
      console.error('Error updating HR user:', error);
      setError(error.message || 'Failed to update HR user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (user: HRUser) => {
    try {
      await hrUserService.toggleActiveStatus(user.id);

      setSuccessMessage(`HR user ${user.is_active ? 'deactivated' : 'activated'} successfully!`);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);

      loadHRUsers();
    } catch (error: any) {
      console.error('Error toggling user status:', error);
      setError(error.message || 'Failed to toggle user status');
    }
  };

  const handleDeleteClick = (user: HRUser) => {
    setSelectedUser(user);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedUser) return;

    setIsDeleting(true);
    setError(null);

    try {
      await hrUserService.deleteHRUser(selectedUser.id);

      setSuccessMessage('HR user deleted successfully!');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);

      setShowDeleteDialog(false);
      setSelectedUser(null);
      loadHRUsers();
    } catch (error: any) {
      console.error('Error deleting HR user:', error);
      setError(error.message || 'Failed to delete HR user');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
    resetForm();
    setError(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">HR User Management</h1>
          <p className="text-slate-600 mt-1">
            Manage HR manager accounts and permissions
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Add HR User
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-800">
          <AlertCircle className="h-5 w-5 mr-2 text-red-600 flex-shrink-0" />
          {error}
        </div>
      )}

      {showSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center text-emerald-800 animate-fade-in">
          <CheckCircle2 className="h-5 w-5 mr-2 text-emerald-600" />
          {successMessage}
        </div>
      )}

      {/* Search and Filter */}
      <Card>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Select
              value={filterEmployer}
              onChange={(e) => setFilterEmployer(e.target.value)}
              options={employers.map((emp) => ({ value: emp.id, label: emp.name }))}
            />
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              options={[
                { value: 'active', label: 'Active Only' },
                { value: 'inactive', label: 'Inactive Only' },
              ]}
            />
            <Button onClick={handleSearch} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
        </div>
      </Card>

      {/* HR Users Table */}
      <Card>
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-slate-600">
              Total HR users: {hrUsers.length}
            </p>
            <Button
              variant="outline"
              onClick={loadHRUsers}
              disabled={isLoading}
              size="sm"
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`}
              />
              Refresh
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#008080]" />
            </div>
          ) : hrUsers.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <p>No HR users found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table
                data={hrUsers}
                keyExtractor={(user) => user.id}
                columns={[
                  {
                    header: 'Name',
                    accessor: (user) => (
                      <div>
                        <div className="font-medium text-slate-900">
                          {user.first_name} {user.last_name}
                        </div>
                        <div className="text-xs text-slate-500">{user.position}</div>
                      </div>
                    ),
                  },
                  {
                    header: 'Contact',
                    accessor: (user) => (
                      <div>
                        <div className="text-sm">{user.email}</div>
                        <div className="text-xs text-slate-500">{user.phone_number}</div>
                      </div>
                    ),
                  },
                  {
                    header: 'Employer',
                    accessor: (user) => user.employer.name,
                  },
                  {
                    header: 'Status',
                    accessor: (user) => (
                      <Badge variant={user.is_active ? 'success' : 'declined'}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    ),
                  },
                  {
                    header: 'Last Login',
                    accessor: (user) => (
                      <span className="text-sm text-slate-600">
                        {user.last_login
                          ? new Date(user.last_login).toLocaleDateString()
                          : 'Never'}
                      </span>
                    ),
                  },
                  {
                    header: 'Actions',
                    accessor: (user) => (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditClick(user)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Edit user"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleToggleActive(user)}
                          className={`p-1 rounded transition-colors ${
                            user.is_active
                              ? 'text-orange-600 hover:bg-orange-50'
                              : 'text-green-600 hover:bg-green-50'
                          }`}
                          title={user.is_active ? 'Deactivate' : 'Activate'}
                        >
                          <Power className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(user)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete user"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ),
                  },
                ]}
              />
            </div>
          )}
        </div>
      </Card>

      {/* Add HR User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slide-in-up">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 sticky top-0 bg-white">
              <h3 className="text-lg font-semibold text-slate-900">Add New HR User</h3>
              <button
                onClick={handleCloseAddModal}
                disabled={isSubmitting}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {generatedCredentials ? (
                <div className="space-y-4">
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <h4 className="font-semibold text-emerald-900 mb-2">
                      HR User Created Successfully!
                    </h4>
                    <p className="text-sm text-emerald-700 mb-4">
                      Please save these credentials securely. The HR manager should change
                      the password after first login.
                    </p>
                    <div className="bg-white rounded border border-emerald-200 p-4 space-y-2">
                      <div>
                        <span className="text-xs text-emerald-700 font-medium">Email:</span>
                        <div className="font-mono text-sm bg-emerald-50 px-2 py-1 rounded mt-1">
                          {generatedCredentials.email}
                        </div>
                      </div>
                      <div>
                        <span className="text-xs text-emerald-700 font-medium">
                          Temporary Password:
                        </span>
                        <div className="font-mono text-sm bg-emerald-50 px-2 py-1 rounded mt-1">
                          {generatedCredentials.password}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={handleCloseAddModal}>Close</Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="First Name *"
                      name="first_name"
                      value={formData.first_name}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, first_name: e.target.value }))
                      }
                      required
                    />
                    <Input
                      label="Last Name *"
                      name="last_name"
                      value={formData.last_name}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, last_name: e.target.value }))
                      }
                      required
                    />
                    <Input
                      label="Email Address (Login ID) *"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, email: e.target.value }))
                      }
                      required
                      helperText="Will be used for HR portal login"
                    />
                    <Input
                      label="Phone Number *"
                      name="phone_number"
                      value={formData.phone_number}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, phone_number: e.target.value }))
                      }
                      required
                      placeholder="+254712345678"
                    />
                    <Input
                      label="Position/Title *"
                      name="position"
                      value={formData.position}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, position: e.target.value }))
                      }
                      required
                      placeholder="e.g. HR Manager"
                    />
                    <Select
                      label="Employer *"
                      name="employer_id"
                      value={formData.employer_id}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, employer_id: e.target.value }))
                      }
                      disabled={isLoadingEmployers}
                      required
                      options={employers.map((emp) => ({
                        value: emp.id,
                        label: emp.name,
                      }))}
                    />
                    <div className="relative">
                      <Input
                        label="Temporary Password *"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, password: e.target.value }))
                        }
                        required
                        helperText="Minimum 8 characters"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-9 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      <strong>Note:</strong> The HR manager will receive login credentials and
                      should change their password after first login.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={handleCloseAddModal}
                      disabled={isSubmitting}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleAddUser}
                      disabled={isSubmitting}
                      isLoading={isSubmitting}
                      className="flex-1"
                    >
                      Create HR User
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit HR User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slide-in-up">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 sticky top-0 bg-white">
              <h3 className="text-lg font-semibold text-slate-900">
                Edit HR User: {selectedUser.first_name} {selectedUser.last_name}
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                disabled={isSubmitting}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  name="first_name"
                  value={editFormData.first_name || ''}
                  onChange={(e) =>
                    setEditFormData((prev) => ({ ...prev, first_name: e.target.value }))
                  }
                />
                <Input
                  label="Last Name"
                  name="last_name"
                  value={editFormData.last_name || ''}
                  onChange={(e) =>
                    setEditFormData((prev) => ({ ...prev, last_name: e.target.value }))
                  }
                />
                <Input
                  label="Email Address"
                  name="email"
                  type="email"
                  value={editFormData.email || ''}
                  onChange={(e) =>
                    setEditFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                />
                <Input
                  label="Phone Number"
                  name="phone_number"
                  value={editFormData.phone_number || ''}
                  onChange={(e) =>
                    setEditFormData((prev) => ({ ...prev, phone_number: e.target.value }))
                  }
                />
                <Input
                  label="Position/Title"
                  name="position"
                  value={editFormData.position || ''}
                  onChange={(e) =>
                    setEditFormData((prev) => ({ ...prev, position: e.target.value }))
                  }
                />
                <Select
                  label="Employer"
                  name="employer_id"
                  value={editFormData.employer_id || ''}
                  onChange={(e) =>
                    setEditFormData((prev) => ({ ...prev, employer_id: e.target.value }))
                  }
                  options={employers.map((emp) => ({
                    value: emp.id,
                    label: emp.name,
                  }))}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowEditModal(false)}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdateUser}
                  disabled={isSubmitting}
                  isLoading={isSubmitting}
                  className="flex-1"
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleConfirmDelete}
        title="Delete HR User"
        description={
          selectedUser ? (
            <div>
              <p className="mb-4">
                Are you sure you want to delete{' '}
                <strong>
                  {selectedUser.first_name} {selectedUser.last_name}
                </strong>
                ?
              </p>
              <div className="bg-red-50 border border-red-200 rounded p-3 text-sm">
                <p className="font-semibold text-red-900 mb-2">This action will:</p>
                <ul className="list-disc list-inside text-red-800 space-y-1">
                  <li>Permanently remove this HR user account</li>
                  <li>Revoke their access to the HR portal</li>
                  <li>Cannot be undone</li>
                </ul>
              </div>
            </div>
          ) : (
            'Are you sure you want to delete this HR user?'
          )
        }
        confirmText="Delete HR User"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
