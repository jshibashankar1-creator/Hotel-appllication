import fetch from 'node-fetch';

const BASE_URL = 'http://127.0.0.1:5000/api';

async function runTests() {
  console.log('================================================================');
  console.log('HOTELHUB ENTERPRISE — FREE PICKUP QA TEST SUITE');
  console.log('================================================================');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
      failed++;
    }
  }

  // 1. Authenticate Customer
  console.log('\n--- 1. Authenticating Customer ---');
  const authRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'aarav.sharma@gmail.com', password: 'Password@123' })
  });
  const authData = await authRes.json();
  assert(authData.success && authData.token, 'Customer login successful');
  const customerToken = authData.token;

  // 2. Fetch Active Hotels and Rooms
  console.log('\n--- 2. Fetching Hotel & Room Details ---');
  const hotelsRes = await fetch(`${BASE_URL}/hotels`);
  const hotelsData = await hotelsRes.json();
  const hotel = hotelsData.hotels && hotelsData.hotels[0];
  assert(hotel && hotel.id, `Found active hotel: ${hotel?.name} (${hotel?.id})`);

  const roomsRes = await fetch(`${BASE_URL}/hotels/${hotel.id}`);
  const hotelDetailData = await roomsRes.json();
  const room = hotelDetailData.hotel && hotelDetailData.hotel.rooms && hotelDetailData.hotel.rooms[0];
  assert(room && room.id, `Found active room: ${room?.room_name} (${room?.id}) @ ₹${room?.price_per_night}/night`);

  const checkInDate = '2026-09-01';
  const checkOutDate = '2026-09-04'; // 3 nights
  const nights = 3;
  const baseAmount = room.price_per_night * nights;
  const taxAmount = Math.round(baseAmount * 0.12);
  const expectedTotal = baseAmount + taxAmount;

  // 3. Test NOT PICKUP Booking Flow
  console.log('\n--- 3. Testing NOT PICKUP Booking Flow ---');
  const noPickupPayload = {
    hotel_id: hotel.id,
    room_id: room.id,
    check_in_date: checkInDate,
    check_out_date: checkOutDate,
    guests_count: 2,
    customer_name: 'Aarav Sharma',
    customer_email: 'aarav.sharma@gmail.com',
    customer_phone: '+91 98200 11928',
    payment_method: 'razorpay',
    pickup: {
      required: false,
      pickup_required: false,
      pickup_charge: 0,
      service: 'NOT_REQUIRED'
    }
  };

  const noPickupBookingRes = await fetch(`${BASE_URL}/bookings/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${customerToken}`
    },
    body: JSON.stringify(noPickupPayload)
  });
  const noPickupBookingData = await noPickupBookingRes.json();
  assert(noPickupBookingData.success, 'NOT PICKUP booking created successfully');
  const bkg1 = noPickupBookingData.booking;
  assert(bkg1.pickup.required === false, 'bkg1.pickup.required === false');
  assert(bkg1.pickup.pickup_charge === 0, 'bkg1.pickup.pickup_charge === 0');
  assert(bkg1.total_amount === expectedTotal, `bkg1.total_amount (₹${bkg1.total_amount}) == expected (₹${expectedTotal})`);

  // 4. Test FREE PICKUP Booking Flow
  console.log('\n--- 4. Testing FREE PICKUP Booking Flow ---');
  const freePickupPayload = {
    hotel_id: hotel.id,
    room_id: room.id,
    check_in_date: '2026-09-05',
    check_out_date: '2026-09-08',
    guests_count: 2,
    customer_name: 'Aarav Sharma',
    customer_email: 'aarav.sharma@gmail.com',
    customer_phone: '+91 98200 11928',
    payment_method: 'razorpay',
    pickup: {
      required: true,
      pickup_required: true,
      pickup_charge: 0,
      pickup_service: 'FREE',
      service: 'FREE',
      location_name: 'Station to Hotel',
      pickup_date: '2026-09-05',
      pickup_time: '10:30 AM'
    }
  };

  const freePickupBookingRes = await fetch(`${BASE_URL}/bookings/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${customerToken}`
    },
    body: JSON.stringify(freePickupPayload)
  });
  const freePickupBookingData = await freePickupBookingRes.json();
  assert(freePickupBookingData.success, 'FREE PICKUP booking created successfully');
  const bkg2 = freePickupBookingData.booking;
  assert(bkg2.pickup.required === true, 'bkg2.pickup.required === true');
  assert(bkg2.pickup.pickup_charge === 0, 'bkg2.pickup.pickup_charge === 0');
  assert(bkg2.pickup.service === 'FREE' || bkg2.pickup.pickup_service === 'FREE', 'bkg2.pickup.service === "FREE"');
  assert(bkg2.total_amount === expectedTotal, `bkg2.total_amount (₹${bkg2.total_amount}) == expected (₹${expectedTotal})`);

  // 5. Compare Totals
  console.log('\n--- 5. Comparing Totals (NOT PICKUP vs PICKUP) ---');
  assert(bkg1.total_amount === bkg2.total_amount, `NOT PICKUP total (₹${bkg1.total_amount}) == PICKUP total (₹${bkg2.total_amount})`);

  // 6. Test Razorpay Order Creation with FREE Pickup
  console.log('\n--- 6. Testing Razorpay Order Creation with FREE Pickup ---');
  const rzpOrderRes = await fetch(`${BASE_URL}/payments/create-order`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${customerToken}`
    },
    body: JSON.stringify({
      hotel_id: hotel.id,
      room_id: room.id,
      check_in_date: '2026-09-10',
      check_out_date: '2026-09-13',
      guests_count: 2,
      pickup: {
        required: true,
        pickup_required: true,
        pickup_charge: 0,
        pickup_service: 'FREE'
      }
    })
  });
  const rzpOrderData = await rzpOrderRes.json();
  assert(rzpOrderData.success, `Razorpay order created: ${rzpOrderData.order_id}`);
  assert(rzpOrderData.amount === expectedTotal, `Order amount (₹${rzpOrderData.amount}) == expected room+tax total (₹${expectedTotal})`);

  // 7. Test Anti-Tampering: Client attempts to send ₹1200 pickup charge
  console.log('\n--- 7. Testing Anti-Tampering (Client passes unauthorized ₹1200 pickup charge) ---');
  const tamperOrderRes = await fetch(`${BASE_URL}/payments/create-order`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${customerToken}`
    },
    body: JSON.stringify({
      hotel_id: hotel.id,
      room_id: room.id,
      check_in_date: '2026-09-15',
      check_out_date: '2026-09-18',
      guests_count: 2,
      pickup: {
        required: true,
        pickup_charge: 1200 // Attempted charge manipulation
      }
    })
  });
  const tamperOrderData = await tamperOrderRes.json();
  assert(tamperOrderData.success, 'Server handled order creation with pickup');
  assert(tamperOrderData.amount === expectedTotal, `Tampered pickup charge overridden: order amount is strictly room+tax ₹${tamperOrderData.amount} (NOT ₹${expectedTotal + 1200})`);

  // 8. Test My Bookings Retrieval
  console.log('\n--- 8. Testing My Bookings Retrieval ---');
  const myBookingsRes = await fetch(`${BASE_URL}/bookings/my`, {
    headers: { 'Authorization': `Bearer ${customerToken}` }
  });
  const myBookingsData = await myBookingsRes.json();
  assert(myBookingsData.success && Array.isArray(myBookingsData.bookings), 'My Bookings fetched successfully');
  const retrievedBkg2 = myBookingsData.bookings.find(b => b.id === bkg2.id);
  assert(retrievedBkg2 && retrievedBkg2.pickup && retrievedBkg2.pickup.required === true, 'Saved FREE pickup preference retrieved in customer bookings');

  // 9. Test Hotel Admin & Super Admin Pickups List
  console.log('\n--- 9. Testing Super Admin & Hotel Admin Pickups View ---');
  const adminAuthRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@hotelhub.com', password: 'Admin@123456' })
  });
  const adminAuthData = await adminAuthRes.json();
  const adminToken = adminAuthData.token;

  const adminPickupsRes = await fetch(`${BASE_URL}/pickups`, {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  const adminPickupsData = await adminPickupsRes.json();
  assert(adminPickupsData.success, 'Admin pickups API responded successfully');
  const adminFound = (adminPickupsData.pickups || []).find(p => p.booking_id === bkg2.id || p.id === bkg2.id);
  assert(adminFound !== undefined, `Admin pickups list contains booking ${bkg2.id}`);

  console.log('\n================================================================');
  console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
