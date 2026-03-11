# Implementation Guide: New Admin Features

## Summary

This document provides a comprehensive guide for implementing the 5 new admin features from `salacheckoffadditions` into the 254Capital platform, including full API integration and backend endpoint implementation.

## Completed Frontend Work

### 1. Service Layers Created ✅
- **`client.service.ts`**: Handles existing client imports, bulk uploads, and approvals
- **`payment.service.ts`**: Manages manual payment recording and early payment discounts

### 2. Admin Pages Implemented ✅
All 5 admin pages have been created with full API integration:

1. **ExistingClients** (`src/pages/salary-checkoff/admin/ExistingClients.tsx`)
   - Manual client entry form with real-time calculations
   - Bulk upload with file validation
   - Employer dropdown integration
   - Draft and submit functionality

2. **PendingApprovals** (`src/pages/salary-checkoff/admin/PendingApprovals.tsx`)
   - List view of pending client approvals
   - Detailed modal for approval/rejection
   - Individual and bulk approval actions
   - Real-time status updates

3. **RecordPayment** (`src/pages/salary-checkoff/admin/RecordPayment.tsx`)
   - Loan search functionality
   - Payment recording with multiple payment methods
   - Early payment discount calculator
   - Real-time balance calculation

4. **MonthlyReconciliation** (`src/pages/salary-checkoff/admin/MonthlyReconciliation.tsx`)
   - Filterable reconciliation dashboard
   - Summary statistics with trends
   - Detailed reconciliation table
   - Export functionality

5. **OnboardEmployer** (`src/pages/salary-checkoff/admin/OnboardEmployer.tsx`)
   - Multi-section employer onboarding form
   - Temporary password generation
   - Document upload for agreements
   - Email notification option

### 3. Routing Updated ✅
- **SalaryCheckOffApp.tsx**: Added routing for all 5 new pages
- **Sidebar.tsx**: Added navigation links with icons

## Backend API Endpoints to Implement

### Directory Structure
Backend location: `~/Desktop/docs/business/254capital/salary_checkoff/backend/`

### A. Client Management Endpoints

Create new app or extend existing `loans` app:

```bash
cd ~/Desktop/docs/business/254capital/salary_checkoff/backend
python manage.py startapp clients
```

#### Endpoints Required:

1. **POST `/api/v1/clients/manual/`**
   - Create manual existing client entry
   - Calculate loan totals and outstanding balance
   - Set approval status to 'pending'
   - Request Body:
     ```json
     {
       "full_name": "John Kamau",
       "national_id": "12345678",
       "mobile": "0712345678",
       "email": "john@example.com",
       "employer_id": "uuid",
       "employee_id": "EMP-1234",
       "loan_amount": 100000,
       "interest_rate": 5,
       "start_date": "2025-01-01",
       "repayment_period": 6,
       "disbursement_date": "2025-01-05",
       "disbursement_method": "mpesa",
       "amount_paid": 0,
       "loan_status": "Active"
     }
     ```

2. **POST `/api/v1/clients/bulk-upload/`**
   - Accept CSV/XLSX file upload
   - Validate all rows
   - Create multiple client records
   - Return validation results
   - Use: `pandas`, `openpyxl` for Excel processing

3. **POST `/api/v1/clients/validate/`**
   - Validate bulk upload file without importing
   - Check ID format, mobile numbers, required fields
   - Return preview with status indicators

4. **GET `/api/v1/clients/upload-template/`**
   - Generate and return Excel template file
   - Include column headers and sample data

5. **GET `/api/v1/clients/pending/`**
   - List all pending client approvals
   - Support pagination
   - Include employer details

6. **GET `/api/v1/clients/{id}/`**
   - Get single client details

7. **POST `/api/v1/clients/{id}/approve/`**
   - Approve client record
   - Create employee account
   - Send SMS with login credentials
   - Update loan status

8. **POST `/api/v1/clients/{id}/reject/`**
   - Reject client record
   - Add rejection reason
   - Update status

9. **POST `/api/v1/clients/bulk-approve/`**
   - Approve multiple client records
   - Process in batch

### B. Payment Management Endpoints

Extend existing `loans` or `reconciliation` app:

1. **GET `/api/v1/loans/search/`**
   - Search loans by employee name, ID, or mobile
   - Query param: `?q=search_term`
   - Return loan details with outstanding balance

2. **POST `/api/v1/payments/record/`**
   - Record manual payment
   - Update loan balance
   - Create payment history record
   - Send SMS notification
   - Request Body:
     ```json
     {
       "loan_id": "uuid",
       "payment_date": "2026-03-11",
       "amount_received": 15000,
       "payment_method": "mpesa",
       "reference_number": "QWE123RTY",
       "notes": "Optional notes",
       "apply_early_payment_discount": true
     }
     ```

3. **POST `/api/v1/payments/calculate-discount/`**
   - Calculate early payment discount
   - Formula:
     ```python
     actual_months = ceil((payment_date - start_date).days / 30)
     adjusted_interest = principal * 0.05 * actual_months
     discount = original_interest - adjusted_interest
     new_total_due = principal + adjusted_interest
     new_outstanding = new_total_due - amount_paid
     ```
   - Request Body:
     ```json
     {
       "loan_id": "uuid",
       "payment_date": "2026-03-11"
     }
     ```

4. **POST `/api/v1/loans/{id}/update-balance/`**
   - Update outstanding balance
   - Mark as paid if balance reaches zero

### C. Reconciliation Endpoints

Extend existing `reconciliation` app:

1. **GET `/api/v1/reconciliation/monthly/`**
   - Get monthly reconciliation data
   - Query params: `?month=3&year=2026&employer=uuid`
   - Return list of reconciliation records with status

2. **POST `/api/v1/reconciliation/filters/`**
   - Apply reconciliation filters
   - Same as GET but with POST body

3. **GET `/api/v1/reconciliation/summary/`**
   - Calculate reconciliation summary statistics
   - Return:
     ```json
     {
       "expected_collections": 450000,
       "actual_collections": 380000,
       "outstanding": 70000,
       "collection_rate": 84.4,
       "trend": -2.1
     }
     ```

4. **POST `/api/v1/reconciliation/generate-report/`**
   - Generate PDF/Excel reconciliation report
   - Use: `reportlab` for PDF, `openpyxl` for Excel

5. **GET `/api/v1/reconciliation/export/`**
   - Export reconciliation data
   - Query param: `?format=excel|pdf|csv`
   - Return file download

### D. Employer Management Endpoints

Extend existing `employers` app:

1. **POST `/api/v1/employers/generate-credentials/`**
   - Generate temporary HR login credentials
   - Return temporary password

2. **POST `/api/v1/employers/send-email/`**
   - Send credentials via email
   - Include onboarding guide

3. **POST `/api/v1/employers/activate/`**
   - Activate employer account
   - Enable HR portal access

4. **POST `/api/v1/employers/draft/`**
   - Save employer as draft
   - Allow editing before activation

## Django Models to Add

### 1. ExistingClient Model

```python
# apps/clients/models.py
from django.db import models
from apps.employers.models import Employer
import uuid

class ExistingClient(models.Model):
    LOAN_STATUS_CHOICES = [
        ('Active', 'Active'),
        ('Fully Paid', 'Fully Paid'),
        ('Defaulted', 'Defaulted'),
        ('Restructured', 'Restructured'),
    ]

    APPROVAL_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]

    DISBURSEMENT_METHOD_CHOICES = [
        ('mpesa', 'M-Pesa'),
        ('bank', 'Bank Transfer'),
        ('cash', 'Cash'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    full_name = models.CharField(max_length=255)
    national_id = models.CharField(max_length=20)
    mobile = models.CharField(max_length=15)
    email = models.EmailField(blank=True, null=True)
    employer = models.ForeignKey(Employer, on_delete=models.CASCADE, related_name='existing_clients')
    employee_id = models.CharField(max_length=100, blank=True, null=True)

    # Loan Details
    loan_amount = models.DecimalField(max_digits=12, decimal_places=2)
    interest_rate = models.DecimalField(max_digits=5, decimal_places=2)
    start_date = models.DateField()
    repayment_period = models.IntegerField()  # months
    disbursement_date = models.DateField()
    disbursement_method = models.CharField(max_length=10, choices=DISBURSEMENT_METHOD_CHOICES)

    # Calculated Fields
    total_due = models.DecimalField(max_digits=12, decimal_places=2)
    monthly_deduction = models.DecimalField(max_digits=12, decimal_places=2)
    amount_paid = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    outstanding_balance = models.DecimalField(max_digits=12, decimal_places=2)

    # Status
    loan_status = models.CharField(max_length=20, choices=LOAN_STATUS_CHOICES, default='Active')
    approval_status = models.CharField(max_length=20, choices=APPROVAL_STATUS_CHOICES, default='pending')

    # Metadata
    entered_by = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'existing_clients'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.full_name} - {self.employer.name}"

    def save(self, *args, **kwargs):
        # Calculate totals
        interest = self.loan_amount * (self.interest_rate / 100)
        self.total_due = self.loan_amount + interest
        self.monthly_deduction = self.total_due / self.repayment_period
        self.outstanding_balance = self.total_due - self.amount_paid
        super().save(*args, **kwargs)
```

### 2. Payment Model

```python
# apps/loans/models.py (add to existing)
class ManualPayment(models.Model):
    PAYMENT_METHOD_CHOICES = [
        ('mpesa', 'M-Pesa'),
        ('bank', 'Bank Transfer'),
        ('cash', 'Cash'),
        ('cheque', 'Cheque'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    loan = models.ForeignKey('LoanApplication', on_delete=models.CASCADE, related_name='manual_payments')
    payment_date = models.DateField()
    amount_received = models.DecimalField(max_digits=12, decimal_places=2)
    payment_method = models.CharField(max_length=10, choices=PAYMENT_METHOD_CHOICES)
    reference_number = models.CharField(max_length=100, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    early_payment_discount_applied = models.BooleanField(default=False)
    discount_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    recorded_by = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'manual_payments'
        ordering = ['-payment_date']

    def __str__(self):
        return f"Payment {self.amount_received} for {self.loan.employee}"
```

## Django Views/Serializers Example

### Example: Client Creation View

```python
# apps/clients/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import ExistingClient
from .serializers import ExistingClientSerializer
from apps.accounts.permissions import IsAdminUser
import pandas as pd

class ExistingClientViewSet(viewsets.ModelViewSet):
    queryset = ExistingClient.objects.all()
    serializer_class = ExistingClientSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]

    @action(detail=False, methods=['post'])
    def manual(self, request):
        """Create manual existing client entry"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        client = serializer.save(entered_by=request.user.get_full_name())

        return Response({
            'detail': 'Client record created successfully',
            'client': ExistingClientSerializer(client).data
        }, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'])
    def bulk_upload(self, request):
        """Bulk upload client records from Excel/CSV"""
        if 'file' not in request.FILES:
            return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)

        file = request.FILES['file']

        try:
            # Read Excel file
            if file.name.endswith('.xlsx') or file.name.endswith('.xls'):
                df = pd.read_excel(file)
            elif file.name.endswith('.csv'):
                df = pd.read_csv(file)
            else:
                return Response({'error': 'Invalid file format'}, status=status.HTTP_400_BAD_REQUEST)

            # Process and validate rows
            valid_rows = []
            errors = []

            for index, row in df.iterrows():
                try:
                    # Validate and create client
                    client_data = {
                        'full_name': row['Full Name'],
                        'national_id': row['National ID'],
                        'mobile': row['Mobile'],
                        'email': row.get('Email', ''),
                        'employer_id': row['Employer ID'],
                        'loan_amount': row['Loan Amount'],
                        'interest_rate': row['Interest Rate'],
                        # ... more fields
                    }

                    serializer = self.get_serializer(data=client_data)
                    serializer.is_valid(raise_exception=True)
                    client = serializer.save(entered_by=request.user.get_full_name())
                    valid_rows.append(client.id)

                except Exception as e:
                    errors.append({'row': index + 2, 'error': str(e)})

            return Response({
                'total_rows': len(df),
                'valid_rows': len(valid_rows),
                'invalid_rows': len(errors),
                'errors': errors
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def pending(self, request):
        """List pending approvals"""
        pending_clients = self.queryset.filter(approval_status='pending')
        page = self.paginate_queryset(pending_clients)

        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(pending_clients, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve client record"""
        client = self.get_object()

        if client.approval_status != 'pending':
            return Response({'error': 'Client already processed'}, status=status.HTTP_400_BAD_REQUEST)

        client.approval_status = 'approved'
        client.save()

        # TODO: Create employee account
        # TODO: Send SMS notification

        return Response({
            'detail': 'Client approved successfully',
            'client': self.get_serializer(client).data
        })

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Reject client record"""
        client = self.get_object()

        if client.approval_status != 'pending':
            return Response({'error': 'Client already processed'}, status=status.HTTP_400_BAD_REQUEST)

        client.approval_status = 'rejected'
        client.save()

        return Response({
            'detail': 'Client rejected successfully',
            'client': self.get_serializer(client).data
        })
```

## URL Configuration

```python
# apps/clients/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ExistingClientViewSet

router = DefaultRouter()
router.register(r'clients', ExistingClientViewSet, basename='clients')

urlpatterns = [
    path('', include(router.urls)),
]

# config/urls.py (main urls)
# Add to existing patterns:
path('api/v1/', include('apps.clients.urls')),
```

## Python Dependencies to Add

```txt
# Add to requirements.txt
pandas==2.0.0
openpyxl==3.1.2
xlrd==2.0.1
reportlab==4.0.4
```

## Testing the Implementation

### Frontend Testing

1. Start the frontend development server:
   ```bash
   cd ~/Desktop/docs/business/254capital/254Capital
   npm run dev
   ```

2. Test each admin page:
   - Navigate to admin portal
   - Test ExistingClients manual entry
   - Test ExistingClients bulk upload
   - Test PendingApprovals workflow
   - Test RecordPayment with search
   - Test MonthlyReconciliation filters
   - Test OnboardEmployer form

### Backend Testing

1. Run migrations:
   ```bash
   cd ~/Desktop/docs/business/254capital/salary_checkoff/backend
   python manage.py makemigrations clients
   python manage.py migrate
   ```

2. Test API endpoints:
   ```bash
   # Test client creation
   curl -X POST http://localhost:8000/api/v1/clients/manual/ \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "full_name": "Test User",
       "national_id": "12345678",
       "mobile": "0712345678",
       "employer_id": "uuid",
       "loan_amount": 100000,
       "interest_rate": 5,
       "repayment_period": 6,
       "start_date": "2026-01-01",
       "disbursement_date": "2026-01-05",
       "disbursement_method": "mpesa"
     }'
   ```

## Implementation Checklist

### Frontend ✅
- [x] Create client service
- [x] Create payment service
- [x] Implement ExistingClients page
- [x] Implement PendingApprovals page
- [x] Implement RecordPayment page
- [x] Implement MonthlyReconciliation page
- [x] Implement OnboardEmployer page
- [x] Update routing
- [x] Update sidebar navigation

### Backend ⏳
- [ ] Create clients app (or extend loans)
- [ ] Add ExistingClient model
- [ ] Add ManualPayment model
- [ ] Implement client management endpoints
- [ ] Implement payment recording endpoints
- [ ] Implement reconciliation endpoints
- [ ] Implement employer credential generation
- [ ] Add bulk upload processing
- [ ] Add early payment discount calculation
- [ ] Add SMS notifications for approvals
- [ ] Add Excel/PDF export functionality
- [ ] Write unit tests
- [ ] Write integration tests

## Next Steps

1. **Backend Implementation**: Follow the Django implementation examples above to create all required endpoints.

2. **API Testing**: Use Postman or curl to test each endpoint thoroughly.

3. **Frontend-Backend Integration**: Connect frontend to actual API endpoints and test end-to-end flows.

4. **Production Deployment**:
   - Update CORS settings
   - Configure production database
   - Set up SSL certificates
   - Deploy backend to https://api.254-capital.com
   - Test in production environment

5. **User Acceptance Testing**: Have admin users test all new features.

## File Locations

### Frontend
- Services: `src/services/salary-checkoff/`
- Pages: `src/pages/salary-checkoff/admin/`
- Routing: `src/pages/salary-checkoff/SalaryCheckOffApp.tsx`
- Navigation: `src/components/salary-checkoff/layout/Sidebar.tsx`

### Backend (To Be Implemented)
- Models: `apps/clients/models.py`, `apps/loans/models.py`
- Views: `apps/clients/views.py`, `apps/loans/views.py`, `apps/reconciliation/views.py`
- Serializers: `apps/clients/serializers.py`, etc.
- URLs: `apps/clients/urls.py`, etc.

## Support

For questions or issues:
1. Check this implementation guide
2. Review the comparison report from the Explore agent
3. Examine existing similar endpoints in the backend
4. Test incrementally as you implement

---

**Document Version**: 1.0
**Last Updated**: March 11, 2026
**Author**: Claude Code Agent
