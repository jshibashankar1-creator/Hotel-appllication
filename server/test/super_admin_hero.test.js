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
let superAdminToken;
let generalAdminToken;
let hotelAdminToken;
let ownerToken;
let customerToken;

let originalPlatformSettings;
let originalAuditLogs;

before(async () => {
  // Start server on ephemeral port
  await new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}/api`;
      resolve();
    });
  });

  // Preserve initial platform settings and audit logs for pristine cleanup in after()
  db.load();
  originalPlatformSettings = JSON.parse(JSON.stringify(db.data.platform_settings || {}));
  originalAuditLogs = JSON.parse(JSON.stringify(db.data.audit_logs || []));

  // Generate tokens for each role
  superAdminToken = jwt.sign({ userId: 'USR-SUPER-ADMIN' }, JWT_SECRET, { expiresIn: '1h' });
  generalAdminToken = jwt.sign({ userId: 'USR-ADMIN-GEN' }, JWT_SECRET, { expiresIn: '1h' });
  hotelAdminToken = jwt.sign({ userId: 'USR-HOTEL-ADMIN-MAIN' }, JWT_SECRET, { expiresIn: '1h' });
  ownerToken = jwt.sign({ userId: 'USR-OWNER-1' }, JWT_SECRET, { expiresIn: '1h' });
  customerToken = jwt.sign({ userId: 'USR-CUST-1' }, JWT_SECRET, { expiresIn: '1h' });
});

after(async () => {
  // Restore initial platform settings and audit logs to prevent test pollution
  db.transaction((data) => {
    data.platform_settings = originalPlatformSettings;
    data.audit_logs = originalAuditLogs;
  });

  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
});

describe('Super Admin Home Hero Background Authorization & Persistence Suite', () => {
  const sampleHeroUrl = 'https://res.cloudinary.com/demo/image/upload/sample_hero.jpg';
  const samplePublicId = 'hotelhub/home-hero/sample_hero';

  // 1. Public retrieval of Home Hero
  test('1. GET /api/settings/home-hero is publicly accessible without authentication', async () => {
    const res = await fetch(`${baseUrl}/settings/home-hero`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok('image_url' in data);
  });

  // 2. Super Admin can update hero background
  test('2. Super Admin can update home hero background image via PUT /api/settings/home-hero', async () => {
    const res = await fetch(`${baseUrl}/settings/home-hero`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${superAdminToken}`
      },
      body: JSON.stringify({
        image_url: sampleHeroUrl,
        public_id: samplePublicId
      })
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.image_url, sampleHeroUrl);
    assert.strictEqual(data.public_id, samplePublicId);

    // Verify database persistence directly
    const storedHero = db.getHomeHero();
    assert.strictEqual(storedHero.image_url, sampleHeroUrl);
    assert.strictEqual(storedHero.public_id, samplePublicId);
  });

  // 3. Customer endpoint reflects updated image
  test('3. Customer app endpoint GET /api/settings/home-hero returns latest saved image', async () => {
    const res = await fetch(`${baseUrl}/settings/home-hero`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.image_url, sampleHeroUrl);
  });

  // 4. Role Authorization: Hotel Admin is forbidden (403)
  test('4. Hotel Admin cannot update home hero image (returns 403 Forbidden)', async () => {
    const res = await fetch(`${baseUrl}/settings/home-hero`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${hotelAdminToken}`
      },
      body: JSON.stringify({
        image_url: 'https://malicious.example.com/hacked.jpg'
      })
    });

    assert.strictEqual(res.status, 403, 'Hotel Admin must be blocked with 403 Forbidden');
    const data = await res.json();
    assert.strictEqual(data.success, false);

    // Ensure hero image was not altered
    assert.strictEqual(db.getHomeHero().image_url, sampleHeroUrl);
  });

  // 5. Role Authorization: Owner is forbidden (403)
  test('5. Owner cannot update home hero image (returns 403 Forbidden)', async () => {
    const res = await fetch(`${baseUrl}/settings/home-hero`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ownerToken}`
      },
      body: JSON.stringify({
        image_url: 'https://malicious.example.com/owner.jpg'
      })
    });

    assert.strictEqual(res.status, 403, 'Owner must be blocked with 403 Forbidden');
    const data = await res.json();
    assert.strictEqual(data.success, false);

    // Ensure hero image was not altered
    assert.strictEqual(db.getHomeHero().image_url, sampleHeroUrl);
  });

  // 6. Role Authorization: Customer is forbidden (403)
  test('6. Customer cannot update home hero image (returns 403 Forbidden)', async () => {
    const res = await fetch(`${baseUrl}/settings/home-hero`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`
      },
      body: JSON.stringify({
        image_url: 'https://malicious.example.com/customer.jpg'
      })
    });

    assert.strictEqual(res.status, 403, 'Customer must be blocked with 403 Forbidden');
    const data = await res.json();
    assert.strictEqual(data.success, false);

    // Ensure hero image was not altered
    assert.strictEqual(db.getHomeHero().image_url, sampleHeroUrl);
  });

  // 7. Role Authorization: Regular Admin is forbidden from hero modifications (403)
  test('7. General Admin cannot update home hero image via /home-hero (returns 403 Forbidden)', async () => {
    const res = await fetch(`${baseUrl}/settings/home-hero`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${generalAdminToken}`
      },
      body: JSON.stringify({
        image_url: 'https://malicious.example.com/admin.jpg'
      })
    });

    assert.strictEqual(res.status, 403, 'General Admin must be blocked with 403 Forbidden');
    const data = await res.json();
    assert.strictEqual(data.success, false);
  });

  // 8. General Admin attempting to update home_hero_bg_image via PUT /api/settings is rejected (403)
  test('8. General Admin cannot set home_hero_bg_image through general PUT /api/settings (403)', async () => {
    const res = await fetch(`${baseUrl}/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${generalAdminToken}`
      },
      body: JSON.stringify({
        home_hero_bg_image: 'https://malicious.example.com/bypass.jpg'
      })
    });

    assert.strictEqual(res.status, 403, 'Only super_admin can set home_hero_bg_image through /settings');
    const data = await res.json();
    assert.strictEqual(data.success, false);
    assert.match(data.message, /only super admin/i);
  });

  // 9. Unauthenticated request to PUT /api/settings/home-hero returns 401
  test('9. Unauthenticated request to PUT /api/settings/home-hero returns 401 Unauthorized', async () => {
    const res = await fetch(`${baseUrl}/settings/home-hero`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        image_url: 'https://example.com/image.jpg'
      })
    });

    assert.strictEqual(res.status, 401);
  });

  // 10. Upload route strict authorization checks
  test('10. POST /api/uploads/hero-image restricts non-super_admin roles with 403', async () => {
    // Hotel Admin
    const resHotelAdmin = await fetch(`${baseUrl}/uploads/hero-image`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${hotelAdminToken}` }
    });
    assert.strictEqual(resHotelAdmin.status, 403, 'Hotel Admin upload must return 403');

    // Owner
    const resOwner = await fetch(`${baseUrl}/uploads/hero-image`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${ownerToken}` }
    });
    assert.strictEqual(resOwner.status, 403, 'Owner upload must return 403');

    // Customer
    const resCustomer = await fetch(`${baseUrl}/uploads/hero-image`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${customerToken}` }
    });
    assert.strictEqual(resCustomer.status, 403, 'Customer upload must return 403');

    // General Admin
    const resAdmin = await fetch(`${baseUrl}/uploads/hero-image`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${generalAdminToken}` }
    });
    assert.strictEqual(resAdmin.status, 403, 'General Admin upload must return 403');

    // Unauthenticated
    const resUnauth = await fetch(`${baseUrl}/uploads/hero-image`, {
      method: 'POST'
    });
    assert.strictEqual(resUnauth.status, 401, 'Unauthenticated upload must return 401');
  });

  // 11. Super Admin upload validation: missing file returns 400
  test('11. Super Admin upload with missing file returns 400 Bad Request', async () => {
    const res = await fetch(`${baseUrl}/uploads/hero-image`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${superAdminToken}` }
    });

    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.strictEqual(data.success, false);
    assert.match(data.message, /no image file/i);
  });

  // 12. Super Admin upload validation: invalid file format returns 400
  test('12. Super Admin upload with invalid file format returns 400 Bad Request', async () => {
    const form = new FormData();
    const textBlob = new Blob(['sample text file'], { type: 'text/plain' });
    form.append('image', textBlob, 'test.txt');

    const res = await fetch(`${baseUrl}/uploads/hero-image`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${superAdminToken}` },
      body: form
    });

    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.strictEqual(data.success, false);
    assert.match(data.message, /only jpg, jpeg, png, and webp/i);
  });

  // 13. Super Admin can remove hero background
  test('13. Super Admin can delete/remove home hero image via DELETE /api/settings/home-hero', async () => {
    const res = await fetch(`${baseUrl}/settings/home-hero`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${superAdminToken}`
      }
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.image_url, null);

    // Verify public endpoint returns null image
    const pubRes = await fetch(`${baseUrl}/settings/home-hero`);
    const pubData = await pubRes.json();
    assert.strictEqual(pubData.image_url, null);
  });

  // 14. Non-super admin cannot delete hero image
  test('14. Unauthorized roles cannot DELETE /api/settings/home-hero (403)', async () => {
    const res = await fetch(`${baseUrl}/settings/home-hero`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${hotelAdminToken}`
      }
    });

    assert.strictEqual(res.status, 403);
  });

  // 15. Hotel promotional banners and hotel covers remain unaffected
  test('15. Hotel promotional banners and hotel cover images remain separate and fully functional', async () => {
    // Hotel HTL-001 banners
    const bannerRes = await fetch(`${baseUrl}/banners?hotel_id=HTL-001`);
    assert.strictEqual(bannerRes.status, 200);
    const bannerData = await bannerRes.json();
    assert.strictEqual(bannerData.success, true);
    assert.ok(Array.isArray(bannerData.banners));

    // Hotel HTL-001 details & cover image
    const hotelRes = await fetch(`${baseUrl}/hotels/HTL-001`);
    assert.strictEqual(hotelRes.status, 200);
    const hotelData = await hotelRes.json();
    assert.strictEqual(hotelData.success, true);
    assert.ok(hotelData.hotel.cover_image);
  });
});
