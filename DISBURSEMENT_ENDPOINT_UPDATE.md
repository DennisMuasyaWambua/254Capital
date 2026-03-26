# Disbursement Endpoint Update Summary

## Overview
Updated the backend endpoint `GET https://api.254-capital.com/api/v1/loans/admin/queue` to return complete disbursement information for all loan applications, including M-Pesa numbers and full bank details.

## Changes Made

### 1. Backend Views (`apps/loans/views.py`)
**File**: `/salary_checkoff/backend/apps/loans/views.py`

#### AdminAssessmentQueueView (lines 897-940)
- **BEFORE**: Only returned applications with status `UNDER_REVIEW_ADMIN`
- **AFTER**: Returns ALL loan applications with complete disbursement details
- **Changes**:
  - Removed status filter restriction (now returns all statuses by default)
  - Added optional status filter via query parameter `?status=<status>`
  - Added `select_related('employee__employee_profile')` for efficient querying
  - Updated docstring to reflect new behavior

### 2. Database Models (`apps/accounts/models.py`)
**File**: `/salary_checkoff/backend/apps/accounts/models.py`

#### EmployeeProfile Model (line 184-193)
- **Added Field**: `bank_branch`
  - Type: CharField(max_length=100)
  - Blank: True (optional)
  - Help text: "Bank branch name"
  - Purpose: Store bank branch information for bank transfer disbursements

### 3. Serializers (`apps/loans/serializers.py`)
**File**: `/salary_checkoff/backend/apps/loans/serializers.py`

#### LoanApplicationListSerializer (lines 49-99)
- **Added Field**: `bank_branch` as SerializerMethodField
- **Added Method**: `get_bank_branch()`
  - Retrieves bank branch from employee profile
  - Returns empty string if not available

#### LoanApplicationDetailSerializer (lines 101-177)
- **Added Fields**:
  - `bank_name` - SerializerMethodField
  - `bank_branch` - SerializerMethodField
  - `account_number` - SerializerMethodField
  - `mpesa_number` - SerializerMethodField
- **Added Methods**:
  - `get_bank_name()` - Gets bank name from employee profile
  - `get_bank_branch()` - Gets bank branch from employee profile
  - `get_account_number()` - Gets account number from employee profile
  - `get_mpesa_number()` - Gets M-Pesa number (falls back to phone_number)

### 4. Database Migration
**File**: `/salary_checkoff/backend/apps/accounts/migrations/0005_employeeprofile_bank_branch.py`

Created migration to add `bank_branch` field to EmployeeProfile model.

## API Response Structure

The endpoint now returns the following structure for each loan application:

```json
{
  "id": "uuid",
  "application_number": "254L12345678",
  "employee": "employee_id",
  "employee_name": "John Doe",
  "employer": "employer_id",
  "employer_name": "Company Name",
  "principal_amount": "50000.00",
  "total_repayment": "52500.00",
  "monthly_deduction": "8750.00",
  "repayment_months": 6,
  "status": "approved",
  "status_display": "Approved",
  "created_at": "2026-03-27T10:30:00Z",
  "disbursement_date": "2026-03-26",
  "department": "IT",
  "disbursement_method": "bank",  // or "mpesa"
  "disbursement_reference": "REF-12345",

  // Disbursement Details
  "bank_name": "Equity Bank",
  "bank_branch": "Westlands Branch",
  "bank_account_number": "1234567890",
  "mpesa_number": "+254712345678"
}
```

## Disbursement Method Logic

### For Bank Transfers (`disbursement_method === 'bank'`)
Display:
- **Bank Name**: `bank_name`
- **Bank Branch**: `bank_branch`
- **Account Number**: `bank_account_number`

### For M-Pesa (`disbursement_method === 'mpesa'`)
Display:
- **M-Pesa Number**: `mpesa_number` (falls back to employee's phone_number)

## Frontend Integration

The frontend has already been updated to display this information clearly:

1. **Disbursement Details Modal** - Shows color-coded boxes:
   - Green box for M-Pesa with phone number
   - Blue box for Bank with name, branch, and account number

2. **Historical Approvals Table** - Shows disbursement details in the "Details" column

3. **Mass Disbursement Modal** - Shows payment details for batch processing

## Testing the Endpoint

### Query Examples:

```bash
# Get all applications
GET /api/v1/loans/admin/queue/

# Filter by status
GET /api/v1/loans/admin/queue/?status=approved

# Filter by employer
GET /api/v1/loans/admin/queue/?employer=<employer_id>

# Search applications
GET /api/v1/loans/admin/queue/?search=John

# Combine filters
GET /api/v1/loans/admin/queue/?status=hr_approved&employer=<employer_id>
```

### Expected Behavior:
- Returns all applications (not just under review)
- Includes complete employee disbursement details from profile
- Efficiently loads related data with `select_related`
- Supports pagination via StandardPagination

## Database Migration Required

**IMPORTANT**: Run the following command to apply the migration:

```bash
cd /home/dennis/Desktop/docs/business/254capital/salary_checkoff/backend
python manage.py migrate accounts
```

This will add the `bank_branch` column to the `employee_profiles` table.

## Next Steps

1. **Run Migration**: Apply the database migration to add `bank_branch` field
2. **Update Employee Profiles**: Ensure existing employee profiles have bank branch information
3. **Test Endpoint**: Verify the endpoint returns all expected fields
4. **Deploy to Production**: Deploy the changes to the production environment

## Benefits

1. **Complete Information**: Admin now sees all disbursement details at a glance
2. **Clear Presentation**: Color-coded UI makes it easy to distinguish payment methods
3. **Efficient Queries**: Using `select_related` prevents N+1 query issues
4. **Flexible Filtering**: Can filter by status, employer, or search term
5. **Scalable**: Handles both pending and historical applications in one endpoint
