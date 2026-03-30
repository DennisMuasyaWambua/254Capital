# Bulk Upload 405 Error Fix - March 27, 2026

## Issue
When uploading files in the Bulk Upload tab of Existing Clients, users encounter a **405 Method Not Allowed** error:
```json
{"detail":"Method \"POST\" not allowed.","code":"method_not_allowed"}
```

## Root Cause
The backend router is treating `/validate/` and `/bulk-upload/` as client detail URLs (like `/clients/{id}/`) instead of custom action endpoints.

**Evidence from OPTIONS request:**
```
allow: GET, PUT, PATCH, DELETE, HEAD, OPTIONS
```
POST is not allowed because the router matches these URLs to the detail view.

## Solution
Add explicit URL patterns for `validate` and `bulk-upload` endpoints, similar to how `template-download` was fixed.

---

## Backend Changes Required

### 1. Update `/backend/apps/clients/urls.py`

```python
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'', views.ExistingClientViewSet, basename='clients')

urlpatterns = [
    # Standalone endpoints (must be BEFORE router.urls)
    path('template-download/', views.download_client_template, name='template-download'),
    path('validate/', views.validate_bulk_upload, name='validate-bulk'),
    path('bulk-upload/', views.bulk_upload_clients, name='bulk-upload'),

    # Viewset routes (handles CRUD operations)
    path('', include(router.urls)),
]
```

### 2. Add Standalone Views to `/backend/apps/clients/views.py`

Add these view functions (place them near `download_client_template`):

```python
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status
import pandas as pd
from apps.employers.models import Employer


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def validate_bulk_upload(request):
    """
    Validate bulk upload file without importing.

    POST /api/v1/clients/validate/
    """
    if 'file' not in request.FILES:
        return Response(
            {'error': 'No file provided'},
            status=status.HTTP_400_BAD_REQUEST
        )

    file = request.FILES['file']

    try:
        # Read file
        if file.name.endswith(('.xlsx', '.xls')):
            df = pd.read_excel(file)
        elif file.name.endswith('.csv'):
            df = pd.read_csv(file)
        else:
            return Response(
                {'error': 'Invalid file format. Use .xlsx, .xls, or .csv'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Normalize column names
        # IMPORTANT: Use r' ?\*' to match optional space + literal asterisk (not ' *' which means zero or more spaces)
        df.columns = df.columns.str.strip().str.replace(r' ?\*', '', regex=True).str.lower().str.replace(' ', '_')

        # Column name mappings
        column_map = {
            'full_name': ['full_name', 'name', 'fullname'],
            'national_id': ['national_id', 'national_id_number', 'id_number', 'id'],
            'mobile': ['mobile', 'mobile_number', 'phone', 'phone_number'],
            'email': ['email', 'email_address'],
            'employer': ['employer', 'employer_name'],
            'employee_id': ['employee_id', 'emp_id'],
            'loan_amount': ['loan_amount', 'loan_amount_(kes)', 'amount'],
            'interest_rate': ['interest_rate', 'interest_rate_(%)'],
            'start_date': ['start_date', 'loan_start_date'],
            'repayment_period': ['repayment_period', 'repayment_period_(months)', 'period'],
            'disbursement_date': ['disbursement_date'],
            'disbursement_method': ['disbursement_method'],
            'amount_paid': ['amount_paid', 'amount_paid_to_date', 'amount_paid_to_date_(kes)'],
            'loan_status': ['loan_status', 'status'],
        }

        # Rename columns to standard names
        for standard_name, alternatives in column_map.items():
            for alt in alternatives:
                if alt in df.columns:
                    df = df.rename(columns={alt: standard_name})
                    break

        # Build preview data
        preview = []
        valid_count = 0
        invalid_count = 0

        # Get all employers for lookup
        employers = {e.name.lower(): e for e in Employer.objects.filter(is_active=True)}

        for index, row in df.iterrows():
            # Skip empty rows or instruction rows
            name = str(row.get('full_name', '')).strip()
            if not name or name.lower().startswith('instruction') or name.lower() == 'nan':
                continue

            row_data = {
                'row_number': index + 2,  # Excel row (1-indexed + header)
                'name': name,
                'national_id': str(row.get('national_id', '')).strip(),
                'mobile': str(row.get('mobile', '')).strip(),
                'employer': str(row.get('employer', '')).strip(),
                'loan_amount': row.get('loan_amount', 0),
                'status': 'valid',
                'issue': None
            }

            # Validate required fields
            issues = []
            if not row_data['name']:
                issues.append('Full name is required')
            if not row_data['national_id']:
                issues.append('National ID is required')
            if not row_data['mobile']:
                issues.append('Mobile number is required')

            # Validate employer
            employer_name = row_data['employer'].lower()
            if not employer_name:
                issues.append('Employer is required')
            elif employer_name not in employers:
                issues.append(f"Employer '{row_data['employer']}' not found")

            if issues:
                row_data['status'] = 'error'
                row_data['issue'] = '; '.join(issues)
                invalid_count += 1
            else:
                valid_count += 1

            preview.append(row_data)

            # Limit preview to 100 rows
            if len(preview) >= 100:
                break

        return Response({
            'total_rows': len(preview),
            'valid_rows': valid_count,
            'invalid_rows': invalid_count,
            'preview': preview
        })

    except Exception as e:
        return Response(
            {'error': f'Error processing file: {str(e)}'},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def bulk_upload_clients(request):
    """
    Bulk upload client records from Excel/CSV file.

    POST /api/v1/clients/bulk-upload/
    """
    if 'file' not in request.FILES:
        return Response(
            {'error': 'No file provided'},
            status=status.HTTP_400_BAD_REQUEST
        )

    file = request.FILES['file']

    try:
        # Read file
        if file.name.endswith(('.xlsx', '.xls')):
            df = pd.read_excel(file)
        elif file.name.endswith('.csv'):
            df = pd.read_csv(file)
        else:
            return Response(
                {'error': 'Invalid file format. Use .xlsx, .xls, or .csv'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Normalize column names
        # IMPORTANT: Use r' ?\*' to match optional space + literal asterisk (not ' *' which means zero or more spaces)
        df.columns = df.columns.str.strip().str.replace(r' ?\*', '', regex=True).str.lower().str.replace(' ', '_')

        # Column name mappings (same as validate)
        column_map = {
            'full_name': ['full_name', 'name', 'fullname'],
            'national_id': ['national_id', 'national_id_number', 'id_number', 'id'],
            'mobile': ['mobile', 'mobile_number', 'phone', 'phone_number'],
            'email': ['email', 'email_address'],
            'employer': ['employer', 'employer_name'],
            'employee_id': ['employee_id', 'emp_id'],
            'loan_amount': ['loan_amount', 'loan_amount_(kes)', 'amount'],
            'interest_rate': ['interest_rate', 'interest_rate_(%)'],
            'start_date': ['start_date', 'loan_start_date'],
            'repayment_period': ['repayment_period', 'repayment_period_(months)', 'period'],
            'disbursement_date': ['disbursement_date'],
            'disbursement_method': ['disbursement_method'],
            'amount_paid': ['amount_paid', 'amount_paid_to_date', 'amount_paid_to_date_(kes)'],
            'loan_status': ['loan_status', 'status'],
        }

        # Rename columns
        for standard_name, alternatives in column_map.items():
            for alt in alternatives:
                if alt in df.columns:
                    df = df.rename(columns={alt: standard_name})
                    break

        # Get employers for lookup
        employers = {e.name.lower(): e for e in Employer.objects.filter(is_active=True)}

        # Process rows
        successful = 0
        failed = 0
        errors = []
        created_ids = []

        for index, row in df.iterrows():
            name = str(row.get('full_name', '')).strip()

            # Skip empty/instruction rows
            if not name or name.lower().startswith('instruction') or name.lower() == 'nan':
                continue

            try:
                # Get employer
                employer_name = str(row.get('employer', '')).strip().lower()
                if employer_name not in employers:
                    raise ValueError(f"Employer '{row.get('employer')}' not found")

                employer = employers[employer_name]

                # Parse dates
                start_date = pd.to_datetime(row.get('start_date')).date() if pd.notna(row.get('start_date')) else None
                disbursement_date = pd.to_datetime(row.get('disbursement_date')).date() if pd.notna(row.get('disbursement_date')) else None

                # Create client record
                from .models import ExistingClient

                client = ExistingClient.objects.create(
                    full_name=name,
                    national_id=str(row.get('national_id', '')).strip(),
                    mobile=str(row.get('mobile', '')).strip(),
                    email=str(row.get('email', '')).strip() if pd.notna(row.get('email')) else '',
                    employer=employer,
                    employee_id=str(row.get('employee_id', '')).strip() if pd.notna(row.get('employee_id')) else '',
                    loan_amount=float(row.get('loan_amount', 0)) if pd.notna(row.get('loan_amount')) else 0,
                    interest_rate=float(row.get('interest_rate', 5)) if pd.notna(row.get('interest_rate')) else 5,
                    start_date=start_date,
                    repayment_period=int(row.get('repayment_period', 6)) if pd.notna(row.get('repayment_period')) else 6,
                    disbursement_date=disbursement_date,
                    disbursement_method=str(row.get('disbursement_method', 'mpesa')).strip().lower() if pd.notna(row.get('disbursement_method')) else 'mpesa',
                    amount_paid=float(row.get('amount_paid', 0)) if pd.notna(row.get('amount_paid')) else 0,
                    loan_status=str(row.get('loan_status', 'Active')).strip() if pd.notna(row.get('loan_status')) else 'Active',
                    entered_by=request.user.get_full_name() if hasattr(request.user, 'get_full_name') else str(request.user),
                    approval_status='pending'
                )

                created_ids.append(str(client.id))
                successful += 1

            except Exception as e:
                failed += 1
                errors.append({
                    'row': index + 2,
                    'error': str(e)
                })

        return Response({
            'message': 'Bulk upload processed',
            'total_rows': successful + failed,
            'successful': successful,
            'failed': failed,
            'valid_client_ids': created_ids,
            'errors': errors
        }, status=status.HTTP_201_CREATED if successful > 0 else status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        return Response(
            {'error': f'Error processing file: {str(e)}'},
            status=status.HTTP_400_BAD_REQUEST
        )
```

---

## Deployment Steps

### 1. Connect to the server
```bash
ssh -i ~/Desktop/SalaryCheckoff.pem ubuntu@54.77.248.243
```

### 2. Backup existing files
```bash
sudo docker cp salary_checkoff_web:/app/apps/clients/views.py /tmp/views_backup.py
sudo docker cp salary_checkoff_web:/app/apps/clients/urls.py /tmp/urls_backup.py
```

### 3. Get current files to edit locally
```bash
# On your local machine
scp -i ~/Desktop/SalaryCheckoff.pem ubuntu@54.77.248.243:/tmp/views_backup.py ./backend_views.py
scp -i ~/Desktop/SalaryCheckoff.pem ubuntu@54.77.248.243:/tmp/urls_backup.py ./backend_urls.py
```

### 4. Edit the files
- Add the `validate_bulk_upload` and `bulk_upload_clients` functions to `views.py`
- Update `urls.py` with the new URL patterns (must be BEFORE `router.urls`)

### 5. Upload updated files
```bash
scp -i ~/Desktop/SalaryCheckoff.pem ./backend_views.py ubuntu@54.77.248.243:/tmp/views.py
scp -i ~/Desktop/SalaryCheckoff.pem ./backend_urls.py ubuntu@54.77.248.243:/tmp/urls.py
```

### 6. Copy files into Docker container
```bash
ssh -i ~/Desktop/SalaryCheckoff.pem ubuntu@54.77.248.243

sudo docker cp /tmp/views.py salary_checkoff_web:/app/apps/clients/views.py
sudo docker cp /tmp/urls.py salary_checkoff_web:/app/apps/clients/urls.py
```

### 7. Clear cache and restart
```bash
sudo docker exec salary_checkoff_web find /app/apps/clients -name '*.pyc' -delete
sudo docker exec salary_checkoff_web find /app/apps/clients -name '__pycache__' -type d -exec rm -rf {} + 2>/dev/null || true
sudo docker restart salary_checkoff_web
```

### 8. Verify the fix
```bash
# Check if POST is now allowed
curl -X OPTIONS https://api.254-capital.com/api/v1/clients/validate/ -i

# Expected: allow: POST, OPTIONS
```

---

## Verification Checklist

- [ ] Backend URLs updated with explicit patterns
- [ ] Standalone view functions added
- [ ] Container restarted
- [ ] OPTIONS request shows POST allowed
- [ ] File upload validation works
- [ ] Bulk import works
- [ ] Records appear in Pending Approvals

---

**Fix Date**: March 27, 2026
**Status**: Backend deployment required
