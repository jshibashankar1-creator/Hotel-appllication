import fetch from 'node-fetch';
import { db } from './server/src/db/database.js';

const BASE_URL = 'http://localhost:5000/api';

async function login(email, password, endpoint = '/auth/login') {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  if (!data.token) {
    console.error(`Login failed for ${email}:`, data);
  }
  return data.token;
}

async function fetchRoute(route, token, method = 'GET') {
  const res = await fetch(`${BASE_URL}${route}`, {
    method,
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res.status;
}

async function runTests() {
  console.log('--- STARTING RBAC TESTS ---');

  const superAdminToken = await login('admin@hotelhub.com', 'Admin@123', '/auth/login');
  const financeAdminToken = await login('finance.admin@hotelhub.com', 'Admin@123', '/auth/login');
  const supportAdminToken = await login('support.admin@hotelhub.com', 'Admin@123', '/auth/login');
  const hotelAdminToken = await login('hoteladmin@hotelhub.com', 'Admin@123', '/auth/login');
  const ownerToken = await login('rajesh@grandhorizon.com', 'Password@123', '/auth/login');
  const customerToken = await login('aarav.sharma@gmail.com', 'Password@123', '/auth/login');

  let passed = 0;
  let failed = 0;

  function assertStatus(name, actual, expected) {
    if (actual === expected) {
      console.log(`✅ PASSED: ${name}`);
      passed++;
    } else {
      console.error(`❌ FAILED: ${name} - Expected ${expected} but got ${actual}`);
      failed++;
    }
  }

  // CUSTOMER
  assertStatus('Customer -> Admin Route (403/401)', await fetchRoute('/admin/profile', customerToken), 403);
  assertStatus('Customer -> Finance Route (403)', await fetchRoute('/payments/admin', customerToken), 403);

  // OWNER
  assertStatus('Owner -> Admin Route (403)', await fetchRoute('/admin/profile', ownerToken), 403);
  assertStatus('Owner -> Finance Route (403)', await fetchRoute('/payments/admin', ownerToken), 403);
  assertStatus('Owner -> Room Type Create (403)', await fetchRoute('/rooms', ownerToken, 'POST'), 403);

  // HOTEL_ADMIN
  assertStatus('Hotel Admin -> Admin Route (403)', await fetchRoute('/admin/profile', hotelAdminToken), 403);
  assertStatus('Hotel Admin -> Finance Route (403)', await fetchRoute('/payments/admin', hotelAdminToken), 403);
  assertStatus('Hotel Admin -> Room Type Create (400 - Authz passed)', await fetchRoute('/rooms', hotelAdminToken, 'POST'), 400);

  // SUPPORT_ADMIN
  assertStatus('Support Admin -> Finance Route (403)', await fetchRoute('/payments/admin', supportAdminToken), 403);

  // FINANCE_ADMIN
  assertStatus('Finance Admin -> Finance Route (200)', await fetchRoute('/payments/admin', financeAdminToken), 200);

  // SUPER_ADMIN
  assertStatus('Super Admin -> Admin Route (200)', await fetchRoute('/admin/profile', superAdminToken), 200);
  assertStatus('Super Admin -> Room Type Create (403)', await fetchRoute('/rooms', superAdminToken, 'POST'), 403);

  console.log(`\nRESULTS: ${passed} Passed, ${failed} Failed`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(console.error);
