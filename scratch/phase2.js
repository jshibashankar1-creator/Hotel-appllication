import fs from 'fs';
import path from 'path';

const routesDir = 'd:/Hotel-app/server/src/routes';
const files = fs.readdirSync(routesDir);

files.forEach(file => {
  const filePath = path.join(routesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // Fix admin.routes.js broad gate
  if (file === 'admin.routes.js') {
    if (content.includes('requireRole(...ADMIN_ROLES)')) {
      content = content.replace(/requireRole\(\.\.\.ADMIN_ROLES\)/g, 'requireRole(...PLATFORM_ADMIN_ROLES)');
      content = content.replace(/import \{ ADMIN_ROLES/g, 'import { PLATFORM_ADMIN_ROLES, ADMIN_ROLES');
      changed = true;
    }
    
    // Explicitly secure user management routes
    if (content.includes("router.post('/users',")) {
      content = content.replace(/router\.post\('\/users',/, "router.post('/users', requireRole('super_admin'),");
      changed = true;
    }
  }
  
  // Fix support.routes.js
  if (file === 'support.routes.js') {
    if (content.includes("requireRole('super_admin', 'admin', 'support_admin', 'finance_admin', 'hotel_admin')")) {
      content = content.replace(/requireRole\('super_admin', 'admin', 'support_admin', 'finance_admin', 'hotel_admin'\)/g, "requireRole('super_admin', 'admin', 'support_admin')");
      changed = true;
    }
  }
  
  // Fix refund.routes.js
  if (file === 'refund.routes.js') {
    // Make sure support_admin can't access
    // Currently requireRole('super_admin', 'admin', 'finance_admin') - which is fine.
  }
  
  // Fix report.routes.js
  if (file === 'report.routes.js') {
    if (content.includes("requireRole('owner', 'hotel_admin', 'super_admin', 'admin')")) {
      // It's owner KPIs, should be available to them. 
    }
    if (content.includes("requireRole('super_admin', 'admin', 'finance_admin', 'support_admin', 'hotel_admin')")) {
      content = content.replace(/requireRole\('super_admin', 'admin', 'finance_admin', 'support_admin', 'hotel_admin'\)/g, "requireRole('super_admin', 'admin', 'finance_admin')");
      changed = true;
    }
  }
  
  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});
console.log('Phase 2 Route Auditing & Patching complete.');
