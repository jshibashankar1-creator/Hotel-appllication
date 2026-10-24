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
let customerToken;
const testHotelId = 'HTL-001';
const otherHotelId = 'HTL-002';

let originalHotel1Cover;
let originalHotel2Cover;
let originalHotel1UpdatedAt;
let originalHotel2UpdatedAt;
let originalBanners;

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

  // Preserve initial database state for full restoration in after()
  const hotel1 = db.getHotelById(testHotelId);
  const hotel2 = db.getHotelById(otherHotelId);
  originalHotel1Cover = hotel1 ? hotel1.cover_image : null;
  originalHotel2Cover = hotel2 ? hotel2.cover_image : null;
  originalHotel1UpdatedAt = hotel1 ? hotel1.updated_at : undefined;
  originalHotel2UpdatedAt = hotel2 ? hotel2.updated_at : undefined;
  originalBanners = JSON.parse(JSON.stringify(db.getBanners()));

  // Generate valid tokens
  owner1Token = jwt.sign({ userId: 'USR-OWNER-1' }, JWT_SECRET, { expiresIn: '1h' });
  owner2Token = jwt.sign({ userId: 'USR-OWNER-2' }, JWT_SECRET, { expiresIn: '1h' });
  customerToken = jwt.sign({ userId: 'USR-CUST-1' }, JWT_SECRET, { expiresIn: '1h' });
});

after(async () => {
  // Restore initial database state to ensure zero diff in database.json
  db.transaction((data) => {
    const h1 = data.hotels.find((h) => h.id === testHotelId);
    if (h1) {
      h1.cover_image = originalHotel1Cover;
      if (originalHotel1UpdatedAt !== undefined) h1.updated_at = originalHotel1UpdatedAt;
      else delete h1.updated_at;
    }
    const h2 = data.hotels.find((h) => h.id === otherHotelId);
    if (h2) {
      h2.cover_image = originalHotel2Cover;
      if (originalHotel2UpdatedAt !== undefined) h2.updated_at = originalHotel2UpdatedAt;
      else delete h2.updated_at;
    }
    data.banners = originalBanners;
  });

  await new Promise((resolve) => {
    if (server) server.close(resolve);
    else resolve();
  });
});

describe('HotelHub Banner & Cover Photo Synchronization Test Suite', () => {
  let banner0Id;
  let banner1Id;
  let banner5Id;

  // 1. First active banner automatically cover photo banata hai
  test('1. First active banner automatically sets hotel cover photo', async () => {
    // Clear any banners for HTL-001 first
    db.transaction((data) => {
      data.banners = (data.banners || []).filter((b) => b.hotel_id !== testHotelId);
    });

    const bannerPayload = {
      title: 'First Active Showcase Banner',
      image_url: 'https://images.unsplash.com/test-banner-1.jpg',
      sort_order: 1,
      is_active: true
    };

    const res = await fetch(`${baseUrl}/hotel-admin/banners`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${owner1Token}`
      },
      body: JSON.stringify(bannerPayload)
    });

    assert.strictEqual(res.status, 201);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    banner1Id = body.banner.id;

    // Verify hotel cover_image in database
    const hotel = db.getHotelById(testHotelId);
    assert.strictEqual(hotel.cover_image, 'https://images.unsplash.com/test-banner-1.jpg');

    // Verify hotel cover_image via GET /api/hotel-admin/hotel
    const getRes = await fetch(`${baseUrl}/hotel-admin/hotel`, {
      headers: { Authorization: `Bearer ${owner1Token}` }
    });
    const getData = await getRes.json();
    assert.strictEqual(getData.hotel.cover_image, 'https://images.unsplash.com/test-banner-1.jpg');
  });

  // 2. Multiple active banners mein lowest sort_order select hota hai
  test('2. Multiple active banners: lowest sort_order is automatically selected as cover photo', async () => {
    // Add banner with sort_order 5
    const res5 = await fetch(`${baseUrl}/hotel-admin/banners`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${owner1Token}`
      },
      body: JSON.stringify({
        title: 'High Order Banner',
        image_url: 'https://images.unsplash.com/test-banner-5.jpg',
        sort_order: 5,
        is_active: true
      })
    });
    assert.strictEqual(res5.status, 201);
    const body5 = await res5.json();
    banner5Id = body5.banner.id;

    // Add banner with sort_order 0 (lowest)
    const res0 = await fetch(`${baseUrl}/hotel-admin/banners`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${owner1Token}`
      },
      body: JSON.stringify({
        title: 'Priority Top Banner',
        image_url: 'https://images.unsplash.com/test-banner-0.jpg',
        sort_order: 0,
        is_active: true
      })
    });
    assert.strictEqual(res0.status, 201);
    const body0 = await res0.json();
    banner0Id = body0.banner.id;

    // Cover image must now be the lowest sort_order banner (sort_order: 0)
    const hotel = db.getHotelById(testHotelId);
    assert.strictEqual(hotel.cover_image, 'https://images.unsplash.com/test-banner-0.jpg');
  });

  // 3. First banner deactivate hone par next active banner cover banta hai
  test('3. Deactivating first banner causes next active banner (lowest sort_order) to become cover photo', async () => {
    const res = await fetch(`${baseUrl}/hotel-admin/banners/${banner0Id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${owner1Token}`
      },
      body: JSON.stringify({ is_active: false })
    });
    assert.strictEqual(res.status, 200);

    // Active banners remaining: sort_order 1 and sort_order 5. Next lowest is 1.
    const hotel = db.getHotelById(testHotelId);
    assert.strictEqual(hotel.cover_image, 'https://images.unsplash.com/test-banner-1.jpg');
  });

  // 4. First banner delete hone par next active banner cover banta hai
  test('4. Deleting first banner causes next active banner to become cover photo', async () => {
    const res = await fetch(`${baseUrl}/hotel-admin/banners/${banner1Id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${owner1Token}` }
    });
    assert.strictEqual(res.status, 200);

    // Only active banner remaining is sort_order 5
    const hotel = db.getHotelById(testHotelId);
    assert.strictEqual(hotel.cover_image, 'https://images.unsplash.com/test-banner-5.jpg');
  });

  // 5. Banner image replace hone par cover update hota hai
  test('5. Replacing banner image updates hotel cover photo', async () => {
    const replacedUrl = 'https://images.unsplash.com/test-banner-5-replaced.jpg';
    const res = await fetch(`${baseUrl}/hotel-admin/banners/${banner5Id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${owner1Token}`
      },
      body: JSON.stringify({
        image_url: replacedUrl,
        title: 'Updated Title'
      })
    });
    assert.strictEqual(res.status, 200);

    const hotel = db.getHotelById(testHotelId);
    assert.strictEqual(hotel.cover_image, replacedUrl);
  });

  // 6. No active banners hone par existing cover preserve hota hai
  test('6. When no active banners remain, existing hotel cover is preserved (not blank or reset)', async () => {
    const lastCover = db.getHotelById(testHotelId).cover_image;
    assert.ok(lastCover, 'Should have a cover image before removing banners');

    // Deactivate or delete remaining banner
    const res = await fetch(`${baseUrl}/hotel-admin/banners/${banner5Id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${owner1Token}` }
    });
    assert.strictEqual(res.status, 200);

    // Verify hotel cover is strictly preserved
    const hotel = db.getHotelById(testHotelId);
    assert.strictEqual(hotel.cover_image, lastCover);
    assert.ok(hotel.cover_image.length > 0, 'Cover image must not be blank or empty');
  });

  // 7. Hotel A ka banner Hotel B ka cover change nahi kar sakta
  test('7. Hotel A banner operations cannot alter Hotel B cover photo or banners (cross-hotel isolation)', async () => {
    const hotel2Before = db.getHotelById(otherHotelId);
    const hotel2CoverBefore = hotel2Before.cover_image;

    // Owner 1 attempts to create a banner targeting Hotel 2
    const res = await fetch(`${baseUrl}/hotel-admin/banners`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${owner1Token}`
      },
      body: JSON.stringify({
        hotel_id: otherHotelId,
        title: 'Malicious Cross-Hotel Banner',
        image_url: 'https://images.unsplash.com/evil-banner.jpg',
        sort_order: 0,
        is_active: true
      })
    });
    assert.strictEqual(res.status, 403, 'Should reject cross-hotel banner creation with 403');

    // Verify Hotel 2 cover photo is completely unaltered
    const hotel2After = db.getHotelById(otherHotelId);
    assert.strictEqual(hotel2After.cover_image, hotel2CoverBefore);
  });

  // 8. Unauthorized admin cover/banner update nahi kar sakta
  test('8. Unauthorized / unauthenticated users cannot update banners or cover photo', async () => {
    // No token
    const resNoAuth = await fetch(`${baseUrl}/hotel-admin/banners`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image_url: 'https://images.unsplash.com/unauth.jpg' })
    });
    assert.strictEqual(resNoAuth.status, 401);

    // Customer role attempting admin banner endpoint
    const resCust = await fetch(`${baseUrl}/hotel-admin/banners`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`
      },
      body: JSON.stringify({ image_url: 'https://images.unsplash.com/unauth.jpg' })
    });
    assert.strictEqual(resCust.status, 403);
  });

  // 9. Customer API updated cover aur banner return karti hai
  test('9. Customer endpoints (GET /api/banners, GET /api/hotels/:id, /summary) return synced cover and banners', async () => {
    // Add an active banner for HTL-001
    const testImage = 'https://images.unsplash.com/photo-customer-view.jpg';
    await fetch(`${baseUrl}/hotel-admin/banners`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${owner1Token}`
      },
      body: JSON.stringify({
        title: 'Customer Highlight Banner',
        image_url: testImage,
        sort_order: 0,
        is_active: true
      })
    });

    // 1. GET /api/banners?hotel_id=HTL-001
    const bannerRes = await fetch(`${baseUrl}/banners?hotel_id=${testHotelId}`);
    assert.strictEqual(bannerRes.status, 200);
    const bannerData = await bannerRes.json();
    assert.strictEqual(bannerData.success, true);
    assert.ok(bannerData.banners.length > 0);
    assert.strictEqual(bannerData.banners[0].image_url, testImage);

    // 2. GET /api/hotels/HTL-001
    const hotelRes = await fetch(`${baseUrl}/hotels/${testHotelId}`);
    assert.strictEqual(hotelRes.status, 200);
    const hotelData = await hotelRes.json();
    assert.strictEqual(hotelData.success, true);
    assert.strictEqual(hotelData.hotel.cover_image, testImage);

    // 3. GET /api/hotels/HTL-001/summary
    const summaryRes = await fetch(`${baseUrl}/hotels/${testHotelId}/summary`);
    assert.strictEqual(summaryRes.status, 200);
    const summaryData = await summaryRes.json();
    assert.strictEqual(summaryData.success, true);
    assert.strictEqual(summaryData.summary.cover_image, testImage);
  });
});
