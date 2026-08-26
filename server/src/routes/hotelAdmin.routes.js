import { Router } from 'express';
import { db } from '../db/database.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

// Only Hotel Admin and Owner roles can access this router
router.use(authenticate, requireRole('hotel_admin', 'owner'));

// Helper: Resolve the authenticated user's assigned hotel
function getAssignedHotel(req, res) {
  const user = db.getUserById(req.user.id);
  const hotelId = req.user.hotel_id || (user ? user.hotel_id : null);
  const hotel = db.getHotels().find(
    h => h.owner_id === req.user.id || h.hotel_admin_id === req.user.id || (hotelId && h.id === hotelId)
  );
  if (!hotel) {
    res.status(404).json({
      success: false,
      message: 'Your hotel account has not been assigned to a property yet. Please contact Admin.'
    });
    return null;
  }
  return hotel;
}

// 1. GET /api/hotel-admin/dashboard (and /kpis) — Hotel-specific metrics
const handleDashboard = (req, res) => {
  const hotel = getAssignedHotel(req, res);
  if (!hotel) return;

  const rooms = db.getRoomsByHotelId(hotel.id);
  const bookings = db.getBookings().filter(b => b.hotel_id === hotel.id);

  const todayStr = new Date().toISOString().slice(0, 10);
  const todaysArrivals = bookings.filter(b => b.check_in_date === todayStr && b.booking_status === 'confirmed');
  const todaysDepartures = bookings.filter(b => b.check_out_date === todayStr && b.booking_status === 'checked_in');

  const occupiedRooms = bookings.filter(b => b.booking_status === 'checked_in').length;
  const totalRoomsCount = rooms.reduce((sum, r) => sum + (r.total_inventory || 1), 0);
  const availableRoomsCount = Math.max(0, totalRoomsCount - occupiedRooms);

  const upcomingBookings = bookings.filter(b => b.check_in_date >= todayStr && b.booking_status === 'confirmed');
  const hotelRevenue = bookings.reduce((sum, b) => sum + (b.owner_payout || 0), 0);

  const pendingCheckins = bookings.filter(b => b.check_in_date <= todayStr && b.booking_status === 'confirmed');
  const pendingCheckouts = bookings.filter(b => b.check_out_date <= todayStr && b.booking_status === 'checked_in');

  const kpis = {
    total_rooms: totalRoomsCount,
    available_rooms: availableRoomsCount,
    occupied_rooms: occupiedRooms,
    todays_arrivals: todaysArrivals.length,
    todays_departures: todaysDepartures.length,
    upcoming_bookings: upcomingBookings.length,
    hotel_revenue: hotelRevenue,
    pending_checkins: pendingCheckins.length,
    pending_checkouts: pendingCheckouts.length,
    total_bookings: bookings.length
  };

  return res.json({
    success: true,
    hotel: {
      id: hotel.id,
      name: hotel.name,
      city: hotel.city,
      status: hotel.status
    },
    data: {
      totalRooms: totalRoomsCount,
      availableRooms: availableRoomsCount,
      occupiedRooms: occupiedRooms,
      todaysArrivals: todaysArrivals.length,
      todaysDepartures: todaysDepartures.length,
      upcomingBookings: upcomingBookings.length,
      hotelRevenue: hotelRevenue,
      pendingCheckins: pendingCheckins.length,
      pendingCheckouts: pendingCheckouts.length
    },
    kpis,
    recent_bookings: bookings.slice(0, 10)
  });
};

router.get('/dashboard', handleDashboard);
router.get('/kpis', handleDashboard);

// 2. GET /api/hotel-admin/property & /hotel — Get Assigned Hotel Details
const handleGetHotel = (req, res) => {
  const hotel = getAssignedHotel(req, res);
  if (!hotel) return;
  return res.json({ success: true, hotel, property: hotel });
};
router.get('/hotel', handleGetHotel);
router.get('/property', handleGetHotel);

// 3. PUT /api/hotel-admin/property & /hotel — Update Assigned Hotel Details
const handleUpdateHotel = (req, res) => {
  const hotel = getAssignedHotel(req, res);
  if (!hotel) return;

  const { name, description, address, city, state, postal_code, pincode, amenities, cover_image, gallery } = req.body;

  const updatedHotel = db.transaction(data => {
    const target = data.hotels.find(h => h.id === hotel.id);
    if (!target) return null;

    if (name) target.name = name.trim();
    if (description !== undefined) target.description = description;
    if (address !== undefined) target.address = address;
    if (city !== undefined) target.city = city;
    if (state !== undefined) target.state = state;
    if (postal_code !== undefined) target.postal_code = postal_code;
    if (pincode !== undefined) target.pincode = pincode;
    if (amenities !== undefined) target.amenities = amenities;
    if (cover_image !== undefined) target.cover_image = cover_image;
    if (gallery !== undefined) target.gallery = gallery;

    return target;
  });

  return res.json({ success: true, message: 'Property details updated successfully.', hotel: updatedHotel, property: updatedHotel });
};
router.put('/hotel', handleUpdateHotel);
router.put('/property', handleUpdateHotel);

// 4. GET /api/hotel-admin/rooms — Rooms belonging exclusively to this hotel
router.get('/rooms', (req, res) => {
  const hotel = getAssignedHotel(req, res);
  if (!hotel) return;
  const rooms = db.getRoomsByHotelId(hotel.id);
  return res.json({ success: true, count: rooms.length, rooms });
});

// 5. POST /api/hotel-admin/rooms — Create Room in this hotel
router.post('/rooms', (req, res) => {
  const hotel = getAssignedHotel(req, res);
  if (!hotel) return;

  const { name, type, base_price, total_inventory, max_occupancy, bed_type, amenities, images } = req.body;
  if (!name || !base_price) {
    return res.status(400).json({ success: false, message: 'Room name and base price are required.' });
  }

  const newRoom = {
    id: `RM-${Date.now()}`,
    hotel_id: hotel.id,
    name: name.trim(),
    type: type || 'Deluxe Room',
    base_price: Number(base_price),
    total_inventory: Number(total_inventory) || 1,
    max_occupancy: Number(max_occupancy) || 2,
    bed_type: bed_type || 'King Bed',
    amenities: amenities || ['Wi-Fi', 'Air Conditioning', 'Ensuite Bathroom'],
    images: images || [],
    created_at: new Date().toISOString()
  };

  db.transaction(data => {
    data.rooms.push(newRoom);
  });

  return res.status(201).json({ success: true, message: 'Room category created.', room: newRoom });
});

// 6. PUT /api/hotel-admin/rooms/:id — Update Room belonging to this hotel
router.put('/rooms/:id', (req, res) => {
  const hotel = getAssignedHotel(req, res);
  if (!hotel) return;

  const roomId = req.params.id;
  const updatedRoom = db.transaction(data => {
    const target = data.rooms.find(r => r.id === roomId && r.hotel_id === hotel.id);
    if (!target) return null;

    Object.assign(target, req.body, { id: target.id, hotel_id: hotel.id });
    return target;
  });

  if (!updatedRoom) {
    return res.status(404).json({ success: false, message: 'Room not found or does not belong to your hotel.' });
  }

  return res.json({ success: true, message: 'Room updated.', room: updatedRoom });
});

// 6b. DELETE /api/hotel-admin/rooms/:id — Delete Room strictly belonging to this hotel
router.delete('/rooms/:id', (req, res) => {
  const hotel = getAssignedHotel(req, res);
  if (!hotel) return;

  const roomId = req.params.id;
  let deleted = false;

  db.transaction(data => {
    const idx = data.rooms.findIndex(r => r.id === roomId && r.hotel_id === hotel.id);
    if (idx !== -1) {
      data.rooms.splice(idx, 1);
      deleted = true;
    }
  });

  if (!deleted) {
    return res.status(404).json({ success: false, message: 'Room not found or does not belong to your hotel.' });
  }

  return res.json({ success: true, message: 'Room category deleted successfully.' });
});

// 7. GET /api/hotel-admin/availability — Availability matrix for hotel rooms
router.get('/availability', (req, res) => {
  const hotel = getAssignedHotel(req, res);
  if (!hotel) return;

  const rooms = db.getRoomsByHotelId(hotel.id);
  const roomIds = new Set(rooms.map(r => r.id));

  const availability = db.getAvailability().filter(a => roomIds.has(a.room_id));
  return res.json({ success: true, count: availability.length, availability });
});

// 7b. PUT & POST /api/hotel-admin/availability — Block or update room availability
const handleUpdateAvailability = (req, res) => {
  const hotel = getAssignedHotel(req, res);
  if (!hotel) return;

  const { roomId, room_id, date, dates, isBlocked, is_available, status, reason } = req.body;
  const targetRoomId = roomId || room_id;

  const rooms = db.getRoomsByHotelId(hotel.id);
  const belongs = rooms.some(r => r.id === targetRoomId);
  if (!belongs) {
    return res.status(403).json({ success: false, message: 'Room does not belong to your assigned hotel property.' });
  }

  const datesToUpdate = Array.isArray(dates) ? dates : (date ? [date] : []);
  if (datesToUpdate.length === 0) {
    return res.status(400).json({ success: false, message: 'At least one date is required.' });
  }

  db.transaction(data => {
    if (!data.room_availability) data.room_availability = [];
    datesToUpdate.forEach(d => {
      const existing = data.room_availability.find(a => a.room_id === targetRoomId && a.date === d);
      if (existing) {
        existing.status = status || (isBlocked ? 'maintenance' : 'available');
        existing.is_available = is_available !== undefined ? is_available : !isBlocked;
        existing.reason = reason || existing.reason;
      } else {
        data.room_availability.push({
          id: `AVL-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          hotel_id: hotel.id,
          room_id: targetRoomId,
          date: d,
          status: status || (isBlocked ? 'maintenance' : 'available'),
          is_available: is_available !== undefined ? is_available : !isBlocked,
          reason: reason || 'Front desk management'
        });
      }
    });
  });

  return res.json({ success: true, message: 'Room availability updated.' });
};
router.put('/availability', handleUpdateAvailability);
router.post('/availability', handleUpdateAvailability);

// 8. GET /api/hotel-admin/bookings — Bookings belonging exclusively to this hotel
router.get('/bookings', (req, res) => {
  const hotel = getAssignedHotel(req, res);
  if (!hotel) return;

  const bookings = db.getBookings().filter(b => b.hotel_id === hotel.id);
  return res.json({ success: true, count: bookings.length, bookings });
});

// 8b. GET /api/hotel-admin/check-ins — Today's and upcoming check-ins
router.get('/check-ins', (req, res) => {
  const hotel = getAssignedHotel(req, res);
  if (!hotel) return;

  const todayStr = new Date().toISOString().slice(0, 10);
  const bookings = db.getBookings().filter(b => b.hotel_id === hotel.id);
  const arrivals = bookings.filter(b => b.check_in_date === todayStr && b.booking_status === 'confirmed');
  const checkedIn = bookings.filter(b => b.booking_status === 'checked_in');

  return res.json({
    success: true,
    todayArrivals: arrivals,
    activeStays: checkedIn,
    totalBookings: bookings.length
  });
});

// 9. POST & PUT /api/hotel-admin/check-in — Check in guest
const handleCheckIn = (req, res) => {
  const hotel = getAssignedHotel(req, res);
  if (!hotel) return;

  const bookingId = req.body.bookingId || req.body.id || req.params.id;
  if (!bookingId) {
    return res.status(400).json({ success: false, message: 'Booking ID is required.' });
  }

  let updatedBooking = null;
  db.transaction(data => {
    const b = data.bookings.find(item => (item.id === bookingId || item.booking_code === bookingId) && item.hotel_id === hotel.id);
    if (b) {
      b.booking_status = 'checked_in';
      b.check_in_time = new Date().toISOString();
      updatedBooking = b;
    }
  });

  if (!updatedBooking) {
    return res.status(404).json({ success: false, message: 'Booking not found for your property.' });
  }

  return res.json({ success: true, message: 'Guest checked in successfully.', booking: updatedBooking });
};
router.post('/check-in', handleCheckIn);
router.put('/check-in', handleCheckIn);
router.post('/check-in/:id', handleCheckIn);

// 10. POST & PUT /api/hotel-admin/check-out — Check out guest
const handleCheckOut = (req, res) => {
  const hotel = getAssignedHotel(req, res);
  if (!hotel) return;

  const bookingId = req.body.bookingId || req.body.id || req.params.id;
  if (!bookingId) {
    return res.status(400).json({ success: false, message: 'Booking ID is required.' });
  }

  let updatedBooking = null;
  db.transaction(data => {
    const b = data.bookings.find(item => (item.id === bookingId || item.booking_code === bookingId) && item.hotel_id === hotel.id);
    if (b) {
      b.booking_status = 'checked_out';
      b.check_out_time = new Date().toISOString();
      updatedBooking = b;
    }
  });

  if (!updatedBooking) {
    return res.status(404).json({ success: false, message: 'Booking not found for your property.' });
  }

  return res.json({ success: true, message: 'Guest checked out successfully.', booking: updatedBooking });
};
router.post('/check-out', handleCheckOut);
router.put('/check-out', handleCheckOut);
router.post('/check-out/:id', handleCheckOut);

// 11. GET /api/hotel-admin/earnings — Hotel net payouts (85%)
router.get('/earnings', (req, res) => {
  const hotel = getAssignedHotel(req, res);
  if (!hotel) return;

  const bookings = db.getBookings().filter(b => b.hotel_id === hotel.id && b.payment_status === 'paid');
  const totalRevenue = bookings.reduce((sum, b) => sum + (b.total_amount || 0), 0);
  const platformCommission = bookings.reduce((sum, b) => sum + (b.commission_amount || 0), 0);
  const netEarnings = bookings.reduce((sum, b) => sum + (b.owner_payout || 0), 0);

  return res.json({
    success: true,
    hotel: { id: hotel.id, name: hotel.name },
    earnings: {
      gross_bookings_amount: totalRevenue,
      platform_commission_deducted: platformCommission,
      net_hotel_earnings: netEarnings,
      paid_bookings_count: bookings.length
    },
    transactions: bookings.map(b => ({
      booking_id: b.id,
      guest_name: b.guest_name,
      dates: `${b.check_in_date} to ${b.check_out_date}`,
      total_amount: b.total_amount,
      commission_amount: b.commission_amount,
      net_payout: b.owner_payout,
      date: b.created_at
    }))
  });
});

// 12. GET /api/hotel-admin/support — Helpdesk tickets for this hotel
router.get('/support', (req, res) => {
  const hotel = getAssignedHotel(req, res);
  if (!hotel) return;

  const tickets = db.getSupportTickets().filter(t => t.hotel_id === hotel.id || t.user_id === req.user.id);
  return res.json({ success: true, count: tickets.length, tickets });
});

// 13. GET & PUT /api/hotel-admin/profile — Profile of the Hotel Admin
router.get('/profile', (req, res) => {
  const user = db.getUserById(req.user.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User profile not found.' });
  }
  const hotel = db.getHotels().find(h => h.id === req.user.hotel_id || h.owner_id === user.id || h.hotel_admin_id === user.id);
  return res.json({
    success: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone || '',
      hotel_id: hotel ? hotel.id : user.hotel_id
    },
    hotel: hotel || null
  });
});

router.put('/profile', (req, res) => {
  const { name, phone } = req.body;
  const updatedUser = db.transaction(data => {
    const u = data.users.find(item => item.id === req.user.id);
    if (!u) return null;
    if (name) u.name = name.trim();
    if (phone !== undefined) u.phone = phone.trim();
    return u;
  });

  if (!updatedUser) {
    return res.status(404).json({ success: false, message: 'User profile not found.' });
  }

  return res.json({
    success: true,
    message: 'Profile updated successfully.',
    user: {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      phone: updatedUser.phone || ''
    }
  });
});

export default router;
