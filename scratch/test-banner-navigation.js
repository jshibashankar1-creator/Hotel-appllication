import dotenv from 'dotenv';
dotenv.config({ path: 'server/.env' });
import http from 'http';
import app from '../server/src/app.js';
import { db } from '../server/src/db/database.js';

async function runTests() {
  console.log('====================================================');
  console.log('HOTELHUB BANNER & HOTEL DETAILS NAVIGATION TEST SUITE');
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
  console.log(`Test server running on port ${port}`);

  try {
    // 1. Health check
    const healthRes = await fetch(`${baseUrl}/health`);
    const healthData = await healthRes.json();
    assert(healthRes.ok && healthData.success, 'Health check endpoint returns 200 and healthy status');

    // 2. Banner Endpoint - GET /api/banners
    const bannerRes = await fetch(`${baseUrl}/banners`);
    const bannerData = await bannerRes.json();
    assert(bannerRes.status === 200, 'GET /api/banners returns 200 OK');
    assert(bannerData.success === true, 'Response contains success: true');
    assert(Array.isArray(bannerData.banners), 'Response contains banners array');
    assert(bannerData.banners.length > 0, `Returned ${bannerData.banners.length} banners`);

    // Verify first banner record shape
    const firstBanner = bannerData.banners[0];
    console.log('\nSample banner record returned:', JSON.stringify(firstBanner, null, 2));
    assert(!!firstBanner.id, `Banner has valid ID: ${firstBanner.id}`);
    assert(!!firstBanner.hotel_id, `Banner has valid hotel_id: ${firstBanner.hotel_id}`);
    assert(!!firstBanner.image_url, `Banner has valid image_url: ${firstBanner.image_url}`);
    assert(!!firstBanner.hotel, `Banner has populated hotel object`);
    assert(firstBanner.hotel && firstBanner.hotel.id === firstBanner.hotel_id, 'Banner hotel ID matches hotel_id');
    assert(firstBanner.hotel && !!firstBanner.hotel.name, `Banner associated hotel has name: ${firstBanner.hotel?.name}`);

    // 3. Hotel Details Endpoint - GET /api/hotels/:id
    const hotelId = firstBanner.hotel_id;
    const hotelRes = await fetch(`${baseUrl}/hotels/${hotelId}`);
    const hotelData = await hotelRes.json();
    assert(hotelRes.status === 200, `GET /api/hotels/${hotelId} returns 200 OK`);
    assert(hotelData.success === true, 'Response contains success: true');
    assert(hotelData.hotel && hotelData.hotel.id === hotelId, `Fetched hotel matches requested ID: ${hotelData.hotel?.id}`);
    assert(hotelData.hotel && hotelData.hotel.rooms && hotelData.hotel.rooms.length > 0, `Hotel has rooms inventory: ${hotelData.hotel?.rooms?.length} rooms`);

    // 4. Test Missing/Invalid Hotel ID Endpoint
    const invalidHotelRes = await fetch(`${baseUrl}/hotels/undefined`);
    const invalidHotelData = await invalidHotelRes.json();
    assert(invalidHotelRes.status === 404, 'GET /api/hotels/undefined returns 404 Not Found controlled error');
    assert(invalidHotelData.success === false, 'Invalid hotel returns success: false');

    // 5. Test Food Endpoint Separation - GET /api/food
    const foodRes = await fetch(`${baseUrl}/food`);
    assert(foodRes.status !== 404, 'GET /api/food is mounted separately on /api/food');

    // 6. Production configuration audit
    // Verify mobile api.js BASE_URL does not default to localhost
    const fs = await import('fs');
    const apiCode = fs.readFileSync('mobile/src/services/api.js', 'utf-8');
    assert(!apiCode.includes("const LOCAL_API_URL = 'http://localhost:5000/api'"), 'Removed hardcoded LOCAL_API_URL constant');
    assert(apiCode.includes("DEFAULT_URL = 'https://hotel-appllication.onrender.com/api'"), 'DEFAULT_URL points to deployed production Render backend');
    assert(apiCode.includes('getBanners()'), 'mobileApi includes getBanners() method');
    assert(apiCode.includes('getHotelDetails requires a valid hotel ID'), 'mobileApi validates hotel ID before making request');

    // 7. Verify Custom Banner creation and retrieval
    const testBanner = {
      id: `BNR-TEST-${Date.now()}`,
      hotel_id: 'HTL-001',
      title: 'Summer Seaside Special',
      image_url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
      sort_order: 1,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    db.transaction(data => {
      if (!data.banners) data.banners = [];
      data.banners.push(testBanner);
    });

    const customBannerRes = await fetch(`${baseUrl}/banners`);
    const customBannerData = await customBannerRes.json();
    assert(customBannerData.success, 'Custom banner response returns success: true');
    assert(customBannerData.fallback === false, 'Returns custom banner with fallback: false');
    const foundBanner = customBannerData.banners.find(b => b.id === testBanner.id);
    assert(!!foundBanner, 'Custom banner is present in /api/banners response');
    assert(foundBanner?.hotel?.name === 'Hotel Sea Hawk New Digha', 'Custom banner populated with correct hotel');

    // Clean up test banner
    db.transaction(data => {
      const idx = data.banners.findIndex(b => b.id === testBanner.id);
      if (idx !== -1) data.banners.splice(idx, 1);
    });

  } finally {
    server.close();
  }

  console.log('\n====================================================');
  console.log(`🏁 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
