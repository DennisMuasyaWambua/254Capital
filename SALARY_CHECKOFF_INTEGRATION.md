# Salary Check-Off Loan System Integration

This document explains how the Salary Check-Off Loan System has been integrated into the 254 Capital frontend application.

## Overview

The Salary Check-Off Loan System is a comprehensive loan management platform that allows:
- **Employees** to apply for salary check-off loans
- **HR Managers** to review and approve/decline applications
- **Admins** to perform credit assessments and manage disbursements

## Architecture

### Frontend Structure

```
src/
├── pages/salary-checkoff/
│   ├── SalaryCheckOffApp.tsx          # Main app component with routing
│   ├── auth/
│   │   ├── LoginPage.tsx              # OTP-based login
│   │   └── RegisterPage.tsx           # Employee registration
│   ├── employee/
│   │   ├── EmployeeDashboard.tsx      # Employee dashboard
│   │   ├── LoanApplication.tsx        # Loan application form
│   │   ├── RepaymentSchedule.tsx      # Repayment schedule view
│   │   └── TermsModal.tsx             # Terms and conditions
│   ├── hr/
│   │   ├── HRDashboard.tsx            # HR dashboard
│   │   └── ApplicationReview.tsx      # Application review interface
│   └── admin/
│       └── AdminDashboard.tsx         # Admin dashboard
├── components/salary-checkoff/
│   ├── layout/
│   │   ├── Header.tsx                 # App header
│   │   └── Sidebar.tsx                # Navigation sidebar
│   └── ui/
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Input.tsx
│       ├── Select.tsx
│       ├── Modal.tsx
│       ├── Table.tsx
│       ├── Badge.tsx
│       ├── StatCard.tsx
│       ├── FileUpload.tsx
│       ├── ProgressSteps.tsx
│       └── Tabs.tsx
├── services/salary-checkoff/
│   ├── api.ts                         # Base API configuration
│   ├── auth.service.ts                # Authentication service
│   ├── loan.service.ts                # Loan management service
│   └── index.ts                       # Service exports
└── utils/salary-checkoff/
    └── (utility functions)
```

### Backend Structure

The backend is a Django REST API located at:
```
~/Desktop/docs/business/254capital/salary_checkoff/backend/
```

**Apps:**
- `accounts` - User authentication and profiles
- `loans` - Loan application management
- `employers` - Employer management
- `documents` - Document upload and verification
- `notifications` - Notification system
- `reconciliation` - Payment reconciliation
- `exports` - Report generation
- `audit` - Audit logging

## Getting Started

### Prerequisites

1. **Backend Requirements:**
   - Python 3.10+
   - Django 4.2+
   - PostgreSQL (optional, SQLite works for development)

2. **Frontend Requirements:**
   - Node.js 18+
   - npm or yarn

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd ~/Desktop/docs/business/254capital/salary_checkoff/backend
   ```

2. Create and activate a virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Linux/Mac
   # or
   venv\Scripts\activate  # On Windows
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. Run migrations:
   ```bash
   python manage.py migrate
   ```

6. Create a superuser (admin):
   ```bash
   python manage.py createsuperuser
   ```

7. (Optional) Seed sample data:
   ```bash
   python manage.py seed_data
   ```

8. Start the development server:
   ```bash
   python manage.py runserver
   ```

   The API will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd ~/Desktop/docs/business/254capital/254Capital
   ```

2. Install dependencies (if not already done):
   ```bash
   npm install
   ```

3. Ensure the `.env` file has the correct backend URL:
   ```env
   VITE_SALARY_CHECKOFF_API_URL=http://localhost:8000
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

   The frontend will be available at `http://localhost:5173`

## Accessing the System

### From the Main Application

1. Navigate to the Services page: `http://localhost:5173/services`
2. Click on the "Salary Check Off loan" card
3. You'll be redirected to the Salary Check-Off login page

### Direct Access

Navigate directly to: `http://localhost:5173/salary-checkoff`

## User Roles and Login

### Employee Login (OTP-based)

1. Click "Login" on the Salary Check-Off page
2. Enter your phone number (format: +254712345678)
3. Enter the OTP code sent to your phone
4. Access the Employee Dashboard

**Test Employee (if seed data was loaded):**
- Phone: Check the backend seed data script

### HR Manager Login

1. Click "HR Login" tab
2. Enter username and password
3. Access the HR Dashboard

**Test HR Manager (if seed data was loaded):**
- Username: Check the backend seed data script

### Admin Login (2FA)

1. Click "Admin Login" tab
2. Enter username and password
3. Enter the TOTP code from your authenticator app
4. Access the Admin Dashboard

**Test Admin:**
- Username: Created with `python manage.py createsuperuser`

## API Endpoints

### Authentication
- `POST /api/v1/auth/otp/send/` - Send OTP
- `POST /api/v1/auth/otp/verify/` - Verify OTP
- `POST /api/v1/auth/register/` - Register employee
- `POST /api/v1/auth/hr/login/` - HR login
- `POST /api/v1/auth/admin/login/` - Admin login
- `GET /api/v1/auth/profile/` - Get user profile

### Loans
- `GET /api/v1/loans/applications/` - List applications
- `POST /api/v1/loans/applications/` - Create application
- `GET /api/v1/loans/applications/{id}/` - Get application detail
- `POST /api/v1/loans/calculator/` - Calculate loan
- `GET /api/v1/loans/hr/pending/` - HR pending applications
- `POST /api/v1/loans/hr/{id}/review/` - HR review
- `GET /api/v1/loans/admin/queue/` - Admin assessment queue
- `POST /api/v1/loans/admin/{id}/assess/` - Admin assess
- `POST /api/v1/loans/admin/{id}/disburse/` - Admin disburse

### API Documentation

When the backend is running, visit:
- Swagger UI: `http://localhost:8000/api/docs/`
- ReDoc: `http://localhost:8000/api/redoc/`
- OpenAPI Schema: `http://localhost:8000/api/schema/`

## Features

### Employee Features
- Apply for salary check-off loans
- View loan application status
- See repayment schedule
- Track payment history
- Receive notifications

### HR Manager Features
- Review pending loan applications
- Approve or decline applications
- Batch approve multiple applications
- View all applications for their employer
- Generate payroll deduction reports

### Admin Features
- Credit assessment for approved applications
- Record loan disbursements
- Track all applications across employers
- Generate reports and analytics
- Manage reconciliation

## Development Notes

### State Management
The Salary Check-Off system uses local component state and does not integrate with the main 254Capital AuthContext. This maintains separation between the two authentication systems.

### API Integration
All API calls use the service layer in `src/services/salary-checkoff/`. The base API configuration automatically handles:
- Bearer token authentication
- Token refresh
- Error handling
- Request/response formatting

### Styling
The system uses Tailwind CSS classes consistent with the main 254Capital application design system.

## Troubleshooting

### Backend Issues

**Issue: CORS errors**
- Ensure `CORS_ALLOWED_ORIGINS` in Django settings includes `http://localhost:5173`

**Issue: Database errors**
- Run migrations: `python manage.py migrate`
- Reset database: Delete `db.sqlite3` and run migrations again

**Issue: OTP not sending**
- Check SMS gateway configuration in backend settings
- For development, OTP codes are logged to the console

### Frontend Issues

**Issue: API connection failed**
- Verify backend is running: `http://localhost:8000`
- Check `.env` file has correct `VITE_SALARY_CHECKOFF_API_URL`
- Restart Vite dev server after changing `.env`

**Issue: Components not rendering**
- Clear build cache: `rm -rf node_modules/.vite`
- Reinstall dependencies: `npm install`

**Issue: Import errors**
- Ensure TypeScript path aliases are configured in `tsconfig.json`
- Check `vite.config.ts` has the `@` alias configured

## Production Deployment

### Backend
1. Set up production database (PostgreSQL recommended)
2. Configure environment variables for production
3. Run `python manage.py collectstatic`
4. Deploy using Gunicorn + Nginx or similar
5. Set up SSL certificates
6. Configure SMS gateway for OTP
7. Set up Celery for background tasks

### Frontend
1. Update `.env` with production backend URL
2. Build the application: `npm run build`
3. Deploy the `dist` folder to your hosting service
4. Configure proper routing for SPA

## Support

For issues or questions:
- Check the API documentation at `/api/docs/`
- Review the Django admin panel at `/admin/`
- Check application logs for detailed error messages

## Security Considerations

- The system uses JWT tokens stored in localStorage
- OTP codes expire after 10 minutes
- Admin login requires 2FA via TOTP
- All sensitive operations are logged in the audit system
- File uploads are validated and scanned
- API rate limiting is configured
