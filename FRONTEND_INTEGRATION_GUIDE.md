# Company Management Feature - Frontend Integration Guide

## Overview

This guide explains how to integrate the newly created Company Management UI components into your existing application routing and navigation structure.

## ✅ Components Created

### HR Admin Pages
Located in: `src/pages/salary-checkoff/hr/company-management/`

1. **Organizations.tsx** - Manage organizations (list, create, edit, deactivate)
2. **Roles.tsx** - Manage roles with permissions (view, approve, decline)
3. **Users.tsx** - Create users with email onboarding
4. **AuditLogs.tsx** - View system audit trail

### Organization User Pages (Restricted Interface)
Located in: `src/pages/salary-checkoff/organization-user/`

1. **PendingApplicationsRestricted.tsx** - View pending applications with permission-based actions
2. **ChangePasswordPage.tsx** - Change password with strength validation
3. **OrganizationUserLayout.tsx** - Restricted layout wrapper (only 2 tabs)

### Service Layer
Located in: `src/services/salary-checkoff/`

1. **company-management.service.ts** - Complete TypeScript API service

---

## Integration Steps

### Step 1: Update Your Main App Routing

Update your `src/App.tsx` or routing configuration file to add the new routes:

```tsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

// Import Company Management Pages
import {
  Organizations,
  Roles,
  UsersManagement,
  AuditLogs
} from './pages/salary-checkoff/hr/company-management';

import {
  OrganizationUserLayout,
  PendingApplicationsRestricted,
  ChangePasswordPage
} from './pages/salary-checkoff/organization-user';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Existing routes... */}

          {/* HR Admin - Company Management Routes */}
          <Route path="/salary-checkoff/hr/company-management">
            <Route path="organizations" element={<Organizations />} />
            <Route path="roles" element={<Roles />} />
            <Route path="users" element={<UsersManagement />} />
            <Route path="audit-logs" element={<AuditLogs />} />
          </Route>

          {/* Organization User Routes (Restricted) */}
          <Route
            path="/salary-checkoff/organization-user"
            element={<OrganizationUserLayoutWrapper />}
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

// Wrapper component to pass user data to OrganizationUserLayout
function OrganizationUserLayoutWrapper() {
  const { user, logout } = useAuth();

  // Check if user is an organization user
  const orgUser = user?.organization_memberships?.[0];

  if (!orgUser) {
    return <Navigate to="/login" replace />;
  }

  const userData = {
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
    organization_name: orgUser.organization_name,
    role_name: orgUser.role_details?.name,
    permissions: {
      can_view_loan_application: orgUser.role_details?.can_view_loan_application || false,
      can_approve_loan_application: orgUser.role_details?.can_approve_loan_application || false,
      can_decline_loan_application: orgUser.role_details?.can_decline_loan_application || false,
    },
    organization_id: orgUser.organization,
    force_password_change: orgUser.force_password_change,
  };

  return <OrganizationUserLayout user={userData} onLogout={logout} />;
}
```

---

### Step 2: Update HR Dashboard Navigation

Add navigation links to your HR dashboard to access Company Management features.

Example in `src/pages/salary-checkoff/hr/HRDashboard.tsx`:

```tsx
import { Building2, Shield, Users, FileText } from 'lucide-react';

// Add to your navigation menu
const companyManagementMenuItems = [
  {
    label: 'Organizations',
    path: '/salary-checkoff/hr/company-management/organizations',
    icon: Building2,
  },
  {
    label: 'Roles & Permissions',
    path: '/salary-checkoff/hr/company-management/roles',
    icon: Shield,
  },
  {
    label: 'Users',
    path: '/salary-checkoff/hr/company-management/users',
    icon: Users,
  },
  {
    label: 'Audit Logs',
    path: '/salary-checkoff/hr/company-management/audit-logs',
    icon: FileText,
  },
];

// In your navigation component:
<div className="mt-6">
  <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
    Company Management
  </h3>
  <nav className="space-y-1">
    {companyManagementMenuItems.map((item) => (
      <Link
        key={item.path}
        to={item.path}
        className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-slate-100"
      >
        <item.icon className="h-5 w-5" />
        <span>{item.label}</span>
      </Link>
    ))}
  </nav>
</div>
```

---

### Step 3: Update AuthContext to Load Organization User Data

Update `src/contexts/AuthContext.tsx` to fetch and store organization user membership data:

```tsx
import { organizationUserService } from '@/services/salary-checkoff/company-management.service';

// Inside AuthContext
const loadUserProfile = async () => {
  try {
    const profile = await authService.getProfile();

    // Check if user is an organization user
    try {
      const orgMemberships = await organizationUserService.list({
        // Filter by current user
        is_active: true,
        page_size: 1
      });

      if (orgMemberships.results.length > 0) {
        profile.organization_memberships = orgMemberships.results;
        profile.force_password_change = orgMemberships.results[0].force_password_change;
      }
    } catch (err) {
      // User is not an organization user (regular employee/hr/admin)
      console.log('User is not an organization user');
    }

    setUser(profile);
  } catch (error) {
    console.error('Failed to load user profile:', error);
  }
};
```

---

### Step 4: Implement Login Redirect Logic

Update your login flow to redirect organization users appropriately:

```tsx
// In your login handler (e.g., src/pages/auth/Login.tsx)
const handleLogin = async (credentials) => {
  try {
    const response = await authService.login(credentials);
    const user = response.user;

    // Check if user is an organization user
    if (user.organization_memberships && user.organization_memberships.length > 0) {
      const orgUser = user.organization_memberships[0];

      // If force_password_change is true, redirect to change password
      if (orgUser.force_password_change) {
        navigate('/salary-checkoff/organization-user', {
          state: { forcePasswordChange: true }
        });
      } else {
        // Redirect to restricted interface (pending applications)
        navigate('/salary-checkoff/organization-user');
      }
    } else {
      // Regular user - redirect to normal dashboard
      if (user.role === 'hr_manager') {
        navigate('/salary-checkoff/hr/dashboard');
      } else if (user.role === 'admin') {
        navigate('/salary-checkoff/admin/dashboard');
      } else {
        navigate('/salary-checkoff/employee/dashboard');
      }
    }
  } catch (error) {
    console.error('Login failed:', error);
  }
};
```

---

### Step 5: Add Permission Guards

Create a guard component to prevent unauthorized access:

```tsx
// src/components/ProtectedRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'hr_manager' | 'admin';
  requireOrganizationUser?: boolean;
}

export function ProtectedRoute({
  children,
  requiredRole,
  requireOrganizationUser = false
}: ProtectedRouteProps) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check for organization user
  if (requireOrganizationUser) {
    const isOrgUser = user?.organization_memberships && user.organization_memberships.length > 0;
    if (!isOrgUser) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // Check for required role
  if (requiredRole && user?.role !== requiredRole && user?.role !== 'admin') {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}

// Usage in routes:
<Route
  path="/salary-checkoff/hr/company-management/*"
  element={
    <ProtectedRoute requiredRole="hr_manager">
      <Outlet />
    </ProtectedRoute>
  }
>
  <Route path="organizations" element={<Organizations />} />
  {/* ... other routes */}
</Route>

<Route
  path="/salary-checkoff/organization-user"
  element={
    <ProtectedRoute requireOrganizationUser>
      <OrganizationUserLayoutWrapper />
    </ProtectedRoute>
  }
/>
```

---

### Step 6: Update Loan Service for Organization Filtering

Update `src/services/salary-checkoff/loan.service.ts` to support organization filtering:

```tsx
// Add organization parameter to pending applications
async hrListPending(organizationId?: string) {
  let url = `${API_BASE_URL}/loans/hr/pending/`;

  if (organizationId) {
    url += `?organization=${organizationId}`;
  }

  return apiRequest<PaginatedResponse<LoanApplication>>(url);
}

// Add approve/decline methods with organization check
async approveApplication(id: string, notes?: string) {
  const url = `${API_BASE_URL}/loans/${id}/approve/`;
  return apiRequest<LoanApplication>(url, {
    method: 'POST',
    body: JSON.stringify({ notes }),
  });
}

async declineApplication(id: string, reason: string) {
  const url = `${API_BASE_URL}/loans/${id}/decline/`;
  return apiRequest<LoanApplication>(url, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
}
```

---

## Usage Examples

### Example 1: Navigating to Company Management from HR Dashboard

```tsx
import { useNavigate } from 'react-router-dom';

function HRDashboard() {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-3 gap-4">
      <Card
        onClick={() => navigate('/salary-checkoff/hr/company-management/organizations')}
        className="cursor-pointer hover:shadow-lg"
      >
        <Building2 className="h-8 w-8 text-[#008080]" />
        <h3>Manage Organizations</h3>
        <p>Create and manage company organizations</p>
      </Card>

      <Card
        onClick={() => navigate('/salary-checkoff/hr/company-management/roles')}
        className="cursor-pointer hover:shadow-lg"
      >
        <Shield className="h-8 w-8 text-[#008080]" />
        <h3>Manage Roles</h3>
        <p>Configure role-based permissions</p>
      </Card>

      <Card
        onClick={() => navigate('/salary-checkoff/hr/company-management/users')}
        className="cursor-pointer hover:shadow-lg"
      >
        <Users className="h-8 w-8 text-[#008080]" />
        <h3>Manage Users</h3>
        <p>Create and onboard organization users</p>
      </Card>
    </div>
  );
}
```

### Example 2: Checking User Permissions

```tsx
import { useAuth } from '@/contexts/AuthContext';

function SomeComponent() {
  const { user } = useAuth();

  // Check if user is an organization user
  const isOrganizationUser = user?.organization_memberships && user.organization_memberships.length > 0;

  // Get permissions
  const canApprove = isOrganizationUser
    ? user.organization_memberships[0].role_details?.can_approve_loan_application
    : false;

  return (
    <div>
      {canApprove && (
        <Button onClick={handleApprove}>Approve</Button>
      )}
    </div>
  );
}
```

---

## Testing Checklist

### HR Admin Flow
- [ ] HR can access Company Management pages from dashboard
- [ ] HR can create an organization successfully
- [ ] HR can create a role with permissions for an organization
- [ ] HR can create a user and user receives onboarding email
- [ ] HR can view audit logs filtered by organization
- [ ] HR can deactivate organizations, roles, and users

### Organization User Flow
- [ ] User receives email with temporary password
- [ ] User can log in with temporary password
- [ ] User is redirected to Change Password page if `force_password_change=true`
- [ ] User cannot access Pending Applications until password changed
- [ ] After password change, user can access Pending Applications
- [ ] User only sees two tabs: Pending Applications and Change Password
- [ ] User only sees applications from their organization
- [ ] User only sees action buttons based on their role permissions
- [ ] User can view application details if has view permission
- [ ] User can approve application if has approve permission
- [ ] User can decline application (with reason) if has decline permission
- [ ] All actions are logged to audit trail

### Security Tests
- [ ] Organization users cannot access HR admin pages
- [ ] Users cannot access applications from other organizations
- [ ] Users cannot perform actions without proper permissions (403 error)
- [ ] Password validation works correctly (8+ chars, mixed case, etc.)
- [ ] Audit logs are created for all actions

---

## Troubleshooting

### Issue: "Organization users see blank page"
**Solution**: Ensure organization user data is loaded in AuthContext:
```tsx
// In AuthContext, after login
const orgMemberships = await organizationUserService.list({ is_active: true });
user.organization_memberships = orgMemberships.results;
```

### Issue: "Permission checks not working"
**Solution**: Verify role permissions are loaded:
```tsx
// Check console for user object
console.log('User permissions:', user?.organization_memberships?.[0]?.role_details);
```

### Issue: "Email not sending"
**Solution**: Check backend .env file has correct email settings:
```bash
AZURE_CLIENT_ID=...
AZURE_CLIENT_SECRET=...
SENDER_EMAIL=checkoff@254-capital.com
```

### Issue: "Cannot create user - role validation error"
**Solution**: Ensure role belongs to selected organization:
```tsx
// Backend validates this automatically, but check:
// - Role is active
// - Role organization_id matches selected organization_id
```

---

## API Endpoints Reference

All Company Management endpoints are at: `http://localhost:8000/api/v1/company-management/`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/organizations/` | GET | List organizations |
| `/organizations/` | POST | Create organization |
| `/organizations/{id}/` | PUT | Update organization |
| `/organizations/{id}/deactivate/` | PATCH | Deactivate organization |
| `/roles/` | GET | List roles |
| `/roles/` | POST | Create role |
| `/roles/{id}/` | PUT | Update role |
| `/roles/{id}/` | DELETE | Soft delete role |
| `/organization-users/` | GET | List organization users |
| `/organization-users/create-with-email/` | POST | Create user with email |
| `/organization-users/{id}/deactivate/` | PATCH | Deactivate user |
| `/change-password/` | POST | Change password |
| `/audit-logs/` | GET | List audit logs |

---

## Next Steps

1. **Run Backend Migrations**:
   ```bash
   cd ~/Desktop/docs/business/254capital/salary_checkoff/backend
   python manage.py makemigrations company_management
   python manage.py migrate
   ```

2. **Test Backend API**:
   - Use Postman or curl to test endpoints
   - Verify email sending works

3. **Integrate Frontend**:
   - Follow steps 1-5 above
   - Test each flow thoroughly

4. **Deploy**:
   - Deploy backend with migrations
   - Deploy frontend with new routes
   - Monitor audit logs for any issues

---

## Support

For issues or questions:
- **Backend**: See `backend/apps/company_management/SETUP_INSTRUCTIONS.md`
- **Frontend**: See this guide
- **API Docs**: Access at `http://localhost:8000/api/docs/` (Swagger UI)
