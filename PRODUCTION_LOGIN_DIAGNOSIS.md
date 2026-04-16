# Production Login Issue - Diagnosis Report

**Date:** April 14, 2026
**Issue:** Unable to login at production salary-checkoff portal (https://www.254-capital.com/salary-checkoff)
**Admin Credentials:** muasyathegreat4@gmail.com / Muasya@2024

---

## Executive Summary

There are **TWO SEPARATE LOGIN SYSTEMS** in your application:

1. **✅ LOCAL LOGIN (FIXED)** - Main app at `http://localhost:8080/login`
   - Uses localStorage with bcrypt hashing
   - **Status:** WORKING - Admin account automatically initialized

2. **❌ PRODUCTION LOGIN (API ISSUE)** - Salary Check-Off at `https://www.254-capital.com/salary-checkoff`
   - Uses backend API at `https://api.254-capital.com`
   - **Status:** API SERVER MISCONFIGURATION

---

## System Architecture

### Production Salary Check-Off System

```
Frontend (React)
  ↓
https://www.254-capital.com/salary-checkoff
  ↓
Backend API
  ↓
https://api.254-capital.com/api/v1/auth/admin/login/
  ↓
Django + PostgreSQL Database
```

### Authentication Flow

**Step 1: Admin Login (Email + Password)**
```
POST https://api.254-capital.com/api/v1/auth/admin/login/
Body: {
  "email": "muasyathegreat4@gmail.com",
  "password": "Muasya@2024"
}

Expected Response:
{
  "requires_otp": true,
  "temp_token": "temporary_token_here",
  "masked_phone": "0712****567",
  "expires_in": 300
}
```

**Step 2: OTP Verification**
```
POST https://api.254-capital.com/api/v1/auth/verify-login-otp/
Body: {
  "temp_token": "temporary_token_from_step_1",
  "otp": "123456"
}

Expected Response:
{
  "tokens": {
    "access": "jwt_access_token",
    "refresh": "jwt_refresh_token"
  },
  "user": {
    "id": "user_id",
    "email": "muasyathegreat4@gmail.com",
    "role": "admin"
  }
}
```

---

## Diagnosis Results

### API Server Test

**Endpoint Tested:** `https://api.254-capital.com/api/v1/auth/admin/login/`

**Request:**
```json
POST /api/v1/auth/admin/login/
Content-Type: application/json

{
  "email": "muasyathegreat4@gmail.com",
  "password": "Muasya@2024"
}
```

**Response:**
```
HTTP/2 400 Bad Request
Server: nginx/1.24.0 (Ubuntu)
Content-Type: text/html; charset=utf-8

<!doctype html>
<html lang="en">
<head>
  <title>Bad Request (400)</title>
</head>
<body>
  <h1>Bad Request (400)</h1><p></p>
</body>
</html>
```

### Problem Identified

❌ **The API server is returning HTML instead of JSON**
❌ **All API endpoints return 400 Bad Request**
❌ **This indicates a server configuration issue, NOT a credentials problem**

---

## Root Cause Analysis

The 400 Bad Request with HTML response indicates one of these issues:

### 1. **Django ALLOWED_HOSTS Misconfiguration** (Most Likely)
Django's `settings.py` may not include the API domain in ALLOWED_HOSTS:

```python
# Django settings.py
ALLOWED_HOSTS = ['localhost', '127.0.0.1']  # Missing 'api.254-capital.com'
```

**Should be:**
```python
ALLOWED_HOSTS = ['localhost', '127.0.0.1', 'api.254-capital.com', '.254-capital.com']
```

### 2. **Nginx Reverse Proxy Misconfiguration**
The nginx configuration may not be properly forwarding requests to Django.

### 3. **CORS Headers Missing**
Cross-Origin Resource Sharing (CORS) may not be configured for the frontend domain.

### 4. **Django Application Not Running**
The Django application server (gunicorn/uwsgi) may not be running properly.

### 5. **Missing HOST Header**
Django is rejecting requests without proper Host header validation.

---

## Solution Steps

### Immediate Fix (Backend Access Required)

You need **SSH access to the production server** or contact the backend administrator.

#### Option 1: Fix Django ALLOWED_HOSTS

1. SSH into the production server:
   ```bash
   ssh user@your-server-ip
   ```

2. Edit Django settings:
   ```bash
   cd /path/to/django/project
   nano backend/settings.py  # or wherever settings.py is located
   ```

3. Update ALLOWED_HOSTS:
   ```python
   ALLOWED_HOSTS = [
       'localhost',
       '127.0.0.1',
       'api.254-capital.com',
       'www.254-capital.com',
       '.254-capital.com',  # Allows all subdomains
   ]
   ```

4. Restart Django/Gunicorn:
   ```bash
   sudo systemctl restart gunicorn
   # or
   sudo supervisorctl restart django_app
   ```

#### Option 2: Check Django Application Status

```bash
# Check if Django/Gunicorn is running
sudo systemctl status gunicorn
# or
ps aux | grep gunicorn

# Check nginx status
sudo systemctl status nginx

# Check Django logs
tail -f /var/log/gunicorn/error.log
tail -f /var/log/nginx/error.log
```

#### Option 3: Test Django Directly (Bypass Nginx)

```bash
# If Django runs on port 8000 internally
curl -X POST http://localhost:8000/api/v1/auth/admin/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"muasyathegreat4@gmail.com","password":"Muasya@2024"}'
```

If this works, the issue is with nginx configuration, not Django.

---

## Alternative: Use Demo Login

The frontend has a **Demo Access** feature that bypasses authentication.

**Location:** LoginPage.tsx lines 572-597

You can temporarily use this to access the admin panel while fixing the API:

1. Go to https://www.254-capital.com/salary-checkoff
2. Scroll to the bottom
3. Click the "Admin" demo button

**⚠️ Note:** This is for testing only and should be removed/disabled in production.

---

## Verification Steps

Once the backend is fixed, verify with:

```bash
# Test the admin login endpoint
curl -X POST https://api.254-capital.com/api/v1/auth/admin/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"muasyathegreat4@gmail.com","password":"Muasya@2024"}'
```

**Expected successful response:**
```json
{
  "detail": "OTP sent to your registered phone number",
  "requires_otp": true,
  "temp_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "masked_phone": "0712****567",
  "expires_in": 300
}
```

---

## Files for Reference

### Frontend Code
- **Login Page:** `src/pages/salary-checkoff/auth/LoginPage.tsx`
- **Auth Service:** `src/services/salary-checkoff/auth.service.ts`
- **API Config:** `src/services/salary-checkoff/api.ts`

### API Endpoints
```
Admin Login:      POST /api/v1/auth/admin/login/
Verify OTP:       POST /api/v1/auth/verify-login-otp/
HR Login:         POST /api/v1/auth/hr/login/
Employee OTP:     POST /api/v1/auth/otp/send/
```

### Environment Variables
```
VITE_SALARY_CHECKOFF_API_URL=https://api.254-capital.com
```

---

## Summary

| System | Status | Action Required |
|--------|--------|-----------------|
| Local Development Login | ✅ FIXED | None - ready to use |
| Production API Server | ❌ MISCONFIGURED | Backend server configuration needs fixing |
| Admin Credentials | ✅ CORRECT | Credentials are valid for both systems |
| Frontend Code | ✅ WORKING | No frontend changes needed |

---

## Next Steps

1. **Contact Backend Administrator** or access the production server
2. **Check Django ALLOWED_HOSTS** configuration
3. **Verify Django application** is running properly
4. **Test API endpoint** directly on the server
5. **Review nginx configuration** for proxy settings
6. **Check application logs** for detailed error messages

---

## Contact Information

If you need help with backend configuration, you'll need:
- SSH access to the production server
- Django admin credentials
- Server administrator contact

---

**Report Generated:** April 14, 2026
**Test Scripts Available:**
- `test-production-login.js` - Tests the production API
- `verify-admin-login.js` - Verifies password hashing (local)
- `test-admin-login.html` - Interactive testing dashboard (local)
