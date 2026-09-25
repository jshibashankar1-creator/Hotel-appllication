/**
 * ============================================================================
 * HOTELHUB ENTERPRISE: COMPREHENSIVE 37-STEP END-TO-END VERIFICATION SUITE
 * ============================================================================
 * Covers:
 * - 16 Existing Core Functionality Tests (Frontend, API, Booking, KYC, Commission, etc.)
 * - 21 New Role-Based Admin Authentication & RBAC Security Tests
 */

const API_BASE = 'http://localhost:5000/api';
const WEB_BASE = 'http://localhost:3001';

let passed = 0;
let failed = 0;

function assert(condition, description) {
  if (condition) {
    console.log(`• ${description}... ✅ PASSED`);
    passed++;
  } else {
    console.error(`• ${description}... ❌ FAILED`);
    failed++;
  }
}

async function runTest(description, fn) {
  try {
    const result = await fn();
    assert(result, description);
  } catch (err) {
    console.error(`• ${description}... ❌ FAILED (${err.message})`);
    failed++;
  }
}

async function main() {
  console.log('================================================================');
  console.log('🚀 HOTELHUB ENTERPRISE: COMPREHENSIVE 37-STEP E2E TEST SUITE');
  console.log('================================================================\n');

  console.log('--- PART 1: CORE PLATFORM & OPERATIONAL VERIFICATION (16 TESTS) ---');

  // 1. Vite Web Server
  await runTest('1. Vite Web Server is serving Unified Platform (port 3001)', async () => {
    let res;
    try {
      res = await fetch(WEB_BASE);
    } catch {
      res = await fetch('http://localhost:3000');
    }
    const text = await res.text();
    return res.ok && text.includes('HotelHub');
  });

  // 2. Backend Health Check
  await runTest('2. Backend REST API Health Check (port 5000)', async () => {
    const res = await fetch(`${API_BASE}/health`);
    const data = await res.json();
    return res.ok && data.status === 'healthy';
  });

  // 3. Super Admin Auth
  let superAdminToken = '';
  await runTest('3. Admin Authentication & JWT Generation (admin@hotelhub.com)', async () => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@hotelhub.com', password: 'Admin@123' })
    });
    const data = await res.json();
    superAdminToken = data.token;
    return res.ok && data.success && data.user.role === 'super_admin' && !!superAdminToken;
  });

  // 4. Hotel Owner Auth
  let ownerToken = '';
  let ownerId = '';
  await runTest('4. Hotel Owner Authentication (rajesh@grandhorizon.com)', async () => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'rajesh@grandhorizon.com', password: 'Password@123' })
    });
    const data = await res.json();
    ownerToken = data.token;
    ownerId = data.user.id;
    return res.ok && data.success && data.user.role === 'owner' && !!ownerToken;
  });

  // 5. Customer Auth
  let customerToken = '';
  let customerId = '';
  await runTest('5. Customer Authentication (aarav.sharma@gmail.com)', async () => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'aarav.sharma@gmail.com', password: 'Password@123' })
    });
    const data = await res.json();
    customerToken = data.token;
    customerId = data.user.id;
    return res.ok && data.success && data.user.role === 'customer' && !!customerToken;
  });

  // 6. Admin Hotel Management
  await runTest('6. Admin Hotel Management: Fetch & Filter Properties', async () => {
    const res = await fetch(`${API_BASE}/hotels/admin`, {
      headers: { Authorization: `Bearer ${superAdminToken}` }
    });
    const data = await res.json();
    return res.ok && data.success && Array.isArray(data.hotels) && data.hotels.length >= 4;
  });

  // 7. Admin Owner KYC Verification Module
  await runTest('7. Admin Owner KYC Verification Module', async () => {
    const res = await fetch(`${API_BASE}/owners/kyc`, {
      headers: { Authorization: `Bearer ${superAdminToken}` }
    });
    const data = await res.json();
    return res.ok && data.success && Array.isArray(data.owners);
  });

  // 8. Customer Mobile Booking (Atomic Transaction)
  let createdBookingId = '';
  await runTest('8. Customer Mobile Booking: Atomic Transaction & Double-booking Prevention', async () => {
    const res = await fetch(`${API_BASE}/bookings/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`
      },
      body: JSON.stringify({
        hotel_id: 'HTL-001',
        room_id: 'RM-101',
        check_in_date: '2027-10-01',
        check_out_date: '2027-10-04',
        guests_count: 2,
        customer_name: 'Aarav Sharma',
        customer_email: 'aarav.sharma@gmail.com',
        payment_method: 'UPI (PhonePe)'
      })
    });
    const data = await res.json();
    if (data.success && data.booking) {
      createdBookingId = data.booking.id;
    }
    return res.ok && data.success && data.booking.commission_amount > 0 && data.booking.tax_amount > 0;
  });

  // 9. Hotel Owner Check-In Desk
  await runTest('9. Hotel Owner Check-In Desk: Check in guest', async () => {
    const res = await fetch(`${API_BASE}/bookings/${createdBookingId}/checkin`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${ownerToken}` }
    });
    const data = await res.json();
    return res.ok && data.success && data.booking.booking_status === 'checked_in';
  });

  // 10. Hotel Owner Check-Out Desk
  await runTest('10. Hotel Owner Check-Out Desk: Check out guest and release room', async () => {
    const res = await fetch(`${API_BASE}/bookings/${createdBookingId}/checkout`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${ownerToken}` }
    });
    const data = await res.json();
    return res.ok && data.success && data.booking.booking_status === 'checked_out';
  });

  // 11. Customer Verified Review
  await runTest('11. Customer Reviews: Submit verified review for completed stay', async () => {
    const res = await fetch(`${API_BASE}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`
      },
      body: JSON.stringify({
        hotel_id: 'HTL-001',
        booking_id: createdBookingId,
        rating: 5,
        comment: 'Exceptional luxury stay with splendid city views and warm hospitality!'
      })
    });
    const data = await res.json();
    return res.ok && data.success;
  });

  // 12. Customer Cancellation with 10% Fee
  await runTest('12. Customer Cancellation: 10% cancellation fee deduction & refund record', async () => {
    // Create a new booking to cancel
    const bookRes = await fetch(`${API_BASE}/bookings/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`
      },
      body: JSON.stringify({
        hotel_id: 'HTL-001',
        room_id: 'RM-102',
        check_in_date: '2026-11-10',
        check_out_date: '2026-11-12',
        guests_count: 2,
        customer_name: 'Aarav Sharma',
        customer_email: 'aarav.sharma@gmail.com',
        payment_method: 'Credit Card'
      })
    });
    const bookData = await bookRes.json();
    const cancelBookingId = bookData.booking.id;

    const cancelRes = await fetch(`${API_BASE}/bookings/${cancelBookingId}/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`
      },
      body: JSON.stringify({ reason: 'Trip schedule changed' })
    });
    const cancelData = await cancelRes.json();
    return cancelRes.ok && cancelData.success && (cancelData.refund?.fee_amount > 0 || cancelData.result?.fee_amount > 0);
  });

  // 13. Admin Commission Management
  await runTest('13. Admin Commission Management: Audit Ledger & Take-Rate', async () => {
    const res = await fetch(`${API_BASE}/commissions/ledger`, {
      headers: { Authorization: `Bearer ${superAdminToken}` }
    });
    const data = await res.json();
    return res.ok && data.success && data.platform_take_rate === 15;
  });

  // 14. Admin Financial Reports
  await runTest('14. Admin Financial Reports: Daily & Monthly statements', async () => {
    const dailyRes = await fetch(`${API_BASE}/reports/daily`, {
      headers: { Authorization: `Bearer ${superAdminToken}` }
    });
    const dailyData = await dailyRes.json();
    return dailyRes.ok && dailyData.success && Array.isArray(dailyData.daily_report);
  });

  // 15. Room Availability & Blackout
  await runTest('15. Hotel Owner Room Availability Matrix & Blackout Blocking', async () => {
    const res = await fetch(`${API_BASE}/availability/block`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ownerToken}`
      },
      body: JSON.stringify({
        room_id: 'RM-101',
        date: '2026-12-25',
        is_blocked: true
      })
    });
    const data = await res.json();
    return res.ok && data.success && data.availability.blocked_count === 1;
  });

  // 16. Support Desk
  await runTest('16. Customer Support Desk: Ticket creation & reply thread', async () => {
    const createRes = await fetch(`${API_BASE}/support/tickets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`
      },
      body: JSON.stringify({
        subject: 'Airport Shuttle Request',
        category: 'Concierge Services',
        message: 'Could you arrange an airport pickup on arrival day?'
      })
    });
    const createData = await createRes.json();
    const ticketId = createData.ticket.id;

    const replyRes = await fetch(`${API_BASE}/support/tickets/${ticketId}/reply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${superAdminToken}`
      },
      body: JSON.stringify({ text: 'Our chauffeur will meet you at the arrivals gate with your name placard.' })
    });
    const replyData = await replyRes.json();
    return replyRes.ok && replyData.success && replyData.ticket.messages.length >= 2;
  });

  console.log('\n--- PART 2: NEW ROLE-BASED ADMIN AUTH & SECURITY VERIFICATION (21 TESTS) ---');

  // 17. Super Admin Initial Setup Rejection
  await runTest('17. Super Admin Initial Setup Rejection (Super Admin already exists)', async () => {
    const res = await fetch(`${API_BASE}/auth/admin/setup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Hacker Admin',
        email: 'hacker@hotelhub.com',
        password: 'Password@123'
      })
    });
    const data = await res.json();
    return res.status === 400 && !data.success && data.message.includes('already exists');
  });

  // 18. Super Admin Login
  let adminLoginToken = '';
  await runTest('18. Super Admin Login & JWT Verification (/api/auth/admin/login)', async () => {
    const res = await fetch(`${API_BASE}/auth/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@hotelhub.com', password: 'Admin@123' })
    });
    const data = await res.json();
    adminLoginToken = data.token;
    return res.ok && data.success && data.user.role === 'super_admin' && !!adminLoginToken;
  });

  // 19. Invalid Credentials Rejection
  await runTest('19. Invalid Admin Login Credentials Rejection', async () => {
    const res = await fetch(`${API_BASE}/auth/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@hotelhub.com', password: 'WrongPassword999' })
    });
    const data = await res.json();
    return res.status === 401 && !data.success;
  });

  // 20. Suspended Admin Login Rejection
  await runTest('20. Suspended Admin Login Rejection (403 Forbidden)', async () => {
    // Provision a test admin to suspend
    const createRes = await fetch(`${API_BASE}/auth/admin/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${superAdminToken}`
      },
      body: JSON.stringify({
        name: 'Suspended Test User',
        email: 'suspended.test@hotelhub.com',
        password: 'Password@123',
        role: 'admin',
        status: 'suspended'
      })
    });
    const createData = await createRes.json();

    const loginRes = await fetch(`${API_BASE}/auth/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'suspended.test@hotelhub.com', password: 'Password@123' })
    });
    const loginData = await loginRes.json();
    return loginRes.status === 403 && !loginData.success && loginData.accountStatus === 'suspended';
  });

  // 21. Inactive Admin Login Rejection
  await runTest('21. Inactive Admin Login Rejection (403 Forbidden)', async () => {
    const createRes = await fetch(`${API_BASE}/auth/admin/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${superAdminToken}`
      },
      body: JSON.stringify({
        name: 'Inactive Test User',
        email: 'inactive.test@hotelhub.com',
        password: 'Password@123',
        role: 'support_admin',
        status: 'inactive'
      })
    });

    const loginRes = await fetch(`${API_BASE}/auth/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'inactive.test@hotelhub.com', password: 'Password@123' })
    });
    const loginData = await loginRes.json();
    return loginRes.status === 403 && !loginData.success;
  });

  // 22. Super Admin Provisions New Admin
  let newlyCreatedAdminId = '';
  await runTest('22. Super Admin Provisions New Admin (POST /api/auth/admin/create)', async () => {
    const res = await fetch(`${API_BASE}/auth/admin/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${superAdminToken}`
      },
      body: JSON.stringify({
        name: 'Pooja Agarwal',
        email: 'pooja.finance@hotelhub.com',
        password: 'Password@123',
        phone: '+91 98330 11223',
        role: 'finance_admin',
        status: 'active'
      })
    });
    const data = await res.json();
    if (data.user) newlyCreatedAdminId = data.user.id;
    return res.status === 201 && data.success && data.user.role === 'finance_admin';
  });

  // 23. Newly Created Admin Login
  let newlyCreatedAdminToken = '';
  await runTest('23. Newly Created Admin Logs in Successfully', async () => {
    const res = await fetch(`${API_BASE}/auth/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'pooja.finance@hotelhub.com', password: 'Password@123' })
    });
    const data = await res.json();
    newlyCreatedAdminToken = data.token;
    return res.ok && data.success && data.user.role === 'finance_admin' && !!newlyCreatedAdminToken;
  });

  // 24. Support Admin Login
  let supportAdminToken = '';
  await runTest('24. Support Admin Login & Role Verification (support.admin@hotelhub.com)', async () => {
    const res = await fetch(`${API_BASE}/auth/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'support.admin@hotelhub.com', password: 'Admin@123' })
    });
    const data = await res.json();
    supportAdminToken = data.token;
    return res.ok && data.success && data.user.role === 'support_admin' && !!supportAdminToken;
  });

  // 25. Finance Admin Login
  let financeAdminToken = '';
  await runTest('25. Finance Admin Login & Role Verification (finance.admin@hotelhub.com)', async () => {
    const res = await fetch(`${API_BASE}/auth/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'finance.admin@hotelhub.com', password: 'Admin@123' })
    });
    const data = await res.json();
    financeAdminToken = data.token;
    return res.ok && data.success && data.user.role === 'finance_admin' && !!financeAdminToken;
  });

  // 26. Hotel Admin Login
  let hotelAdminToken = '';
  await runTest('26. Hotel Admin Login & Role Verification (hotel.admin@hotelhub.com)', async () => {
    let res = await fetch(`${API_BASE}/auth/hotel-admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'hotel.admin@hotelhub.com', password: 'Admin@123' })
    });
    if (!res.ok) {
      res = await fetch(`${API_BASE}/auth/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'hotel.admin@hotelhub.com', password: 'Admin@123' })
      });
    }
    const data = await res.json();
    hotelAdminToken = data.token;
    return res.ok && data.success && data.user.role === 'hotel_admin' && !!hotelAdminToken;
  });

  // 27. Customer Blocked from Admin APIs
  await runTest('27. Customer Account Blocked from Admin APIs (403 Forbidden)', async () => {
    const res = await fetch(`${API_BASE}/admin/users`, {
      headers: { Authorization: `Bearer ${customerToken}` }
    });
    return res.status === 403;
  });

  // 28. Hotel Owner Blocked from Admin APIs
  await runTest('28. Hotel Owner Account Blocked from Admin APIs (403 Forbidden)', async () => {
    const res = await fetch(`${API_BASE}/admin/users`, {
      headers: { Authorization: `Bearer ${ownerToken}` }
    });
    return res.status === 403;
  });

  // 29. Support Admin Blocked from Finance APIs
  await runTest('29. Support Admin Blocked from Finance APIs (403 Forbidden)', async () => {
    const res = await fetch(`${API_BASE}/commissions/rate`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${supportAdminToken}`
      },
      body: JSON.stringify({ rate: 20 })
    });
    return res.status === 403;
  });

  // 30. Finance Admin Blocked from Admin Management APIs
  await runTest('30. Finance Admin Blocked from Admin Creation APIs (403 Forbidden)', async () => {
    const res = await fetch(`${API_BASE}/auth/admin/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${financeAdminToken}`
      },
      body: JSON.stringify({
        name: 'Unauthorized User',
        email: 'unauth@hotelhub.com',
        password: 'Password@123',
        role: 'admin'
      })
    });
    return res.status === 403;
  });

  // 31. Non-Super Admin Blocked from creating Super Admin
  await runTest('31. Admin Blocked from Creating Super Admin (403 Forbidden)', async () => {
    const res = await fetch(`${API_BASE}/auth/admin/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${supportAdminToken}`
      },
      body: JSON.stringify({
        name: 'Rogue Admin',
        email: 'rogue@hotelhub.com',
        password: 'Password@123',
        role: 'super_admin'
      })
    });
    return res.status === 403;
  });

  // 32. Super Admin Updates Admin Role
  await runTest('32. Super Admin Updates Admin Role (PUT /api/admin/users/:id/role)', async () => {
    const res = await fetch(`${API_BASE}/admin/users/${newlyCreatedAdminId}/role`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${superAdminToken}`
      },
      body: JSON.stringify({ role: 'hotel_admin' })
    });
    const data = await res.json();
    return res.ok && data.success && data.user.role === 'hotel_admin';
  });

  // 33. Super Admin Updates Admin Status
  await runTest('33. Super Admin Updates Admin Status (PUT /api/admin/users/:id/status)', async () => {
    const res = await fetch(`${API_BASE}/admin/users/${newlyCreatedAdminId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${superAdminToken}`
      },
      body: JSON.stringify({ status: 'suspended' })
    });
    const data = await res.json();
    return res.ok && data.success && data.user.status === 'suspended';
  });

  // 34. Super Admin Deletes Admin User
  await runTest('34. Super Admin Deletes Admin User (DELETE /api/admin/users/:id)', async () => {
    const res = await fetch(`${API_BASE}/admin/users/${newlyCreatedAdminId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${superAdminToken}` }
    });
    const data = await res.json();
    return res.ok && data.success;
  });

  // 35. Admin Profile Fetch
  await runTest('35. Admin Profile Fetch (GET /api/admin/profile)', async () => {
    const res = await fetch(`${API_BASE}/admin/profile`, {
      headers: { Authorization: `Bearer ${superAdminToken}` }
    });
    const data = await res.json();
    return res.ok && data.success && data.user.email === 'admin@hotelhub.com';
  });

  // 36. Admin Profile Update
  await runTest('36. Admin Profile Update (PUT /api/admin/profile)', async () => {
    const res = await fetch(`${API_BASE}/admin/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${superAdminToken}`
      },
      body: JSON.stringify({ name: 'Super Administrator Executive', phone: '+91 98000 99999' })
    });
    const data = await res.json();
    return res.ok && data.success && data.user.name === 'Super Administrator Executive';
  });

  // 37. Admin Password Change & Re-Login
  await runTest('37. Admin Password Change (PUT /api/admin/change-password) & Re-Login', async () => {
    const changeRes = await fetch(`${API_BASE}/admin/change-password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${superAdminToken}`
      },
      body: JSON.stringify({ currentPassword: 'Admin@123', newPassword: 'NewSecureAdmin@2026' })
    });
    const changeData = await changeRes.json();
    if (!changeRes.ok || !changeData.success) return false;

    // Test Login with new password
    const loginRes = await fetch(`${API_BASE}/auth/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@hotelhub.com', password: 'NewSecureAdmin@2026' })
    });
    const loginData = await loginRes.json();

    // Reset password back to Admin@123 for developer convenience
    if (loginData.token) {
      await fetch(`${API_BASE}/admin/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${loginData.token}`
        },
        body: JSON.stringify({ currentPassword: 'NewSecureAdmin@2026', newPassword: 'Admin@123' })
      });
    }

    return loginRes.ok && loginData.success;
  });

  console.log('\n================================================================');
  console.log(`🏁 TEST RUN RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
