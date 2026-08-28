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
          if (Array.isArray(this.data.hotels)) {
            this.data.hotels.forEach(h => {
              if (h.pickup_service_enabled === undefined) h.pickup_service_enabled = true;
              if (!Array.isArray(h.pickup_locations) || h.pickup_locations.length === 0) {
                h.pickup_locations = [
                  { id: `LOC-${h.id}-1`, name: 'Netaji Subhash Chandra Bose Int\'l Airport (CCU)', type: 'airport', address: 'Jessore Rd, Dum Dum, Kolkata', active: true },
                  { id: `LOC-${h.id}-2`, name: 'New Digha Railway Station', type: 'railway', address: 'Station Road, New Digha', active: true },
                  { id: `LOC-${h.id}-3`, name: 'Digha Central Bus Stand', type: 'bus', address: 'State Highway 57, Digha', active: true }
                ];
              }
              if (!Array.isArray(h.pickup_vehicles) || h.pickup_vehicles.length === 0) {
                h.pickup_vehicles = [
                  { id: `VEH-${h.id}-1`, name: 'Executive Sedan', type: 'Sedan', capacity: 4, price: 800, vehicle_number: 'WB-30-AB-1290', active: true },
                  { id: `VEH-${h.id}-2`, name: 'Premium Luxury SUV', type: 'SUV', capacity: 6, price: 1200, vehicle_number: 'WB-30-CD-4421', active: true },
                  { id: `VEH-${h.id}-3`, name: 'Group Tempo Traveller', type: 'Tempo Traveller', capacity: 12, price: 2000, vehicle_number: 'WB-30-EF-8812', active: true }
                ];
              }
            });
          }
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

  getRooms() { this.load(); return this.data.rooms; }
  getRoomById(id) {
    this.load();
    let r = this.data.rooms.find(r => r.id === id);
    if (!r) {
      r = this.data.rooms.find(rm => rm.room_name && id && (rm.room_name.toLowerCase().includes(String(id).toLowerCase()) || String(id).toLowerCase().includes(rm.room_name.toLowerCase())));
    }
    return r;
  }
  getRoomsByHotel(hotelId) {
    this.load();
    let rooms = this.data.rooms.filter(r => r.hotel_id === hotelId && (r.is_active !== false));
    if (rooms.length === 0) {
      const hotel = this.data.hotels.find(h => h.id === hotelId);
      if (hotel) {
        const autoRoom1 = {
          id: `RM-${hotelId}-1`,
          hotel_id: hotelId,
          room_name: 'Heritage AC Room',
          room_type: 'Deluxe Room',
          description: 'Spacious air-conditioned room with modern amenities.',
          max_guests: 2,
          total_inventory: 15,
          price_per_night: 2800,
          photos: ['https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80'],
          is_active: true
        };
        const autoRoom2 = {
          id: `RM-${hotelId}-2`,
          hotel_id: hotelId,
          room_name: 'Colonial Ocean Suite',
          room_type: 'Suite',
          description: 'Panoramic view suite with king bed and balcony.',
          max_guests: 3,
          total_inventory: 10,
          price_per_night: 4200,
          photos: ['https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80'],
          is_active: true
        };
        this.data.rooms.push(autoRoom1, autoRoom2);
        this.save();
        rooms = [autoRoom1, autoRoom2];
      }
    }
    return rooms;
  }
  getRoomsByHotelId(hotelId) { return this.getRoomsByHotel(hotelId); }

  getAvailability(roomId, date) {
    this.load();
    if (roomId && date) {
      return this.data.room_availability.find(a => a.room_id === roomId && a.date === date);
    }
    return this.data.room_availability;
  }

  getBookings() { this.load(); return this.data.bookings; }
  getBookingById(id) { this.load(); return this.data.bookings.find(b => b.id === id || b.booking_code === id); }
  getBookingsByCustomer(customerId) { this.load(); return this.data.bookings.filter(b => b.customer_id === customerId); }
  getBookingsByHotel(hotelId) { this.load(); return this.data.bookings.filter(b => b.hotel_id === hotelId); }

  getPickups(hotelId = null) {
    this.load();
    const bookingsWithPickup = (this.data.bookings || []).filter(b => b.pickup && b.pickup.required);
    if (hotelId) {
      return bookingsWithPickup.filter(b => b.hotel_id === hotelId);
    }
    return bookingsWithPickup;
  }

  getPayments() { this.load(); return this.data.payments; }
  getRefunds() { this.load(); return this.data.refunds; }
  getCommissionLedger() {
    this.load();
    const bookings = this.data.bookings || [];
    return bookings.map(b => ({
      booking_id: b.id,
      booking_code: b.booking_code,
      hotel_name: b.hotel_name,
      customer_name: b.customer_name,
      total_amount: b.total_amount,
      commission_rate: b.commission_rate,
      commission_amount: b.commission_amount,
      owner_payout: b.owner_payout,
      payment_status: b.payment_status,
      created_at: b.created_at
    }));
  }
  getReviews(hotelId) {
    this.load();
    if (hotelId) return this.data.reviews.filter(r => r.hotel_id === hotelId);
    return this.data.reviews;
  }

  getSupportTickets(userId = null) {
    this.load();
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
