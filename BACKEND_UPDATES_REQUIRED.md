# Backend API Updates Required

**Date:** April 28, 2026
**Status:** Backend Changes Needed
**Frontend:** Ready - waiting for backend implementation

---

## Issue #1: Loan Repayment Start Date Logic in Collection Sheets

### Problem
Loans disbursed on or after the 15th of any given month should have their first repayment scheduled for the following month (not the current month). While the system charges 5% interest for that month, the client gets the benefit of a longer first period (~6 weeks) while only paying one month's interest. However, these loans are currently appearing on the current month's collection sheet when they shouldn't.

### Current Behavior
The collection sheet endpoints currently return ALL active loans for a given month, regardless of when the loan was disbursed within that month.

### Required Fix

**Endpoint:** `GET /api/v1/clients/collection-report/` and `GET /api/v1/clients/collection-report-data/`

**Business Rule:**
- Loans disbursed **BEFORE the 15th** of month M → First repayment on 25th of month M (same month)
- Loans disbursed **ON OR AFTER the 15th** of month M → First repayment on 25th of month M+1 (next month)

**Filter Logic Needed:**
```python
from dateutil.relativedelta import relativedelta
from django.utils import timezone

def calculate_first_deduction_date(disbursement_date):
    """
    Calculate the first deduction date based on disbursement date.
    Rule: Disbursed before 15th → deduct same month (25th)
          Disbursed on/after 15th → deduct next month (25th)
    """
    if disbursement_date.day < 15:
        # Deduction in same month
        return disbursement_date.replace(day=25)
    else:
        # Deduction in next month
        next_month = (disbursement_date.replace(day=1) + relativedelta(months=1))
        return next_month.replace(day=25)

def should_appear_in_collection_sheet(loan, report_month, report_year):
    """
    Determine if a loan should appear in the collection sheet for a given period.
    """
    disbursement_date = loan.disbursement_date
    first_deduction_date = calculate_first_deduction_date(disbursement_date)

    # Create report date (25th of the report month)
    report_date = datetime(report_year, report_month, 25)

    # Loan should only appear if report_date >= first_deduction_date
    if report_date < first_deduction_date:
        return False

    return True
```

**Example Scenarios:**
1. **Loan disbursed April 10, 2026 (before 15th)**:
   - First deduction: April 25, 2026
   - Should appear in: April 2026 collection sheet ✅

2. **Loan disbursed April 15, 2026 (on 15th)**:
   - First deduction: May 25, 2026
   - Should NOT appear in: April 2026 collection sheet ❌
   - Should appear in: May 2026 collection sheet ✅

3. **Loan disbursed April 20, 2026 (after 15th)**:
   - First deduction: May 25, 2026
   - Should NOT appear in: April 2026 collection sheet ❌
   - Should appear in: May 2026 collection sheet ✅

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

## Issue #5: Admin CRUD - Granular Loan & Repayment Controls

### Problem
Admins need full granular control over all entities in the system with proper confirmation dialogs before any destructive action. Currently, there's no ability to edit or delete clients, loans, or individual repayments.

### Required Endpoints

---

### 5.1 Client Management

#### Edit Client Details
**Endpoint:** `PATCH /api/v1/clients/{client_id}/`
**Authentication:** Required (Admin only)

**Request Body (all fields optional):**
```json
{
  "full_name": "Updated Name",
  "national_id": "12345678",
  "mobile": "0744556677",
  "email": "newemail@example.com",
  "employer": "new-employer-uuid",
  "employee_id": "EMP123",
  "loan_amount": 60000,
  "interest_rate": 5.0,
  "repayment_period": 10,
  "disbursement_date": "2026-04-10",
  "disbursement_method": "mpesa",
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
    "loan_amount": "60000.00",
    "repayment_period": 10,
    "updated_at": "2026-04-28T12:00:00Z"
  },
  "modification_logged": true
}
```

#### Delete Client Record
**Endpoint:** `DELETE /api/v1/clients/{client_id}/`
**Authentication:** Required (Admin only)

**Important:** Deleting a client cascades and removes ALL associated loans and repayments.

**Request Body:**
```json
{
  "confirm": true,
  "reason": "Duplicate entry / Client requested removal / Data cleanup"
}
```

**Pre-Delete Check - GET /api/v1/clients/{client_id}/delete-check/**
```json
{
  "can_delete": true,
  "client": {
    "id": "client-uuid",
    "full_name": "John Doe",
    "employer_name": "ABC Company"
  },
  "associated_data": {
    "total_loans": 2,
    "active_loans": 1,
    "closed_loans": 1,
    "total_repayments": 15
  },
  "loans": [
    {
      "id": "loan-1",
      "loan_amount": "50000.00",
      "status": "Active",
      "outstanding_balance": "25000.00"
    },
    {
      "id": "loan-2",
      "loan_amount": "30000.00",
      "status": "Fully Paid",
      "outstanding_balance": "0.00"
    }
  ],
  "warning": "Deleting this client will permanently remove 2 loan(s) and 15 repayment record(s). This action cannot be undone."
}
```

**Success Response (200) - after confirmation:**
```json
{
  "detail": "Client and all associated data deleted successfully",
  "deleted": {
    "client_id": "client-uuid",
    "client_name": "John Doe",
    "loans_deleted": 2,
    "repayments_deleted": 15
  },
  "archived": true,
  "archived_at": "2026-04-28T12:00:00Z"
}
```

---

### 5.2 Loan Management (for both LoanApplication and ExistingClient models)

#### Edit Loan Details
**Endpoint:** `PATCH /api/v1/loans/{loan_id}/`
**Authentication:** Required (Admin only)

**Request Body (all fields optional):**
```json
{
  "principal_amount": 50000,
  "interest_rate": 5.0,
  "repayment_months": 12,
  "total_repayment": 52500,
  "monthly_deduction": 4375,
  "disbursement_date": "2026-04-10",
  "disbursement_method": "mpesa",
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
    "updated_at": "2026-04-28T12:00:00Z"
  },
  "repayment_schedule_updated": true,
  "modification_logged": true
}
```

#### Delete Loan Record
**Endpoint:** `DELETE /api/v1/loans/{loan_id}/`
**Authentication:** Required (Admin only)

**Important:** Deleting a loan removes ALL associated repayments.

**Request Body:**
```json
{
  "confirm": true,
  "reason": "Duplicate loan / Error in disbursement / Client withdrawal"
}
```

**Pre-Delete Check - GET /api/v1/loans/{loan_id}/delete-check/**
```json
{
  "can_delete": true,
  "loan": {
    "id": "loan-uuid",
    "application_number": "LN-2026-001234",
    "employee_name": "John Doe",
    "principal_amount": "50000.00",
    "status": "disbursed",
    "outstanding_balance": "25000.00"
  },
  "associated_data": {
    "total_repayments": 8,
    "paid_repayments": 3,
    "pending_repayments": 5
  },
  "warning": "Deleting this loan will permanently remove 8 repayment record(s). This action cannot be undone."
}
```

**Success Response (200):**
```json
{
  "detail": "Loan and all associated repayments deleted successfully",
  "deleted": {
    "loan_id": "loan-uuid",
    "application_number": "LN-2026-001234",
    "repayments_deleted": 8
  },
  "archived": true,
  "archived_at": "2026-04-28T12:00:00Z"
}
```

---

### 5.3 Repayment Management

#### Get Loan Repayments
**Endpoint:** `GET /api/v1/loans/{loan_id}/repayments/`
**Authentication:** Required (Admin/HR)

**Success Response (200):**
```json
{
  "loan_id": "loan-uuid",
  "loan_details": {
    "application_number": "LN-2026-001234",
    "employee_name": "John Doe",
    "total_repayment": "52500.00",
    "monthly_deduction": "4375.00"
  },
  "repayments": [
    {
      "id": "repayment-1",
      "installment_number": 1,
      "due_date": "2026-05-25",
      "amount": "4375.00",
      "paid": true,
      "payment_date": "2026-05-25",
      "payment_method": "mpesa",
      "reference": "REF123"
    },
    {
      "id": "repayment-2",
      "installment_number": 2,
      "due_date": "2026-06-25",
      "amount": "4375.00",
      "paid": false,
      "payment_date": null,
      "payment_method": null,
      "reference": null
    }
  ],
  "summary": {
    "total_installments": 12,
    "paid_installments": 1,
    "pending_installments": 11,
    "total_paid": "4375.00",
    "outstanding_balance": "48125.00"
  }
}
```

#### Edit Repayment Record
**Endpoint:** `PATCH /api/v1/repayments/{repayment_id}/`
**Authentication:** Required (Admin only)

**Request Body (all fields optional):**
```json
{
  "amount": 5000.00,
  "due_date": "2026-06-25",
  "paid": true,
  "payment_date": "2026-06-26",
  "payment_method": "mpesa",
  "reference": "MPX123456",
  "admin_notes": "Manual correction - updated payment amount"
}
```

**Success Response (200):**
```json
{
  "detail": "Repayment record updated successfully",
  "repayment": {
    "id": "repayment-id",
    "installment_number": 2,
    "amount": "5000.00",
    "due_date": "2026-06-25",
    "paid": true,
    "payment_date": "2026-06-26",
    "updated_at": "2026-04-28T12:00:00Z"
  },
  "loan_balance_updated": true,
  "modification_logged": true
}
```

#### Delete Repayment Record
**Endpoint:** `DELETE /api/v1/repayments/{repayment_id}/`
**Authentication:** Required (Admin only)

**Request Body:**
```json
{
  "confirm": true,
  "reason": "Duplicate entry / Erroneous record / Correction needed"
}
```

**Success Response (200):**
```json
{
  "detail": "Repayment record deleted successfully",
  "deleted": {
    "repayment_id": "repayment-id",
    "installment_number": 2,
    "amount": "4375.00",
    "loan_id": "loan-uuid"
  },
  "loan_balance_updated": true,
  "archived": true,
  "archived_at": "2026-04-28T12:00:00Z"
}
```

#### Manually Post Repayment
**Endpoint:** `POST /api/v1/loans/{loan_id}/repayments/manual/`
**Authentication:** Required (Admin only)

**Request Body:**
```json
{
  "installment_number": 3,
  "amount": 4375.00,
  "payment_date": "2026-07-25",
  "payment_method": "mpesa",
  "reference": "MPX789012",
  "notes": "Manual payment posted - received via M-Pesa"
}
```

**Success Response (201):**
```json
{
  "detail": "Repayment posted successfully",
  "repayment": {
    "id": "new-repayment-id",
    "loan_id": "loan-uuid",
    "installment_number": 3,
    "amount": "4375.00",
    "due_date": "2026-07-25",
    "paid": true,
    "payment_date": "2026-07-25",
    "payment_method": "mpesa",
    "reference": "MPX789012",
    "created_at": "2026-04-28T12:00:00Z"
  },
  "loan_updated": {
    "amount_paid": "13125.00",
    "outstanding_balance": "39375.00"
  }
}
```

---

## Implementation Priority

### Critical Priority (Implement Immediately)
1. **Issue #1** - Loan repayment start date logic in collection sheets (15th cutoff rule)
2. **Issue #2** - Collection report matured loan filtering (loans dropping off after tenure)
3. **Issue #3.2 & 3.3** - Forgot password / OTP-based password reset (user experience)

### High Priority (This Week)
4. **Issue #5.1** - Client CRUD (Edit & Delete with cascading)
5. **Issue #5.2** - Loan CRUD (Edit & Delete)
6. **Issue #5.3** - Repayment CRUD (Edit, Delete, Manual Post)
7. **Issue #3.1** - Self-service password change
8. **Issue #3.4** - Admin-triggered password reset for HR users

### Medium Priority (Already Partially Implemented)
9. **Issue #4.1, 4.2, 4.3** - View and edit HR users (some endpoints exist)
10. **Issue #4.4** - Deactivate/reactivate HR users (toggle-active exists)
11. **Issue #4.5** - Create new HR users (endpoint exists)
12. **Issue #4.6** - Delete HR users with confirmation

---

## Testing Checklist

### After Backend Implementation

#### Collection Sheet Logic
- [ ] Loans disbursed before 15th appear in same month's collection sheet
- [ ] Loans disbursed on/after 15th do NOT appear in same month's collection sheet
- [ ] Loans disbursed on/after 15th appear in next month's collection sheet
- [ ] Collection reports exclude matured loans correctly
- [ ] 6-month loan only appears on 6 collection sheets (not month 7+)

#### Password Management
- [ ] HR users can change their own passwords
- [ ] HR users can reset forgotten passwords via OTP
- [ ] Admin can trigger password reset for any HR user via OTP
- [ ] All password changes invalidate existing tokens (force re-login)

#### Client CRUD
- [ ] Admin can edit client details (name, phone, employer, etc.)
- [ ] Admin can delete client record
- [ ] Deleting client shows warning with list of associated loans
- [ ] Deleting client requires explicit confirmation
- [ ] Deleting client cascades to remove all loans and repayments

#### Loan CRUD
- [ ] Admin can edit individual loan details (amount, tenure, interest, etc.)
- [ ] Admin can delete individual loan
- [ ] Deleting loan shows warning with repayment count
- [ ] Deleting loan requires explicit confirmation
- [ ] Deleting loan removes all associated repayments

#### Repayment CRUD
- [ ] Admin can view all repayments for a loan
- [ ] Admin can edit individual repayment record
- [ ] Admin can delete individual repayment record
- [ ] Admin can manually post a repayment for a specific loan
- [ ] Manual repayment updates loan balance correctly
- [ ] All repayment modifications require confirmation

#### HR User Management
- [ ] Admin can view list of all HR users
- [ ] Admin can edit HR user details (email, phone, name, position)
- [ ] Admin can reassign employer to different HR user
- [ ] Admin can delete HR user account with confirmation
- [ ] Admin can deactivate/reactivate HR accounts

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
