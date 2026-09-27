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
    if (content.includes("['super_admin', 'admin', 'support_admin', 'finance_admin', 'hotel_admin']")) {
       // it's the ADMIN_ROLES array from User.js, which we already patched by using PLATFORM_ADMIN_ROLES.
    }
  }
  
  // Fix support.routes.js
  if (file === 'support.routes.js') {
    if (content.includes("['super_admin', 'admin', 'support_admin', 'finance_admin', 'hotel_admin']")) {
      content = content.replace(/\['super_admin', 'admin', 'support_admin', 'finance_admin', 'hotel_admin'\]/g, "['super_admin', 'admin', 'support_admin']");
      changed = true;
    }
  }

  // Fix report.routes.js (remove hotel_admin and support_admin from admin kpis)
  if (file === 'report.routes.js') {
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
console.log('Phase 2 Route Auditing & Patching complete part 2.');
