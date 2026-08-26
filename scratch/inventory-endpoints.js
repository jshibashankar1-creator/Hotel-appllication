import fs from 'fs';
import path from 'path';

const routesDir = './server/src/routes';
const files = fs.readdirSync(routesDir).filter(f => f.endsWith('.js'));

const endpointsMap = new Map();
for (const f of files) {
  const content = fs.readFileSync(path.join(routesDir, f), 'utf8');
  const routePrefix = f === 'admin.routes.js' ? '/api/admin' :
                      f === 'auth.routes.js' ? '/api/auth' :
                      f === 'hotelAdmin.routes.js' ? '/api/hotel-admin' :
                      f === 'hotel.routes.js' ? '/api/hotels' :
                      f === 'room.routes.js' ? '/api/rooms' :
                      f === 'availability.routes.js' ? '/api/availability' :
                      f === 'booking.routes.js' ? '/api/bookings' :
                      f === 'payment.routes.js' ? '/api/payments' :
                      f === 'refund.routes.js' ? '/api/refunds' :
                      f === 'review.routes.js' ? '/api/reviews' :
                      f === 'support.routes.js' ? '/api/support' :
                      f === 'commission.routes.js' ? '/api/commissions' :
                      f === 'report.routes.js' ? '/api/reports' :
                      f === 'settings.routes.js' ? '/api/settings' :
                      f === 'owner.routes.js' ? '/api/owners' : '';

  const regex = /router\.(get|post|put|delete|patch)\(\s*['"]([^'"]+)['"]/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const method = match[1].toUpperCase();
    const subPath = match[2] === '/' ? '' : (match[2].startsWith('/') ? match[2] : '/' + match[2]);
    const key = `${method} ${routePrefix}${subPath}`;
    endpointsMap.set(key, f);
  }
}
endpointsMap.set('GET /api/health', 'app.js');
console.log('Total Unique Method+Path Endpoints:', endpointsMap.size);
