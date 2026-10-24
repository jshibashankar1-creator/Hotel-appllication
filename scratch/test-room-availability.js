import dotenv from 'dotenv';
dotenv.config({ path: 'server/.env' });
import http from 'http';
import app from '../server/src/app.js';
import { db } from '../server/src/db/database.js';

async function runTests() {
  console.log('====================================================');
  console.log('HOTELHUB ROOM AVAILABILITY TEST SUITE');
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

    // Verify day record shape
    const day0 = availData1.matrix[0];
    assert(day0.date === startStr, `Matrix day 0 starts at ${startStr}`);
    assert(typeof day0.available_count === 'number', 'Matrix includes available_count number');
    assert(typeof day0.booked_count === 'number', 'Matrix includes booked_count number');
    assert(typeof day0.blocked_count === 'number', 'Matrix includes blocked_count number');
    assert(typeof day0.total_inventory === 'number', 'Matrix includes total_inventory number');
    assert(day0.available_count === Math.max(0, day0.total_inventory - day0.booked_count - day0.blocked_count),
      'available_count equals max(0, total_inventory - booked_count - blocked_count)');

    // 3. GET /api/availability/room/:roomId with startDate=14 (must be rejected with 400 validation error)
    const badDateRes = await fetch(`${baseUrl}/availability/room/RM-101?startDate=14&endDate=undefined`);
    const badDateData = await badDateRes.json();
    assert(badDateRes.status === 400, 'startDate=14 is rejected with 400 Bad Request');
    assert(badDateData.success === false, 'Error response has success: false');
    assert(badDateData.message.includes('Invalid startDate'), 'Error message describes invalid startDate format');

    // 4. Missing endDate returns default window (e.g. 14 days) instead of 404 or unhandled crash
    const noEndRes = await fetch(`${baseUrl}/availability/room/RM-101?startDate=${startStr}`);
    const noEndData = await noEndRes.json();
    assert(noEndRes.status === 200, 'Missing endDate gracefully defaults to 14 days matrix');
    assert(noEndData.matrix.length === 14, `Default matrix length is 14 days (got ${noEndData.matrix?.length})`);

    // 5. Inverted dates (endDate < startDate) returns 400
    const invRes = await fetch(`${baseUrl}/availability/room/RM-101?startDate=${endStr}&endDate=${startStr}`);
    const invData = await invRes.json();
    assert(invRes.status === 400, 'endDate < startDate returns 400 Bad Request');
    assert(invData.message.includes('endDate must be greater'), 'Error explains checkout date condition');

    // 6. Unknown room returns 404
    const unkRes = await fetch(`${baseUrl}/availability/room/RM-NON-EXISTENT?startDate=${startStr}&endDate=${endStr}`);
    assert(unkRes.status === 404, 'Unknown room returns 404 Room not found');

    // 7. Backward compatibility: Direct route GET /api/availability/:roomId
    const directRes = await fetch(`${baseUrl}/availability/RM-101?startDate=${startStr}&endDate=${endStr}`);
    const directData = await directRes.json();
    assert(directRes.status === 200, 'GET /api/availability/RM-101 returns 200 OK');
    assert(directData.success === true && directData.matrix.length === 7, 'Direct route returns identical matrix');

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
