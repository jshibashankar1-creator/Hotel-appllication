import dotenv from 'dotenv';
dotenv.config({ path: 'server/.env' });
import http from 'http';
import jwt from 'jsonwebtoken';
import app from '../server/src/app.js';
import { db } from '../server/src/db/database.js';

const JWT_SECRET = process.env.JWT_SECRET || 'hotelhub-production-jwt-secret-key-2025';

async function runTests() {
  console.log('====================================================');
  console.log('HOTELHUB AVAILABILITY MATRIX & BLOCK/UNBLOCK TEST SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${message}`);
      failed++;
    }
  }

  // Start in-memory server
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api`;
  console.log(`Test server running on port ${port}\n`);

  try {
    // 1. Health check
    const healthRes = await fetch(`${baseUrl}/health`);
    const healthData = await healthRes.json();
    assert(healthRes.ok && healthData.success, 'Health check returns 200 OK');

    // 2. Canonical route: GET /api/availability/room/:roomId with valid date range
    const today = new Date();
    const formatYMD = (d) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    const startStr = formatYMD(today);
    const endStr = formatYMD(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7));

    const availRes1 = await fetch(`${baseUrl}/availability/room/RM-101?startDate=${startStr}&endDate=${endStr}`);
    const availData1 = await availRes1.json();
    assert(availRes1.status === 200, 'GET /api/availability/room/RM-101?startDate=...&endDate=... returns 200 OK');
    assert(availData1.success === true, 'Response has success: true');
    assert(availData1.room_id === 'RM-101', 'Response has correct room_id');
    assert(Array.isArray(availData1.matrix), 'Response includes matrix array');
    assert(availData1.matrix.length === 7, `Matrix length equals requested 7 nights (got ${availData1.matrix?.length})`);

    // Verify day record shape and formula
    const day0 = availData1.matrix[0];
    assert(day0.date === startStr, `Matrix day 0 starts at ${startStr}`);
    assert(typeof day0.available_count === 'number', 'Matrix includes available_count number');
    assert(typeof day0.booked_count === 'number', 'Matrix includes booked_count number');
    assert(typeof day0.blocked_count === 'number', 'Matrix includes blocked_count number');
    assert(typeof day0.total_inventory === 'number', 'Matrix includes total_inventory number');
    assert(day0.available_count === Math.max(0, day0.total_inventory - day0.booked_count - day0.blocked_count),
      'available_count equals max(0, total_inventory - booked_count - blocked_count)');

    // 3. Validation: startDate=14 is rejected
    const badDateRes = await fetch(`${baseUrl}/availability/room/RM-101?startDate=14&endDate=undefined`);
    const badDateData = await badDateRes.json();
    assert(badDateRes.status === 400, 'startDate=14 is rejected with 400 Bad Request');
    assert(badDateData.success === false, 'Error response has success: false');

    // 4. Missing endDate defaults to 14 days
    const noEndRes = await fetch(`${baseUrl}/availability/room/RM-101?startDate=${startStr}`);
    const noEndData = await noEndRes.json();
    assert(noEndRes.status === 200, 'Missing endDate gracefully defaults to 14 days matrix');
    assert(noEndData.matrix.length === 14, `Default matrix length is 14 days (got ${noEndData.matrix?.length})`);

    // 5. Inverted dates (endDate < startDate) returns 400
    const invRes = await fetch(`${baseUrl}/availability/room/RM-101?startDate=${endStr}&endDate=${startStr}`);
    assert(invRes.status === 400, 'endDate < startDate returns 400 Bad Request');

    // 6. Unknown room returns 404
    const unkRes = await fetch(`${baseUrl}/availability/room/RM-NON-EXISTENT?startDate=${startStr}&endDate=${endStr}`);
    assert(unkRes.status === 404, 'Unknown room returns 404 Room not found');

    // --- AUTHENTICATION & BLOCK / UNBLOCK TESTS ---
    // Prepare authorized owner token for hotel associated with RM-101
    const testRoom = db.getRoomById('RM-101');
    assert(testRoom !== undefined, 'RM-101 exists in database');
    const testHotel = db.getHotelById(testRoom.hotel_id);
    assert(testHotel !== undefined, `Hotel ${testRoom.hotel_id} exists`);

    let owner = db.getUsers().find(u => u.id === testHotel.owner_id);
    if (!owner) {
      owner = db.getUsers().find(u => u.role === 'owner') || { id: 'USR-OWNER-TEST', email: 'owner@test.com', role: 'owner' };
    }

    const ownerToken = jwt.sign({ userId: testHotel.owner_id, role: 'owner' }, JWT_SECRET, { expiresIn: '1h' });

    // Create a real other owner user in DB for unauthorized check
    let otherOwner = db.getUsers().find(u => u.role === 'owner' && u.id !== testHotel.owner_id);
    if (!otherOwner) {
      db.transaction(data => {
        otherOwner = {
          id: 'USR-OTHER-OWNER-99',
          name: 'Other Owner',
          email: 'otherowner@hotelhub.com',
          role: 'owner',
          status: 'active'
        };
        data.users.push(otherOwner);
      });
    }

    const unauthorizedToken = jwt.sign({ userId: otherOwner.id, role: 'owner' }, JWT_SECRET, { expiresIn: '1h' });

    const targetDate = formatYMD(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3));

    // 7. Test unauthorized property owner cannot modify RM-101
    const unauthBlockRes = await fetch(`${baseUrl}/availability/block`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${unauthorizedToken}`
      },
      body: JSON.stringify({
        room_id: 'RM-101',
        date: targetDate,
        blocked_count: 2
      })
    });
    assert(unauthBlockRes.status === 403, 'Unauthorized owner modifying another property room returns 403 Forbidden');

    // 8. Test authorized owner successfully blocks rooms
    const authBlockRes = await fetch(`${baseUrl}/availability/block`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ownerToken}`
      },
      body: JSON.stringify({
        room_id: 'RM-101',
        date: targetDate,
        blocked_count: 3
      })
    });
    const authBlockData = await authBlockRes.json();
    assert(authBlockRes.status === 200 && authBlockData.success === true, 'Authorized owner can block rooms (HTTP 200)');
    assert(authBlockData.availability.blocked_count === 3, 'Database persisted blocked_count of 3');

    // 9. Verify availability matrix recalculates with the blocked count
    const verifyAvailRes = await fetch(`${baseUrl}/availability/room/RM-101?startDate=${targetDate}&endDate=${formatYMD(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 4))}`);
    const verifyAvailData = await verifyAvailRes.json();
    const dayTarget = verifyAvailData.matrix[0];
    assert(dayTarget.date === targetDate, 'Matrix matches targetDate');
    assert(dayTarget.blocked_count === 3, `Matrix reports blocked_count = 3 (got ${dayTarget.blocked_count})`);
    assert(dayTarget.available_count === testRoom.total_inventory - dayTarget.booked_count - 3,
      `available_count correctly reduced by blocked_count (${dayTarget.available_count})`);

    // 10. Test over-blocking rejection (count > total_inventory - booked_count)
    const excessiveRes = await fetch(`${baseUrl}/availability/block`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ownerToken}`
      },
      body: JSON.stringify({
        room_id: 'RM-101',
        date: targetDate,
        blocked_count: testRoom.total_inventory + 50
      })
    });
    const excessiveData = await excessiveRes.json();
    assert(excessiveRes.status === 400, 'Blocking more rooms than total inventory is rejected with 400 Bad Request');
    assert(excessiveData.message.includes('Cannot block'), 'Error message explains excessive block count');

    // 11. Test unblocking (setting blocked_count to 0)
    const unblockRes = await fetch(`${baseUrl}/availability/block`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ownerToken}`
      },
      body: JSON.stringify({
        room_id: 'RM-101',
        date: targetDate,
        blocked_count: 0
      })
    });
    const unblockData = await unblockRes.json();
    assert(unblockRes.status === 200 && unblockData.success === true, 'Unblock action sets blocked_count to 0 (HTTP 200)');
    assert(unblockData.availability.blocked_count === 0, 'Database confirms blocked_count is 0');

    // Verify matrix reflects unblock
    const afterUnblockRes = await fetch(`${baseUrl}/availability/room/RM-101?startDate=${targetDate}&endDate=${formatYMD(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 4))}`);
    const afterUnblockData = await afterUnblockRes.json();
    assert(afterUnblockData.matrix[0].blocked_count === 0, 'Matrix confirms blocked_count is 0 after unblock');

    console.log('\n----------------------------------------------------');
    console.log(`TOTAL: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
    console.log('----------------------------------------------------');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  } finally {
    server.close();
  }
}

runTests();
