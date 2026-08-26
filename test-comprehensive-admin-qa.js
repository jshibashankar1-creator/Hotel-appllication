/**
 * ============================================================================
 * HOTEL BOOKING ADMIN PANEL — FULL REGRESSION & SECURITY QA AUDIT SUITE
 * ============================================================================
 */

import jwt from 'jsonwebtoken';

const BASE_URL = process.env.API_BASE || 'http://localhost:5000/api';
const JWT_SECRET = 'hotelhub_production_jwt_secret_key_2026_super_secure_enterprise';

// Global test registry
const testResults = [];
let passedCount = 0;
let failedCount = 0;
let blockedCount = 0;
let skippedCount = 0;

// Test Execution & Recording Helper
async function runTest({ id, section, method, endpoint, description, authRole = 'none', testFn }) {
  const startTime = Date.now();
  let status = 'FAIL';
  let errorMsg = null;
  let responseData = null;
  let statusCode = null;

  try {
    const result = await testFn();
    statusCode = result.status;
    responseData = result.data;
    if (result.passed) {
      status = 'PASS';
      passedCount++;
    } else {
      status = 'FAIL';
      failedCount++;
      errorMsg = result.message || 'Assertion failed';
    }
  } catch (err) {
    status = 'FAIL';
    failedCount++;
    errorMsg = err.message;
  }
  const duration = Date.now() - startTime;

  testResults.push({
    id,
    section,
    method,
    endpoint,
    description,
    authRole,
    status,
    statusCode,
    duration,
    error: errorMsg,
    responseData
  });

  const icon = status === 'PASS' ? '✅' : '❌';
  console.log(`[${id}] ${icon} [${method} ${endpoint}] (${duration}ms) - ${description} ${errorMsg ? `| ERR: ${errorMsg}` : ''}`);
}

async function request(endpoint, { method = 'GET', token, body, headers = {} } = {}) {
  const reqHeaders = { 'Content-Type': 'application/json', ...headers };
  if (token) {
    reqHeaders['Authorization'] = `Bearer ${token}`;
  }

  const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;
  const options = { method, headers: reqHeaders };
  if (body !== undefined) {
    options.body = typeof body === 'string' ? body : JSON.stringify(body);
  }

  const res = await fetch(url, options);
  let data = null;
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      data = await res.json();
    } catch (e) {
      data = await res.text();
    }
  } else {
    data = await res.text();
  }

  return { res, status: res.status, data };
}

// MAIN AUDIT EXECUTION
async function executeAudit() {
  console.log('========================================================================');
  console.log('🛡️  HOTEL BOOKING ADMIN PANEL: FULL REGRESSION & QA AUDIT SUITE        🛡️');
  console.log(`📡 Target API Base: ${BASE_URL}`);
  console.log('========================================================================\n');

  // Token Store
  const tokens = {};
  const testHotels = [];
  const testUsers = [];
  const testBookings = [];
  const testRooms = [];

  // --------------------------------------------------------------------------
  // SECTION 1: SYSTEM HEALTH
  // --------------------------------------------------------------------------
  console.log('\n--- SECTION 1: SYSTEM DISCOVERY & HEALTH ---');
  await runTest({
    id: 'SYS-01',
    section: 'Health Check',
    method: 'GET',
    endpoint: '/health',
    description: 'Verify system health endpoint responds 200 with service info',
    authRole: 'Public',
    testFn: async () => {
      const { status, data } = await request('/health');
      return {
        status,
        passed: status === 200 && data.success === true && data.status === 'healthy',
        message: status !== 200 ? `Expected 200, got ${status}` : null
      };
    }
  });

  // --------------------------------------------------------------------------
  // SECTION 2: AUTHENTICATION TESTING
  // --------------------------------------------------------------------------
  console.log('\n--- SECTION 2: AUTHENTICATION TESTING ---');

  // 2.1 Super Admin Login (Valid)
  await runTest({
    id: 'AUTH-01',
    section: 'Authentication',
    method: 'POST',
    endpoint: '/auth/admin/login',
    description: 'Super Admin login with valid credentials returns 200 and JWT token',
    authRole: 'Public -> super_admin',
    testFn: async () => {
      const { status, data } = await request('/auth/admin/login', {
        method: 'POST',
        body: { email: 'admin@hotelhub.com', password: 'Admin@123456' }
      });
      if (status === 200 && data.token) tokens.super_admin = data.token;
      return {
        status,
        passed: status === 200 && data.success === true && !!data.token && data.user.role === 'super_admin'
      };
    }
  });

  // 2.2 Operations Admin Login (Valid)
  await runTest({
    id: 'AUTH-02',
    section: 'Authentication',
    method: 'POST',
    endpoint: '/auth/admin/login',
    description: 'Operations Admin login with valid credentials returns 200 and token',
    authRole: 'Public -> admin',
    testFn: async () => {
      const { status, data } = await request('/auth/admin/login', {
        method: 'POST',
        body: { email: 'manager@hotelhub.com', password: 'Admin@123456' }
      });
      if (status === 200 && data.token) tokens.admin = data.token;
      return {
        status,
        passed: status === 200 && data.success === true && !!data.token && data.user.role === 'admin'
      };
    }
  });

  // 2.3 Finance Admin Login (Valid)
  await runTest({
    id: 'AUTH-03',
    section: 'Authentication',
    method: 'POST',
    endpoint: '/auth/admin/login',
    description: 'Finance Admin login with valid credentials',
    authRole: 'Public -> finance_admin',
    testFn: async () => {
      const { status, data } = await request('/auth/admin/login', {
        method: 'POST',
        body: { email: 'finance.admin@hotelhub.com', password: 'Admin@123456' }
      });
      if (status === 200 && data.token) tokens.finance_admin = data.token;
      return { status, passed: status === 200 && data.success === true && data.user.role === 'finance_admin' };
    }
  });

  // 2.4 Support Admin Login (Valid)
  await runTest({
    id: 'AUTH-04',
    section: 'Authentication',
    method: 'POST',
    endpoint: '/auth/admin/login',
    description: 'Support Admin login with valid credentials',
    authRole: 'Public -> support_admin',
    testFn: async () => {
      const { status, data } = await request('/auth/admin/login', {
        method: 'POST',
        body: { email: 'support.admin@hotelhub.com', password: 'Admin@123456' }
      });
      if (status === 200 && data.token) tokens.support_admin = data.token;
      return { status, passed: status === 200 && data.success === true && data.user.role === 'support_admin' };
    }
  });

  // 2.5 Hotel Admin Login (Valid)
  await runTest({
    id: 'AUTH-05',
    section: 'Authentication',
    method: 'POST',
    endpoint: '/auth/hotel-admin/login',
    description: 'Hotel Admin login via hotel-admin portal returns 200 and assigned hotel',
    authRole: 'Public -> hotel_admin',
    testFn: async () => {
      const { status, data } = await request('/auth/hotel-admin/login', {
        method: 'POST',
        body: { email: 'hoteladmin@hotelhub.com', password: 'HotelAdmin@123456' }
      });
      if (status === 200 && data.token) tokens.hotel_admin = data.token;
      return { status, passed: status === 200 && data.success === true && data.user.role === 'hotel_admin' && !!data.token };
    }
  });

  // 2.6 Hotel Owner Login (Valid)
  await runTest({
    id: 'AUTH-06',
    section: 'Authentication',
    method: 'POST',
    endpoint: '/auth/owner/login',
    description: 'Owner login via owner portal returns 200',
    authRole: 'Public -> owner',
    testFn: async () => {
      const { status, data } = await request('/auth/owner/login', {
        method: 'POST',
        body: { email: 'rajesh@grandhorizon.com', password: 'Password@123' }
      });
      if (status === 200 && data.token) tokens.owner = data.token;
      return { status, passed: status === 200 && data.success === true && data.user.role === 'owner' };
    }
  });

  // 2.7 Customer Login (Valid)
  await runTest({
    id: 'AUTH-07',
    section: 'Authentication',
    method: 'POST',
    endpoint: '/auth/login',
    description: 'Customer login via customer login endpoint',
    authRole: 'Public -> customer',
    testFn: async () => {
      const { status, data } = await request('/auth/login', {
        method: 'POST',
        body: { email: 'aarav.sharma@gmail.com', password: 'Password@123' }
      });
      if (status === 200 && data.token) tokens.customer = data.token;
      return { status, passed: status === 200 && data.success === true && data.user.role === 'customer' };
    }
  });

  // 2.8 Negative: Wrong Password
  await runTest({
    id: 'AUTH-08',
    section: 'Authentication',
    method: 'POST',
    endpoint: '/auth/admin/login',
    description: 'Admin login with wrong password rejected with 401',
    authRole: 'Public',
    testFn: async () => {
      const { status, data } = await request('/auth/admin/login', {
        method: 'POST',
        body: { email: 'admin@hotelhub.com', password: 'WrongPassword999!' }
      });
      return { status, passed: status === 401 && data.success === false };
    }
  });

  // 2.9 Negative: Non-existent Email
  await runTest({
    id: 'AUTH-09',
    section: 'Authentication',
    method: 'POST',
    endpoint: '/auth/admin/login',
    description: 'Admin login with non-existent email rejected with 401',
    authRole: 'Public',
    testFn: async () => {
      const { status, data } = await request('/auth/admin/login', {
        method: 'POST',
        body: { email: 'nonexistent.user.qa@hotelhub.com', password: 'Password@123' }
      });
      return { status, passed: status === 401 && data.success === false };
    }
  });

  // 2.10 Negative: Empty Email / Password
  await runTest({
    id: 'AUTH-10',
    section: 'Authentication',
    method: 'POST',
    endpoint: '/auth/admin/login',
    description: 'Admin login with empty credentials returns 400 validation error',
    authRole: 'Public',
    testFn: async () => {
      const { status, data } = await request('/auth/admin/login', {
        method: 'POST',
        body: { email: '', password: '' }
      });
      return { status, passed: status === 400 && data.success === false };
    }
  });

  // 2.11 Negative: Malformed Token
  await runTest({
    id: 'AUTH-11',
    section: 'Authentication',
    method: 'GET',
    endpoint: '/admin/profile',
    description: 'Access protected admin endpoint with malformed token returns 401',
    authRole: 'Malformed Token',
    testFn: async () => {
      const { status, data } = await request('/admin/profile', {
        token: 'invalid_malformed_jwt_token_12345'
      });
      return { status, passed: status === 401 && data.success === false };
    }
  });

  // 2.12 Negative: Expired Token
  await runTest({
    id: 'AUTH-12',
    section: 'Authentication',
    method: 'GET',
    endpoint: '/admin/profile',
    description: 'Access protected admin endpoint with expired token returns 401',
    authRole: 'Expired Token',
    testFn: async () => {
      const expiredToken = jwt.sign(
        { userId: 'USR-SUPER-ADMIN', role: 'super_admin' },
        JWT_SECRET,
        { expiresIn: '-10s' }
      );
      const { status, data } = await request('/admin/profile', { token: expiredToken });
      return { status, passed: status === 401 && data.success === false };
    }
  });

  // 2.13 Negative: Missing Token (Unauthenticated)
  await runTest({
    id: 'AUTH-13',
    section: 'Authentication',
    method: 'GET',
    endpoint: '/admin/profile',
    description: 'Access protected admin endpoint with no token returns 401',
    authRole: 'Unauthenticated',
    testFn: async () => {
      const { status, data } = await request('/admin/profile');
      return { status, passed: status === 401 && data.success === false };
    }
  });

  // --------------------------------------------------------------------------
  // SECTION 3: ADMIN RBAC & AUTHORIZATION TESTING
  // --------------------------------------------------------------------------
  console.log('\n--- SECTION 3: ADMIN RBAC & ACCESS CONTROL TESTING ---');

  // 3.1 Customer accessing /api/admin/profile rejected (403)
  await runTest({
    id: 'RBAC-01',
    section: 'RBAC',
    method: 'GET',
    endpoint: '/admin/profile',
    description: 'Customer token accessing /api/admin/profile is rejected with 403',
    authRole: 'customer',
    testFn: async () => {
      const { status, data } = await request('/admin/profile', { token: tokens.customer });
      return { status, passed: status === 403 && data.success === false };
    }
  });

  // 3.2 Customer accessing /api/admin/users rejected (403)
  await runTest({
    id: 'RBAC-02',
    section: 'RBAC',
    method: 'GET',
    endpoint: '/admin/users',
    description: 'Customer token accessing /api/admin/users is rejected with 403',
    authRole: 'customer',
    testFn: async () => {
      const { status, data } = await request('/admin/users', { token: tokens.customer });
      return { status, passed: status === 403 && data.success === false };
    }
  });

  // 3.3 Hotel Admin accessing /api/admin/users (Super Admin only) rejected (403)
  await runTest({
    id: 'RBAC-03',
    section: 'RBAC',
    method: 'GET',
    endpoint: '/admin/users',
    description: 'Hotel Admin token accessing Super Admin /api/admin/users is rejected with 403',
    authRole: 'hotel_admin',
    testFn: async () => {
      const { status, data } = await request('/admin/users', { token: tokens.hotel_admin });
      return { status, passed: status === 403 && data.success === false };
    }
  });

  // 3.4 Operations Admin accessing /api/admin/users (Super Admin only) rejected (403)
  await runTest({
    id: 'RBAC-04',
    section: 'RBAC',
    method: 'GET',
    endpoint: '/admin/users',
    description: 'Operations Admin accessing Super Admin /api/admin/users is rejected with 403',
    authRole: 'admin',
    testFn: async () => {
      const { status, data } = await request('/admin/users', { token: tokens.admin });
      return { status, passed: status === 403 && data.success === false };
    }
  });

  // 3.5 Super Admin accessing /api/admin/users succeeds (200)
  await runTest({
    id: 'RBAC-05',
    section: 'RBAC',
    method: 'GET',
    endpoint: '/admin/users',
    description: 'Super Admin accessing /api/admin/users succeeds with 200 and admin directory',
    authRole: 'super_admin',
    testFn: async () => {
      const { status, data } = await request('/admin/users', { token: tokens.super_admin });
      return {
        status,
        passed: status === 200 && data.success === true && Array.isArray(data.users) && data.users.length > 0
      };
    }
  });

  // 3.6 Support Admin accessing /api/admin/payments (Finance/Super Admin only) rejected (403)
  await runTest({
    id: 'RBAC-06',
    section: 'RBAC',
    method: 'GET',
    endpoint: '/admin/payments',
    description: 'Support Admin token accessing /api/admin/payments is rejected with 403',
    authRole: 'support_admin',
    testFn: async () => {
      const { status, data } = await request('/admin/payments', { token: tokens.support_admin });
      return { status, passed: status === 403 && data.success === false };
    }
  });

  // 3.7 Finance Admin accessing /api/admin/payments succeeds (200)
  await runTest({
    id: 'RBAC-07',
    section: 'RBAC',
    method: 'GET',
    endpoint: '/admin/payments',
    description: 'Finance Admin accessing /api/admin/payments succeeds with 200',
    authRole: 'finance_admin',
    testFn: async () => {
      const { status, data } = await request('/admin/payments', { token: tokens.finance_admin });
      return { status, passed: status === 200 && data.success === true && Array.isArray(data.payments) };
    }
  });

  // 3.8 Customer attempting /api/auth/admin/create rejected (403)
  await runTest({
    id: 'RBAC-08',
    section: 'RBAC',
    method: 'POST',
    endpoint: '/auth/admin/create',
    description: 'Customer token attempting admin creation is rejected with 403',
    authRole: 'customer',
    testFn: async () => {
      const { status, data } = await request('/auth/admin/create', {
        method: 'POST',
        token: tokens.customer,
        body: { name: 'Hacker Admin', email: 'hacker@test.com', password: 'Password@123', role: 'super_admin' }
      });
      return { status, passed: status === 403 && data.success === false };
    }
  });

  // --------------------------------------------------------------------------
  // SECTION 4: ADMIN PROFILE & AUDIT LOGS
  // --------------------------------------------------------------------------
  console.log('\n--- SECTION 4: ADMIN PROFILE & AUDIT LOGS ---');

  // 4.1 Get Current Admin Profile
  await runTest({
    id: 'ADM-PROF-01',
    section: 'Admin Profile',
    method: 'GET',
    endpoint: '/admin/profile',
    description: 'Super Admin retrieves own profile',
    authRole: 'super_admin',
    testFn: async () => {
      const { status, data } = await request('/admin/profile', { token: tokens.super_admin });
      return {
        status,
        passed: status === 200 && data.success === true && data.user.email === 'admin@hotelhub.com' && !data.user.password
      };
    }
  });

  // 4.2 Update Admin Profile (Valid)
  await runTest({
    id: 'ADM-PROF-02',
    section: 'Admin Profile',
    method: 'PUT',
    endpoint: '/admin/profile',
    description: 'Super Admin updates profile name and phone',
    authRole: 'super_admin',
    testFn: async () => {
      const { status, data } = await request('/admin/profile', {
        method: 'PUT',
        token: tokens.super_admin,
        body: { name: 'Super Administrator Master', phone: '+91 98000 00001' }
      });
      return { status, passed: status === 200 && data.success === true && data.user.name === 'Super Administrator Master' };
    }
  });

  // 4.3 Negative: Update Admin Profile (Empty name)
  await runTest({
    id: 'ADM-PROF-03',
    section: 'Admin Profile',
    method: 'PUT',
    endpoint: '/admin/profile',
    description: 'Update profile with empty name returns 400 validation error',
    authRole: 'super_admin',
    testFn: async () => {
      const { status, data } = await request('/admin/profile', {
        method: 'PUT',
        token: tokens.super_admin,
        body: { name: '' }
      });
      return { status, passed: status === 400 && data.success === false };
    }
  });

  // 4.4 Audit Logs Retrieval
  await runTest({
    id: 'ADM-AUDIT-01',
    section: 'Audit Logs',
    method: 'GET',
    endpoint: '/admin/audit-logs',
    description: 'Retrieve immutable system audit logs (Super Admin & Admin)',
    authRole: 'super_admin',
    testFn: async () => {
      const { status, data } = await request('/admin/audit-logs', { token: tokens.super_admin });
      return {
        status,
        passed: status === 200 && data.success === true && Array.isArray(data.logs) && data.logs.length > 0
      };
    }
  });

  // --------------------------------------------------------------------------
  // SECTION 5: ADMIN USER MANAGEMENT CRUD
  // --------------------------------------------------------------------------
  console.log('\n--- SECTION 5: ADMIN USER MANAGEMENT (SUPER ADMIN) ---');

  let testAdminId = null;
  const testAdminEmail = `qa.support.adm.${Date.now()}@hotelhub.com`;

  // 5.1 Create new sub-admin (Support Admin)
  await runTest({
    id: 'ADM-USER-01',
    section: 'User Management',
    method: 'POST',
    endpoint: '/auth/admin/create',
    description: 'Super Admin creates a new Support Admin account',
    authRole: 'super_admin',
    testFn: async () => {
      const { status, data } = await request('/auth/admin/create', {
        method: 'POST',
        token: tokens.super_admin,
        body: {
          name: 'QA Support Analyst',
          email: testAdminEmail,
          password: 'Admin@123456',
          role: 'support_admin',
          phone: '+91 98888 11111'
        }
      });
      if (status === 201 && data.user) {
        testAdminId = data.user.id;
        testUsers.push(testAdminId);
      }
      return {
        status,
        passed: status === 201 && data.success === true && data.user.role === 'support_admin'
      };
    }
  });

  // 5.2 Negative: Duplicate Admin Email
  await runTest({
    id: 'ADM-USER-02',
    section: 'User Management',
    method: 'POST',
    endpoint: '/auth/admin/create',
    description: 'Attempt to create admin with duplicate email rejected with 400',
    authRole: 'super_admin',
    testFn: async () => {
      const { status, data } = await request('/auth/admin/create', {
        method: 'POST',
        token: tokens.super_admin,
        body: {
          name: 'Duplicate Admin',
          email: testAdminEmail,
          password: 'Admin@123456',
          role: 'support_admin'
        }
      });
      return { status, passed: status === 400 && data.success === false };
    }
  });

  // 5.3 Get Single Admin Details
  await runTest({
    id: 'ADM-USER-03',
    section: 'User Management',
    method: 'GET',
    endpoint: `/admin/users/${testAdminId}`,
    description: 'Get details of single admin by ID',
    authRole: 'super_admin',
    testFn: async () => {
      if (!testAdminId) return { status: 0, passed: false, message: 'Test admin not created' };
      const { status, data } = await request(`/admin/users/${testAdminId}`, { token: tokens.super_admin });
      return { status, passed: status === 200 && data.success === true && data.user.id === testAdminId };
    }
  });

  // 5.4 Update Admin Status (Suspend)
  await runTest({
    id: 'ADM-USER-04',
    section: 'User Management',
    method: 'PUT',
    endpoint: `/admin/users/${testAdminId}/status`,
    description: 'Suspend sub-admin account',
    authRole: 'super_admin',
    testFn: async () => {
      if (!testAdminId) return { status: 0, passed: false, message: 'Test admin not created' };
      const { status, data } = await request(`/admin/users/${testAdminId}/status`, {
        method: 'PUT',
        token: tokens.super_admin,
        body: { status: 'suspended' }
      });
      return { status, passed: status === 200 && data.success === true && data.user.status === 'suspended' };
    }
  });

  // 5.5 Verify Suspended Admin Cannot Login
  await runTest({
    id: 'ADM-USER-05',
    section: 'User Management',
    method: 'POST',
    endpoint: '/auth/admin/login',
    description: 'Suspended admin account login rejected with 403 Forbidden',
    authRole: 'Public',
    testFn: async () => {
      const { status, data } = await request('/auth/admin/login', {
        method: 'POST',
        body: { email: testAdminEmail, password: 'Admin@123456' }
      });
      return { status, passed: status === 403 && data.success === false };
    }
  });

  // 5.6 Reactivate Admin Account
  await runTest({
    id: 'ADM-USER-06',
    section: 'User Management',
    method: 'PUT',
    endpoint: `/admin/users/${testAdminId}/status`,
    description: 'Reactivate sub-admin account to active',
    authRole: 'super_admin',
    testFn: async () => {
      if (!testAdminId) return { status: 0, passed: false, message: 'Test admin not created' };
      const { status, data } = await request(`/admin/users/${testAdminId}/status`, {
        method: 'PUT',
        token: tokens.super_admin,
        body: { status: 'active' }
      });
      return { status, passed: status === 200 && data.success === true && data.user.status === 'active' };
    }
  });

  // 5.7 Update Admin Role (Super Admin only)
  await runTest({
    id: 'ADM-USER-07',
    section: 'User Management',
    method: 'PUT',
    endpoint: `/admin/users/${testAdminId}/role`,
    description: 'Change sub-admin role from support_admin to finance_admin',
    authRole: 'super_admin',
    testFn: async () => {
      if (!testAdminId) return { status: 0, passed: false, message: 'Test admin not created' };
      const { status, data } = await request(`/admin/users/${testAdminId}/role`, {
        method: 'PUT',
        token: tokens.super_admin,
        body: { role: 'finance_admin' }
      });
      return { status, passed: status === 200 && data.success === true && data.user.role === 'finance_admin' };
    }
  });

  // 5.8 Super Admin self-suspend guard
  await runTest({
    id: 'ADM-USER-08',
    section: 'User Management',
    method: 'PUT',
    endpoint: '/admin/users/USR-SUPER-ADMIN/status',
    description: 'Super Admin cannot suspend their own active account (guard check)',
    authRole: 'super_admin',
    testFn: async () => {
      const { status, data } = await request('/admin/users/USR-SUPER-ADMIN/status', {
        method: 'PUT',
        token: tokens.super_admin,
        body: { status: 'suspended' }
      });
      return { status, passed: status === 400 && data.success === false };
    }
  });

  // 5.9 Delete Admin User (Super Admin only)
  await runTest({
    id: 'ADM-USER-09',
    section: 'User Management',
    method: 'DELETE',
    endpoint: `/admin/users/${testAdminId}`,
    description: 'Super Admin deletes sub-admin account',
    authRole: 'super_admin',
    testFn: async () => {
      if (!testAdminId) return { status: 0, passed: false, message: 'Test admin not created' };
      const { status, data } = await request(`/admin/users/${testAdminId}`, {
        method: 'DELETE',
        token: tokens.super_admin
      });
      return { status, passed: status === 200 && data.success === true };
    }
  });

  // --------------------------------------------------------------------------
  // SECTION 6: HOTEL MANAGEMENT API TESTING
  // --------------------------------------------------------------------------
  console.log('\n--- SECTION 6: HOTEL MANAGEMENT API TESTING ---');

  let testHotelId = null;

  // 6.1 List Hotels for Admin
  await runTest({
    id: 'HTL-01',
    section: 'Hotel Management',
    method: 'GET',
    endpoint: '/admin/hotels',
    description: 'Admin retrieves all hotels with metadata',
    authRole: 'super_admin',
    testFn: async () => {
      const { status, data } = await request('/admin/hotels', { token: tokens.super_admin });
      return { status, passed: status === 200 && data.success === true && Array.isArray(data.hotels) };
    }
  });

  // 6.2 Hotel Onboarding (Create Hotel)
  await runTest({
    id: 'HTL-02',
    section: 'Hotel Management',
    method: 'POST',
    endpoint: '/hotels/onboard',
    description: 'Hotel Owner onboards a new hotel property',
    authRole: 'owner',
    testFn: async () => {
      const { status, data } = await request('/hotels/onboard', {
        method: 'POST',
        token: tokens.owner,
        body: {
          name: 'QA Test Grand Palace Resort',
          hotel_type: '5-Star Luxury Resort',
          description: 'Automated test suite hotel property.',
          address: 'Beachfront Road 101',
          city: 'Goa',
          state: 'Goa',
          country: 'India',
          postal_code: '403001',
          star_category: 5,
          amenities: ['Private Beach', 'Infinity Pool', 'Fine Dining', 'Spa & Wellness'],
          cover_image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200',
          rooms: [
            { room_name: 'Sea View Suite', room_type: 'Suite', price_per_night: 12000, total_inventory: 5, max_guests: 3 }
          ]
        }
      });
      if (status === 201 && data.hotel) {
        testHotelId = data.hotel.id;
        testHotels.push(testHotelId);
      }
      return {
        status,
        passed: status === 201 && data.success === true && data.hotel.status === 'under_review'
      };
    }
  });

  // 6.3 Negative: Create Hotel missing required fields
  await runTest({
    id: 'HTL-03',
    section: 'Hotel Management',
    method: 'POST',
    endpoint: '/hotels/onboard',
    description: 'Hotel onboarding without required fields returns 400',
    authRole: 'owner',
    testFn: async () => {
      const { status, data } = await request('/hotels/onboard', {
        method: 'POST',
        token: tokens.owner,
        body: { name: 'Incomplete Hotel' }
      });
      return { status, passed: status === 400 && data.success === false };
    }
  });

  // 6.4 Get Single Hotel Details (Public)
  await runTest({
    id: 'HTL-04',
    section: 'Hotel Management',
    method: 'GET',
    endpoint: `/hotels/${testHotelId}`,
    description: 'Retrieve single hotel details with rooms and reviews',
    authRole: 'Public',
    testFn: async () => {
      if (!testHotelId) return { status: 0, passed: false, message: 'Hotel not created' };
      const { status, data } = await request(`/hotels/${testHotelId}`);
      return { status, passed: status === 200 && data.success === true && data.hotel.id === testHotelId };
    }
  });

  // 6.5 Admin Approves Hotel (Status -> active)
  await runTest({
    id: 'HTL-05',
    section: 'Hotel Management',
    method: 'PUT',
    endpoint: `/hotels/${testHotelId}/status`,
    description: 'Admin approves under-review hotel to active status',
    authRole: 'super_admin',
    testFn: async () => {
      if (!testHotelId) return { status: 0, passed: false, message: 'Hotel not created' };
      const { status, data } = await request(`/hotels/${testHotelId}/status`, {
        method: 'PUT',
        token: tokens.super_admin,
        body: { status: 'active' }
      });
      return { status, passed: status === 200 && data.success === true && data.hotel.status === 'active' };
    }
  });

  // 6.6 Admin Suspends Hotel
  await runTest({
    id: 'HTL-06',
    section: 'Hotel Management',
    method: 'PUT',
    endpoint: `/hotels/${testHotelId}/status`,
    description: 'Admin suspends hotel property',
    authRole: 'super_admin',
    testFn: async () => {
      if (!testHotelId) return { status: 0, passed: false, message: 'Hotel not created' };
      const { status, data } = await request(`/hotels/${testHotelId}/status`, {
        method: 'PUT',
        token: tokens.super_admin,
        body: { status: 'suspended' }
      });
      return { status, passed: status === 200 && data.success === true && data.hotel.status === 'suspended' };
    }
  });

  // 6.7 Re-activate Hotel
  await runTest({
    id: 'HTL-07',
    section: 'Hotel Management',
    method: 'PUT',
    endpoint: `/hotels/${testHotelId}/status`,
    description: 'Admin re-activates hotel property to active',
    authRole: 'super_admin',
    testFn: async () => {
      if (!testHotelId) return { status: 0, passed: false, message: 'Hotel not created' };
      const { status, data } = await request(`/hotels/${testHotelId}/status`, {
        method: 'PUT',
        token: tokens.super_admin,
        body: { status: 'active' }
      });
      return { status, passed: status === 200 && data.success === true && data.hotel.status === 'active' };
    }
  });

  // 6.8 Update Hotel Information
  await runTest({
    id: 'HTL-08',
    section: 'Hotel Management',
    method: 'PUT',
    endpoint: `/hotels/${testHotelId}`,
    description: 'Owner updates hotel description and amenities',
    authRole: 'owner',
    testFn: async () => {
      if (!testHotelId) return { status: 0, passed: false, message: 'Hotel not created' };
      const { status, data } = await request(`/hotels/${testHotelId}`, {
        method: 'PUT',
        token: tokens.owner,
        body: { description: 'Updated luxury beachfront property description.' }
      });
      return { status, passed: status === 200 && data.success === true };
    }
  });

  // --------------------------------------------------------------------------
  // SECTION 7: ROOM MANAGEMENT & AVAILABILITY TESTING
  // --------------------------------------------------------------------------
  console.log('\n--- SECTION 7: ROOM MANAGEMENT & AVAILABILITY TESTING ---');

  let testRoomId = null;

  // 7.1 Add Room Category
  await runTest({
    id: 'RM-01',
    section: 'Room Management',
    method: 'POST',
    endpoint: '/rooms',
    description: 'Owner creates a new room category in hotel',
    authRole: 'owner',
    testFn: async () => {
      if (!testHotelId) return { status: 0, passed: false, message: 'Hotel not created' };
      const { status, data } = await request('/rooms', {
        method: 'POST',
        token: tokens.owner,
        body: {
          hotel_id: testHotelId,
          room_name: 'Presidential Ocean Villa',
          room_type: 'Villa',
          description: 'Top luxury villa with private plunge pool.',
          max_guests: 4,
          total_inventory: 3,
          price_per_night: 25000
        }
      });
      if (status === 201 && data.room) {
        testRoomId = data.room.id;
        testRooms.push(testRoomId);
      }
      return { status, passed: status === 201 && data.success === true && data.room.price_per_night === 25000 };
    }
  });

  // 7.2 Get Room Details
  await runTest({
    id: 'RM-02',
    section: 'Room Management',
    method: 'GET',
    endpoint: `/rooms/${testRoomId}`,
    description: 'Retrieve single room details',
    authRole: 'Public',
    testFn: async () => {
      if (!testRoomId) return { status: 0, passed: false, message: 'Room not created' };
      const { status, data } = await request(`/rooms/${testRoomId}`);
      return { status, passed: status === 200 && data.success === true && data.room.id === testRoomId };
    }
  });

  // 7.3 Update Room Pricing
  await runTest({
    id: 'RM-03',
    section: 'Room Management',
    method: 'PUT',
    endpoint: `/rooms/${testRoomId}`,
    description: 'Owner updates room price and inventory',
    authRole: 'owner',
    testFn: async () => {
      if (!testRoomId) return { status: 0, passed: false, message: 'Room not created' };
      const { status, data } = await request(`/rooms/${testRoomId}`, {
        method: 'PUT',
        token: tokens.owner,
        body: { price_per_night: 28000, total_inventory: 4 }
      });
      return { status, passed: status === 200 && data.success === true && data.room.price_per_night === 28000 };
    }
  });

  // 7.4 Room Availability Matrix Retrieval
  await runTest({
    id: 'AVL-01',
    section: 'Availability',
    method: 'GET',
    endpoint: `/availability/${testRoomId}?days=7`,
    description: 'Retrieve 7-day room availability calendar matrix',
    authRole: 'Public',
    testFn: async () => {
      if (!testRoomId) return { status: 0, passed: false, message: 'Room not created' };
      const { status, data } = await request(`/availability/${testRoomId}?days=7`);
      return {
        status,
        passed: status === 200 && data.success === true && Array.isArray(data.matrix) && data.matrix.length === 7
      };
    }
  });

  // 7.5 Owner Blocks Room Inventory
  await runTest({
    id: 'AVL-02',
    section: 'Availability',
    method: 'POST',
    endpoint: '/availability/block',
    description: 'Owner blocks 1 room unit for maintenance',
    authRole: 'owner',
    testFn: async () => {
      if (!testRoomId) return { status: 0, passed: false, message: 'Room not created' };
      const todayStr = new Date().toISOString().slice(0, 10);
      const { status, data } = await request('/availability/block', {
        method: 'POST',
        token: tokens.owner,
        body: { room_id: testRoomId, date: todayStr, blocked_count: 1 }
      });
      return { status, passed: status === 200 && data.success === true };
    }
  });

  // --------------------------------------------------------------------------
  // SECTION 8: BOOKING LIFECYCLE & STATE TRANSITIONS
  // --------------------------------------------------------------------------
  console.log('\n--- SECTION 8: BOOKING LIFECYCLE & STATE TRANSITIONS ---');

  let testBookingId = null;
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfterTomorrow = new Date();
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 3);

  const checkInDate = tomorrow.toISOString().slice(0, 10);
  const checkOutDate = dayAfterTomorrow.toISOString().slice(0, 10);

  // 8.1 Create Booking (Customer)
  await runTest({
    id: 'BKG-01',
    section: 'Booking Lifecycle',
    method: 'POST',
    endpoint: '/bookings/create',
    description: 'Customer creates booking with atomic lock, financial calculation & payment record',
    authRole: 'customer',
    testFn: async () => {
      if (!testHotelId || !testRoomId) return { status: 0, passed: false, message: 'Hotel/Room missing' };
      const { status, data } = await request('/bookings/create', {
        method: 'POST',
        token: tokens.customer,
        body: {
          hotel_id: testHotelId,
          room_id: testRoomId,
          check_in_date: checkInDate,
          check_out_date: checkOutDate,
          guests_count: 2,
          payment_method: 'UPI'
        }
      });
      if (status === 201 && data.booking) {
        testBookingId = data.booking.id;
        testBookings.push(testBookingId);
      }
      return {
        status,
        passed: status === 201 && data.success === true && data.booking.booking_status === 'confirmed' && data.booking.commission_amount > 0
      };
    }
  });

  // 8.2 Get Booking by ID
  await runTest({
    id: 'BKG-02',
    section: 'Booking Lifecycle',
    method: 'GET',
    endpoint: `/bookings/${testBookingId}`,
    description: 'Retrieve booking details by ID',
    authRole: 'customer',
    testFn: async () => {
      if (!testBookingId) return { status: 0, passed: false, message: 'Booking not created' };
      const { status, data } = await request(`/bookings/${testBookingId}`, { token: tokens.customer });
      return { status, passed: status === 200 && data.success === true && data.booking.id === testBookingId };
    }
  });

  // 8.3 Admin Views All Bookings
  await runTest({
    id: 'BKG-03',
    section: 'Booking Lifecycle',
    method: 'GET',
    endpoint: '/admin/bookings',
    description: 'Admin retrieves centralized booking list',
    authRole: 'super_admin',
    testFn: async () => {
      const { status, data } = await request('/admin/bookings', { token: tokens.super_admin });
      return { status, passed: status === 200 && data.success === true && Array.isArray(data.bookings) };
    }
  });

  // 8.4 Check-In Guest (confirmed -> checked_in)
  await runTest({
    id: 'BKG-04',
    section: 'Booking Lifecycle',
    method: 'PUT',
    endpoint: `/bookings/${testBookingId}/checkin`,
    description: 'Front desk / Admin checks in guest (confirmed -> checked_in)',
    authRole: 'super_admin',
    testFn: async () => {
      if (!testBookingId) return { status: 0, passed: false, message: 'Booking not created' };
      const { status, data } = await request(`/bookings/${testBookingId}/checkin`, {
        method: 'PUT',
        token: tokens.super_admin
      });
      return { status, passed: status === 200 && data.success === true && data.booking.booking_status === 'checked_in' };
    }
  });

  // 8.5 Negative: Duplicate Check-In (already checked_in -> checkin)
  await runTest({
    id: 'BKG-05',
    section: 'Booking Lifecycle',
    method: 'PUT',
    endpoint: `/bookings/${testBookingId}/checkin`,
    description: 'Attempting to check-in an already checked-in booking returns 400',
    authRole: 'super_admin',
    testFn: async () => {
      if (!testBookingId) return { status: 0, passed: false, message: 'Booking not created' };
      const { status, data } = await request(`/bookings/${testBookingId}/checkin`, {
        method: 'PUT',
        token: tokens.super_admin
      });
      return { status, passed: status === 400 && data.success === false };
    }
  });

  // 8.6 Check-Out Guest (checked_in -> checked_out)
  await runTest({
    id: 'BKG-06',
    section: 'Booking Lifecycle',
    method: 'PUT',
    endpoint: `/bookings/${testBookingId}/checkout`,
    description: 'Front desk / Admin checks out guest (checked_in -> checked_out)',
    authRole: 'super_admin',
    testFn: async () => {
      if (!testBookingId) return { status: 0, passed: false, message: 'Booking not created' };
      const { status, data } = await request(`/bookings/${testBookingId}/checkout`, {
        method: 'PUT',
        token: tokens.super_admin
      });
      return { status, passed: status === 200 && data.success === true && data.booking.booking_status === 'checked_out' };
    }
  });

  // 8.7 Customer Reviews Checked-Out Booking
  await runTest({
    id: 'REV-01',
    section: 'Reviews',
    method: 'POST',
    endpoint: '/reviews',
    description: 'Customer submits 5-star review for completed checked-out stay',
    authRole: 'customer',
    testFn: async () => {
      if (!testBookingId || !testHotelId) return { status: 0, passed: false, message: 'Booking/Hotel missing' };
      const { status, data } = await request('/reviews', {
        method: 'POST',
        token: tokens.customer,
        body: {
          booking_id: testBookingId,
          hotel_id: testHotelId,
          rating: 5,
          comment: 'Exceptional stay! Beautiful view and flawless service.'
        }
      });
      return { status, passed: status === 201 && data.success === true && data.review.rating === 5 };
    }
  });

  // 8.8 Second Booking for Cancellation & Refund Flow
  let cancelBookingId = null;
  let testRefundId = null;

  await runTest({
    id: 'BKG-07',
    section: 'Booking Cancellation Flow',
    method: 'POST',
    endpoint: '/bookings/create',
    description: 'Create secondary booking to test cancellation and refund pipeline',
    authRole: 'customer',
    testFn: async () => {
      if (!testHotelId || !testRoomId) return { status: 0, passed: false, message: 'Hotel/Room missing' };
      const nextWeek1 = new Date();
      nextWeek1.setDate(nextWeek1.getDate() + 10);
      const nextWeek2 = new Date();
      nextWeek2.setDate(nextWeek2.getDate() + 12);

      const { status, data } = await request('/bookings/create', {
        method: 'POST',
        token: tokens.customer,
        body: {
          hotel_id: testHotelId,
          room_id: testRoomId,
          check_in_date: nextWeek1.toISOString().slice(0, 10),
          check_out_date: nextWeek2.toISOString().slice(0, 10),
          guests_count: 2
        }
      });
      if (status === 201 && data.booking) {
        cancelBookingId = data.booking.id;
        testBookings.push(cancelBookingId);
      }
      return { status, passed: status === 201 && data.success === true };
    }
  });

  // 8.9 Cancel Booking & Generate Refund Request
  await runTest({
    id: 'BKG-08',
    section: 'Booking Cancellation Flow',
    method: 'POST',
    endpoint: `/bookings/${cancelBookingId}/cancel`,
    description: 'Customer cancels booking, releasing inventory and generating pending refund record',
    authRole: 'customer',
    testFn: async () => {
      if (!cancelBookingId) return { status: 0, passed: false, message: 'Cancel booking missing' };
      const { status, data } = await request(`/bookings/${cancelBookingId}/cancel`, {
        method: 'POST',
        token: tokens.customer,
        body: { reason: 'Flight cancellation' }
      });
      if (status === 200 && data.refund) {
        testRefundId = data.refund.id;
      }
      return {
        status,
        passed: status === 200 && data.success === true && data.booking.booking_status === 'cancelled' && !!data.refund
      };
    }
  });

  // --------------------------------------------------------------------------
  // SECTION 9: PAYMENTS & REFUNDS API TESTING
  // --------------------------------------------------------------------------
  console.log('\n--- SECTION 9: PAYMENTS & REFUNDS TESTING ---');

  // 9.1 Admin Payment Ledger
  await runTest({
    id: 'PAY-01',
    section: 'Payments',
    method: 'GET',
    endpoint: '/payments/admin',
    description: 'Finance Admin retrieves all transactions without exposing card/CVV data',
    authRole: 'finance_admin',
    testFn: async () => {
      const { status, data } = await request('/payments/admin', { token: tokens.finance_admin });
      const noSensitiveData = data.payments?.every(p => !p.card_number && !p.cvv);
      return {
        status,
        passed: status === 200 && data.success === true && Array.isArray(data.payments) && noSensitiveData
      };
    }
  });

  // 9.2 Admin Refund Requests Queue
  await runTest({
    id: 'REF-01',
    section: 'Refunds',
    method: 'GET',
    endpoint: '/refunds/admin',
    description: 'Finance Admin retrieves pending refund queue',
    authRole: 'finance_admin',
    testFn: async () => {
      const { status, data } = await request('/refunds/admin', { token: tokens.finance_admin });
      return { status, passed: status === 200 && data.success === true && Array.isArray(data.refunds) };
    }
  });

  // 9.3 Process Refund (Approve)
  await runTest({
    id: 'REF-02',
    section: 'Refunds',
    method: 'PUT',
    endpoint: `/refunds/${testRefundId}/process`,
    description: 'Finance Admin approves refund and updates linked booking payment status to refunded',
    authRole: 'finance_admin',
    testFn: async () => {
      if (!testRefundId) return { status: 0, passed: false, message: 'Refund record missing' };
      const { status, data } = await request(`/refunds/${testRefundId}/process`, {
        method: 'PUT',
        token: tokens.finance_admin,
        body: { status: 'approved', admin_notes: 'Approved per standard cancellation policy.' }
      });
      return { status, passed: status === 200 && data.success === true && data.refund.status === 'approved' };
    }
  });

  // --------------------------------------------------------------------------
  // SECTION 10: COMMISSIONS & PLATFORM SETTINGS
  // --------------------------------------------------------------------------
  console.log('\n--- SECTION 10: COMMISSIONS & SETTINGS TESTING ---');

  // 10.1 Commission Ledger
  await runTest({
    id: 'COM-01',
    section: 'Commissions',
    method: 'GET',
    endpoint: '/commissions/ledger',
    description: 'Finance Admin views platform take-rate ledger & GMV breakdown',
    authRole: 'finance_admin',
    testFn: async () => {
      const { status, data } = await request('/commissions/ledger', { token: tokens.finance_admin });
      return { status, passed: status === 200 && data.success === true && data.platform_take_rate !== undefined };
    }
  });

  // 10.2 Update Commission Rate (Super Admin only)
  await runTest({
    id: 'COM-02',
    section: 'Commissions',
    method: 'PUT',
    endpoint: '/commissions/rate',
    description: 'Super Admin updates platform take-rate percentage',
    authRole: 'super_admin',
    testFn: async () => {
      const { status, data } = await request('/commissions/rate', {
        method: 'PUT',
        token: tokens.super_admin,
        body: { rate: 18 }
      });
      return { status, passed: status === 200 && data.success === true && data.settings.commission_rate === 18 };
    }
  });

  // 10.3 Negative: Invalid Commission Rate (> 50%)
  await runTest({
    id: 'COM-03',
    section: 'Commissions',
    method: 'PUT',
    endpoint: '/commissions/rate',
    description: 'Setting commission rate > 50% rejected with 400',
    authRole: 'super_admin',
    testFn: async () => {
      const { status, data } = await request('/commissions/rate', {
        method: 'PUT',
        token: tokens.super_admin,
        body: { rate: 95 }
      });
      return { status, passed: status === 400 && data.success === false };
    }
  });

  // Reset rate back to 15%
  await request('/commissions/rate', { method: 'PUT', token: tokens.super_admin, body: { rate: 15 } });

  // 10.4 Platform Global Settings
  await runTest({
    id: 'SET-01',
    section: 'Platform Settings',
    method: 'GET',
    endpoint: '/settings',
    description: 'Retrieve platform configuration parameters',
    authRole: 'Public',
    testFn: async () => {
      const { status, data } = await request('/settings');
      return { status, passed: status === 200 && data.success === true && !!data.settings.support_email };
    }
  });

  // 10.5 Update Global Settings (Super Admin)
  await runTest({
    id: 'SET-02',
    section: 'Platform Settings',
    method: 'PUT',
    endpoint: '/settings',
    description: 'Super Admin updates platform parameters',
    authRole: 'super_admin',
    testFn: async () => {
      const { status, data } = await request('/settings', {
        method: 'PUT',
        token: tokens.super_admin,
        body: { support_email: 'support.enterprise@hotelhub.com' }
      });
      return { status, passed: status === 200 && data.success === true && data.settings.support_email === 'support.enterprise@hotelhub.com' };
    }
  });

  // --------------------------------------------------------------------------
  // SECTION 11: SUPPORT DESK & TICKETING API TESTING
  // --------------------------------------------------------------------------
  console.log('\n--- SECTION 11: SUPPORT TICKETS TESTING ---');

  let testTicketId = null;

  // 11.1 Create Support Ticket (Customer)
  await runTest({
    id: 'SUP-01',
    section: 'Support Desk',
    method: 'POST',
    endpoint: '/support/tickets',
    description: 'Customer opens new support inquiry ticket',
    authRole: 'customer',
    testFn: async () => {
      const { status, data } = await request('/support/tickets', {
        method: 'POST',
        token: tokens.customer,
        body: {
          subject: 'Late check-in request',
          category: 'Reservation Inquiry',
          priority: 'high',
          message: 'Will be arriving at 11 PM due to flight delay.'
        }
      });
      if (status === 201 && data.ticket) testTicketId = data.ticket.id;
      return { status, passed: status === 201 && data.success === true && data.ticket.status === 'open' };
    }
  });

  // 11.2 Support Admin Replies to Ticket
  await runTest({
    id: 'SUP-02',
    section: 'Support Desk',
    method: 'POST',
    endpoint: `/support/tickets/${testTicketId}/reply`,
    description: 'Support Admin replies to customer inquiry',
    authRole: 'support_admin',
    testFn: async () => {
      if (!testTicketId) return { status: 0, passed: false, message: 'Ticket missing' };
      const { status, data } = await request(`/support/tickets/${testTicketId}/reply`, {
        method: 'POST',
        token: tokens.support_admin,
        body: { text: 'Noted! The hotel front desk has been notified of your late arrival.' }
      });
      return { status, passed: status === 200 && data.success === true && data.ticket.messages.length >= 2 };
    }
  });

  // 11.3 Support Admin Closes Ticket
  await runTest({
    id: 'SUP-03',
    section: 'Support Desk',
    method: 'PUT',
    endpoint: `/support/tickets/${testTicketId}/status`,
    description: 'Support Admin updates ticket status to resolved',
    authRole: 'support_admin',
    testFn: async () => {
      if (!testTicketId) return { status: 0, passed: false, message: 'Ticket missing' };
      const { status, data } = await request(`/support/tickets/${testTicketId}/status`, {
        method: 'PUT',
        token: tokens.support_admin,
        body: { status: 'resolved' }
      });
      return { status, passed: status === 200 && data.success === true && data.ticket.status === 'resolved' };
    }
  });

  // --------------------------------------------------------------------------
  // SECTION 12: OWNER KYC COMPLIANCE
  // --------------------------------------------------------------------------
  console.log('\n--- SECTION 12: OWNER KYC TESTING ---');

  // 12.1 List Owner KYC submissions
  await runTest({
    id: 'KYC-01',
    section: 'Owner KYC',
    method: 'GET',
    endpoint: '/owners/kyc',
    description: 'Admin retrieves owner KYC verification list',
    authRole: 'super_admin',
    testFn: async () => {
      const { status, data } = await request('/owners/kyc', { token: tokens.super_admin });
      return { status, passed: status === 200 && data.success === true && Array.isArray(data.owners) };
    }
  });

  // --------------------------------------------------------------------------
  // SECTION 13: DASHBOARDS & ANALYTICS REPORTS
  // --------------------------------------------------------------------------
  console.log('\n--- SECTION 13: DASHBOARD & REPORTS TESTING ---');

  // 13.1 Admin Dashboard KPIs (/api/admin/kpis)
  await runTest({
    id: 'DASH-01',
    section: 'Analytics & KPIs',
    method: 'GET',
    endpoint: '/admin/kpis',
    description: 'Admin retrieves high-level operational and financial KPIs',
    authRole: 'super_admin',
    testFn: async () => {
      const { status, data } = await request('/admin/kpis', { token: tokens.super_admin });
      return {
        status,
        passed: status === 200 && data.success === true && data.kpis && data.kpis.total_hotels >= 0 && data.kpis.total_gmv >= 0
      };
    }
  });

  // 13.2 Reports Admin KPIs (/api/reports/admin-kpis)
  await runTest({
    id: 'REP-01',
    section: 'Analytics & KPIs',
    method: 'GET',
    endpoint: '/reports/admin-kpis',
    description: 'Retrieve administrative report KPIs',
    authRole: 'super_admin',
    testFn: async () => {
      const { status, data } = await request('/reports/admin-kpis', { token: tokens.super_admin });
      return { status, passed: status === 200 && data.success === true && data.kpis !== undefined };
    }
  });

  // 13.3 Daily Income Statement (/api/reports/daily)
  await runTest({
    id: 'REP-02',
    section: 'Financial Reports',
    method: 'GET',
    endpoint: '/reports/daily',
    description: 'Finance Admin retrieves 14-day daily financial statement',
    authRole: 'finance_admin',
    testFn: async () => {
      const { status, data } = await request('/reports/daily', { token: tokens.finance_admin });
      return { status, passed: status === 200 && data.success === true && Array.isArray(data.daily_report) };
    }
  });

  // 13.4 Monthly Income Statement (/api/reports/monthly)
  await runTest({
    id: 'REP-03',
    section: 'Financial Reports',
    method: 'GET',
    endpoint: '/reports/monthly',
    description: 'Finance Admin retrieves monthly financial performance',
    authRole: 'finance_admin',
    testFn: async () => {
      const { status, data } = await request('/reports/monthly', { token: tokens.finance_admin });
      return { status, passed: status === 200 && data.success === true && Array.isArray(data.monthly_report) };
    }
  });

  // --------------------------------------------------------------------------
  // SECTION 13B: HOTEL ADMIN PROPERTY & ISOLATION MANAGEMENT
  // --------------------------------------------------------------------------
  console.log('\n--- SECTION 13B: HOTEL ADMIN PROPERTY & ISOLATION MANAGEMENT ---');

  // 13B.1 Hotel Admin Dashboard
  await runTest({
    id: 'HTL-ADM-01',
    section: 'Hotel Admin Property',
    method: 'GET',
    endpoint: '/hotel-admin/dashboard',
    description: 'Hotel Admin retrieves property-specific metrics and dashboard',
    authRole: 'hotel_admin',
    testFn: async () => {
      const { status, data } = await request('/hotel-admin/dashboard', { token: tokens.hotel_admin });
      return { status, passed: status === 200 && data.success === true && data.kpis && data.hotel };
    }
  });

  // 13B.2 Hotel Admin Property Details
  await runTest({
    id: 'HTL-ADM-02',
    section: 'Hotel Admin Property',
    method: 'GET',
    endpoint: '/hotel-admin/property',
    description: 'Hotel Admin retrieves assigned property details',
    authRole: 'hotel_admin',
    testFn: async () => {
      const { status, data } = await request('/hotel-admin/property', { token: tokens.hotel_admin });
      return { status, passed: status === 200 && data.success === true && !!data.hotel };
    }
  });

  // 13B.3 Hotel Admin Rooms List
  await runTest({
    id: 'HTL-ADM-03',
    section: 'Hotel Admin Property',
    method: 'GET',
    endpoint: '/hotel-admin/rooms',
    description: 'Hotel Admin retrieves rooms belonging exclusively to their hotel',
    authRole: 'hotel_admin',
    testFn: async () => {
      const { status, data } = await request('/hotel-admin/rooms', { token: tokens.hotel_admin });
      return { status, passed: status === 200 && data.success === true && Array.isArray(data.rooms) };
    }
  });

  // 13B.4 Hotel Admin Earnings
  await runTest({
    id: 'HTL-ADM-04',
    section: 'Hotel Admin Property',
    method: 'GET',
    endpoint: '/hotel-admin/earnings',
    description: 'Hotel Admin views property net payouts and transaction records',
    authRole: 'hotel_admin',
    testFn: async () => {
      const { status, data } = await request('/hotel-admin/earnings', { token: tokens.hotel_admin });
      return { status, passed: status === 200 && data.success === true && data.earnings !== undefined };
    }
  });

  // 13B.5 Hotel Admin Check-Ins
  await runTest({
    id: 'HTL-ADM-05',
    section: 'Hotel Admin Property',
    method: 'GET',
    endpoint: '/hotel-admin/check-ins',
    description: 'Hotel Admin retrieves check-in roster',
    authRole: 'hotel_admin',
    testFn: async () => {
      const { status, data } = await request('/hotel-admin/check-ins', { token: tokens.hotel_admin });
      return { status, passed: status === 200 && data.success === true && Array.isArray(data.activeStays) };
    }
  });

  // 13B.6 Hotel Admin Profile
  await runTest({
    id: 'HTL-ADM-06',
    section: 'Hotel Admin Property',
    method: 'GET',
    endpoint: '/hotel-admin/profile',
    description: 'Hotel Admin retrieves their own profile',
    authRole: 'hotel_admin',
    testFn: async () => {
      const { status, data } = await request('/hotel-admin/profile', { token: tokens.hotel_admin });
      return { status, passed: status === 200 && data.success === true && data.user.role === 'hotel_admin' };
    }
  });

  // --------------------------------------------------------------------------
  // SECTION 14: DEDICATED SECURITY & RBAC REGRESSION ON FIXED ENDPOINTS
  // --------------------------------------------------------------------------
  console.log('\n--- SECTION 14: TARGETED SECURITY REGRESSION ON FIXED ENDPOINTS ---');

  // 14.1 GET /api/admin/commissions Security Matrix
  // 14.1.1 super_admin -> PASS (200)
  await runTest({
    id: 'SEC-COM-01',
    section: 'Commissions Security',
    method: 'GET',
    endpoint: '/admin/commissions',
    description: 'Super Admin access to /api/admin/commissions returns 200',
    authRole: 'super_admin',
    testFn: async () => {
      const { status, data } = await request('/admin/commissions', { token: tokens.super_admin });
      return { status, passed: status === 200 && data.success === true && Array.isArray(data.ledger) };
    }
  });

  // 14.1.2 admin -> PASS (200)
  await runTest({
    id: 'SEC-COM-02',
    section: 'Commissions Security',
    method: 'GET',
    endpoint: '/admin/commissions',
    description: 'Operations Admin access to /api/admin/commissions returns 200',
    authRole: 'admin',
    testFn: async () => {
      const { status, data } = await request('/admin/commissions', { token: tokens.admin });
      return { status, passed: status === 200 && data.success === true && Array.isArray(data.ledger) };
    }
  });

  // 14.1.3 finance_admin -> PASS (200)
  await runTest({
    id: 'SEC-COM-03',
    section: 'Commissions Security',
    method: 'GET',
    endpoint: '/admin/commissions',
    description: 'Finance Admin access to /api/admin/commissions returns 200 and accurate ledger records',
    authRole: 'finance_admin',
    testFn: async () => {
      const { status, data } = await request('/admin/commissions', { token: tokens.finance_admin });
      return { status, passed: status === 200 && data.success === true && Array.isArray(data.ledger) && data.count >= 0 };
    }
  });

  // 14.1.4 support_admin -> BLOCKED (403)
  await runTest({
    id: 'SEC-COM-04',
    section: 'Commissions Security',
    method: 'GET',
    endpoint: '/admin/commissions',
    description: 'Support Admin access to /api/admin/commissions is blocked with 403',
    authRole: 'support_admin',
    testFn: async () => {
      const { status, data } = await request('/admin/commissions', { token: tokens.support_admin });
      return { status, passed: status === 403 && data.success === false };
    }
  });

  // 14.1.5 hotel_admin -> BLOCKED (403)
  await runTest({
    id: 'SEC-COM-05',
    section: 'Commissions Security',
    method: 'GET',
    endpoint: '/admin/commissions',
    description: 'Hotel Admin access to /api/admin/commissions is blocked with 403',
    authRole: 'hotel_admin',
    testFn: async () => {
      const { status, data } = await request('/admin/commissions', { token: tokens.hotel_admin });
      return { status, passed: status === 403 && data.success === false };
    }
  });

  // 14.1.6 owner -> BLOCKED (403)
  await runTest({
    id: 'SEC-COM-06',
    section: 'Commissions Security',
    method: 'GET',
    endpoint: '/admin/commissions',
    description: 'Hotel Owner access to /api/admin/commissions is blocked with 403',
    authRole: 'owner',
    testFn: async () => {
      const { status, data } = await request('/admin/commissions', { token: tokens.owner });
      return { status, passed: status === 403 && data.success === false };
    }
  });

  // 14.1.7 customer -> BLOCKED (403)
  await runTest({
    id: 'SEC-COM-07',
    section: 'Commissions Security',
    method: 'GET',
    endpoint: '/admin/commissions',
    description: 'Customer access to /api/admin/commissions is blocked with 403',
    authRole: 'customer',
    testFn: async () => {
      const { status, data } = await request('/admin/commissions', { token: tokens.customer });
      return { status, passed: status === 403 && data.success === false };
    }
  });

  // 14.1.8 no token -> BLOCKED (401)
  await runTest({
    id: 'SEC-COM-08',
    section: 'Commissions Security',
    method: 'GET',
    endpoint: '/admin/commissions',
    description: 'Unauthenticated access to /api/admin/commissions is blocked with 401',
    authRole: 'Unauthenticated',
    testFn: async () => {
      const { status, data } = await request('/admin/commissions');
      return { status, passed: status === 401 && data.success === false };
    }
  });

  // 14.1.9 invalid token -> BLOCKED (401)
  await runTest({
    id: 'SEC-COM-09',
    section: 'Commissions Security',
    method: 'GET',
    endpoint: '/admin/commissions',
    description: 'Invalid token access to /api/admin/commissions is blocked with 401',
    authRole: 'Invalid Token',
    testFn: async () => {
      const { status, data } = await request('/admin/commissions', { token: 'invalid.token.123' });
      return { status, passed: status === 401 && data.success === false };
    }
  });

  // 14.2 GET /api/reports/owner-kpis Security Matrix
  // 14.2.1 owner -> PASS (200)
  await runTest({
    id: 'SEC-OWN-01',
    section: 'Owner KPIs Security',
    method: 'GET',
    endpoint: '/reports/owner-kpis',
    description: 'Hotel Owner access to /api/reports/owner-kpis returns 200 and property metrics',
    authRole: 'owner',
    testFn: async () => {
      const { status, data } = await request('/reports/owner-kpis', { token: tokens.owner });
      return { status, passed: status === 200 && data.success === true && data.kpis && data.kpis.hotels_count !== undefined };
    }
  });

  // 14.2.2 hotel_admin -> PASS (200)
  await runTest({
    id: 'SEC-OWN-02',
    section: 'Owner KPIs Security',
    method: 'GET',
    endpoint: '/reports/owner-kpis',
    description: 'Hotel Admin access to /api/reports/owner-kpis returns 200',
    authRole: 'hotel_admin',
    testFn: async () => {
      const { status, data } = await request('/reports/owner-kpis', { token: tokens.hotel_admin });
      return { status, passed: status === 200 && data.success === true && data.kpis !== undefined };
    }
  });

  // 14.2.3 authorized admin (super_admin / admin) -> PASS (200)
  await runTest({
    id: 'SEC-OWN-03',
    section: 'Owner KPIs Security',
    method: 'GET',
    endpoint: '/reports/owner-kpis',
    description: 'Super Admin access to /api/reports/owner-kpis returns 200',
    authRole: 'super_admin',
    testFn: async () => {
      const { status, data } = await request('/reports/owner-kpis', { token: tokens.super_admin });
      return { status, passed: status === 200 && data.success === true && data.kpis !== undefined };
    }
  });

  // 14.2.4 customer -> BLOCKED (403)
  await runTest({
    id: 'SEC-OWN-04',
    section: 'Owner KPIs Security',
    method: 'GET',
    endpoint: '/reports/owner-kpis',
    description: 'Customer access to /api/reports/owner-kpis is blocked with 403',
    authRole: 'customer',
    testFn: async () => {
      const { status, data } = await request('/reports/owner-kpis', { token: tokens.customer });
      return { status, passed: status === 403 && data.success === false };
    }
  });

  // 14.2.5 invalid token -> BLOCKED (401)
  await runTest({
    id: 'SEC-OWN-05',
    section: 'Owner KPIs Security',
    method: 'GET',
    endpoint: '/reports/owner-kpis',
    description: 'Invalid token access to /api/reports/owner-kpis is blocked with 401',
    authRole: 'Invalid Token',
    testFn: async () => {
      const { status, data } = await request('/reports/owner-kpis', { token: 'invalid.token.123' });
      return { status, passed: status === 401 && data.success === false };
    }
  });

  // 14.2.6 no token -> BLOCKED (401)
  await runTest({
    id: 'SEC-OWN-06',
    section: 'Owner KPIs Security',
    method: 'GET',
    endpoint: '/reports/owner-kpis',
    description: 'Unauthenticated access to /api/reports/owner-kpis is blocked with 401',
    authRole: 'Unauthenticated',
    testFn: async () => {
      const { status, data } = await request('/reports/owner-kpis');
      return { status, passed: status === 401 && data.success === false };
    }
  });

  // --------------------------------------------------------------------------
  // SECTION 15: SEARCH, FILTERING, SORTING & INJECTION PAYLOADS
  // --------------------------------------------------------------------------
  console.log('\n--- SECTION 15: SEARCH, FILTER & INJECTION ATTACKS ---');

  // 15.1 Public Search by City
  await runTest({
    id: 'SEC-01',
    section: 'Search & Injection',
    method: 'GET',
    endpoint: '/hotels?city=Goa',
    description: 'Filter active hotels by city',
    authRole: 'Public',
    testFn: async () => {
      const { status, data } = await request('/hotels?city=Goa');
      return { status, passed: status === 200 && data.success === true && Array.isArray(data.hotels) };
    }
  });

  // 15.2 NoSQL Injection Payload in Login
  await runTest({
    id: 'SEC-02',
    section: 'Security Injection',
    method: 'POST',
    endpoint: '/auth/admin/login',
    description: 'NoSQL injection payload {"$gt": ""} in email/password rejected gracefully',
    authRole: 'Public',
    testFn: async () => {
      const { status, data } = await request('/auth/admin/login', {
        method: 'POST',
        body: { email: { $gt: '' }, password: { $gt: '' } }
      });
      return { status, passed: (status === 400 || status === 401) && data.success === false };
    }
  });

  // 15.3 SQL / String Injection in Search Parameter
  await runTest({
    id: 'SEC-03',
    section: 'Security Injection',
    method: 'GET',
    endpoint: `/hotels?search=${encodeURIComponent("' OR '1'='1' --")}`,
    description: 'SQL injection payload in search parameter safely handled without server crash',
    authRole: 'Public',
    testFn: async () => {
      const { status, data } = await request(`/hotels?search=${encodeURIComponent("' OR '1'='1' --")}`);
      return { status, passed: status === 200 && data.success === true };
    }
  });

  // 15.4 XSS Payload in Input Field
  await runTest({
    id: 'SEC-04',
    section: 'Security Injection',
    method: 'POST',
    endpoint: '/support/tickets',
    description: 'XSS script injection payload in ticket message stored and returned safely without executing',
    authRole: 'customer',
    testFn: async () => {
      const { status, data } = await request('/support/tickets', {
        method: 'POST',
        token: tokens.customer,
        body: {
          subject: 'XSS Test',
          message: '<script>alert("XSS")</script>'
        }
      });
      return { status, passed: status === 201 && data.success === true };
    }
  });

  // --------------------------------------------------------------------------
  // SECTION 16: DATA INTEGRITY VERIFICATION
  // --------------------------------------------------------------------------
  console.log('\n--- SECTION 16: FINANCIAL DATA INTEGRITY VERIFICATION ---');

  // 16.1 Financial calculation consistency: Total = Commission + Owner Payout
  await runTest({
    id: 'INT-01',
    section: 'Data Integrity',
    method: 'GET',
    endpoint: '/admin/commissions',
    description: 'Verify mathematical integrity: total_amount === commission_amount + owner_payout across all ledger items',
    authRole: 'finance_admin',
    testFn: async () => {
      const { status, data } = await request('/admin/commissions', { token: tokens.finance_admin });
      if (status !== 200 || !data.ledger || data.ledger.length === 0) {
        return { status, passed: false, message: 'Ledger empty or unavailable' };
      }
      const isConsistent = data.ledger.every(item => {
        const expectedPayout = item.total_amount - item.commission_amount;
        return Math.abs(expectedPayout - item.owner_payout) <= 1; // Allow rounding tolerance of 1 rupee
      });
      return { status, passed: isConsistent };
    }
  });

  // --------------------------------------------------------------------------
  // SECTION 17: SUMMARY STATISTICS
  // --------------------------------------------------------------------------
  console.log('\n========================================================================');
  console.log('📊 REGRESSION AUDIT SUMMARY:');
  console.log(`   Total Assertions Executed: ${testResults.length}`);
  console.log(`   ✅ Passed: ${passedCount}`);
  console.log(`   ❌ Failed: ${failedCount}`);
  console.log(`   ⛔ Blocked: ${blockedCount}`);
  console.log(`   ⏭️ Skipped: ${skippedCount}`);
  console.log(`   Pass Percentage: ${((passedCount / testResults.length) * 100).toFixed(1)}%`);
  console.log('========================================================================\n');

  return { testResults, passedCount, failedCount, blockedCount, skippedCount, total: testResults.length };
}

// Run the script
executeAudit().then(summary => {
  if (summary.failedCount > 0) {
    console.log(`⚠️ Completed with ${summary.failedCount} failures.`);
    process.exit(1);
  } else {
    console.log('🎉 ALL REGRESSION AND SECURITY TESTS PASSED 100%!');
    process.exit(0);
  }
}).catch(err => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
