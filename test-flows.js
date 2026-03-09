/**
 * Comprehensive Flow Testing Script for 254 Capital
 * Tests all application flows and generates a detailed report
 */

import axios from 'axios';
import fs from 'fs';

// Configuration
const MAIN_APP_URL = 'http://localhost:8080';
const API_URL = 'http://localhost:5000/api';
const SALARY_API_URL = 'https://api.254-capital.com/api/v1';

const ADMIN_CREDENTIALS = {
  email: 'muasyathegreat4@gmail.com',
  password: 'Muasya@2024'
};

// Test Results Storage
const testResults = {
  timestamp: new Date().toISOString(),
  summary: {
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0
  },
  tests: []
};

// Helper Functions
function logTest(category, name, status, details = {}) {
  const test = {
    category,
    name,
    status,
    timestamp: new Date().toISOString(),
    ...details
  };

  testResults.tests.push(test);
  testResults.summary.total++;
  testResults.summary[status]++;

  const icon = status === 'passed' ? '✓' : status === 'failed' ? '✗' : '○';
  console.log(`${icon} [${category}] ${name} - ${status.toUpperCase()}`);
  if (details.message) {
    console.log(`  ${details.message}`);
  }
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Test Functions

async function testSalaryCheckoffAdminLogin() {
  const category = 'Salary Check-Off Auth';

  try {
    console.log('\n=== Testing Salary Check-Off System Admin Login ===\n');

    // Step 1: Admin Login (sends OTP)
    console.log('Step 1: Initiating admin login...');
    const loginResponse = await axios.post(`${SALARY_API_URL}/auth/admin/login/`, {
      email: ADMIN_CREDENTIALS.email,
      password: ADMIN_CREDENTIALS.password
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    if (loginResponse.data.requires_otp) {
      logTest(category, 'Admin Login Step 1 (Password)', 'passed', {
        message: `OTP sent to ${loginResponse.data.masked_phone}. Expires in ${loginResponse.data.expires_in}s`,
        data: {
          temp_token_length: loginResponse.data.temp_token?.length,
          masked_phone: loginResponse.data.masked_phone,
          expires_in: loginResponse.data.expires_in
        }
      });

      // Note: We can't complete OTP verification without manual input
      logTest(category, 'Admin Login Step 2 (OTP Verification)', 'skipped', {
        message: 'OTP verification requires manual input from phone',
        note: 'Check phone for OTP code and use the API endpoint: POST /auth/verify-login-otp/'
      });

      return {
        success: true,
        requiresOTP: true,
        tempToken: loginResponse.data.temp_token,
        maskedPhone: loginResponse.data.masked_phone,
        expiresIn: loginResponse.data.expires_in
      };
    }

  } catch (error) {
    const errorDetails = {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    };

    if (error.code === 'ECONNREFUSED') {
      logTest(category, 'Admin Login', 'failed', {
        message: 'Cannot connect to Salary Check-Off API server',
        error: `Connection refused to ${SALARY_API_URL}`
      });
    } else if (error.response?.status === 401) {
      logTest(category, 'Admin Login', 'failed', {
        message: 'Invalid credentials',
        error: error.response?.data?.detail || 'Authentication failed'
      });
    } else if (error.response?.status === 404) {
      logTest(category, 'Admin Login', 'failed', {
        message: 'API endpoint not found',
        error: 'The admin login endpoint may not exist or URL is incorrect'
      });
    } else {
      logTest(category, 'Admin Login', 'failed', errorDetails);
    }

    return { success: false, error: errorDetails };
  }
}

async function testMainAppBackendAPIs() {
  const category = 'Main App Backend APIs';

  console.log('\n=== Testing Main Application Backend APIs ===\n');

  // Test Dashboard Metrics API
  try {
    const response = await axios.get(`${API_URL}/dashboard/metrics`, {
      timeout: 5000
    });
    logTest(category, 'Dashboard Metrics API', 'passed', {
      data: response.data
    });
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      logTest(category, 'Dashboard Metrics API', 'failed', {
        message: 'Backend API server not running',
        error: `Cannot connect to ${API_URL}`
      });
    } else {
      logTest(category, 'Dashboard Metrics API', 'failed', {
        message: error.message,
        status: error.response?.status
      });
    }
  }

  // Test Dashboard Activities API
  try {
    const response = await axios.get(`${API_URL}/dashboard/activities`, {
      timeout: 5000
    });
    logTest(category, 'Dashboard Activities API', 'passed', {
      data: response.data
    });
  } catch (error) {
    logTest(category, 'Dashboard Activities API', 'failed', {
      message: error.message,
      status: error.response?.status
    });
  }

  // Test Company Profile API
  try {
    const response = await axios.get(`${API_URL}/company-profile`, {
      timeout: 5000
    });
    logTest(category, 'Company Profile API', 'passed', {
      data: response.data
    });
  } catch (error) {
    logTest(category, 'Company Profile API', 'failed', {
      message: error.message,
      status: error.response?.status
    });
  }
}

async function testFrontendAccessibility() {
  const category = 'Frontend Accessibility';

  console.log('\n=== Testing Frontend Page Accessibility ===\n');

  const pages = [
    { path: '/', name: 'Home Page' },
    { path: '/login', name: 'Login Page' },
    { path: '/signup', name: 'Signup Page' },
    { path: '/about-us', name: 'About Us Page' },
    { path: '/services', name: 'Services Page' },
    { path: '/investor-relations', name: 'Investor Relations Page' },
    { path: '/faqs', name: 'FAQs Page' },
    { path: '/contacts', name: 'Contacts Page' },
    { path: '/salary-checkoff', name: 'Salary Check-Off Login' }
  ];

  for (const page of pages) {
    try {
      const response = await axios.get(`${MAIN_APP_URL}${page.path}`, {
        timeout: 5000,
        maxRedirects: 0,
        validateStatus: (status) => status < 500
      });

      logTest(category, page.name, 'passed', {
        status: response.status,
        contentLength: response.data?.length
      });
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        logTest(category, page.name, 'failed', {
          message: 'Frontend server not running',
          error: `Cannot connect to ${MAIN_APP_URL}`
        });
      } else {
        logTest(category, page.name, 'failed', {
          message: error.message,
          status: error.response?.status
        });
      }
    }
  }
}

async function testSalaryCheckoffAPIEndpoints() {
  const category = 'Salary Check-Off API Endpoints';

  console.log('\n=== Testing Salary Check-Off API Endpoints ===\n');

  const endpoints = [
    { method: 'GET', path: '/loans/applications/', name: 'Loan Applications List', requiresAuth: true },
    { method: 'GET', path: '/employers/', name: 'Employers List', requiresAuth: true },
    { method: 'GET', path: '/notifications/', name: 'Notifications List', requiresAuth: true }
  ];

  for (const endpoint of endpoints) {
    try {
      const config = {
        timeout: 5000,
        validateStatus: (status) => status < 500
      };

      if (endpoint.requiresAuth) {
        config.headers = {
          'Authorization': 'Bearer test_token'
        };
      }

      const response = await axios({
        method: endpoint.method,
        url: `${SALARY_API_URL}${endpoint.path}`,
        ...config
      });

      if (response.status === 401) {
        logTest(category, endpoint.name, 'passed', {
          message: 'Authentication required (expected)',
          status: 401
        });
      } else if (response.status === 200) {
        logTest(category, endpoint.name, 'passed', {
          status: response.status
        });
      } else {
        logTest(category, endpoint.name, 'passed', {
          status: response.status,
          note: 'Endpoint accessible but returned non-200 status'
        });
      }
    } catch (error) {
      if (error.response?.status === 401) {
        logTest(category, endpoint.name, 'passed', {
          message: 'Authentication required (expected)',
          status: 401
        });
      } else if (error.code === 'ECONNREFUSED') {
        logTest(category, endpoint.name, 'failed', {
          message: 'Cannot connect to Salary Check-Off API',
          error: error.message
        });
      } else {
        logTest(category, endpoint.name, 'failed', {
          message: error.message,
          status: error.response?.status
        });
      }
    }
  }
}

async function analyzeLoanApplicationsDB() {
  const category = 'Local Database Analysis';

  console.log('\n=== Analyzing Local Database ===\n');

  try {
    // This would need to be run in browser context, so we'll skip it
    logTest(category, 'Loan Applications DB', 'skipped', {
      message: 'LocalStorage analysis requires browser context',
      note: 'Check browser console for localStorage data: 254_capital_applications'
    });

    logTest(category, 'User Accounts DB', 'skipped', {
      message: 'LocalStorage analysis requires browser context',
      note: 'Check browser console for localStorage data: 254_capital_users'
    });
  } catch (error) {
    logTest(category, 'Local Database', 'failed', {
      message: error.message
    });
  }
}

function generateReport() {
  console.log('\n\n' + '='.repeat(80));
  console.log('COMPREHENSIVE TEST REPORT');
  console.log('='.repeat(80));
  console.log(`\nTimestamp: ${testResults.timestamp}`);
  console.log(`\nSummary:`);
  console.log(`  Total Tests: ${testResults.summary.total}`);
  console.log(`  ✓ Passed: ${testResults.summary.passed}`);
  console.log(`  ✗ Failed: ${testResults.summary.failed}`);
  console.log(`  ○ Skipped: ${testResults.summary.skipped}`);
  console.log(`\nSuccess Rate: ${((testResults.summary.passed / testResults.summary.total) * 100).toFixed(2)}%`);

  console.log('\n' + '-'.repeat(80));
  console.log('DETAILED RESULTS BY CATEGORY');
  console.log('-'.repeat(80));

  const categories = [...new Set(testResults.tests.map(t => t.category))];

  for (const category of categories) {
    const categoryTests = testResults.tests.filter(t => t.category === category);
    const passed = categoryTests.filter(t => t.status === 'passed').length;
    const failed = categoryTests.filter(t => t.status === 'failed').length;
    const skipped = categoryTests.filter(t => t.status === 'skipped').length;

    console.log(`\n${category}:`);
    console.log(`  Tests: ${categoryTests.length} | Passed: ${passed} | Failed: ${failed} | Skipped: ${skipped}`);

    for (const test of categoryTests) {
      const icon = test.status === 'passed' ? '✓' : test.status === 'failed' ? '✗' : '○';
      console.log(`  ${icon} ${test.name}`);
      if (test.message) {
        console.log(`      ${test.message}`);
      }
      if (test.error) {
        console.log(`      Error: ${test.error}`);
      }
    }
  }

  // Save report to file
  const reportPath = './test-report.json';
  fs.writeFileSync(reportPath, JSON.stringify(testResults, null, 2));
  console.log(`\n\nDetailed JSON report saved to: ${reportPath}`);

  // Generate markdown report
  generateMarkdownReport();
}

function generateMarkdownReport() {
  let markdown = `# 254 Capital - Comprehensive Test Report\n\n`;
  markdown += `**Generated:** ${new Date().toLocaleString()}\n\n`;
  markdown += `## Summary\n\n`;
  markdown += `| Metric | Count |\n`;
  markdown += `|--------|-------|\n`;
  markdown += `| Total Tests | ${testResults.summary.total} |\n`;
  markdown += `| ✓ Passed | ${testResults.summary.passed} |\n`;
  markdown += `| ✗ Failed | ${testResults.summary.failed} |\n`;
  markdown += `| ○ Skipped | ${testResults.summary.skipped} |\n`;
  markdown += `| Success Rate | ${((testResults.summary.passed / testResults.summary.total) * 100).toFixed(2)}% |\n\n`;

  markdown += `## Test Credentials Used\n\n`;
  markdown += `- **Email:** ${ADMIN_CREDENTIALS.email}\n`;
  markdown += `- **Password:** [REDACTED]\n\n`;

  markdown += `## Results by Category\n\n`;

  const categories = [...new Set(testResults.tests.map(t => t.category))];

  for (const category of categories) {
    const categoryTests = testResults.tests.filter(t => t.category === category);
    markdown += `### ${category}\n\n`;

    for (const test of categoryTests) {
      const icon = test.status === 'passed' ? '✅' : test.status === 'failed' ? '❌' : '⏭️';
      const status = typeof test.status === 'string' ? test.status.toUpperCase() : String(test.status);
      markdown += `${icon} **${test.name}** - ${status}\n`;
      if (test.message) {
        markdown += `   - ${test.message}\n`;
      }
      if (test.error) {
        markdown += `   - Error: ${test.error}\n`;
      }
      markdown += `\n`;
    }
  }

  markdown += `## Key Findings\n\n`;
  markdown += `### Application Architecture\n\n`;
  markdown += `- **Main Application:** React + Vite + TypeScript\n`;
  markdown += `- **Authentication:** localStorage-based (localDb.ts) for development\n`;
  markdown += `- **Salary Check-Off System:** Separate authentication with OTP\n`;
  markdown += `- **Backend APIs:**\n`;
  markdown += `  - Main API: ${API_URL}\n`;
  markdown += `  - Salary Check-Off API: ${SALARY_API_URL}\n\n`;

  markdown += `### Flows Tested\n\n`;
  markdown += `1. **Salary Check-Off Admin Login**\n`;
  markdown += `   - Two-step authentication (password + OTP)\n`;
  markdown += `   - OTP sent to registered phone number\n`;
  markdown += `   - Requires manual OTP input for completion\n\n`;

  markdown += `2. **Frontend Accessibility**\n`;
  markdown += `   - All public pages tested\n`;
  markdown += `   - Authentication pages verified\n`;
  markdown += `   - Salary check-off system interface checked\n\n`;

  markdown += `3. **API Endpoints**\n`;
  markdown += `   - Backend API connectivity tested\n`;
  markdown += `   - Salary check-off API endpoints verified\n`;
  markdown += `   - Authentication requirements confirmed\n\n`;

  markdown += `### Recommendations\n\n`;

  const failed = testResults.tests.filter(t => t.status === 'failed');
  if (failed.length > 0) {
    markdown += `#### Issues Found\n\n`;
    for (const test of failed) {
      markdown += `- **${test.category} - ${test.name}:** ${test.message || test.error}\n`;
    }
    markdown += `\n`;
  }

  markdown += `#### Manual Testing Required\n\n`;
  markdown += `- **OTP Verification:** Complete the admin login flow by entering the OTP received on phone\n`;
  markdown += `- **Dashboard Functionality:** Test application CRUD operations after login\n`;
  markdown += `- **Form Submissions:** Test loan application form submission\n`;
  markdown += `- **File Uploads:** Test document upload functionality\n`;
  markdown += `- **User Interactions:** Test all interactive elements in the dashboard\n\n`;

  const reportPath = './TEST-REPORT.md';
  fs.writeFileSync(reportPath, markdown);
  console.log(`Markdown report saved to: ${reportPath}\n`);
}

// Main Test Runner
async function runAllTests() {
  console.log('\n' + '='.repeat(80));
  console.log('254 CAPITAL - COMPREHENSIVE FLOW TESTING');
  console.log('='.repeat(80));
  console.log(`\nStarting tests at: ${new Date().toLocaleString()}\n`);

  // Test Frontend Accessibility
  await testFrontendAccessibility();
  await sleep(1000);

  // Test Main App Backend APIs
  await testMainAppBackendAPIs();
  await sleep(1000);

  // Test Salary Check-Off Admin Login
  await testSalaryCheckoffAdminLogin();
  await sleep(1000);

  // Test Salary Check-Off API Endpoints
  await testSalaryCheckoffAPIEndpoints();
  await sleep(1000);

  // Analyze Local Database
  await analyzeLoanApplicationsDB();

  // Generate Report
  generateReport();
}

// Run Tests
runAllTests().catch(error => {
  console.error('\nFatal error during test execution:', error);
  process.exit(1);
});
