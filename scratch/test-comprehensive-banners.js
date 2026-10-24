import dotenv from 'dotenv';
dotenv.config({ path: 'server/.env' });
import http from 'http';
import app from '../server/src/app.js';
import { db } from '../server/src/db/database.js';

async function runComprehensiveTests() {
  console.log('====================================================');
  console.log('HOTELHUB COMPREHENSIVE PHASE 4 TEST SUITE');
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

  // 1. Live Render Backend Endpoint Validation
  console.log('--- 1. Live Render Backend APIs ---');
  const liveBase = 'https://hotel-appllication.onrender.com/api';
  try {
    const bannerRes = await fetch(`${liveBase}/banners`);
    const bannerData = await bannerRes.json();
    assert(bannerRes.status === 200, 'Live /api/banners returns 200 OK');
    assert(bannerData.success === true, 'Live /api/banners returns success: true');
    assert(Array.isArray(bannerData.banners), 'Live /api/banners returns banners array');
    assert(bannerData.banners.length === 4, `Live /api/banners returned exact 4 banners (got ${bannerData.banners.length})`);
    
    // Check fields of all returned banners
    bannerData.banners.forEach((b, idx) => {
      assert(!!b.id, `Banner #${idx + 1} has valid ID (${b.id})`);
      assert(!!b.hotel_id, `Banner #${idx + 1} has hotel_id (${b.hotel_id})`);
      assert(!!(b.image_url || b.cover_image), `Banner #${idx + 1} has valid image URL`);
      assert(b.is_active === true, `Banner #${idx + 1} is active`);
      assert(b.hotel && b.hotel.id === b.hotel_id, `Banner #${idx + 1} includes populated matching hotel`);
    });

    // Test Live Food endpoint
    const foodRes = await fetch(`${liveBase}/food`);
    const foodData = await foodRes.json();
    assert(foodRes.status === 200, 'Live /api/food returns 200 OK');
    assert(foodData.success === true, 'Live /api/food returns success: true');

    // Test Live Hotel Search
    const hotelRes = await fetch(`${liveBase}/hotels?city=New%20Digha`);
    const hotelData = await hotelRes.json();
    assert(hotelRes.status === 200, 'Live /api/hotels returns 200 OK');
    assert(hotelData.success === true, 'Live /api/hotels returns success: true');
    assert(Array.isArray(hotelData.hotels), 'Live /api/hotels returns hotels array');

    // Test Live Hotel Details
    const detailsRes = await fetch(`${liveBase}/hotels/HTL-001`);
    const detailsData = await detailsRes.json();
    assert(detailsRes.status === 200, 'Live /api/hotels/HTL-001 returns 200 OK');
    assert(detailsData.success === true, 'Live /api/hotels/HTL-001 returns success: true');
    assert(detailsData.hotel?.id === 'HTL-001', 'Live /api/hotels/HTL-001 returns correct hotel ID');
  } catch (err) {
    console.error('Live backend test error:', err.message);
    assert(false, `Live backend test error: ${err.message}`);
  }

  // 2. Unit Testing Banner Parsing, Sorting & Active Rules
  console.log('\n--- 2. Unit Tests for Banner Parsing, Filtering & Sorting ---');
  const mockBanners = [
    { id: 'B1', title: 'Inactive banner', is_active: false, sort_order: 1, hotel_id: 'H1' },
    { id: 'B2', title: 'Second banner', is_active: true, sort_order: 5, hotel_id: 'H2', image_url: 'https://img.com/2.jpg' },
    { id: 'B3', title: 'First banner', is_active: true, sort_order: 2, hotel_id: 'H3', cover_image: 'https://img.com/3.jpg' },
    { id: 'B4', title: 'Default active banner', sort_order: 3, hotel_id: 'H4', image_url: 'https://img.com/4.jpg' }
  ];

  const parsedValidBanners = mockBanners
    .filter(item => item && item.is_active !== false)
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

  assert(parsedValidBanners.length === 3, 'Filtered out inactive banner');
  assert(parsedValidBanners[0].id === 'B3', 'Banner with sort_order 2 is sorted first');
  assert(parsedValidBanners[1].id === 'B4', 'Banner with sort_order 3 is sorted second');
  assert(parsedValidBanners[2].id === 'B2', 'Banner with sort_order 5 is sorted third');

  // Test empty and malformed list
  const emptyBanners = [];
  const parsedEmpty = emptyBanners.filter(item => item && item.is_active !== false);
  assert(parsedEmpty.length === 0, 'Handles empty banner list safely without throwing');

  const malformedBanners = [null, undefined, {}, { is_active: false }];
  const parsedMalformed = malformedBanners.filter(item => item && item.is_active !== false);
  assert(parsedMalformed.length === 1, 'Filters out null, undefined, and inactive items from malformed banner list');

  // 3. Banner Navigation mapping test
  console.log('\n--- 3. Banner Tap Navigation Target Resolution ---');
  function resolveNavigationTarget(item) {
    const hotel = item.hotel || {};
    const hotelId = item.hotel_id || hotel.id || hotel._id || item.id;
    return {
      screen: 'HotelDetails',
      params: {
        id: hotelId,
        hotel: Object.keys(hotel).length > 0 ? hotel : (item.name ? item : null),
      }
    };
  }

  const navTest1 = resolveNavigationTarget({
    id: 'BNR-1',
    hotel_id: 'HTL-001',
    hotel: { id: 'HTL-001', name: 'Hotel Sea Hawk New Digha' }
  });
  assert(navTest1.params.id === 'HTL-001', 'Resolves hotel_id directly from banner object');
  assert(navTest1.params.hotel.name === 'Hotel Sea Hawk New Digha', 'Preserves populated hotel object in navigation params');

  const navTest2 = resolveNavigationTarget({
    id: 'BNR-2',
    hotel: { id: 'HTL-002', name: 'Digha Beach Resort' }
  });
  assert(navTest2.params.id === 'HTL-002', 'Resolves hotel ID from nested hotel object when hotel_id omitted');

  // 4. Client Bundle Validation
  console.log('\n--- 4. Client Web Bundle Verification ---');
  try {
    const bundleRes = await fetch('http://localhost:8081/index.bundle?platform=web&dev=true&hot=false&lazy=true&transform.engine=hermes&transform.routerRoot=app');
    const bundleText = await bundleRes.text();
    assert(bundleRes.status === 200, 'Metro Web Bundle server responds with 200 OK');
    assert(bundleText.includes('validBanners'), 'Bundle includes validBanners filtering logic');
    assert(!bundleText.includes('resizeMode="cover"'), 'Bundle has eliminated deprecated resizeMode JSX attribute');
    assert(!bundleText.includes('.M_ID'), 'Bundle has no .M_ID property accesses');
  } catch (err) {
    console.error('Bundle verification error:', err.message);
    assert(false, `Bundle verification error: ${err.message}`);
  }

  console.log('\n====================================================');
  console.log(`🏁 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runComprehensiveTests().catch(err => {
  console.error('Fatal error running tests:', err);
  process.exit(1);
});
