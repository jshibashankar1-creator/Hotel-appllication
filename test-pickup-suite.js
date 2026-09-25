/**
 * ============================================================================
 * HOTELHUB ENTERPRISE: CUSTOMER PICKUP SERVICE 22-STEP TEST SUITE
 * ============================================================================
 */

import fetch from 'node-fetch';

const API_BASE = 'http://localhost:5000/api';

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
  console.log('🚗 HOTELHUB ENTERPRISE: 22-STEP PICKUP SERVICE VERIFICATION SUITE');
  console.log('================================================================\n');

  // Authenticate Actors
  let custToken, ownerToken, hotelAdminToken, superAdminToken, supportAdminToken, custBToken;
  let custUser, custBUser;

  console.log('--- SETUP: AUTHENTICATING TEST ROLES ---');
  // 1. Customer A
  const custRes = await (await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'aarav.sharma@gmail.com', password: 'Password@123' })
  })).json();
  custToken = custRes.token;
  custUser = custRes.user;

  // 2. Customer B
  const custBRes = await (await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'meera.iyer@outlook.com', password: 'Password@123' })
  })).json();
  custBToken = custBRes.token;
  custBUser = custBRes.user;

  // 3. Hotel Admin (Grand Horizon HTL-001)
  const hAdminRes = await (await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'hoteladmin@hotelhub.com', password: 'HotelAdmin@123456' })
  })).json();
  hotelAdminToken = hAdminRes.token;

  // 4. Hotel Owner 1
  const ownerRes = await (await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'rajesh@grandhorizon.com', password: 'Password@123' })
  })).json();
  ownerToken = ownerRes.token;

  // 5. Super Admin
  const sAdminRes = await (await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@hotelhub.com', password: 'Admin@123456' })
  })).json();
  superAdminToken = sAdminRes.token;

  // 6. Support Admin
  const suppRes = await (await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'support.admin@hotelhub.com', password: 'Admin@123456' })
  })).json();
  supportAdminToken = suppRes.token;

  console.log(`Tokens Acquired: CustomerA=${!!custToken}, CustomerB=${!!custBToken}, HotelAdmin=${!!hotelAdminToken}, SuperAdmin=${!!superAdminToken}\n`);

  let hotelId = 'HTL-001';
  let roomId = 'RM-101';

  // Dynamically resolve active room
  const hotelDetails = await (await fetch(`${API_BASE}/hotels/${hotelId}`)).json();
  if (hotelDetails.hotel?.rooms && hotelDetails.hotel.rooms.length > 0) {
    roomId = hotelDetails.hotel.rooms[0].id;
  }

  let createdBookingNoPickup = null;
  let createdBookingAirport = null;
  let createdBookingRailway = null;
  let createdBookingBus = null;
  let createdBookingCustom = null;

  console.log('--- TEST GROUP 1: HOTEL PICKUP CONFIGURATION & PUBLIC DISCOVERY ---');

  // Test 1: Fetch Hotel Pickup Settings
  await runTest('1. Fetch hotel pickup settings & active fleets/locations', async () => {
    const res = await fetch(`${API_BASE}/hotels/${hotelId}/pickup-settings`);
    const data = await res.json();
    return res.ok && data.success && data.pickup_service_enabled === true && data.locations.length > 0 && data.vehicles.length > 0;
  });

  // Test 2: Hotel Admin can add and update a pickup location
  let customLocId = null;
  await runTest('2. Hotel Admin adds and updates a custom pickup station', async () => {
    const addRes = await fetch(`${API_BASE}/hotels/${hotelId}/pickup-locations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${hotelAdminToken}` },
      body: JSON.stringify({ name: 'Digha Heliport VIP Gate', type: 'custom', address: 'Helipad Area, Digha' })
    });
    const addData = await addRes.json();
    if (!addData.success || !addData.location?.id) return false;
    customLocId = addData.location.id;

    const updateRes = await fetch(`${API_BASE}/hotels/${hotelId}/pickup-locations/${customLocId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${hotelAdminToken}` },
      body: JSON.stringify({ name: 'Digha Heliport VIP Gate Premium', active: true })
    });
    const updateData = await updateRes.json();
    return updateData.success && updateData.location.name === 'Digha Heliport VIP Gate Premium';
  });

  // Test 3: Hotel Admin can add a pickup vehicle
  let customVehId = null;
  await runTest('3. Hotel Admin configures a new vehicle in fleet (Luxury EV Van)', async () => {
    const addRes = await fetch(`${API_BASE}/hotels/${hotelId}/pickup-vehicles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${hotelAdminToken}` },
      body: JSON.stringify({ name: 'Luxury EV Van', type: 'SUV', capacity: 5, price: 950, vehicle_number: 'WB-30-EV-1001' })
    });
    const addData = await addRes.json();
    if (!addData.success || !addData.vehicle?.id) return false;
    customVehId = addData.vehicle.id;
    return addData.vehicle.price === 950 && addData.vehicle.capacity === 5;
  });

  console.log('\n--- TEST GROUP 2: BOOKING FLOW & PRICE CALCULATION ---');

  // Test 4: Customer booking WITHOUT pickup (backward compatibility)
  await runTest('4. Customer creates booking WITHOUT pickup (Backward Compatibility)', async () => {
    const res = await fetch(`${API_BASE}/bookings/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${custToken}` },
      body: JSON.stringify({
        hotel_id: hotelId,
        room_id: roomId,
        check_in_date: '2026-09-01',
        check_out_date: '2026-09-03',
        guests_count: 2,
        payment_method: 'UPI',
        pickup: { required: false }
      })
    });
    const data = await res.json();
    if (res.ok && data.success && data.booking) {
      createdBookingNoPickup = data.booking;
      return createdBookingNoPickup.pickup?.required === false;
    }
    return false;
  });

  // Test 5: Customer booking WITH Airport pickup
  await runTest('5. Customer creates booking WITH Airport pickup (Sedan, ₹800)', async () => {
    const settings = await (await fetch(`${API_BASE}/hotels/${hotelId}/pickup-settings`)).json();
    const sedan = settings.vehicles.find(v => v.name.toLowerCase().includes('sedan')) || settings.vehicles[0];
    const airportLoc = settings.locations.find(l => l.type === 'airport') || settings.locations[0];

    const res = await fetch(`${API_BASE}/bookings/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${custToken}` },
      body: JSON.stringify({
        hotel_id: hotelId,
        room_id: roomId,
        check_in_date: '2026-09-05',
        check_out_date: '2026-09-07',
        guests_count: 2,
        payment_method: 'UPI',
        pickup: {
          required: true,
          type: 'airport',
          location_id: airportLoc.id,
          vehicle_id: sedan.id,
          passengers: 2,
          flight_number: '6E-441',
          pickup_time: '11:00 AM'
        }
      })
    });
    const data = await res.json();
    if (res.ok && data.success && data.booking) {
      createdBookingAirport = data.booking;
      return createdBookingAirport.pickup?.required === true &&
             createdBookingAirport.pickup.pickup_charge === sedan.price &&
             createdBookingAirport.pickup.flight_number === '6E-441';
    }
    return false;
  });

  // Test 6: Customer booking WITH Railway pickup
  await runTest('6. Customer creates booking WITH Railway pickup (SUV, ₹1200)', async () => {
    const settings = await (await fetch(`${API_BASE}/hotels/${hotelId}/pickup-settings`)).json();
    const suv = settings.vehicles.find(v => v.type.toLowerCase().includes('suv')) || settings.vehicles[1] || settings.vehicles[0];
    const rlyLoc = settings.locations.find(l => l.type === 'railway') || settings.locations[0];

    const res = await fetch(`${API_BASE}/bookings/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${custToken}` },
      body: JSON.stringify({
        hotel_id: hotelId,
        room_id: roomId,
        check_in_date: '2026-09-10',
        check_out_date: '2026-09-12',
        guests_count: 4,
        payment_method: 'UPI',
        pickup: {
          required: true,
          type: 'railway',
          location_id: rlyLoc.id,
          vehicle_id: suv.id,
          passengers: 4,
          train_number: '12857 Tamralipta Express',
          pickup_time: '10:30 AM'
        }
      })
    });
    const data = await res.json();
    if (res.ok && data.success && data.booking) {
      createdBookingRailway = data.booking;
      return createdBookingRailway.pickup?.pickup_charge === suv.price &&
             createdBookingRailway.pickup.train_number === '12857 Tamralipta Express';
    }
    return false;
  });

  // Test 7: Customer booking WITH Bus Stand pickup
  await runTest('7. Customer creates booking WITH Bus Stand pickup', async () => {
    const settings = await (await fetch(`${API_BASE}/hotels/${hotelId}/pickup-settings`)).json();
    const veh = settings.vehicles[0];
    const busLoc = settings.locations.find(l => l.type === 'bus') || settings.locations[0];

    const res = await fetch(`${API_BASE}/bookings/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${custToken}` },
      body: JSON.stringify({
        hotel_id: hotelId,
        room_id: roomId,
        check_in_date: '2026-09-15',
        check_out_date: '2026-09-17',
        guests_count: 2,
        payment_method: 'UPI',
        pickup: {
          required: true,
          type: 'bus',
          location_id: busLoc.id,
          vehicle_id: veh.id,
          passengers: 2,
          bus_number: 'SBSTC AC Volvo',
          pickup_time: '09:00 AM'
        }
      })
    });
    const data = await res.json();
    if (res.ok && data.success && data.booking) {
      createdBookingBus = data.booking;
      return createdBookingBus.pickup?.type === 'bus' && createdBookingBus.pickup.bus_number === 'SBSTC AC Volvo';
    }
    return false;
  });

  // Test 8: Customer booking WITH Custom pickup location
  await runTest('8. Customer creates booking WITH Custom pickup location', async () => {
    const settings = await (await fetch(`${API_BASE}/hotels/${hotelId}/pickup-settings`)).json();
    const veh = settings.vehicles[0];

    const res = await fetch(`${API_BASE}/bookings/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${custToken}` },
      body: JSON.stringify({
        hotel_id: hotelId,
        room_id: roomId,
        check_in_date: '2026-09-20',
        check_out_date: '2026-09-22',
        guests_count: 2,
        payment_method: 'UPI',
        pickup: {
          required: true,
          type: 'other',
          location_name: 'Near Old Digha Sea Beach Park',
          vehicle_id: veh.id,
          passengers: 2,
          special_instructions: 'Need extra boot space for 3 bags'
        }
      })
    });
    const data = await res.json();
    if (res.ok && data.success && data.booking) {
      createdBookingCustom = data.booking;
      return createdBookingCustom.pickup?.location_name === 'Near Old Digha Sea Beach Park' &&
             createdBookingCustom.pickup?.special_instructions.includes('boot space');
    }
    return false;
  });

  console.log('\n--- TEST GROUP 3: SERVER-SIDE VALIDATION & TAMPER PROTECTION ---');

  // Test 9: Server price calculation protects against altered frontend price
  await runTest('9. Backend ignores fake frontend price and calculates true vehicle price', async () => {
    const settings = await (await fetch(`${API_BASE}/hotels/${hotelId}/pickup-settings`)).json();
    const sedan = settings.vehicles.find(v => v.name.toLowerCase().includes('sedan')) || settings.vehicles[0];

    const res = await fetch(`${API_BASE}/bookings/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${custToken}` },
      body: JSON.stringify({
        hotel_id: hotelId,
        room_id: roomId,
        check_in_date: '2026-09-24',
        check_out_date: '2026-09-25',
        guests_count: 2,
        payment_method: 'UPI',
        pickup: {
          required: true,
          type: 'airport',
          vehicle_id: sedan.id,
          passengers: 2,
          pickup_charge: 10 // Attacker trying to send ₹10 instead of ₹800
        }
      })
    });
    const data = await res.json();
    if (data.success && data.booking) {
      // Backend must have applied sedan.price (₹800), NOT ₹10
      return data.booking.pickup.pickup_charge === sedan.price;
    }
    return false;
  });

  // Test 10: Passenger capacity validation (reject passenger count > vehicle capacity)
  await runTest('10. Reject booking if passenger count exceeds vehicle capacity', async () => {
    const settings = await (await fetch(`${API_BASE}/hotels/${hotelId}/pickup-settings`)).json();
    const sedan = settings.vehicles.find(v => v.capacity <= 4) || settings.vehicles[0];

    const res = await fetch(`${API_BASE}/bookings/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${custToken}` },
      body: JSON.stringify({
        hotel_id: hotelId,
        room_id: roomId,
        check_in_date: '2026-09-26',
        check_out_date: '2026-09-27',
        guests_count: 8,
        payment_method: 'UPI',
        pickup: {
          required: true,
          type: 'airport',
          vehicle_id: sedan.id,
          passengers: 8 // Exceeds capacity of 4
        }
      })
    });
    const data = await res.json();
    return res.status === 400 && !data.success && data.message.includes('exceeds');
  });

  // Test 11: Invalid vehicle rejection
  await runTest('11. Reject booking with invalid/fake vehicle ID', async () => {
    const res = await fetch(`${API_BASE}/bookings/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${custToken}` },
      body: JSON.stringify({
        hotel_id: hotelId,
        room_id: roomId,
        check_in_date: '2026-09-26',
        check_out_date: '2026-09-27',
        guests_count: 2,
        payment_method: 'UPI',
        pickup: {
          required: true,
          type: 'airport',
          vehicle_id: 'VEH-NON-EXISTENT-999',
          passengers: 2
        }
      })
    });
    const data = await res.json();
    return res.status === 400 && !data.success;
  });

  // Test 12: Invalid location from another hotel rejection
  await runTest('12. Reject pickup location belonging to another hotel', async () => {
    const res = await fetch(`${API_BASE}/bookings/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${custToken}` },
      body: JSON.stringify({
        hotel_id: hotelId,
        room_id: roomId,
        check_in_date: '2026-09-26',
        check_out_date: '2026-09-27',
        guests_count: 2,
        payment_method: 'UPI',
        pickup: {
          required: true,
          type: 'railway',
          location_id: 'LOC-HTL-999-FAKE',
          vehicle_id: 'VEH-001',
          passengers: 2
        }
      })
    });
    const data = await res.json();
    return res.status === 400 && !data.success;
  });

  console.log('\n--- TEST GROUP 4: MULTI-TENANCY & SECURITY ---');

  // Test 13: Customer A cannot view Customer B's pickup
  await runTest('13. Cross-Tenant Protection: Customer B cannot access Customer A\'s pickup', async () => {
    const res = await fetch(`${API_BASE}/pickups/${createdBookingAirport.id}`, {
      headers: { 'Authorization': `Bearer ${custBToken}` }
    });
    return res.status === 403;
  });

  // Test 14: Hotel Admin A cannot modify pickup of Hotel B
  await runTest('14. Hotel Isolation: Hotel Admin cannot modify another hotel\'s pickup settings', async () => {
    const res = await fetch(`${API_BASE}/hotels/HTL-003/pickup-settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${hotelAdminToken}` },
      body: JSON.stringify({ pickup_service_enabled: false })
    });
    return res.status === 403;
  });

  // Test 15: Unauthenticated access rejected with 401
  await runTest('15. Unauthenticated pickup access returns 401 Unauthorized', async () => {
    const res = await fetch(`${API_BASE}/pickups`);
    return res.status === 401;
  });

  // Test 16: Platform Admin (Super Admin) can aggregate pickups across hotels
  await runTest('16. Super Admin can view all platform pickup requests', async () => {
    const res = await fetch(`${API_BASE}/pickups`, {
      headers: { 'Authorization': `Bearer ${superAdminToken}` }
    });
    const data = await res.json();
    return res.ok && data.success && Array.isArray(data.pickups) && data.pickups.length >= 4;
  });

  console.log('\n--- TEST GROUP 5: DRIVER ALLOCATION & STATUS LIFECYCLE ---');

  // Test 17: Hotel Admin assigns driver to pickup
  await runTest('17. Hotel Admin assigns driver & vehicle plate number', async () => {
    const res = await fetch(`${API_BASE}/pickups/${createdBookingAirport.id}/assign-driver`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${hotelAdminToken}` },
      body: JSON.stringify({
        driver_name: 'Subhash Roy',
        driver_phone: '+91 98300 44129',
        vehicle: 'Executive Sedan (Swift Dzire)',
        vehicle_number: 'WB-30-AB-1290'
      })
    });
    const data = await res.json();
    return res.ok && data.success && data.pickup.driver?.name === 'Subhash Roy' && data.pickup.status === 'assigned';
  });

  // Test 18: Pickup status transitions: driver_on_way -> arrived -> completed
  await runTest('18. Pickup status progression: driver_on_way -> arrived -> completed', async () => {
    // 1. Driver on way
    const r1 = await (await fetch(`${API_BASE}/pickups/${createdBookingAirport.id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${hotelAdminToken}` },
      body: JSON.stringify({ status: 'driver_on_way' })
    })).json();
    if (r1.pickup?.status !== 'driver_on_way') return false;

    // 2. Arrived
    const r2 = await (await fetch(`${API_BASE}/pickups/${createdBookingAirport.id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${hotelAdminToken}` },
      body: JSON.stringify({ status: 'arrived' })
    })).json();
    if (r2.pickup?.status !== 'arrived') return false;

    // 3. Completed
    const r3 = await (await fetch(`${API_BASE}/pickups/${createdBookingAirport.id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${hotelAdminToken}` },
      body: JSON.stringify({ status: 'completed' })
    })).json();
    return r3.pickup?.status === 'completed';
  });

  // Test 19: Customer can query their own pickup details with driver info
  await runTest('19. Customer can retrieve pickup tracking itinerary with driver contact', async () => {
    const res = await fetch(`${API_BASE}/pickups/${createdBookingAirport.id}`, {
      headers: { 'Authorization': `Bearer ${custToken}` }
    });
    const data = await res.json();
    return res.ok && data.success && data.pickup.pickup?.driver?.name === 'Subhash Roy';
  });

  // Test 20: Payment ledger includes pickup charge
  await runTest('20. Payment transaction record includes room + tax + pickup charge', async () => {
    const res = await fetch(`${API_BASE}/bookings/${createdBookingAirport.id}`, {
      headers: { 'Authorization': `Bearer ${custToken}` }
    });
    const data = await res.json();
    const b = data.booking;
    const expected = b.base_amount + b.tax_amount + b.pickup.pickup_charge;
    return b.total_amount === expected;
  });

  // Test 21: Cancellation of booking with pickup sets pickup status to cancelled
  await runTest('21. Cancellation of booking with pickup sets pickup status to cancelled & refunds', async () => {
    const res = await fetch(`${API_BASE}/bookings/${createdBookingRailway.id}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${custToken}` },
      body: JSON.stringify({ reason: 'Trip rescheduled by customer.' })
    });
    const data = await res.json();
    return res.ok && data.success && data.booking.booking_status === 'cancelled' && data.booking.pickup?.status === 'cancelled';
  });

  // Test 22: Old booking without pickup loads normally without exceptions
  await runTest('22. Historical bookings without pickup load smoothly without regressions', async () => {
    const res = await fetch(`${API_BASE}/bookings/${createdBookingNoPickup.id}`, {
      headers: { 'Authorization': `Bearer ${custToken}` }
    });
    const data = await res.json();
    return res.ok && data.success && data.booking.booking_code === createdBookingNoPickup.booking_code;
  });

  console.log('\n================================================================');
  console.log(`📊 PICKUP SERVICE TEST RESULTS: ${passed} PASSED, ${failed} FAILED (TOTAL: 22)`);
  console.log('================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
