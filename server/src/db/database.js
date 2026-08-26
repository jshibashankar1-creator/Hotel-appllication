import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultDbPath = path.join(__dirname, 'database.json');
const dbFileEnv = process.env.DATABASE_FILE || (!process.env.DATABASE_URI?.startsWith('mongodb') ? process.env.DATABASE_URI : null);
const DB_FILE = dbFileEnv || defaultDbPath;

class RelationalDatabase {
  constructor() {
    this.data = {
      users: [],
      owner_profiles: [],
      hotels: [],
      rooms: [],
      room_availability: [],
      bookings: [],
      payments: [],
      refunds: [],
      reviews: [],
      support_tickets: [],
      audit_logs: [],
      platform_settings: {
        commission_rate: 15,
        app_mode: 'live',
        payment_mode: 'production',
        cancellation_window_hours: 24,
        cancel_fee_pct: 10,
        support_email: 'support@hotelhub.com',
        support_phone: '+91 1800 200 8899',
        updated_at: new Date().toISOString()
      }
    };
    this.lock = false;
    this.load();
  }

  load() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const stats = fs.statSync(DB_FILE);
        if (!this.lastMtime || stats.mtimeMs > this.lastMtime) {
          const raw = fs.readFileSync(DB_FILE, 'utf-8');
          this.data = JSON.parse(raw);
          if (!this.data.audit_logs) this.data.audit_logs = [];
          this.lastMtime = stats.mtimeMs;
        }
      } else {
        this.save();
      }
    } catch (err) {
      console.error('Error loading DB file:', err);
    }
  }

  save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
      const stats = fs.statSync(DB_FILE);
      this.lastMtime = stats.mtimeMs;
    } catch (err) {
      console.error('Error saving DB file:', err);
    }
  }

  // Atomic transaction wrapper
  transaction(fn) {
    this.load();
    if (this.lock) {
      throw new Error('Database is busy with another write transaction. Please retry.');
    }
    this.lock = true;
    try {
      const result = fn(this.data);
      this.save();
      return result;
    } finally {
      this.lock = false;
    }
  }

  // --- QUERY HELPERS ---
  getUsers() { this.load(); return this.data.users; }
  getUserById(id) { this.load(); return this.data.users.find(u => u.id === id); }
  getUserByEmail(email) {
    this.load();
    if (!email) return null;
    const clean = email.trim().toLowerCase();
    return this.data.users.find(u => u.email && u.email.trim().toLowerCase() === clean);
  }
  getAdminUsers() {
    this.load();
    const adminRoles = new Set(['super_admin', 'admin', 'support_admin', 'finance_admin', 'hotel_admin']);
    return this.data.users.filter(u => adminRoles.has(u.role));
  }
  hasSuperAdmin() {
    this.load();
    return this.data.users.some(u => u.role === 'super_admin' && u.status === 'active');
  }

  getOwnerProfiles() { this.load(); return this.data.owner_profiles; }
  getOwnerProfile(userId) { this.load(); return this.data.owner_profiles.find(o => o.user_id === userId); }

  getHotels() { this.load(); return this.data.hotels; }
  getHotelById(id) { this.load(); return this.data.hotels.find(h => h.id === id); }
  getHotelsByOwner(ownerId) { this.load(); return this.data.hotels.filter(h => h.owner_id === ownerId); }

  getRooms() { return this.data.rooms; }
  getRoomById(id) { return this.data.rooms.find(r => r.id === id); }
  getRoomsByHotel(hotelId) { return this.data.rooms.filter(r => r.hotel_id === hotelId && (r.is_active !== false)); }
  getRoomsByHotelId(hotelId) { return this.data.rooms.filter(r => r.hotel_id === hotelId); }

  getAvailability(roomId, date) {
    if (roomId && date) {
      return this.data.room_availability.find(a => a.room_id === roomId && a.date === date);
    }
    return this.data.room_availability;
  }

  getBookings() { return this.data.bookings; }
  getBookingById(id) { return this.data.bookings.find(b => b.id === id || b.booking_code === id); }
  getBookingsByCustomer(customerId) { return this.data.bookings.filter(b => b.customer_id === customerId); }
  getBookingsByHotel(hotelId) { return this.data.bookings.filter(b => b.hotel_id === hotelId); }

  getPayments() { return this.data.payments; }
  getRefunds() { return this.data.refunds; }
  getReviews(hotelId) {
    if (hotelId) return this.data.reviews.filter(r => r.hotel_id === hotelId);
    return this.data.reviews;
  }

  getSupportTickets(userId = null) {
    if (userId) return this.data.support_tickets.filter(t => t.user_id === userId);
    return this.data.support_tickets;
  }

  getAuditLogs() {
    return this.data.audit_logs || [];
  }

  addAuditLog(entry) {
    const log = {
      id: `LOG-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
      timestamp: new Date().toISOString(),
      ...entry
    };
    this.transaction(data => {
      if (!data.audit_logs) data.audit_logs = [];
      data.audit_logs.unshift(log);
      if (data.audit_logs.length > 500) data.audit_logs.pop(); // Keep last 500 logs
    });
    return log;
  }

  getSettings() { return this.data.platform_settings; }
}

export const db = new RelationalDatabase();
