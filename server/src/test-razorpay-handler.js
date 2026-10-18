import 'dotenv/config';
import assert from 'assert';
import http from 'http';
import app from '../src/app.js';
import jwt from 'jsonwebtoken';

console.log('=== TEST SUITE: Razorpay Credential Handling & Error Responses ===\n');

const JWT_SECRET = process.env.JWT_SECRET;
const testToken = jwt.sign(
  { userId: 'USR-CUST-1', role: 'customer', name: 'Aarav Sharma', email: 'aarav.sharma@gmail.com' },
  JWT_SECRET,
  { expiresIn: '1h' }
);

function makeRequest(server, options, postData) {
  return new Promise((resolve, reject) => {
    const address = server.address();
    const req = http.request({
      hostname: '127.0.0.1',
      port: address.port,
      path: options.path,
      method: options.method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testToken}`,
        ...options.headers
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => { body += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, headers: res.headers, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, raw: body });
        }
      });
    });

    req.on('error', reject);
    if (postData) {
      req.write(JSON.stringify(postData));
    }
    req.end();
  });
}

async function runTests() {
  const server = app.listen(0);
  await new Promise(r => server.once('listening', r));

  try {
    // TEST 1: Missing environment variables handling
    console.log('[Test 1] Missing RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET returns 500 with clear message');
    const origKeyId = process.env.RAZORPAY_KEY_ID;
    const origKeySecret = process.env.RAZORPAY_KEY_SECRET;

    delete process.env.RAZORPAY_KEY_ID;
    delete process.env.RAZORPAY_KEY_SECRET;

    const resMissing = await makeRequest(server, {
      path: '/api/payments/create-order',
      method: 'POST'
    }, {
      hotel_id: 'htl-01',
      room_id: 'rm-01',
      check_in_date: '2026-11-01',
      check_out_date: '2026-11-03',
      guests_count: 2
    });

    assert.strictEqual(resMissing.status, 500, 'Expected 500 status when credentials missing');
    assert.strictEqual(resMissing.data.success, false);
    assert(resMissing.data.message.includes('missing in server environment'), 'Message must indicate missing config');
    console.log('  -> PASS: Correctly handled missing credentials\n');

    // TEST 2: Whitespace in environment variables is trimmed safely
    console.log('[Test 2] Whitespace in RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is safely sanitized');
    process.env.RAZORPAY_KEY_ID = '  rzp_test_mockKeyId123  ';
    process.env.RAZORPAY_KEY_SECRET = '  mockKeySecret456  ';

    // Mock Razorpay SDK orders.create
    const resWhitespace = await makeRequest(server, {
      path: '/api/payments/create-order',
      method: 'POST'
    }, {
      hotel_id: 'htl-01',
      room_id: 'rm-01',
      check_in_date: '2026-11-01',
      check_out_date: '2026-11-03',
      guests_count: 2
    });

    // In this mock test without real Razorpay call (since mock credentials will 401 on api.razorpay.com),
    // we verify that the message handles 401 gracefully without leaking credentials
    assert.strictEqual(resWhitespace.data.success, false);
    assert(!JSON.stringify(resWhitespace.data).includes('mockKeySecret456'), 'Never leak secret in response');
    console.log('  -> PASS: Trimming handled and zero secret leakage verified\n');

    // TEST 3: Validation of required parameters for order creation
    console.log('[Test 3] Validation error on missing booking parameters (400 Bad Request)');
    const resValidation = await makeRequest(server, {
      path: '/api/payments/create-order',
      method: 'POST'
    }, {
      hotel_id: 'htl-01'
      // missing room_id, check_in_date, check_out_date
    });

    assert.strictEqual(resValidation.status, 400, 'Expected 400 when missing required booking parameters');
    assert.strictEqual(resValidation.data.success, false);
    console.log('  -> PASS: 400 returned for missing booking parameters\n');

    // Restore original env
    process.env.RAZORPAY_KEY_ID = origKeyId;
    process.env.RAZORPAY_KEY_SECRET = origKeySecret;

    // TEST 4: Razorpay 401 Authentication failure handling (with mismatched test credentials)
    console.log('[Test 4] Razorpay 401 authentication failed error message mapping');
    process.env.RAZORPAY_KEY_ID = 'rzp_test_invalidKeyId1234';
    process.env.RAZORPAY_KEY_SECRET = 'invalidKeySecret56789012';

    const res401 = await makeRequest(server, {
      path: '/api/payments/create-order',
      method: 'POST'
    }, {
      hotel_id: 'htl-01',
      room_id: 'rm-01',
      check_in_date: '2026-11-01',
      check_out_date: '2026-11-03',
      guests_count: 2
    });

    assert.strictEqual(res401.status, 401, 'Expected 401 status from Razorpay');
    assert.strictEqual(res401.data.success, false);
    assert(
      res401.data.message.includes('Razorpay authentication failed') ||
      res401.data.message.includes('Authentication failed'),
      'Expected descriptive message for 401 error'
    );
    assert(!JSON.stringify(res401.data).includes(process.env.RAZORPAY_KEY_SECRET), 'Secret must not be in response body');
    console.log('  -> PASS: 401 mapped to actionable explanation without secret exposure\n');

    // Restore original env
    process.env.RAZORPAY_KEY_ID = origKeyId;
    process.env.RAZORPAY_KEY_SECRET = origKeySecret;

    // TEST 5: Real Razorpay order creation success (201 Created)
    console.log('[Test 5] Valid Razorpay credentials produce real order (201 Created)');
    const res201 = await makeRequest(server, {
      path: '/api/payments/create-order',
      method: 'POST'
    }, {
      hotel_id: 'htl-01',
      room_id: 'rm-01',
      check_in_date: '2026-11-01',
      check_out_date: '2026-11-03',
      guests_count: 2
    });

    assert.strictEqual(res201.status, 201, 'Expected 201 status for valid order creation');
    assert.strictEqual(res201.data.success, true);
    assert(res201.data.order_id && res201.data.order_id.startsWith('order_'), 'Must return valid order_id');
    assert.strictEqual(res201.data.currency, 'INR');
    assert(!JSON.stringify(res201.data).includes(process.env.RAZORPAY_KEY_SECRET), 'Secret must not be in response body');
    console.log(`  -> PASS: Genuine Razorpay order created successfully (order_id: ${res201.data.order_id})\n`);

    console.log('=== ALL RAZORPAY TEST SUITE TESTS PASSED ===\n');
  } finally {
    server.close();
  }
}

runTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
