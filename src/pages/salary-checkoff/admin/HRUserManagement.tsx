import React, { useState, useEffect } from 'react';
import { Card } from '@/components/salary-checkoff/ui/Card';
import { Table } from '@/components/salary-checkoff/ui/Table';
import { Badge } from '@/components/salary-checkoff/ui/Badge';
import { Button } from '@/components/salary-checkoff/ui/Button';
import { Input } from '@/components/salary-checkoff/ui/Input';
import {
  hrUserService,
  HRUser,
  CreateHRUserRequest,
  UpdateHRUserRequest,
} from '@/services/salary-checkoff/hr-user.service';
import {
  employerService,
  Employer,
} from '@/services/salary-checkoff/employer.service';
import { authService } from '@/services/salary-checkoff/auth.service';
import { formatDate } from '@/utils/formatters';
import {
  Loader2,
  AlertCircle,
  X,
  Users,
  Search,
  Plus,
  Edit,
  Power,
  Trash2,
  Eye,
  KeyRound,
  CheckCircle,
} from 'lucide-react';

interface HRUserManagementProps {
  onNavigate?: (page: string) => void;
}

type ModalType = 'create' | 'edit' | 'view' | 'deactivate' | 'delete' | 'reset-password' | null;

export function HRUserManagement({ onNavigate }: HRUserManagementProps) {
  const [hrUsers, setHRUsers] = useState<HRUser[]>([]);
  const [employers, setEmployers] = useState<Employer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterActive, setFilterActive] = useState<boolean | undefined>(undefined);

  const [modalType, setModalType] = useState<ModalType>(null);
  const [selectedUser, setSelectedUser] = useState<HRUser | null>(null);
  const [formData, setFormData] = useState<CreateHRUserRequest | UpdateHRUserRequest>({
    email: '',
    phone_number: '',
    first_name: '',
    last_name: '',
    employer_id: '',
    position: '',
  });
  const [deactivationReason, setDeactivationReason] = useState('');
  const [deletionReason, setDeletionReason] = useState('');
  const [tempPassword, setTempPassword] = useState('');

  useEffect(() => {
    loadHRUsers();
    loadEmployers();
  }, []);

  const loadHRUsers = async (search?: string, isActive?: boolean) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await hrUserService.listHRUsers({
        search,
        is_active: isActive,
      });
      setHRUsers(response.results);
    } catch (error: any) {
      console.error('Error loading HR users:', error);
      setError(error.message || 'Failed to load HR users');
    } finally {
      setIsLoading(false);
    }
  };

  const loadEmployers = async () => {
    try {
      const response = await employerService.listEmployers();
      setEmployers(response.results);
    } catch (error: any) {
      console.error('Error loading employers:', error);
    }
  };

  const handleSearch = () => {
    loadHRUsers(searchQuery, filterActive);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setFilterActive(undefined);
    loadHRUsers();
  };

  const handleCreateUser = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await hrUserService.createHRUser(formData as CreateHRUserRequest);

      setTempPassword(response.temporary_password);
      setSuccess(`HR user created successfully! Temporary password: ${response.temporary_password}`);

      loadHRUsers();
      setTimeout(() => {
        setModalType(null);
        setFormData({
          email: '',
          phone_number: '',
          first_name: '',
          last_name: '',
          employer_id: '',
          position: '',
        });
      }, 5000);
    } catch (error: any) {
      console.error('Error creating HR user:', error);
      setError(error.message || 'Failed to create HR user');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    try {
      setIsLoading(true);
      setError(null);

      await hrUserService.updateHRUser(selectedUser.id, formData as UpdateHRUserRequest);

      setSuccess('HR user updated successfully');
      loadHRUsers();
      setTimeout(() => {
        setModalType(null);
        setSelectedUser(null);
      }, 2000);
    } catch (error: any) {
      console.error('Error updating HR user:', error);
      setError(error.message || 'Failed to update HR user');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleActive = async (activate: boolean) => {
    if (!selectedUser) return;

    try {
      setIsLoading(true);
      setError(null);

      await hrUserService.toggleHRUserActive(selectedUser.id, {
        is_active: activate,
        reason: deactivationReason,
      });

      setSuccess(
        `HR user ${activate ? 'activated' : 'deactivated'} successfully`
      );
      setDeactivationReason('');
      loadHRUsers();
      setTimeout(() => {
        setModalType(null);
        setSelectedUser(null);
      }, 2000);
    } catch (error: any) {
      console.error('Error toggling HR user status:', error);
      setError(error.message || 'Failed to update HR user status');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      setIsLoading(true);
      setError(null);

      await hrUserService.deleteHRUser(selectedUser.id, {
        confirm: true,
        reason: deletionReason,
      });

      setSuccess('HR user deleted successfully');
      setDeletionReason('');
      loadHRUsers();
      setTimeout(() => {
        setModalType(null);
        setSelectedUser(null);
      }, 2000);
    } catch (error: any) {
      console.error('Error deleting HR user:', error);
      setError(error.message || 'Failed to delete HR user');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!selectedUser) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await authService.adminResetUserPassword({
        user_id: selectedUser.id,
        send_otp: true,
      });

      setSuccess(`Password reset OTP sent to ${response.masked_phone}`);
      setTimeout(() => {
        setModalType(null);
        setSelectedUser(null);
      }, 3000);
    } catch (error: any) {
      console.error('Error resetting password:', error);
      setError(error.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = (type: ModalType, user?: HRUser) => {
    setModalType(type);
    setSelectedUser(user || null);
    setError(null);
    setSuccess(null);

    if (type === 'edit' && user) {
      setFormData({
        email: user.email,
        phone_number: user.phone_number,
        first_name: user.first_name,
        last_name: user.last_name,
        employer_id: user.employer.id,
        position: user.position,
      });
    } else if (type === 'create') {
      setFormData({
        email: '',
        phone_number: '',
        first_name: '',
        last_name: '',
        employer_id: '',
        position: '',
      });
    }
  };

  const columns = [
    {
      header: 'Name',
      accessor: (item: HRUser) => `${item.first_name} ${item.last_name}`,
      className: 'font-medium',
    },
    {
      header: 'Email',
      accessor: 'email',
    },
    {
      header: 'Phone',
      accessor: 'phone_number',
    },
    {
      header: 'Employer',
      accessor: (item: HRUser) => item.employer.name,
    },
    {
      header: 'Position',
      accessor: 'position',
    },
    {
      header: 'Status',
      accessor: (item: HRUser) => (
        <Badge variant={item.is_active ? 'approved' : 'rejected'}>
          {item.is_active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      header: 'Last Login',
      accessor: (item: HRUser) =>
        item.last_login ? formatDate(item.last_login) : 'Never',
    },
    {
      header: 'Actions',
      accessor: (item: HRUser) => (
        <div className="flex gap-2">
          <button
            onClick={() => openModal('view', item)}
            className="text-slate-600 hover:text-[#008080]"
            title="View Details"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => openModal('edit', item)}
            className="text-slate-600 hover:text-[#008080]"
            title="Edit"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => openModal('reset-password', item)}
            className="text-slate-600 hover:text-[#008080]"
            title="Reset Password"
          >
            <KeyRound className="h-4 w-4" />
          </button>
          <button
            onClick={() => openModal('deactivate', item)}
            className={`${
              item.is_active
                ? 'text-yellow-600 hover:text-yellow-700'
                : 'text-green-600 hover:text-green-700'
            }`}
            title={item.is_active ? 'Deactivate' : 'Activate'}
          >
            <Power className="h-4 w-4" />
          </button>
          <button
            onClick={() => openModal('delete', item)}
            className="text-red-600 hover:text-red-700"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  const renderModal = () => {
    if (!modalType) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900">
                {modalType === 'create' && 'Create New HR User'}
                {modalType === 'edit' && 'Edit HR User'}
                {modalType === 'view' && 'HR User Details'}
                {modalType === 'deactivate' &&
                  (selectedUser?.is_active ? 'Deactivate HR User' : 'Activate HR User')}
                {modalType === 'delete' && 'Delete HR User'}
                {modalType === 'reset-password' && 'Reset Password'}
              </h3>
              <button
                onClick={() => setModalType(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-800">
                <AlertCircle className="h-5 w-5 mr-2 text-red-600 flex-shrink-0" />
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center text-green-800">
                <CheckCircle className="h-5 w-5 mr-2 text-green-600 flex-shrink-0" />
                {success}
              </div>
            )}

            {(modalType === 'create' || modalType === 'edit') && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      First Name
                    </label>
                    <Input
                      type="text"
                      value={(formData as CreateHRUserRequest).first_name || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, first_name: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Last Name
                    </label>
                    <Input
                      type="text"
                      value={(formData as CreateHRUserRequest).last_name || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, last_name: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Email
                  </label>
                  <Input
                    type="email"
                    value={(formData as CreateHRUserRequest).email || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Phone Number
                  </label>
                  <Input
                    type="tel"
                    value={(formData as CreateHRUserRequest).phone_number || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, phone_number: e.target.value })
                    }
                    placeholder="0712345678"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Employer
                  </label>
                  <select
                    value={(formData as CreateHRUserRequest).employer_id || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, employer_id: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080]"
                    required
                  >
                    <option value="">Select Employer</option>
                    {employers.map((employer) => (
                      <option key={employer.id} value={employer.id}>
                        {employer.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Position
                  </label>
                  <Input
                    type="text"
                    value={(formData as CreateHRUserRequest).position || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, position: e.target.value })
                    }
                    placeholder="HR Manager"
                    required
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setModalType(null)}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={modalType === 'create' ? handleCreateUser : handleUpdateUser}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {modalType === 'create' ? 'Creating...' : 'Updating...'}
                      </>
                    ) : modalType === 'create' ? (
                      'Create HR User'
                    ) : (
                      'Update HR User'
                    )}
                  </Button>
                </div>
              </div>
            )}

            {modalType === 'view' && selectedUser && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-500">Name</p>
                    <p className="font-medium">
                      {selectedUser.first_name} {selectedUser.last_name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Email</p>
                    <p className="font-medium">{selectedUser.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Phone</p>
                    <p className="font-medium">{selectedUser.phone_number}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Position</p>
                    <p className="font-medium">{selectedUser.position}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Employer</p>
                    <p className="font-medium">{selectedUser.employer.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Status</p>
                    <Badge variant={selectedUser.is_active ? 'approved' : 'rejected'}>
                      {selectedUser.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Created</p>
                    <p className="font-medium">{formatDate(selectedUser.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Last Login</p>
                    <p className="font-medium">
                      {selectedUser.last_login
                        ? formatDate(selectedUser.last_login)
                        : 'Never'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {modalType === 'deactivate' && selectedUser && (
              <div className="space-y-4">
                <p className="text-slate-600">
                  {selectedUser.is_active
                    ? 'Are you sure you want to deactivate this HR user? They will no longer be able to log in to the system.'
                    : 'Are you sure you want to activate this HR user? They will be able to log in to the system.'}
                </p>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Reason (Optional)
                  </label>
                  <textarea
                    value={deactivationReason}
                    onChange={(e) => setDeactivationReason(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080]"
                    rows={3}
                    placeholder="Enter reason for status change..."
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setModalType(null)}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => handleToggleActive(!selectedUser.is_active)}
                    disabled={isLoading}
                    variant={selectedUser.is_active ? 'destructive' : 'default'}
                    className="flex-1"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : selectedUser.is_active ? (
                      'Deactivate'
                    ) : (
                      'Activate'
                    )}
                  </Button>
                </div>
              </div>
            )}

            {modalType === 'delete' && selectedUser && (
              <div className="space-y-4">
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800 font-medium">Warning: This action cannot be undone!</p>
                  <p className="text-red-700 text-sm mt-1">
                    Deleting this HR user will permanently remove their account and all associated data.
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Reason for Deletion (Required)
                  </label>
                  <textarea
                    value={deletionReason}
                    onChange={(e) => setDeletionReason(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080]"
                    rows={3}
                    placeholder="Enter reason for deletion..."
                    required
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setModalType(null)}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleDeleteUser}
                    disabled={isLoading || !deletionReason}
                    variant="destructive"
                    className="flex-1"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      'Delete Permanently'
                    )}
                  </Button>
                </div>
              </div>
            )}

            {modalType === 'reset-password' && selectedUser && (
              <div className="space-y-4">
                <p className="text-slate-600">
                  Send a password reset OTP to {selectedUser.first_name} {selectedUser.last_name}?
                  <br />
                  <span className="text-sm text-slate-500">
                    The OTP will be sent to their registered phone number.
                  </span>
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setModalType(null)}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleResetPassword}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending OTP...
                      </>
                    ) : (
                      'Send Reset OTP'
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (isLoading && hrUsers.length === 0) {
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
            <Users className="h-6 w-6 text-[#008080]" />
            HR User Management
          </h1>
          <p className="text-slate-500">
            Manage HR user accounts and permissions
          </p>
        </div>
        <Button onClick={() => openModal('create')}>
          <Plus className="mr-2 h-4 w-4" />
          Create HR User
        </Button>
      </div>

      {error && !modalType && (
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

      {success && !modalType && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center text-green-800">
          <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
          {success}
          <button
            onClick={() => setSuccess(null)}
            className="ml-auto text-green-600 hover:text-green-800"
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
              placeholder="Search by name, email, or phone..."
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
          <div className="flex gap-2">
            <select
              value={filterActive === undefined ? 'all' : filterActive ? 'active' : 'inactive'}
              onChange={(e) => {
                const value = e.target.value;
                setFilterActive(
                  value === 'all' ? undefined : value === 'active'
                );
                loadHRUsers(searchQuery, value === 'all' ? undefined : value === 'active');
              }}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080]"
            >
              <option value="all">All Users</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
            <Badge variant="default">{hrUsers.length} HR Users</Badge>
          </div>
        </div>

        {hrUsers.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            {searchQuery || filterActive !== undefined
              ? 'No HR users found matching your filters'
              : 'No HR users in the system yet'}
          </div>
        ) : (
          <Table
            data={hrUsers}
            columns={columns}
            keyExtractor={(item) => item.id}
          />
        )}
      </Card>

      {renderModal()}
    </div>
  );
}
