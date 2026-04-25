# Backend API Updates Required

**Date:** April 25, 2026
**Status:** Backend Changes Needed
**Frontend:** Ready - waiting for backend implementation

---

## Issue #2: Collection Reports Including Matured Loans

### Problem
Loans are appearing on collection reports even after they have fully matured. For example, a 6-month loan should NOT appear on the collection sheet in month 7 and beyond.

### Current Behavior
The endpoints `/api/v1/clients/collection-report/` and `/api/v1/clients/collection-report-data/` return ALL loans with outstanding balances, regardless of whether the repayment period has ended.

### Required Fix

**Endpoint:** `GET /api/v1/clients/collection-report/` and `GET /api/v1/clients/collection-report-data/`

**Filter Logic Needed:**
```python
from dateutil.relativedelta import relativedelta
from django.utils import timezone

def filter_active_loans_for_period(queryset, report_month, report_year):
    """
    Filter loans that should appear on the collection report for a given period.
    Exclude loans where the current report period is beyond the loan's maturity date.
    """
    active_loans = []

    for loan in queryset:
        # Calculate loan maturity date
        disbursement_date = loan.disbursement_date
        repayment_months = loan.repayment_period

        # Calculate first deduction date (IMPORTANT: Day 15+ goes to next month)
        if disbursement_date.day < 15:
            first_deduction_date = disbursement_date.replace(day=25)
        else:
            # Moves to next month
            first_deduction_date = (disbursement_date.replace(day=1) + relativedelta(months=1)).replace(day=25)

        # Calculate last deduction date (maturity date)
        last_deduction_date = first_deduction_date + relativedelta(months=repayment_months - 1)

        # Check if report period is within loan repayment period
        report_date = datetime(report_year, report_month, 25)

        if report_date <= last_deduction_date and loan.outstanding_balance > 0:
            active_loans.append(loan)

    return active_loans
```

**Expected Behavior:**
- 6-month loan disbursed April 15, 2026:
  - First deduction: May 25, 2026
  - Last deduction: October 25, 2026
  - Should appear in: May, June, July, August, September, October reports
  - Should NOT appear in: November+ reports

---

## Issue #3: HR Password Management

### Problem
HR users cannot change their passwords, and admins cannot reset passwords for HR users. There are NO password management endpoints currently available.

### Required Endpoints

#### 3.1 Change Password (Self-Service)
**Endpoint:** `POST /api/v1/auth/change-password/`
**Authentication:** Required (Bearer token)
**Available to:** All authenticated users (employee, HR, admin)

**Request Body:**
```json
{
  "current_password": "OldPassword123",
  "new_password": "NewPassword456",
  "confirm_password": "NewPassword456"
}
```

**Success Response (200):**
```json
{
  "detail": "Password changed successfully",
  "requires_relogin": true
}
```

**Error Responses:**
```json
// 400 - Validation errors
{
  "error": "Current password is incorrect"
}

{
  "error": "New password does not meet requirements",
  "requirements": [
    "Minimum 8 characters",
    "At least one uppercase letter",
    "At least one number",
    "At least one special character"
  ]
}

{
  "error": "New passwords do not match"
}
```

#### 3.2 Request Password Reset (Forgot Password)
**Endpoint:** `POST /api/v1/auth/request-password-reset/`
**Authentication:** Not required
**Available to:** All users

**Request Body:**
```json
{
  "email": "hr@company.com"
}
```

**Success Response (200):**
```json
{
  "detail": "OTP sent to your registered phone number",
  "masked_phone": "0712****567",
  "temp_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "expires_in": 300
}
```

**Error Response (404):**
```json
{
  "error": "No user found with this email address"
}
```

#### 3.3 Verify OTP and Reset Password
**Endpoint:** `POST /api/v1/auth/reset-password/`
**Authentication:** Not required (uses temp_token)

**Request Body:**
```json
{
  "temp_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "otp": "123456",
  "new_password": "NewPassword456",
  "confirm_password": "NewPassword456"
}
```

**Success Response (200):**
```json
{
  "detail": "Password reset successfully",
  "tokens": {
    "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
  }
}
```

#### 3.4 Admin Reset User Password
**Endpoint:** `POST /api/v1/auth/admin/reset-user-password/`
**Authentication:** Required (Admin only)
**Available to:** Admin users only

**Request Body:**
```json
{
  "user_id": "uuid-of-user",
  "send_otp": true
}
```

**Success Response (200):**
```json
{
  "detail": "Password reset OTP sent to user's phone",
  "masked_phone": "0712****567",
  "user_email": "hr@company.com",
  "user_name": "John Doe"
}
```

**Alternative (Temporary Password):**
```json
{
  "user_id": "uuid-of-user",
  "send_otp": false,
  "temporary_password": "TempPass123"
}
```

**Success Response (200):**
```json
{
  "detail": "Temporary password generated",
  "temporary_password": "TempPass123",
  "user_email": "hr@company.com",
  "user_name": "John Doe",
  "expires_in_hours": 24,
  "requires_change_on_login": true
}
```

---

## Issue #4: Admin HR User Management

### Problem
Admins cannot manage HR user accounts when HR employees leave the company. There's no way to:
- View all HR users
- Edit HR user details (email, phone, employer assignment)
- Deactivate/reactivate HR accounts
- Reassign employers to different HR users
- Delete HR accounts

### Required Endpoints

#### 4.1 List All HR Users
**Endpoint:** `GET /api/v1/users/hr/`
**Authentication:** Required (Admin only)
**Query Parameters:**
- `search` (optional) - Search by name, email, or phone
- `employer_id` (optional) - Filter by employer
- `is_active` (optional) - Filter by active status (true/false)
- `page` (optional) - Pagination

**Success Response (200):**
```json
{
  "count": 25,
  "next": "https://api.254-capital.com/api/v1/users/hr/?page=2",
  "previous": null,
  "page": 1,
  "total_pages": 3,
  "results": [
    {
      "id": "uuid-1",
      "email": "hr@company1.com",
      "phone_number": "0712345678",
      "first_name": "John",
      "last_name": "Doe",
      "is_active": true,
      "employer": {
        "id": "employer-uuid",
        "name": "Company ABC"
      },
      "position": "HR Manager",
      "created_at": "2025-01-15T10:30:00Z",
      "last_login": "2026-04-24T14:22:00Z"
    }
  ]
}
```

#### 4.2 Get HR User Details
**Endpoint:** `GET /api/v1/users/hr/{user_id}/`
**Authentication:** Required (Admin only)

**Success Response (200):**
```json
{
  "id": "uuid-1",
  "email": "hr@company1.com",
  "phone_number": "0712345678",
  "first_name": "John",
  "last_name": "Doe",
  "is_active": true,
  "employer": {
    "id": "employer-uuid",
    "name": "Company ABC",
    "registration_number": "REG123",
    "total_employees": 150,
    "active_loans_count": 45
  },
  "position": "HR Manager",
  "created_at": "2025-01-15T10:30:00Z",
  "last_login": "2026-04-24T14:22:00Z",
  "login_history": [
    {
      "timestamp": "2026-04-24T14:22:00Z",
      "ip_address": "197.232.45.12"
    }
  ]
}
```

#### 4.3 Update HR User Details
**Endpoint:** `PATCH /api/v1/users/hr/{user_id}/`
**Authentication:** Required (Admin only)

**Request Body (all fields optional):**
```json
{
  "email": "newemail@company.com",
  "phone_number": "0722334455",
  "first_name": "Jane",
  "last_name": "Smith",
  "position": "Senior HR Manager",
  "employer_id": "new-employer-uuid"
}
```

**Success Response (200):**
```json
{
  "detail": "HR user updated successfully",
  "user": {
    "id": "uuid-1",
    "email": "newemail@company.com",
    "phone_number": "0722334455",
    "first_name": "Jane",
    "last_name": "Smith",
    "employer": {
      "id": "new-employer-uuid",
      "name": "New Company XYZ"
    },
    "position": "Senior HR Manager"
  }
}
```

#### 4.4 Deactivate/Reactivate HR User
**Endpoint:** `POST /api/v1/users/hr/{user_id}/toggle-active/`
**Authentication:** Required (Admin only)

**Request Body:**
```json
{
  "is_active": false,
  "reason": "Employee left the company"
}
```

**Success Response (200):**
```json
{
  "detail": "HR user account deactivated successfully",
  "user": {
    "id": "uuid-1",
    "email": "hr@company.com",
    "is_active": false,
    "deactivated_at": "2026-04-25T12:00:00Z",
    "deactivation_reason": "Employee left the company"
  }
}
```

#### 4.5 Create HR User Account
**Endpoint:** `POST /api/v1/users/hr/create/`
**Authentication:** Required (Admin only)

**Request Body:**
```json
{
  "email": "newhr@company.com",
  "phone_number": "0733445566",
  "first_name": "Alice",
  "last_name": "Johnson",
  "employer_id": "employer-uuid",
  "position": "HR Manager",
  "send_welcome_email": true,
  "send_credentials_sms": true
}
```

**Success Response (201):**
```json
{
  "detail": "HR user created successfully",
  "user": {
    "id": "new-uuid",
    "email": "newhr@company.com",
    "phone_number": "0733445566",
    "first_name": "Alice",
    "last_name": "Johnson",
    "employer": {
      "id": "employer-uuid",
      "name": "Company ABC"
    },
    "position": "HR Manager"
  },
  "temporary_password": "TempPass456",
  "welcome_email_sent": true,
  "credentials_sms_sent": true,
  "password_expires_in_hours": 24
}
```

#### 4.6 Delete HR User Account
**Endpoint:** `DELETE /api/v1/users/hr/{user_id}/`
**Authentication:** Required (Admin only)

**Request Body:**
```json
{
  "confirm": true,
  "reason": "Account cleanup - employee left 6 months ago"
}
```

**Success Response (200):**
```json
{
  "detail": "HR user account deleted successfully",
  "deleted_user": {
    "id": "uuid-1",
    "email": "hr@company.com",
    "name": "John Doe",
    "employer": "Company ABC"
  },
  "archived": true,
  "archived_at": "2026-04-25T12:00:00Z"
}
```

**Error Response (409 - Conflict):**
```json
{
  "error": "Cannot delete HR user with active responsibilities",
  "details": {
    "pending_loan_reviews": 12,
    "active_employer_loans": 45
  },
  "suggestion": "Consider deactivating the account instead of deleting it, or reassign the employer to another HR user first"
}
```

---

## Admin Loan and Client Management

### Additional Endpoints Needed

#### Update Disbursed Loan Details
**Endpoint:** `PATCH /api/v1/loans/admin/{loan_id}/modify/`
**Authentication:** Required (Admin only)

**Request Body (all fields optional):**
```json
{
  "principal_amount": 50000,
  "interest_rate": 5.0,
  "repayment_months": 12,
  "monthly_deduction": 4375,
  "disbursement_date": "2026-04-10",
  "reason": "Customer requested loan restructuring",
  "admin_notes": "Approved restructuring due to financial hardship"
}
```

**Success Response (200):**
```json
{
  "detail": "Loan updated successfully",
  "loan": {
    "id": "loan-uuid",
    "principal_amount": "50000.00",
    "interest_rate": "5.00",
    "repayment_months": 12,
    "monthly_deduction": "4375.00",
    "updated_at": "2026-04-25T12:00:00Z"
  },
  "modification_logged": true
}
```

#### Update Client Record
**Endpoint:** `PATCH /api/v1/clients/{client_id}/`
**Authentication:** Required (Admin only)

**Request Body (all fields optional):**
```json
{
  "full_name": "Updated Name",
  "mobile": "0744556677",
  "email": "newemail@example.com",
  "employer": "new-employer-uuid",
  "loan_amount": 60000,
  "repayment_period": 10,
  "amount_paid": 30000,
  "loan_status": "Active",
  "admin_notes": "Updated contact information per client request"
}
```

**Success Response (200):**
```json
{
  "detail": "Client record updated successfully",
  "client": {
    "id": "client-uuid",
    "full_name": "Updated Name",
    "mobile": "0744556677",
    "updated_at": "2026-04-25T12:00:00Z"
  }
}
```

---

## Implementation Priority

### High Priority (Immediate)
1. ✅ **Issue #1** - Already fixed in frontend
2. **Issue #2** - Collection report matured loan filtering (critical for accuracy)
3. **Issue #3.2 & 3.3** - Forgot password / password reset via OTP (user experience)

### Medium Priority (This Week)
4. **Issue #3.1** - Self-service password change
5. **Issue #4.1, 4.2, 4.3** - View and edit HR users
6. **Issue #4.4** - Deactivate/reactivate HR users

### Lower Priority (When Needed)
7. **Issue #3.4** - Admin password reset for users
8. **Issue #4.5** - Create new HR users (can use existing onboarding)
9. **Issue #4.6** - Delete HR users (use deactivate instead)
10. **Admin loan/client modification** - Only if business requires

---

## Testing Checklist

### After Backend Implementation

- [ ] Collection reports exclude matured loans correctly
- [ ] Day 15 disbursements appear in NEXT month's report (not same month)
- [ ] HR users can change their own passwords
- [ ] HR users can reset forgotten passwords via OTP
- [ ] Admin can view list of all HR users
- [ ] Admin can edit HR user details (email, phone, name, position)
- [ ] Admin can reassign employer to different HR user
- [ ] Admin can deactivate HR accounts
- [ ] Admin can reset passwords for HR users
- [ ] All password changes invalidate existing tokens (force re-login)

---

## Security Considerations

1. **Password Requirements:**
   - Minimum 8 characters
   - At least one uppercase letter
   - At least one lowercase letter
   - At least one number
   - At least one special character

2. **OTP Security:**
   - OTP expires after 5 minutes
   - Maximum 3 attempts before lockout
   - Rate limiting on OTP requests (max 3 per hour per user)

3. **Admin Actions:**
   - All admin modifications should be logged with:
     - Admin user ID
     - Timestamp
     - Modified fields
     - Reason (if provided)
   - Audit trail for compliance

4. **Token Invalidation:**
   - Password changes should invalidate all existing tokens
   - User must re-login after password change
   - Deactivated accounts should have all tokens revoked

---

## Frontend Status

✅ **Frontend is ready** - All service methods and UI components will be implemented once backend endpoints are available.

The following files will need updates after backend is ready:
- `/src/services/salary-checkoff/auth.service.ts` - Add password management methods
- `/src/services/salary-checkoff/api.ts` - Add new endpoint constants
- Create: `/src/pages/salary-checkoff/admin/HRUserManagement.tsx` - Admin HR management UI
- Create: `/src/pages/salary-checkoff/hr/ChangePassword.tsx` - Password change UI
- Create: `/src/pages/salary-checkoff/auth/ForgotPassword.tsx` - Password reset flow

---

**Contact:** Frontend team ready to implement once backend changes are deployed.
