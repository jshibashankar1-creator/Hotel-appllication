import fetch from 'node-fetch';

const routes = [
  '/',
  '/login',
  '/admin',
  '/admin/dashboard',
  '/admin/support',
  '/admin/bookings',
  '/admin/finance',
  '/hotel-admin',
  '/hotel-admin/dashboard'
];

async function checkRoutes() {
  console.log('================================================================');
  console.log('HOTELHUB ENTERPRISE — NETLIFY SPA PRODUCTION ROUTING AUDIT');
  console.log('================================================================');
  
  let passed = 0;
  for (const route of routes) {
    try {
      const res = await fetch('http://localhost:4173' + route);
      const text = await res.text();
      const hasApp = text.includes('id="app"') && text.includes('HotelHub');
      if (res.status === 200 && hasApp) {
        console.log(`✅ [PASS] ${route.padEnd(25)} -> HTTP 200 OK (Loads SPA entry HTML)`);
        passed++;
      } else {
        console.log(`❌ [FAIL] ${route.padEnd(25)} -> HTTP ${res.status}`);
      }
    } catch (err) {
      console.log(`❌ [ERR]  ${route.padEnd(25)} -> ${err.message}`);
    }
  }

  // Test asset loading
  const assetRes = await fetch('http://localhost:4173/assets/index-BYGm0P_w.css');
  if (assetRes.status === 200) {
    console.log(`✅ [PASS] ${'/assets/index-BYGm0P_w.css'.padEnd(25)} -> HTTP 200 OK (CSS Asset loaded)`);
    passed++;
  } else {
    console.log(`❌ [FAIL] CSS asset failed: HTTP ${assetRes.status}`);
  }

  // Test _redirects file presence
  const redirRes = await fetch('http://localhost:4173/_redirects');
  const redirText = await redirRes.text();
  if (redirText.includes('/*    /index.html   200')) {
    console.log(`✅ [PASS] ${'/_redirects'.padEnd(25)} -> Contains exact Netlify SPA rewrite rule`);
    passed++;
  }

  console.log('================================================================');
  console.log(`AUDIT RESULTS: ${passed} PASSED`);
  console.log('================================================================');
}

checkRoutes();
