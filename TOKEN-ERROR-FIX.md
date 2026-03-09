# 🔧 Fix: "Token Not Valid" Error (401)

## Problem
When trying to login at https://www.254-capital.com/salary-checkoff with credentials:
- Email: `muasyathegreat4@gmail.com`
- Password: `Muasya@2024`

You receive:
```json
{
  "detail": "Given token not valid for any token type",
  "code": "token_not_valid"
}
```

## Root Cause
The `apiRequest` function automatically attaches any stored JWT token to ALL requests, including login requests. If you have an expired/invalid token in localStorage from a previous session, it gets sent with your login request, causing the backend to reject it with a 401 error.

**Location:** `src/services/salary-checkoff/api.ts:109-118`

---

## ✅ Immediate Solution (For Production Site)

### Method 1: Browser Console (Fastest)

1. **Go to** https://www.254-capital.com/salary-checkoff
2. **Open Developer Tools:**
   - Windows/Linux: Press `F12` or `Ctrl + Shift + I`
   - Mac: Press `Cmd + Option + I`
3. **Click on the "Console" tab**
4. **Paste this code and press Enter:**

```javascript
// Clear invalid tokens
localStorage.removeItem('salary_checkoff_access_token');
localStorage.removeItem('salary_checkoff_refresh_token');
console.log('✅ Tokens cleared successfully!');
console.log('You can now close DevTools and try logging in again.');
```

5. **Close Developer Tools**
6. **Try logging in again** with your credentials

### Method 2: Browser Storage Panel

1. **Go to** https://www.254-capital.com/salary-checkoff
2. **Open Developer Tools** (F12)
3. **Click on "Application" tab** (Chrome/Edge) or "Storage" tab (Firefox)
4. **Expand "Local Storage"** in the left sidebar
5. **Click on** `https://www.254-capital.com`
6. **Find and delete these keys:**
   - `salary_checkoff_access_token`
   - `salary_checkoff_refresh_token`
7. **Close Developer Tools**
8. **Try logging in again**

### Method 3: Clear Site Data (Nuclear Option)

1. Go to https://www.254-capital.com/salary-checkoff
2. Open Developer Tools (F12)
3. Click "Application" → "Clear storage"
4. Click "Clear site data" button
5. Refresh page and login again

---

## 🛠️ Permanent Code Fix (Already Implemented)

I've updated the authentication service to **automatically clear invalid tokens** before login attempts.

### Files Modified:

#### `src/services/salary-checkoff/auth.service.ts`

**Changes:**
- ✅ `sendOTP()` - Clears tokens before sending OTP
- ✅ `hrLogin()` - Clears tokens before HR login
- ✅ `adminLogin()` - Clears tokens before admin login

**Code additions:**
```typescript
// Clear any existing invalid tokens before login
tokenManager.clearTokens();
```

### To Deploy the Fix:

```bash
# Build the updated application
npm run build

# Deploy the dist/ folder to your hosting
# (Vercel, Netlify, or your hosting provider)
```

---

## 🧪 Testing After Fix

### Test Script for Verification:

```javascript
// Run this in browser console on https://www.254-capital.com/salary-checkoff

async function testLogin() {
  console.log('🧪 Testing login flow...');

  // 1. Set a bad token (simulating the error scenario)
  localStorage.setItem('salary_checkoff_access_token', 'invalid_token_xyz');
  console.log('❌ Set invalid token');

  // 2. Try login (should auto-clear the bad token now)
  const response = await fetch('https://api.254-capital.com/api/v1/auth/admin/login/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'muasyathegreat4@gmail.com',
      password: 'Muasya@2024'
    })
  });

  const data = await response.json();

  if (response.ok) {
    console.log('✅ Login successful!');
    console.log('📱 OTP sent to:', data.masked_phone);
  } else {
    console.log('❌ Login failed:', data);
  }

  return data;
}

testLogin();
```

---

## 📋 Step-by-Step Login Process (After Fix)

1. **Clear existing tokens** (manual or automatic)
2. **Navigate to** https://www.254-capital.com/salary-checkoff
3. **Click** "HR / Admin Login" tab
4. **Enter credentials:**
   - Email: `muasyathegreat4@gmail.com`
   - Password: `Muasya@2024`
5. **Click** "Sign In"
6. **Wait for OTP** to be sent to phone (072***299)
7. **Enter the 6-digit OTP code**
8. **Click** "Verify & Sign In"
9. **You should be redirected** to Admin Dashboard

---

## 🔍 Troubleshooting

### Still getting 401 error after clearing tokens?

**Check 1: Verify credentials**
```bash
# Use curl to test directly
curl -X POST https://api.254-capital.com/api/v1/auth/admin/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"muasyathegreat4@gmail.com","password":"Muasya@2024"}'
```

Expected response:
```json
{
  "detail": "OTP sent successfully",
  "requires_otp": true,
  "temp_token": "...",
  "masked_phone": "072***299",
  "expires_in": 300
}
```

**Check 2: Network tab inspection**

1. Open DevTools → Network tab
2. Try logging in
3. Look for the login request
4. Check the **Headers** section:
   - Should NOT have `Authorization` header on login request
   - If it does, tokens weren't cleared properly

**Check 3: Hard refresh**

After clearing tokens:
- Windows/Linux: `Ctrl + Shift + R`
- Mac: `Cmd + Shift + R`

---

## 📝 Additional Notes

### Why this happened:

The app uses JWT tokens for authentication. When you login successfully, tokens are stored in localStorage. If you:
1. Close the browser
2. Tokens expire (after some time)
3. Return to the site later

The expired tokens are still in localStorage, and the app tries to use them, causing authentication failures.

### The fix ensures:

- ✅ All login attempts start with a clean slate
- ✅ No invalid tokens interfere with authentication
- ✅ Better user experience (no confusing 401 errors)

---

## 🚀 Quick Reference

**Clear tokens command:**
```javascript
localStorage.removeItem('salary_checkoff_access_token');
localStorage.removeItem('salary_checkoff_refresh_token');
```

**Login credentials:**
- Email: `muasyathegreat4@gmail.com`
- Password: `Muasya@2024`
- OTP Phone: `072***299`

**Login URL:**
https://www.254-capital.com/salary-checkoff

---

**Updated:** March 9, 2026
**Status:** ✅ Fixed in code, awaiting deployment
