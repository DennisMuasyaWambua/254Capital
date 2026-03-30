
# Bulk Upload Employer Error Fix

## Issue
When uploading the bulk client template, users get this error:
```
employer: This field is required.
```

## Root Cause
The employer names in the Excel file don't match the employer names in the database.

### Your Excel File Contains:
- Row 1: "254 Capital"
- Row 2: "xltd"

### Database Contains (Local):
- Kenya Power & Lighting Co.
- Safaricom PLC
- KCB Bank Kenya

## Solution Options

### Option 1: Use Correct Employer Names (Quick Fix)
Edit your Excel file to use employer names that exist in the system:
1. Open `/home/dennis/Downloads/client_upload_template (2).xlsx`
2. Change "254 Capital" to one of the existing employers (or keep it if it exists in production)
3. Change "xltd" to a valid employer name
4. Save and re-upload

### Option 2: Add Missing Employers to Database
If "254 Capital" and "xltd" should be valid employers:

1. Add them through the admin panel or directly to the database
2. Make sure they are marked as `is_active = 1`
3. Then the bulk upload will work

### Option 3: Check Production Database
The local database might be out of sync with production. Check what employers exist in production:

```bash
ssh -i ~/Desktop/SalaryCheckoff.pem ubuntu@54.77.248.243

# Query production database
sudo docker exec salary_checkoff_db psql -U salary_checkoff -d salary_checkoff_db -c "SELECT name, is_active FROM employers WHERE is_active = true LIMIT 20;"
```

## How the Validation Works

The backend code in `views.py` (line 111-148) looks up employers by name:

```python
def _get_employer_id(self, employer_value):
    # ...
    employer = Employer.objects.filter(
        name__iexact=employer_value,  # Case-insensitive match
        is_active=True
    ).first()

    if employer:
        return str(employer.id)
    else:
        raise ValueError(f"Employer '{employer_value}' not found...")
```

When the employer is not found, it raises an error which the frontend displays as:
```
employer: This field is required.
```

## Next Steps

1. **Check production database** to see if "254 Capital" exists there
2. If yes, your local database is out of sync
3. If no, either:
   - Add "254 Capital" as an employer in production
   - Change your Excel file to use existing employer names

## Testing the Fix

After making changes:
1. Download a fresh template from the system
2. The "Employer Reference" sheet will show all active employers
3. Copy employer names exactly as shown in the reference sheet
4. Upload the file

The template download includes all active employers in a reference sheet specifically to avoid this issue.
