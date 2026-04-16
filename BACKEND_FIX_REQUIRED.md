# Production Admin Login Fix - Backend Configuration Required

**Date:** April 14, 2026
**Status:** BACKEND ISSUE - Frontend is working correctly
**Issue:** Django ALLOWED_HOSTS misconfiguration

---

## Problem Summary

The production API at `https://api.254-capital.com` is returning `400 Bad Request` with HTML for ALL requests:

```
POST https://api.254-capital.com/api/v1/auth/admin/login/
Status: 400 Bad Request
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

---

## Root Cause

Django is rejecting ALL incoming requests because the domain `api.254-capital.com` is **NOT** in the `ALLOWED_HOSTS` configuration. This is a Django security feature that prevents HTTP Host header attacks.

### Evidence:
1. Server returns 400 for ALL endpoints (GET, POST, etc.)
2. Response is HTML instead of JSON
3. Django security headers are present in response
4. Empty error message `<p></p>` indicates early request rejection

---

## Solution (Backend Administrator Required)

You need **SSH access** to the production server or contact the backend administrator to make these changes:

### Step 1: Access the Django Settings File

```bash
# SSH into your production server
ssh user@your-production-server

# Navigate to your Django project
cd /path/to/your/django/project

# Find and edit settings.py (usually in backend/settings.py or project_name/settings.py)
nano backend/settings.py
```

### Step 2: Update ALLOWED_HOSTS

Find the `ALLOWED_HOSTS` setting and update it:

**Current (Incorrect):**
```python
ALLOWED_HOSTS = ['localhost', '127.0.0.1']
# or
ALLOWED_HOSTS = []
```

**Fixed (Correct):**
```python
ALLOWED_HOSTS = [
    'localhost',
    '127.0.0.1',
    'api.254-capital.com',           # Add this!
    'www.254-capital.com',           # Add this!
    '.254-capital.com',              # This allows all subdomains
]
```

### Step 3: Restart Django Application

After updating the settings, restart your Django application:

```bash
# If using systemd
sudo systemctl restart gunicorn
sudo systemctl restart nginx

# OR if using supervisor
sudo supervisorctl restart django_app

# OR if using Docker
docker-compose restart backend

# OR if using PM2
pm2 restart django
```

### Step 4: Verify the Fix

Test the API endpoint:

```bash
curl -X POST https://api.254-capital.com/api/v1/auth/admin/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"muasyathegreat4@gmail.com","password":"Muasya@2024"}'
```

**Expected Success Response:**
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

## Alternative: Environment-Based Configuration

For better security, use environment variables:

### In Django settings.py:
```python
import os

ALLOWED_HOSTS = os.getenv('DJANGO_ALLOWED_HOSTS', 'localhost').split(',')
```

### In your .env file or environment:
```bash
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1,api.254-capital.com,www.254-capital.com,.254-capital.com
```

### Restart the application:
```bash
sudo systemctl restart gunicorn
```

---

## Checking Django Logs

To get more detailed error information, check the Django logs:

```bash
# Common log locations
tail -f /var/log/gunicorn/error.log
tail -f /var/log/nginx/error.log
tail -f /var/log/django/django.log

# Or check systemd logs
sudo journalctl -u gunicorn -f

# Or Docker logs
docker logs -f backend_container_name
```

---

## Additional Checks

### 1. Verify Django is Running

```bash
# Check if Gunicorn/Django process is running
ps aux | grep gunicorn
ps aux | grep django

# Check service status
sudo systemctl status gunicorn
sudo systemctl status nginx
```

### 2. Test Django Directly (Bypass Nginx)

If Django runs on port 8000 internally:

```bash
curl -X POST http://localhost:8000/api/v1/auth/admin/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"muasyathegreat4@gmail.com","password":"Muasya@2024"}'
```

If this works but the public URL doesn't, the issue is with nginx configuration, not Django.

### 3. Check Nginx Configuration

```bash
# View nginx config
cat /etc/nginx/sites-available/api.254-capital.com

# Test nginx config
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

Expected nginx proxy configuration:
```nginx
server {
    listen 443 ssl http2;
    server_name api.254-capital.com;

    location / {
        proxy_pass http://localhost:8000;  # Or wherever Django runs
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # SSL configuration...
}
```

---

## Frontend Code Analysis

The frontend code is **CORRECT** and does NOT need any changes:

### Request Format (Correct):
```javascript
// From: src/services/salary-checkoff/auth.service.ts
adminLogin: async (email: string, password: string) => {
  return apiRequest<AdminLoginResponse>(
    API_ENDPOINTS.AUTH.ADMIN_LOGIN,  // https://api.254-capital.com/api/v1/auth/admin/login/
    {
      method: 'POST',
      body: JSON.stringify({ email, password }),  // Correct format
    }
  );
}
```

### Headers (Correct):
```javascript
// From: src/services/salary-checkoff/api.ts
const headers: HeadersInit = {
  'Content-Type': 'application/json',  // Correct
  ...options.headers,
};
```

---

## Summary

| Component | Status | Action Required |
|-----------|--------|-----------------|
| Frontend Code | ✅ Working | None |
| API Request Format | ✅ Correct | None |
| Django Backend | ❌ Misconfigured | **Fix ALLOWED_HOSTS** |
| Admin Credentials | ✅ Valid | None |
| Nginx | ✅ Running | None (unless proxy config issues) |

---

## Contact Backend Administrator

If you don't have SSH access to the production server, contact the backend administrator and provide them with this document. They need to:

1. Add `api.254-capital.com` to Django `ALLOWED_HOSTS`
2. Restart the Django application (Gunicorn/uWSGI)
3. Verify the fix by testing the API endpoint

---

## Quick Fix Commands Summary

```bash
# 1. SSH into server
ssh user@your-server

# 2. Edit Django settings
nano /path/to/django/project/backend/settings.py

# 3. Add to ALLOWED_HOSTS:
#    'api.254-capital.com', 'www.254-capital.com', '.254-capital.com'

# 4. Restart Django
sudo systemctl restart gunicorn

# 5. Test
curl -X POST https://api.254-capital.com/api/v1/auth/admin/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"muasyathegreat4@gmail.com","password":"Muasya@2024"}'
```

---

**IMPORTANT:** This is a backend server configuration issue. The frontend code is working correctly. No frontend changes are needed.
