# Backend Update for Disbursement Information

## Changes Made

### File: `/home/dennis/Desktop/docs/business/254capital/salary_checkoff/backend/apps/loans/serializers.py`

Updated `LoanApplicationListSerializer` to include disbursement method and bank/M-Pesa details.

#### Added Fields:
1. `disbursement_method` - The method chosen for disbursement (bank/mpesa)
2. `disbursement_reference` - Transaction reference for disbursement
3. `bank_name` - Employee's bank name from EmployeeProfile
4. `bank_account_number` - Employee's bank account number from EmployeeProfile
5. `mpesa_number` - Employee's M-Pesa number from EmployeeProfile

#### New Methods:
```python
def get_bank_name(self, obj):
    """Get employee's bank name from profile."""
    if hasattr(obj.employee, 'employee_profile'):
        return obj.employee.employee_profile.bank_name or ''
    return ''

def get_bank_account_number(self, obj):
    """Get employee's bank account number from profile."""
    if hasattr(obj.employee, 'employee_profile'):
        return obj.employee.employee_profile.bank_account_number or ''
    return ''

def get_mpesa_number(self, obj):
    """Get employee's M-Pesa number from profile."""
    if hasattr(obj.employee, 'employee_profile'):
        return obj.employee.employee_profile.mpesa_number or obj.employee.phone_number
    return obj.employee.phone_number
```

## What This Provides

The `/api/v1/loans/admin/queue/` endpoint now returns:

```json
{
  "results": [
    {
      "id": "...",
      "application_number": "254L12345678",
      "disbursement_method": "bank" | "mpesa" | null,
      "disbursement_reference": "REF123...",
      "bank_name": "Equity Bank",
      "bank_account_number": "0123456789",
      "mpesa_number": "+254712345678",
      ...
    }
  ]
}
```

## Frontend Integration

The frontend AdminDashboard.tsx has been updated to display:

1. **Disbursement Details Modal:**
   - Shows M-Pesa number when method is M-Pesa
   - Shows Bank name and account number when method is Bank Transfer

2. **Mass Disbursement Modal:**
   - Displays disbursement details for each selected application

3. **Historical Approvals Table:**
   - Shows disbursement method and relevant details

## To Deploy

1. Navigate to backend directory:
   ```bash
   cd /home/dennis/Desktop/docs/business/254capital/salary_checkoff/backend
   ```

2. Activate virtual environment:
   ```bash
   source venv/bin/activate
   ```

3. No migrations needed (only serializer changes)

4. Restart the Django server:
   ```bash
   sudo systemctl restart gunicorn
   # OR if using supervisor
   sudo supervisorctl restart salary_checkoff
   ```

## Testing

Test the endpoint:
```bash
curl -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  https://api.254-capital.com/api/v1/loans/admin/queue/
```

Verify the response includes the new fields: `disbursement_method`, `bank_name`, `bank_account_number`, `mpesa_number`.
