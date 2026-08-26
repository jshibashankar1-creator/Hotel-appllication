import fs from 'fs';
import path from 'path';

let passed = 0;
let failed = 0;

function assert(condition, description) {
  if (condition) {
    console.log(`  ✅ [PASS] ${description}`);
    passed++;
  } else {
    console.error(`  ❌ [FAIL] ${description}`);
    failed++;
  }
}

console.log('================================================================');
console.log('🎨 HOTELHUB ADMIN PANEL UI & RESPONSIVENESS VERIFICATION');
console.log('================================================================\n');

// 1. Verify index.html
const indexHtml = fs.readFileSync(path.resolve('./frontend/index.html'), 'utf-8');
assert(!indexHtml.includes('btn-portal-owner'), '1. index.html does not contain btn-portal-owner');
assert(!indexHtml.includes('Hotel Owner Panel'), '2. index.html does not contain "Hotel Owner Panel" button');
assert(indexHtml.includes('header-mobile-toggle'), '3. index.html contains mobile hamburger toggle button');
assert(indexHtml.includes('header-user-pill'), '4. index.html contains SaaS header user pill');
assert(indexHtml.includes('sidebar-backdrop'), '5. index.html contains mobile drawer backdrop overlay');

// 2. Verify main.js
const mainJs = fs.readFileSync(path.resolve('./frontend/src/main.js'), 'utf-8');
assert(!mainJs.includes('btn-portal-owner'), '6. main.js does not contain btn-portal-owner reference');
assert(mainJs.includes('initMobileDrawer') || mainJs.includes('sidebar-backdrop'), '7. main.js implements mobile drawer handling');
assert(mainJs.includes('renderLoginView'), '8. main.js imports and renders unified LoginView');
assert(mainJs.includes('renderRegisterView'), '8b. main.js imports and renders unified RegisterView');

// 2b. Verify LoginView.js and RegisterView.js
const loginJs = fs.readFileSync(path.resolve('./frontend/src/views/auth/LoginView.js'), 'utf-8');
assert(loginJs.includes('unified-login-form'), '8c. LoginView.js contains unified login form');
assert(loginJs.includes('login-password'), '8d. LoginView.js contains password input with toggle');
assert(loginJs.includes('#/register'), '8e. LoginView.js contains link to partner registration');

const registerJs = fs.readFileSync(path.resolve('./frontend/src/views/auth/RegisterView.js'), 'utf-8');
assert(registerJs.includes('partner-register-form'), '8f. RegisterView.js contains partner registration form');
assert(registerJs.includes('#/login'), '8g. RegisterView.js contains link back to login');

// 3. Verify main.css & theme.css
const mainCss = fs.readFileSync(path.resolve('./frontend/src/styles/main.css'), 'utf-8');
const themeCss = fs.readFileSync(path.resolve('./frontend/src/styles/theme.css'), 'utf-8');
assert(themeCss.includes('--sidebar-width: 250px') || mainCss.includes('--sidebar-width: 250px'), '9. theme.css / main.css sets fixed 250px sidebar width');
assert(mainCss.includes('grid-template-columns: repeat(4, minmax(0, 1fr))'), '10. main.css sets 4-column KPI cards on desktop');
assert(mainCss.includes('grid-template-columns: 2fr 1fr'), '11. main.css sets 2fr 1fr desktop layout for bookings & action desk');
assert(mainCss.includes('@media (max-width: 1024px)'), '12. main.css contains tablet drawer breakpoint (<= 1024px)');
assert(mainCss.includes('@media (max-width: 768px)'), '13. main.css contains mobile breakpoint (<= 768px)');
assert(mainCss.includes('@media (max-width: 480px)'), '14. main.css contains small mobile breakpoint (<= 480px)');

// 4. Verify AdminDashboardView.js
const dashboardJs = fs.readFileSync(path.resolve('./frontend/src/views/admin/AdminDashboardView.js'), 'utf-8');
assert(dashboardJs.includes('formatDateRange'), '15. AdminDashboardView.js formats date ranges cleanly');
assert(!dashboardJs.includes('guest_name</td>'), '16. AdminDashboardView.js does not have duplicate unclosed td tags');
assert(dashboardJs.includes('Priority Action Desk'), '17. AdminDashboardView.js contains polished Priority Action Desk');
assert(dashboardJs.includes('Operational Booking Overview'), '18. AdminDashboardView.js contains 5 compact booking overview statistics');
assert(dashboardJs.includes('desktop-booking-table-container'), '19. AdminDashboardView.js renders desktop table container');
assert(dashboardJs.includes('mobile-booking-cards-container'), '20. AdminDashboardView.js renders mobile booking cards container');
assert(dashboardJs.includes('ops-item-full'), '21. AdminDashboardView.js uses ops-item-full for 2-column mobile grid');

// 5. Verify main.css Dual Mode Rules
assert(mainCss.includes('.desktop-booking-table-container'), '22. main.css has .desktop-booking-table-container rules');
assert(mainCss.includes('.mobile-booking-cards-container'), '23. main.css has .mobile-booking-cards-container rules');
assert(mainCss.includes('.ops-item-full'), '24. main.css has .ops-item-full spanning rules on mobile');

console.log('\n----------------------------------------------------------------');
console.log(`TOTAL UI ASSERTIONS:\n  Passed: ${passed}\n  Failed: ${failed}`);
console.log('================================================================\n');

process.exit(failed > 0 ? 1 : 0);
