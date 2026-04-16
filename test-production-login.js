/**
 * Test Production Admin Login
 * Tests the admin login at https://api.254-capital.com
 */

import axios from 'axios';

const API_URL = 'https://api.254-capital.com';
const ADMIN_CREDENTIALS = {
  email: 'muasyathegreat4@gmail.com',
  password: 'Muasya@2024'
};

console.log('='.repeat(70));
console.log('PRODUCTION ADMIN LOGIN TEST');
console.log('='.repeat(70));
console.log('\nAPI URL:', API_URL);
console.log('Admin Email:', ADMIN_CREDENTIALS.email);
console.log('\n' + '-'.repeat(70));

async function testAdminLogin() {
  try {
    console.log('\n📝 Step 1: Attempting admin login...');
    console.log('Endpoint:', `${API_URL}/api/v1/auth/admin/login/`);

    const response = await axios.post(
      `${API_URL}/api/v1/auth/admin/login/`,
      {
        email: ADMIN_CREDENTIALS.email,
        password: ADMIN_CREDENTIALS.password
      },
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );

    console.log('\n✅ Login request successful!');
    console.log('Response:', JSON.stringify(response.data, null, 2));

    if (response.data.requires_otp) {
      console.log('\n' + '='.repeat(70));
      console.log('OTP AUTHENTICATION REQUIRED');
      console.log('='.repeat(70));
      console.log('\nOTP Details:');
      console.log('  - Sent to:', response.data.masked_phone);
      console.log('  - Expires in:', response.data.expires_in, 'seconds');
      console.log('  - Temp Token:', response.data.temp_token.substring(0, 20) + '...');

      console.log('\n' + '-'.repeat(70));
      console.log('NEXT STEPS:');
      console.log('-'.repeat(70));
      console.log('1. Check your phone for the OTP code');
      console.log('2. Use the following command to verify OTP:\n');
      console.log(`curl -X POST "${API_URL}/api/v1/auth/verify-login-otp/" \\`);
      console.log(`  -H "Content-Type: application/json" \\`);
      console.log(`  -d '{"temp_token":"${response.data.temp_token}","otp":"YOUR_OTP_CODE"}'`);

      console.log('\n3. Or use this JavaScript code:\n');
      console.log(`const verifyOTP = async (otpCode) => {
  const response = await axios.post(
    '${API_URL}/api/v1/auth/verify-login-otp/',
    {
      temp_token: '${response.data.temp_token}',
      otp: otpCode
    }
  );
  console.log('Logged in!', response.data);
};

// Call with your OTP: verifyOTP('123456');
`);

      console.log('\n' + '='.repeat(70));
      console.log('TEST RESULT: ✅ SUCCESS - Admin account exists!');
      console.log('='.repeat(70));
      console.log('\nThe admin account is properly configured in production.');
      console.log('You can now login at: https://www.254-capital.com/salary-checkoff');
      console.log('\nLogin steps:');
      console.log('1. Go to https://www.254-capital.com/salary-checkoff');
      console.log('2. Click "HR / Admin Login" tab');
      console.log('3. Enter email:', ADMIN_CREDENTIALS.email);
      console.log('4. Enter password: ******* (your password)');
      console.log('5. Check phone', response.data.masked_phone, 'for OTP');
      console.log('6. Enter OTP to complete login');

      return {
        success: true,
        requiresOTP: true,
        maskedPhone: response.data.masked_phone,
        expiresIn: response.data.expires_in
      };
    }

  } catch (error) {
    console.log('\n' + '='.repeat(70));
    console.log('❌ LOGIN FAILED');
    console.log('='.repeat(70));

    if (error.response) {
      console.log('\nHTTP Status:', error.response.status);
      console.log('Error Response:', JSON.stringify(error.response.data, null, 2));

      if (error.response.status === 400) {
        console.log('\n💡 DIAGNOSIS: Bad Request');
        console.log('The API rejected the login request.');
        console.log('\nPossible causes:');
        console.log('  1. Invalid email format');
        console.log('  2. Missing required fields');
        console.log('  3. API expects different data structure');

      } else if (error.response.status === 401 || error.response.status === 403) {
        console.log('\n💡 DIAGNOSIS: Invalid Credentials');
        console.log('The email or password is incorrect.');
        console.log('\nPossible causes:');
        console.log('  1. Admin account does NOT exist in production database');
        console.log('  2. Password is incorrect');
        console.log('  3. Account is disabled');

        console.log('\n' + '-'.repeat(70));
        console.log('SOLUTION REQUIRED:');
        console.log('-'.repeat(70));
        console.log('You need to create the admin account in the production database.');
        console.log('\nOptions:');
        console.log('1. Access the Django admin panel');
        console.log('2. Run Django management command to create superuser');
        console.log('3. Use database migration/seed script');
        console.log('4. Contact the backend administrator');

      } else if (error.response.status === 404) {
        console.log('\n💡 DIAGNOSIS: Endpoint Not Found');
        console.log('The API endpoint does not exist.');
        console.log('  - Check if API URL is correct');
        console.log('  - Verify endpoint path');

      } else if (error.response.status === 500) {
        console.log('\n💡 DIAGNOSIS: Server Error');
        console.log('The backend server encountered an error.');
        console.log('  - Check server logs');
        console.log('  - Database may be down');
        console.log('  - Backend code error');
      }

    } else if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 DIAGNOSIS: Connection Refused');
      console.log('Cannot connect to the production API server.');
      console.log('  - Server may be down');
      console.log('  - Network issue');
      console.log('  - Firewall blocking connection');

    } else {
      console.log('\n💡 DIAGNOSIS: Network Error');
      console.log('Error:', error.message);
    }

    return { success: false, error: error.message };
  }
}

// Run the test
testAdminLogin().catch(error => {
  console.error('\nFatal error:', error);
  process.exit(1);
});
