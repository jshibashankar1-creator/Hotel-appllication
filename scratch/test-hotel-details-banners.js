import { db } from '../server/src/db/database.js';
import assert from 'assert';

console.log('--- STARTING HOTEL DETAILS & BANNERS INTEGRATION TESTS ---');

// Test 1: Verify database banner persistence and retrieval
const testHotelId = 'HTL-001';
const otherHotelId = 'HTL-002';

// Clean test banners if any exist
db.transaction(data => {
  if (!data.banners) data.banners = [];
  data.banners = data.banners.filter(b => !b.id.startsWith('BNR-TEST-'));
});

// Create 2 test banners for HTL-001 and 1 for HTL-002
const banner1 = {
  id: 'BNR-TEST-001',
  hotel_id: testHotelId,
  title: 'Luxury Suite 30% Off Weekend Deal',
  image_url: 'https://res.cloudinary.com/hotelhub/image/upload/v12345/test_banner1.jpg',
  sort_order: 1,
  is_active: true,
  created_at: new Date('2026-10-24T10:00:00Z').toISOString(),
  updated_at: new Date('2026-10-24T10:00:00Z').toISOString()
};

const banner2 = {
  id: 'BNR-TEST-002',
  hotel_id: testHotelId,
  title: 'Complimentary Spa & Breakfast Package',
  image_url: 'https://res.cloudinary.com/hotelhub/image/upload/v12345/test_banner2.jpg',
  sort_order: 2,
  is_active: true,
  created_at: new Date('2026-10-24T11:00:00Z').toISOString(),
  updated_at: new Date('2026-10-24T11:00:00Z').toISOString()
};

const bannerInactive = {
  id: 'BNR-TEST-003-INACTIVE',
  hotel_id: testHotelId,
  title: 'Expired Monsoon Offer',
  image_url: 'https://res.cloudinary.com/hotelhub/image/upload/v12345/test_banner3.jpg',
  sort_order: 3,
  is_active: false,
  created_at: new Date('2026-10-24T09:00:00Z').toISOString(),
  updated_at: new Date('2026-10-24T09:00:00Z').toISOString()
};

const bannerOtherHotel = {
  id: 'BNR-TEST-OTHER',
  hotel_id: otherHotelId,
  title: 'Other Hotel Secret Sale',
  image_url: 'https://res.cloudinary.com/hotelhub/image/upload/v12345/test_banner_other.jpg',
  sort_order: 1,
  is_active: true,
  created_at: new Date('2026-10-24T12:00:00Z').toISOString(),
  updated_at: new Date('2026-10-24T12:00:00Z').toISOString()
};

db.transaction(data => {
  data.banners.push(banner1, banner2, bannerInactive, bannerOtherHotel);
});

console.log('✓ Banners inserted into database');

// Test 2: Database method getBannersByHotel
const hotelBanners = db.getBannersByHotel(testHotelId);
assert.strictEqual(hotelBanners.length, 3, 'Should retrieve all 3 banners for HTL-001 (including inactive in raw db query)');
console.log('✓ db.getBannersByHotel returns correct count');

// Test 3: Filtering logic matching banner.routes.js and HotelDetailsScreen
const allBanners = db.getBanners();
const activeForHotel1 = allBanners
  .filter(b => b.is_active !== false && String(b.hotel_id) === String(testHotelId))
  .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

assert.strictEqual(activeForHotel1.length, 2, 'Only active banners should be retained');
assert.strictEqual(activeForHotel1[0].id, 'BNR-TEST-001');
assert.strictEqual(activeForHotel1[1].id, 'BNR-TEST-002');
assert.strictEqual(activeForHotel1[0].title, 'Luxury Suite 30% Off Weekend Deal');
assert.strictEqual(activeForHotel1[0].image_url, 'https://res.cloudinary.com/hotelhub/image/upload/v12345/test_banner1.jpg');
console.log('✓ Active banners properly filtered and sorted by sort_order');

// Test 4: Hotel 2 isolation (does not see Hotel 1 banners)
const activeForHotel2 = allBanners
  .filter(b => b.is_active !== false && String(b.hotel_id) === String(otherHotelId));

assert.strictEqual(activeForHotel2.length, 1);
assert.strictEqual(activeForHotel2[0].id, 'BNR-TEST-OTHER');
console.log('✓ Property isolation verified: Hotel 2 does not see Hotel 1 banners');

// Test 5: Empty hotel banner scenario (graceful hide)
const emptyHotelId = 'HTL-NONE';
const activeForEmpty = allBanners
  .filter(b => b.is_active !== false && String(b.hotel_id) === String(emptyHotelId));
assert.strictEqual(activeForEmpty.length, 0);
console.log('✓ Graceful empty handling verified: hotels without banners return 0 items');

// Cleanup
db.transaction(data => {
  data.banners = data.banners.filter(b => !b.id.startsWith('BNR-TEST-'));
});
console.log('✓ Cleanup completed');

console.log('--- ALL INTEGRATION TESTS PASSED SUCCESSFULLY! ---');
