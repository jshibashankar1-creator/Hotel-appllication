/**
 * ============================================================================
 * HOTELHUB ENTERPRISE: COMPREHENSIVE SEPARATE ADMIN & HOTEL ADMIN SUITE
 * ============================================================================
 */

const API_BASE = 'http://localhost:5000/api';
const WEB_BASE = 'http://localhost:3001';

const categories = {
  login: { name: 'ADMIN & HOTEL ADMIN LOGIN', total: 0, passed: 0, failed: 0 },
  crossRole: { name: 'CROSS-ROLE ACCESS REJECTION', total: 0, passed: 0, failed: 0 },
  isolation: { name: 'MULTI-HOTEL DATA ISOLATION', total: 0, passed: 0, failed: 0 },
  dashboards: { name: 'DASHBOARDS & KPIS', total: 0, passed: 0, failed: 0 },
  security: { name: 'SECURITY & RBAC', total: 0, passed: 0, failed: 0 }
};

let globalPassed = 0;
let globalFailed = 0;

async function recordTest(categoryKey, description, fn) {
  categories[categoryKey].total++;
  try {
    const result = await fn();
    if (result) {
      console.log(`  ✅ [PASS] ${description}`);
      categories[categoryKey].passed++;
      globalPassed++;
    } else {
      console.error(`  ❌ [FAIL] ${description}`);
      categories[categoryKey].failed++;
      globalFailed++;
    }
  } catch (err) {
    console.error(`  ❌ [FAIL] ${description} — (${err.message})`);
    categories[categoryKey].failed++;
    globalFailed++;
  }
}

async function runSuite() {
  console.log('================================================================');
  console.log('🚀 HOTELHUB SEPARATE ADMIN & HOTEL ADMIN VERIFICATION SUITE');
  console.log('================================================================\n');

  // ============================================================================
  // PART 1 — SEPARATE LOGIN TESTS
  // ============================================================================
  console.log('--- PART 1: SEPARATE ADMIN & HOTEL ADMIN AUTHENTICATION ---');

  let superAdminToken = '';
  let hotelAdminToken = '';
  let hotelAdminAToken = '';
  let hotelAdminBToken = '';
  let customerToken = '';

  // TEST 1 — Admin Login (admin@hotelhub.com)
  await recordTest('login', 'TEST 1 — Super Admin logs in via /api/auth/admin/login -> #/admin/dashboard', async () => {
    const res = await fetch(`${API_BASE}/auth/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@hotelhub.com', password: 'Admin@123' })
    });
    const data = await res.json();
    if (data.token) superAdminToken = data.token;
    return res.ok && data.success && data.user.role === 'super_admin' && data.redirectUrl.includes('admin/dashboard');
  });

  // TEST 2 — Hotel Admin Login (hoteladmin@hotelhub.com)
  await recordTest('login', 'TEST 2 — Hotel Admin logs in via /api/auth/hotel-admin/login -> #/hotel-admin/dashboard', async () => {
    const res = await fetch(`${API_BASE}/auth/hotel-admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'hoteladmin@hotelhub.com', password: 'HotelAdmin@123456' })
    });
    const data = await res.json();
    if (data.token) hotelAdminToken = data.token;
    return res.ok && data.success && data.user.role === 'hotel_admin' && data.redirectUrl.includes('hotel-admin/dashboard');
  });

  // Customer Login
  const custRes = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'aarav.sharma@gmail.com', password: 'Password@123' })
  });
  const custData = await custRes.json();
  customerToken = custData.token;

  // ============================================================================
  // PART 2 — CROSS-ROLE REJECTION MATRIX
  // ============================================================================
  console.log('\n--- PART 2: STRICT CROSS-ROLE LOGIN REJECTION ---');

  // TEST 3 — Admin credentials at Hotel Admin Login rejected (403)
  await recordTest('crossRole', 'TEST 3 — Admin credentials rejected at /api/auth/hotel-admin/login (403 Forbidden)', async () => {
    const res = await fetch(`${API_BASE}/auth/hotel-admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@hotelhub.com', password: 'Admin@123' })
    });
    const data = await res.json();
    return res.status === 403 && !data.success && data.message.includes('Hotel Admin access');
  });

  // TEST 4 — Hotel Admin credentials at Admin Login rejected (403)
  await recordTest('crossRole', 'TEST 4 — Hotel Admin credentials rejected at /api/auth/admin/login (403 Forbidden)', async () => {
    const res = await fetch(`${API_BASE}/auth/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'hoteladmin@hotelhub.com', password: 'HotelAdmin@123456' })
    });
    const data = await res.json();
    return res.status === 403 && !data.success && data.message.includes('Admin access');
  });

  // TEST 5 — Customer at Admin Login rejected (403)
  await recordTest('crossRole', 'TEST 5 — Customer credentials rejected at /api/auth/admin/login (403 Forbidden)', async () => {
    const res = await fetch(`${API_BASE}/auth/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'aarav.sharma@gmail.com', password: 'Password@123' })
    });
    return res.status === 403;
  });

  // TEST 6 — Customer at Hotel Admin Login rejected (403)
  await recordTest('crossRole', 'TEST 6 — Customer credentials rejected at /api/auth/hotel-admin/login (403 Forbidden)', async () => {
    const res = await fetch(`${API_BASE}/auth/hotel-admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'aarav.sharma@gmail.com', password: 'Password@123' })
    });
    return res.status === 403;
  });

  // TEST 7 — Hotel Admin blocked from Admin Users API (403)
  await recordTest('crossRole', 'TEST 7 — Hotel Admin JWT blocked from GET /api/admin/users (403 Forbidden)', async () => {
    const res = await fetch(`${API_BASE}/admin/users`, {
      headers: { Authorization: `Bearer ${hotelAdminToken}` }
    });
    return res.status === 403;
  });

  // TEST 8 — Admin blocked from Hotel Admin Check-In desk without hotel context
  await recordTest('crossRole', 'TEST 8 — Super Admin JWT blocked from Hotel Admin scoped desk /api/hotel-admin/check-in', async () => {
    const res = await fetch(`${API_BASE}/hotel-admin/check-in`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${superAdminToken}`
      },
      body: JSON.stringify({ bookingId: 'BKG-001' })
    });
    return res.status === 403;
  });

  // ============================================================================
  // PART 3 — DASHBOARDS & KPIS
  // ============================================================================
  console.log('\n--- PART 3: DASHBOARD METRICS & KPI VERIFICATION ---');

  // TEST 9 — Admin KPI endpoint GET /api/admin/kpis
  await recordTest('dashboards', 'TEST 9 — Admin KPI endpoint /api/admin/kpis returns valid platform totals', async () => {
    const res = await fetch(`${API_BASE}/admin/kpis`, {
      headers: { Authorization: `Bearer ${superAdminToken}` }
    });
    const data = await res.json();
    return res.ok && data.success && data.kpis.total_hotels >= 2 && data.data.totalHotels >= 2;
  });

  // TEST 10 — Hotel Admin Dashboard endpoint GET /api/hotel-admin/dashboard
  await recordTest('dashboards', 'TEST 10 — Hotel Admin Dashboard endpoint /api/hotel-admin/dashboard returns hotel scoped metrics', async () => {
    const res = await fetch(`${API_BASE}/hotel-admin/dashboard`, {
      headers: { Authorization: `Bearer ${hotelAdminToken}` }
    });
    const data = await res.json();
    return res.ok && data.success && data.hotel && data.kpis && data.kpis.total_rooms > 0;
  });

  // ============================================================================
  // PART 4 — MULTI-HOTEL DATA ISOLATION
  // ============================================================================
  console.log('\n--- PART 4: MULTI-HOTEL DATA ISOLATION (HOTEL A vs HOTEL B) ---');

  // Login Admin A (HTL-001)
  const resA = await fetch(`${API_BASE}/auth/hotel-admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'hoteladminA@hotelhub.com', password: 'HotelAdmin@123456' })
  });
  const dataA = await resA.json();
  hotelAdminAToken = dataA.token;

  // Login Admin B (HTL-002)
  const resB = await fetch(`${API_BASE}/auth/hotel-admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'hoteladminB@hotelhub.com', password: 'HotelAdmin@123456' })
  });
  const dataB = await resB.json();
  hotelAdminBToken = dataB.token;

  // TEST 11 — Hotel Admin A receives only Hotel A (HTL-001)
  await recordTest('isolation', 'TEST 11 — Hotel Admin A receives only Hotel A (HTL-001) info', async () => {
    const res = await fetch(`${API_BASE}/hotel-admin/hotel`, {
      headers: { Authorization: `Bearer ${hotelAdminAToken}` }
    });
    const data = await res.json();
    return res.ok && data.success && data.hotel.id === 'HTL-001';
  });

  // TEST 12 — Hotel Admin B receives only Hotel B (HTL-002)
  await recordTest('isolation', 'TEST 12 — Hotel Admin B receives only Hotel B (HTL-002) info', async () => {
    const res = await fetch(`${API_BASE}/hotel-admin/hotel`, {
      headers: { Authorization: `Bearer ${hotelAdminBToken}` }
    });
    const data = await res.json();
    return res.ok && data.success && data.hotel.id === 'HTL-002';
  });

  // TEST 13 — Hotel Admin A rooms contain only HTL-001 rooms
  await recordTest('isolation', 'TEST 13 — Hotel Admin A rooms strictly filtered to HTL-001', async () => {
    const res = await fetch(`${API_BASE}/hotel-admin/rooms`, {
      headers: { Authorization: `Bearer ${hotelAdminAToken}` }
    });
    const data = await res.json();
    return res.ok && data.rooms.every(r => r.hotel_id === 'HTL-001');
  });

  // TEST 14 — Hotel Admin B rooms contain only HTL-002 rooms
  await recordTest('isolation', 'TEST 14 — Hotel Admin B rooms strictly filtered to HTL-002', async () => {
    const res = await fetch(`${API_BASE}/hotel-admin/rooms`, {
      headers: { Authorization: `Bearer ${hotelAdminBToken}` }
    });
    const data = await res.json();
    return res.ok && data.rooms.every(r => r.hotel_id === 'HTL-002');
  });

  // TEST 15 — Hotel Admin A bookings contain only HTL-001 bookings
  await recordTest('isolation', 'TEST 15 — Hotel Admin A bookings strictly isolated to HTL-001', async () => {
    const res = await fetch(`${API_BASE}/hotel-admin/bookings`, {
      headers: { Authorization: `Bearer ${hotelAdminAToken}` }
    });
    const data = await res.json();
    return res.ok && data.bookings.every(b => b.hotel_id === 'HTL-001');
  });

  // TEST 16 — Hotel Admin B bookings contain only HTL-002 bookings
  await recordTest('isolation', 'TEST 16 — Hotel Admin B bookings strictly isolated to HTL-002', async () => {
    const res = await fetch(`${API_BASE}/hotel-admin/bookings`, {
      headers: { Authorization: `Bearer ${hotelAdminBToken}` }
    });
    const data = await res.json();
    return res.ok && data.bookings.every(b => b.hotel_id === 'HTL-002');
  });

  // TEST 17 — Super Admin has global visibility over all hotels
  await recordTest('security', 'TEST 17 — Super Admin can view all hotels (HTL-001 & HTL-002)', async () => {
    const res = await fetch(`${API_BASE}/admin/hotels`, {
      headers: { Authorization: `Bearer ${superAdminToken}` }
    });
    const data = await res.json();
    const hotelIds = data.hotels.map(h => h.id);
    return res.ok && hotelIds.includes('HTL-001') && hotelIds.includes('HTL-002');
  });

  // ============================================================================
  // FINAL TEST REPORT
  // ============================================================================
  console.log('\n================================================================');
  console.log('📊 FINAL TEST REPORT');
  console.log('================================================================');

  for (const [k, v] of Object.entries(categories)) {
    console.log(`${v.name}:`);
    console.log(`  Tests: ${v.total}`);
    console.log(`  Passed: ${v.passed}`);
    console.log(`  Failed: ${v.failed}\n`);
  }

  console.log('----------------------------------------------------------------');
  console.log(`TOTAL:\n  Passed: ${globalPassed}\n  Failed: ${globalFailed}`);
  console.log('================================================================\n');

  if (globalFailed > 0) {
    process.exit(1);
  }
}

runSuite().catch(err => {
  console.error('Fatal suite runner error:', err);
  process.exit(1);
});
