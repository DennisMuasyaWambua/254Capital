# Disbursement Method Implementation Summary

## Overview
Updated the loan application flow so that the **employee selects their preferred disbursement method** (M-Pesa or Bank) when applying for a loan. The admin then sees this preference and uses it when recording disbursement.

## Changes Made

### 1. Backend - Loan Application Serializer
**File**: `/salary_checkoff/backend/apps/loans/serializers.py`

#### LoanApplicationCreateSerializer (lines 179-199)
**Added Field**: `disbursement_method`
```python
disbursement_method = serializers.ChoiceField(
    choices=LoanApplication.DisbursementMethod.choices,
    required=True,
    help_text='Preferred disbursement method (bank or mpesa)'
)
```

#### LoanApplicationUpdateSerializer (line 362)
**Updated** to allow employees to update their disbursement method:
```python
fields = ['principal_amount', 'repayment_months', 'disbursement_method', 'purpose']
```

#### AdminDisbursementSerializer (lines 334-344)
**Made disbursement_method optional** in admin disbursement:
```python
disbursement_method = serializers.ChoiceField(
    choices=LoanApplication.DisbursementMethod.choices,
    required=False,  # Optional - uses employee preference if not provided
    help_text='Disbursement method (optional - uses employee preference if not provided)'
)
```

### 2. Backend - Loan Application View
**File**: `/salary_checkoff/backend/apps/loans/views.py`

#### LoanApplicationListCreateView POST (line 103)
**Now saves disbursement_method** during application creation:
```python
loan = LoanApplication.objects.create(
    # ... other fields
    disbursement_method=serializer.validated_data['disbursement_method'],
    # ...
)
```

#### AdminDisbursementView POST (lines 1159-1170)
**Uses employee's preference** when disbursing:
```python
# Use employee's preferred disbursement method if not provided by admin
disbursement_method = serializer.validated_data.get('disbursement_method') or app.disbursement_method or 'mpesa'

# ...

# Only update disbursement_method if it wasn't already set by employee
if not app.disbursement_method:
    app.disbursement_method = disbursement_method
```

### 3. Frontend - Loan Application Form
**File**: `/254Capital/src/pages/salary-checkoff/employee/LoanApplication.tsx`

The frontend already had the disbursement method selector implemented:

#### Step 1: Disbursement Method Selection (lines 304-365)
- **M-Pesa Button**: Quick selection for mobile money transfer
- **Bank Button**: Selection for bank transfer
- **Bank Details Form**: Shown when bank is selected
  - Bank Name
  - Bank Branch
  - Account Number

#### Application Submission (lines 159-172)
Sends disbursement method with application:
```typescript
const applicationData: any = {
  principal_amount: amountNum,
  repayment_months: period,
  purpose: purpose || 'Personal loan',
  terms_accepted: termsAccepted,
  disbursement_method: disbursementMethod, // Employee's choice
};
```

## Data Flow

### When Employee Applies for Loan:
1. Employee selects disbursement method (M-Pesa or Bank)
2. If Bank is selected, employee provides bank details
3. Application is submitted with `disbursement_method` field
4. Backend saves `disbursement_method` to the LoanApplication

### When Admin Views Application:
1. Admin opens the Disbursement Details modal
2. Modal displays the employee's preferred disbursement method
3. Modal shows the corresponding payment details:
   - **M-Pesa**: Phone number from employee profile
   - **Bank**: Bank name, branch, account number from employee profile

### When Admin Records Disbursement:
1. Admin clicks "Approve and Disburse"
2. System uses the `disbursement_method` already set by the employee
3. Admin only needs to provide:
   - Disbursement date
   - Transaction reference/ID
4. The payment is made to the account specified in the employee's profile

## Important Notes

### Bank Details Storage
Bank account details (bank_name, bank_branch, bank_account_number) are stored in the **EmployeeProfile**, not in the LoanApplication. This means:

1. **Employee Profile Update**: When employees update their bank details, they should update their profile (not the loan application)
2. **Loan Application**: Only stores which method (bank or mpesa) they prefer
3. **Admin View**: Reads bank details from the employee profile when displaying disbursement information

### Frontend Note
The frontend loan application form currently tries to send bank details in the application data (lines 169-171), but the backend does not save these to the loan application. These values should be saved to the employee profile instead.

**Recommendation**: Update the employee profile management to allow employees to set/update their bank details separately from the loan application.

## API Changes

### POST /api/v1/loans/applications/
**Request Body**:
```json
{
  "principal_amount": 50000.00,
  "repayment_months": 6,
  "disbursement_method": "bank",  // NEW FIELD - "bank" or "mpesa"
  "purpose": "School fees",
  "terms_accepted": true
}
```

### PATCH /api/v1/loans/applications/<id>/
Employees can now update their `disbursement_method` before the loan is approved.

### POST /api/v1/loans/admin/<id>/disburse/
**Request Body** (disbursement_method now optional):
```json
{
  "disbursement_date": "2026-03-27",
  "disbursement_method": "bank",  // OPTIONAL - uses employee preference if omitted
  "disbursement_reference": "TXN123456789"
}
```

## UI Updates

### Admin Dashboard - Disbursement Details Modal
**Location**: `src/pages/salary-checkoff/admin/AdminDashboard.tsx`

Now displays payment account details in the **Disbursement Information** section:

#### For M-Pesa:
```
┌─────────────────────────────────────┐
│ Payment Account Details             │
│                                     │
│ M-Pesa Number: +254712345678       │
└─────────────────────────────────────┘
```

#### For Bank:
```
┌─────────────────────────────────────┐
│ Payment Account Details             │
│                                     │
│ Bank Name: NCBA                     │
│ Bank Branch: Westlands              │
│ ────────────────────────────────── │
│ Account Number: 12345678            │
└─────────────────────────────────────┘
```

## Testing

### Test Scenarios:

1. **Employee Applies with M-Pesa**:
   - Select M-Pesa disbursement method
   - Submit application
   - Verify `disbursement_method: "mpesa"` is saved

2. **Employee Applies with Bank**:
   - Select Bank disbursement method
   - Enter bank details
   - Submit application
   - Verify `disbursement_method: "bank"` is saved

3. **Admin Views Application**:
   - Open disbursement details modal
   - Verify correct payment method is displayed
   - Verify correct account details are shown

4. **Admin Disburses Loan**:
   - Record disbursement without specifying method
   - Verify employee's preferred method is used
   - Verify disbursement is recorded correctly

## Benefits

1. **Employee Control**: Employees choose how they want to receive their money
2. **Reduced Admin Work**: Admin doesn't need to ask or choose disbursement method
3. **Fewer Errors**: Payment details are confirmed upfront
4. **Clear Process**: Admin sees exactly where to send money
5. **Audit Trail**: Disbursement method is recorded from application stage

## Next Steps

1. **Update Employee Profile Management**: Allow employees to update bank details in their profile
2. **Validation**: Add validation to ensure employee profile has complete payment details before application approval
3. **Testing**: Test the complete flow from application to disbursement
