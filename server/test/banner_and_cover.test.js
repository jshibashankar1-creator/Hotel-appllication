import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

import app from '../src/app.js';
import { db } from '../src/db/database.js';
import { JWT_SECRET } from '../src/middleware/auth.js';

let server;
let baseUrl;
let owner1Token;
let owner2Token;
const testHotelId = 'HTL-001';
const otherHotelId = 'HTL-002';

before(async () => {
  // Start server on an ephemeral port
  await new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}/api`;
      resolve();
    });
  });

  // Generate valid tokens
  owner1Token = jwt.sign({ userId: 'USR-OWNER-1' }, JWT_SECRET, { expiresIn: '1h' });
  owner2Token = jwt.sign({ userId: 'USR-OWNER-2' }, JWT_SECRET, { expiresIn: '1h' });
});

after(async () => {
  // Clean up any test banners from the database
  db.transaction((data) => {
    if (data.banners) {
      data.banners = data.banners.filter((b) => !b.id.startsWith('BNR-TEST-'));
    }
  });

  await new Promise((resolve) => {
    if (server) server.close(resolve);
    else resolve();
  });
});

describe('HotelHub Banner & Cover Photo Test Suite', () => {
  // 1. Existing Banner Retrieval
  test('1. GET /api/banners returns active banners or global fallback', async () => {
    const res = await fetch(`${baseUrl}/banners`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(Array.isArray(data.banners), 'banners should be an array');
    assert.ok(data.count >= 0);
  });

  // 2. Hotel-specific Filtering with Promotional Banners
  test('2. GET /api/banners?hotel_id=HTL-001 returns real promotional banners when active', async () => {
    // Insert an active banner for HTL-001
    const testBanner = {
      id: 'BNR-TEST-ACTIVE-1',
      hotel_id: testHotelId,
      title: 'Summer Seaside Special 30% Off',
      image_url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200',
      sort_order: 1,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    db.transaction((data) => {
      if (!data.banners) data.banners = [];
      data.banners.push(testBanner);
    });

    const res = await fetch(`${baseUrl}/banners?hotel_id=${testHotelId}`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.fallback, false, 'Should be marked fallback: false when promotional banners exist');
    assert.ok(data.banners.length >= 1);
    const found = data.banners.find((b) => b.id === 'BNR-TEST-ACTIVE-1');
    assert.ok(found, 'Should contain the newly created promotional banner');
    assert.strictEqual(found.hotel_id, testHotelId);
    assert.strictEqual(found.title, 'Summer Seaside Special 30% Off');

    // Clean up
    db.transaction((data) => {
      data.banners = data.banners.filter((b) => b.id !== 'BNR-TEST-ACTIVE-1');
    });
  });

  // 3. Cover Image Fallback when no promotional banners exist
  test('3. GET /api/banners?hotel_id=HTL-001 returns hotel cover image as fallback when no promo banners exist', async () => {
    // Ensure no banners exist for HTL-001
    db.transaction((data) => {
      if (data.banners) {
        data.banners = data.banners.filter((b) => b.hotel_id !== testHotelId);
      }
    });

    const hotel = db.getHotelById(testHotelId);
    assert.ok(hotel, 'HTL-001 hotel should exist in database');
    assert.ok(hotel.cover_image, 'HTL-001 should have a cover_image');

    const res = await fetch(`${baseUrl}/banners?hotel_id=${testHotelId}`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.fallback, true, 'Should be clearly marked fallback: true');
    assert.strictEqual(data.count, 1, 'Should return exactly 1 fallback banner from hotel cover image');
    assert.strictEqual(data.banners[0].hotel_id, testHotelId);
    assert.strictEqual(data.banners[0].image_url, hotel.cover_image);
    assert.strictEqual(data.banners[0].fallback, true);
  });

  // 4. Inactive Banners Excluded
  test('4. Inactive banners (is_active: false) are excluded from public banner retrieval', async () => {
    const inactiveBanner = {
      id: 'BNR-TEST-INACTIVE-1',
      hotel_id: testHotelId,
      title: 'Expired Monsoon Offer',
      image_url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200',
      sort_order: 1,
      is_active: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    db.transaction((data) => {
      if (!data.banners) data.banners = [];
      data.banners.push(inactiveBanner);
    });

    const res = await fetch(`${baseUrl}/banners?hotel_id=${testHotelId}`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    const found = data.banners.find((b) => b.id === 'BNR-TEST-INACTIVE-1');
    assert.strictEqual(found, undefined, 'Inactive banner must not appear in customer banner response');

    // Clean up
    db.transaction((data) => {
      data.banners = data.banners.filter((b) => b.id !== 'BNR-TEST-INACTIVE-1');
    });
  });

  // 5. Cross-Hotel Authorization Checks
  test('5. Cross-hotel authorization: Admin of HTL-001 cannot create banner for HTL-002 (403)', async () => {
    const res = await fetch(`${baseUrl}/hotel-admin/banners`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${owner1Token}`
      },
      body: JSON.stringify({
        hotel_id: otherHotelId, // Attempting cross-hotel banner creation
        title: 'Hacked Offer for Another Hotel',
        image_url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200'
      })
    });

    assert.strictEqual(res.status, 403, 'Should reject cross-hotel banner creation with 403 Forbidden');
    const data = await res.json();
    assert.strictEqual(data.success, false);
    assert.match(data.message, /not authorized|access denied/i);
  });

  test('6. Cross-hotel authorization: Admin of HTL-001 cannot modify HTL-002 hotel details (403)', async () => {
    const res = await fetch(`${baseUrl}/hotels/${otherHotelId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${owner1Token}`
      },
      body: JSON.stringify({
        name: 'Malicious Rename Attempt',
        cover_image: 'https://malicious.com/fake.jpg'
      })
    });

    assert.strictEqual(res.status, 403, 'Should reject modifying another hotel with 403 Forbidden');
    const data = await res.json();
    assert.strictEqual(data.success, false);
  });

  // 7. Upload Endpoint Failures & Validation
  test('7. Missing image file in /api/uploads/banner-image returns 400', async () => {
    const res = await fetch(`${baseUrl}/uploads/banner-image`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${owner1Token}`
      }
    });

    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.strictEqual(data.success, false);
    assert.match(data.message, /no image file/i);
  });

  test('8. Missing image file in /api/uploads/cover-image returns 400', async () => {
    const res = await fetch(`${baseUrl}/uploads/cover-image`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${owner1Token}`
      }
    });

    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.strictEqual(data.success, false);
    assert.match(data.message, /no image file/i);
  });

  test('9. Cross-hotel upload authorization: Owner of HTL-001 cannot upload cover for HTL-002 (403)', async () => {
    const form = new FormData();
    const fakeFile = new Blob(['fake image content'], { type: 'image/jpeg' });
    form.append('image', fakeFile, 'test.jpg');
    form.append('hotel_id', otherHotelId);

    const res = await fetch(`${baseUrl}/uploads/cover-image`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${owner1Token}`
      },
      body: form
    });

    assert.strictEqual(res.status, 403, 'Should reject uploading cover photo for another hotel with 403 Forbidden');
    const data = await res.json();
    assert.strictEqual(data.success, false);
    assert.match(data.message, /not authorized/i);
  });

  test('10. Unsupported file type rejected during upload (400)', async () => {
    const form = new FormData();
    const textBlob = new Blob(['this is a text file not an image'], { type: 'text/plain' });
    form.append('image', textBlob, 'test.txt');

    const res = await fetch(`${baseUrl}/uploads/cover-image`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${owner1Token}`
      },
      body: form
    });

    assert.strictEqual(res.status, 400, 'Should reject unsupported file type with 400');
    const data = await res.json();
    assert.strictEqual(data.success, false);
    assert.match(data.message, /invalid file type/i);
  });

  // 11. Lightweight Hotel Summary Endpoint
  test('11. GET /api/hotels/:id/summary returns lightweight summary with minimal payload', async () => {
    const res = await fetch(`${baseUrl}/hotels/${testHotelId}/summary`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.summary, 'Should return summary object');
    assert.strictEqual(data.summary.id, testHotelId);
    assert.ok(data.summary.name);
    assert.ok(data.summary.city);
    assert.ok(data.summary.cover_image);
    assert.strictEqual(typeof data.summary.starting_price, 'number');
    assert.strictEqual(typeof data.summary.rooms_count, 'number');
    // Ensure large subdocuments like rooms array, reviews array, pickup lists are omitted
    assert.strictEqual(data.summary.rooms, undefined, 'Rooms array should be omitted in lightweight summary');
    assert.strictEqual(data.summary.reviews, undefined, 'Reviews array should be omitted in lightweight summary');
  });

  // 12. Full Hotel Details preserved
  test('12. GET /api/hotels/:id preserves complete hotel details with rooms and reviews for booking flow', async () => {
    const res = await fetch(`${baseUrl}/hotels/${testHotelId}`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.hotel);
    assert.strictEqual(data.hotel.id, testHotelId);
    assert.ok(Array.isArray(data.hotel.rooms), 'Rooms array must be present for room selection');
    assert.ok(data.hotel.rooms.length > 0, 'Hotel should have selectable rooms');
  });

  // 13. Property Cover Photo Save & Persistence
  test('13. Owner can update hotel cover_image and verify persistence', async () => {
    const originalHotel = db.getHotelById(testHotelId);
    const originalCover = originalHotel ? originalHotel.cover_image : null;
    const updatedCoverUrl = 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200';

    try {
      const updateRes = await fetch(`${baseUrl}/hotels/${testHotelId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${owner1Token}`
        },
        body: JSON.stringify({
          cover_image: updatedCoverUrl
        })
      });

      assert.strictEqual(updateRes.status, 200);
      const updateData = await updateRes.json();
      assert.strictEqual(updateData.success, true);
      assert.strictEqual(updateData.hotel.cover_image, updatedCoverUrl);

      // Verify persistence via GET /api/hotels/:id
      const verifyRes = await fetch(`${baseUrl}/hotels/${testHotelId}`);
      const verifyData = await verifyRes.json();
      assert.strictEqual(verifyData.hotel.cover_image, updatedCoverUrl);

      // Verify that banners fallback now receives the updated cover image!
      const bannerRes = await fetch(`${baseUrl}/banners?hotel_id=${testHotelId}`);
      const bannerData = await bannerRes.json();
      assert.strictEqual(bannerData.banners[0].image_url, updatedCoverUrl);
    } finally {
      if (originalCover) {
        db.transaction((data) => {
          const h = data.hotels.find((item) => item.id === testHotelId);
          if (h) h.cover_image = originalCover;
        });
      }
    }
  });
});
