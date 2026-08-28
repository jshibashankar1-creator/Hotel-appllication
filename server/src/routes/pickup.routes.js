import { Router } from 'express';
import { db } from '../db/database.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

// Helper: Check if user owns or is assigned to manage the hotel
function canManageHotel(user, hotel) {
  if (!user || !hotel) return false;
  if (['super_admin', 'admin'].includes(user.role)) return true;
  if (hotel.owner_id === user.id) return true;
  if (hotel.hotel_admin_id === user.id) return true;
  if (user.hotel_id && user.hotel_id === hotel.id) return true;
  return false;
}

// --------------------------------------------------------------------------
// 1. HOTEL PICKUP SETTINGS (PUBLIC & OWNER/ADMIN)
// --------------------------------------------------------------------------

// GET /api/hotels/:hotelId/pickup-settings (Public & Mobile App)
router.get('/hotels/:hotelId/pickup-settings', (req, res) => {
  const hotel = db.getHotelById(req.params.hotelId);
  if (!hotel) {
    return res.status(404).json({ success: false, message: 'Hotel not found.' });
  }

  const enabled = hotel.pickup_service_enabled !== false;
  const locations = (hotel.pickup_locations || []).filter(l => l.active !== false);
  const vehicles = (hotel.pickup_vehicles || []).filter(v => v.active !== false);

  return res.json({
    success: true,
    hotel_id: hotel.id,
    hotel_name: hotel.name,
    pickup_service_enabled: enabled,
    locations,
    vehicles,
    all_locations: hotel.pickup_locations || [],
    all_vehicles: hotel.pickup_vehicles || []
  });
});

// PUT /api/hotels/:hotelId/pickup-settings (Hotel Admin / Owner / Admin)
router.put('/hotels/:hotelId/pickup-settings', authenticate, requireRole('super_admin', 'admin', 'hotel_admin', 'owner'), (req, res) => {
  const hotel = db.getHotelById(req.params.hotelId);
  if (!hotel) {
    return res.status(404).json({ success: false, message: 'Hotel not found.' });
  }

  if (!canManageHotel(req.user, hotel)) {
    return res.status(403).json({ success: false, message: 'Unauthorized to manage pickup settings for this hotel.' });
  }

  const { pickup_service_enabled } = req.body;

  const updatedHotel = db.transaction((data) => {
    const target = data.hotels.find(h => h.id === hotel.id);
    if (!target) return null;
    if (pickup_service_enabled !== undefined) {
      target.pickup_service_enabled = Boolean(pickup_service_enabled);
    }
    return target;
  });

  return res.json({
    success: true,
    message: 'Pickup settings updated successfully.',
    hotel: updatedHotel
  });
});

// --------------------------------------------------------------------------
// 2. PICKUP LOCATIONS MANAGEMENT
// --------------------------------------------------------------------------

// POST /api/hotels/:hotelId/pickup-locations
router.post('/hotels/:hotelId/pickup-locations', authenticate, requireRole('super_admin', 'admin', 'hotel_admin', 'owner'), (req, res) => {
  const hotel = db.getHotelById(req.params.hotelId);
  if (!hotel) {
    return res.status(404).json({ success: false, message: 'Hotel not found.' });
  }

  if (!canManageHotel(req.user, hotel)) {
    return res.status(403).json({ success: false, message: 'Unauthorized to manage pickup locations for this hotel.' });
  }

  const { name, type, address } = req.body;
  if (!name || name.trim() === '') {
    return res.status(400).json({ success: false, message: 'Location name is required.' });
  }

  const locationId = `LOC-${hotel.id}-${Date.now().toString(36).toUpperCase()}`;
  const newLocation = {
    id: locationId,
    name: name.trim(),
    type: ['airport', 'railway', 'bus', 'custom'].includes(type) ? type : 'custom',
    address: address ? address.trim() : '',
    active: true
  };

  db.transaction((data) => {
    const target = data.hotels.find(h => h.id === hotel.id);
    if (!target.pickup_locations) target.pickup_locations = [];
    target.pickup_locations.push(newLocation);
  });

  return res.status(201).json({
    success: true,
    message: 'Pickup location added successfully.',
    location: newLocation
  });
});

// PUT /api/hotels/:hotelId/pickup-locations/:locationId
const updateLocationHandler = (req, res) => {
  const { hotelId, locationId } = req.params;
  const hotel = hotelId ? db.getHotelById(hotelId) : db.getHotels().find(h => (h.pickup_locations || []).some(l => l.id === locationId));

  if (!hotel) {
    return res.status(404).json({ success: false, message: 'Hotel or location not found.' });
  }

  if (!canManageHotel(req.user, hotel)) {
    return res.status(403).json({ success: false, message: 'Unauthorized to update pickup locations for this hotel.' });
  }

  const { name, type, address, active } = req.body;

  let updatedLocation = null;
  db.transaction((data) => {
    const target = data.hotels.find(h => h.id === hotel.id);
    if (!target || !target.pickup_locations) return;
    const loc = target.pickup_locations.find(l => l.id === locationId);
    if (loc) {
      if (name !== undefined) loc.name = name.trim();
      if (type !== undefined) loc.type = type;
      if (address !== undefined) loc.address = address.trim();
      if (active !== undefined) loc.active = Boolean(active);
      updatedLocation = loc;
    }
  });

  if (!updatedLocation) {
    return res.status(404).json({ success: false, message: 'Pickup location not found.' });
  }

  return res.json({
    success: true,
    message: 'Pickup location updated successfully.',
    location: updatedLocation
  });
};

router.put('/hotels/:hotelId/pickup-locations/:locationId', authenticate, requireRole('super_admin', 'admin', 'hotel_admin', 'owner'), updateLocationHandler);
router.put('/pickup-locations/:locationId', authenticate, requireRole('super_admin', 'admin', 'hotel_admin', 'owner'), updateLocationHandler);

// DELETE /api/hotels/:hotelId/pickup-locations/:locationId
const deleteLocationHandler = (req, res) => {
  const { hotelId, locationId } = req.params;
  const hotel = hotelId ? db.getHotelById(hotelId) : db.getHotels().find(h => (h.pickup_locations || []).some(l => l.id === locationId));

  if (!hotel) {
    return res.status(404).json({ success: false, message: 'Hotel or location not found.' });
  }

  if (!canManageHotel(req.user, hotel)) {
    return res.status(403).json({ success: false, message: 'Unauthorized to delete pickup locations for this hotel.' });
  }

  db.transaction((data) => {
    const target = data.hotels.find(h => h.id === hotel.id);
    if (target && target.pickup_locations) {
      target.pickup_locations = target.pickup_locations.filter(l => l.id !== locationId);
    }
  });

  return res.json({
    success: true,
    message: 'Pickup location removed successfully.'
  });
};

router.delete('/hotels/:hotelId/pickup-locations/:locationId', authenticate, requireRole('super_admin', 'admin', 'hotel_admin', 'owner'), deleteLocationHandler);
router.delete('/pickup-locations/:locationId', authenticate, requireRole('super_admin', 'admin', 'hotel_admin', 'owner'), deleteLocationHandler);

// --------------------------------------------------------------------------
// 3. PICKUP VEHICLES FLEET MANAGEMENT
// --------------------------------------------------------------------------

// POST /api/hotels/:hotelId/pickup-vehicles
router.post('/hotels/:hotelId/pickup-vehicles', authenticate, requireRole('super_admin', 'admin', 'hotel_admin', 'owner'), (req, res) => {
  const hotel = db.getHotelById(req.params.hotelId);
  if (!hotel) {
    return res.status(404).json({ success: false, message: 'Hotel not found.' });
  }

  if (!canManageHotel(req.user, hotel)) {
    return res.status(403).json({ success: false, message: 'Unauthorized to manage pickup vehicles for this hotel.' });
  }

  const { name, type, capacity, price, vehicle_number } = req.body;
  if (!name || name.trim() === '') {
    return res.status(400).json({ success: false, message: 'Vehicle name is required.' });
  }

  const numCapacity = Number(capacity);
  if (isNaN(numCapacity) || numCapacity <= 0) {
    return res.status(400).json({ success: false, message: 'Vehicle capacity must be a positive number.' });
  }

  const numPrice = Number(price);
  if (isNaN(numPrice) || numPrice < 0) {
    return res.status(400).json({ success: false, message: 'Vehicle price cannot be negative.' });
  }

  const vehicleId = `VEH-${hotel.id}-${Date.now().toString(36).toUpperCase()}`;
  const newVehicle = {
    id: vehicleId,
    name: name.trim(),
    type: type || 'Sedan',
    capacity: numCapacity,
    price: numPrice,
    vehicle_number: vehicle_number ? vehicle_number.trim() : '',
    active: true
  };

  db.transaction((data) => {
    const target = data.hotels.find(h => h.id === hotel.id);
    if (!target.pickup_vehicles) target.pickup_vehicles = [];
    target.pickup_vehicles.push(newVehicle);
  });

  return res.status(201).json({
    success: true,
    message: 'Pickup vehicle added successfully.',
    vehicle: newVehicle
  });
});

// PUT /api/hotels/:hotelId/pickup-vehicles/:vehicleId
const updateVehicleHandler = (req, res) => {
  const { hotelId, vehicleId } = req.params;
  const hotel = hotelId ? db.getHotelById(hotelId) : db.getHotels().find(h => (h.pickup_vehicles || []).some(v => v.id === vehicleId));

  if (!hotel) {
    return res.status(404).json({ success: false, message: 'Hotel or vehicle not found.' });
  }

  if (!canManageHotel(req.user, hotel)) {
    return res.status(403).json({ success: false, message: 'Unauthorized to update pickup vehicles for this hotel.' });
  }

  const { name, type, capacity, price, vehicle_number, active } = req.body;

  let updatedVehicle = null;
  db.transaction((data) => {
    const target = data.hotels.find(h => h.id === hotel.id);
    if (!target || !target.pickup_vehicles) return;
    const veh = target.pickup_vehicles.find(v => v.id === vehicleId);
    if (veh) {
      if (name !== undefined) veh.name = name.trim();
      if (type !== undefined) veh.type = type;
      if (capacity !== undefined) {
        const c = Number(capacity);
        if (c > 0) veh.capacity = c;
      }
      if (price !== undefined) {
        const p = Number(price);
        if (p >= 0) veh.price = p;
      }
      if (vehicle_number !== undefined) veh.vehicle_number = vehicle_number.trim();
      if (active !== undefined) veh.active = Boolean(active);
      updatedVehicle = veh;
    }
  });

  if (!updatedVehicle) {
    return res.status(404).json({ success: false, message: 'Pickup vehicle not found.' });
  }

  return res.json({
    success: true,
    message: 'Pickup vehicle updated successfully.',
    vehicle: updatedVehicle
  });
};

router.put('/hotels/:hotelId/pickup-vehicles/:vehicleId', authenticate, requireRole('super_admin', 'admin', 'hotel_admin', 'owner'), updateVehicleHandler);
router.put('/pickup-vehicles/:vehicleId', authenticate, requireRole('super_admin', 'admin', 'hotel_admin', 'owner'), updateVehicleHandler);

// DELETE /api/hotels/:hotelId/pickup-vehicles/:vehicleId
const deleteVehicleHandler = (req, res) => {
  const { hotelId, vehicleId } = req.params;
  const hotel = hotelId ? db.getHotelById(hotelId) : db.getHotels().find(h => (h.pickup_vehicles || []).some(v => v.id === vehicleId));

  if (!hotel) {
    return res.status(404).json({ success: false, message: 'Hotel or vehicle not found.' });
  }

  if (!canManageHotel(req.user, hotel)) {
    return res.status(403).json({ success: false, message: 'Unauthorized to delete pickup vehicles for this hotel.' });
  }

  db.transaction((data) => {
    const target = data.hotels.find(h => h.id === hotel.id);
    if (target && target.pickup_vehicles) {
      target.pickup_vehicles = target.pickup_vehicles.filter(v => v.id !== vehicleId);
    }
  });

  return res.json({
    success: true,
    message: 'Pickup vehicle removed successfully.'
  });
};

router.delete('/hotels/:hotelId/pickup-vehicles/:vehicleId', authenticate, requireRole('super_admin', 'admin', 'hotel_admin', 'owner'), deleteVehicleHandler);
router.delete('/pickup-vehicles/:vehicleId', authenticate, requireRole('super_admin', 'admin', 'hotel_admin', 'owner'), deleteVehicleHandler);

// --------------------------------------------------------------------------
// 4. PICKUP REQUESTS & QUEUE (HOTEL ADMIN, OWNER, PLATFORM ADMIN, CUSTOMER)
// --------------------------------------------------------------------------

// GET /api/pickups
router.get('/pickups', authenticate, (req, res) => {
  const { status, hotel_id, date } = req.query;
  const role = req.user.role;

  let bookingsWithPickup = (db.getBookings() || []).filter(b => b.pickup && b.pickup.required);

  if (role === 'customer') {
    bookingsWithPickup = bookingsWithPickup.filter(b => b.customer_id === req.user.id);
  } else if (['hotel_admin', 'owner'].includes(role)) {
    const userHotels = db.getHotels().filter(h =>
      h.owner_id === req.user.id ||
      h.hotel_admin_id === req.user.id ||
      (req.user.hotel_id && h.id === req.user.hotel_id)
    );
    const hotelIds = new Set(userHotels.map(h => h.id));
    bookingsWithPickup = bookingsWithPickup.filter(b => hotelIds.has(b.hotel_id));
  } else if (['super_admin', 'admin', 'support_admin', 'finance_admin'].includes(role)) {
    if (hotel_id) {
      bookingsWithPickup = bookingsWithPickup.filter(b => b.hotel_id === hotel_id);
    }
  } else {
    return res.status(403).json({ success: false, message: 'Unauthorized.' });
  }

  if (status) {
    bookingsWithPickup = bookingsWithPickup.filter(b => b.pickup && b.pickup.status === status);
  }

  if (date) {
    bookingsWithPickup = bookingsWithPickup.filter(b => b.pickup && b.pickup.pickup_date === date);
  }

  const pickups = bookingsWithPickup.map(b => ({
    booking_id: b.id,
    booking_code: b.booking_code,
    hotel_id: b.hotel_id,
    hotel_name: b.hotel_name,
    customer_id: b.customer_id,
    customer_name: b.customer_name,
    customer_phone: b.customer_phone,
    customer_email: b.customer_email,
    check_in_date: b.check_in_date,
    check_out_date: b.check_out_date,
    total_amount: b.total_amount,
    booking_status: b.booking_status,
    pickup: b.pickup,
    created_at: b.created_at
  }));

  return res.json({
    success: true,
    count: pickups.length,
    pickups
  });
});

// GET /api/pickups/:id (or by bookingId)
router.get('/pickups/:id', authenticate, (req, res) => {
  const booking = db.getBookingById(req.params.id);
  if (!booking || !booking.pickup || !booking.pickup.required) {
    return res.status(404).json({ success: false, message: 'Pickup request not found.' });
  }

  // Authorization check
  if (req.user.role === 'customer' && booking.customer_id !== req.user.id) {
    return res.status(403).json({ success: false, message: 'Unauthorized to view this pickup request.' });
  }

  if (['hotel_admin', 'owner'].includes(req.user.role)) {
    const hotel = db.getHotelById(booking.hotel_id);
    if (!canManageHotel(req.user, hotel)) {
      return res.status(403).json({ success: false, message: 'Unauthorized to view pickup for another hotel.' });
    }
  }

  return res.json({
    success: true,
    pickup: {
      booking_id: booking.id,
      booking_code: booking.booking_code,
      hotel_id: booking.hotel_id,
      hotel_name: booking.hotel_name,
      customer_id: booking.customer_id,
      customer_name: booking.customer_name,
      customer_phone: booking.customer_phone,
      check_in_date: booking.check_in_date,
      pickup: booking.pickup
    }
  });
});

// PATCH & PUT /api/pickups/:id/status (Hotel Admin / Owner / Admin)
const updatePickupStatusHandler = (req, res) => {
  const { status, notes } = req.body;
  const validStatuses = ['requested', 'confirmed', 'rejected', 'assigned', 'driver_on_way', 'arrived', 'completed', 'cancelled'];

  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: `Invalid status. Valid statuses are: ${validStatuses.join(', ')}.` });
  }

  const booking = db.getBookingById(req.params.id);
  if (!booking || !booking.pickup || !booking.pickup.required) {
    return res.status(404).json({ success: false, message: 'Pickup request not found.' });
  }

  const hotel = db.getHotelById(booking.hotel_id);
  if (!canManageHotel(req.user, hotel)) {
    return res.status(403).json({ success: false, message: 'Unauthorized to update pickup status for this hotel.' });
  }

  const updatedBooking = db.transaction((data) => {
    const idx = data.bookings.findIndex(b => b.id === booking.id);
    if (idx !== -1) {
      data.bookings[idx].pickup.status = status;
      if (notes) {
        data.bookings[idx].pickup.admin_notes = notes;
      }
      return data.bookings[idx];
    }
    return null;
  });

  return res.json({
    success: true,
    message: `Pickup status updated to ${status.toUpperCase()}.`,
    booking: updatedBooking,
    pickup: updatedBooking.pickup
  });
};

router.patch('/pickups/:id/status', authenticate, requireRole('super_admin', 'admin', 'hotel_admin', 'owner'), updatePickupStatusHandler);
router.put('/pickups/:id/status', authenticate, requireRole('super_admin', 'admin', 'hotel_admin', 'owner'), updatePickupStatusHandler);

// POST /api/pickups/:id/assign-driver (Hotel Admin / Owner / Admin)
router.post('/pickups/:id/assign-driver', authenticate, requireRole('super_admin', 'admin', 'hotel_admin', 'owner'), (req, res) => {
  const { driver_name, driver_phone, vehicle, vehicle_number } = req.body;

  if (!driver_name || driver_name.trim() === '') {
    return res.status(400).json({ success: false, message: 'Driver name is required.' });
  }

  const booking = db.getBookingById(req.params.id);
  if (!booking || !booking.pickup || !booking.pickup.required) {
    return res.status(404).json({ success: false, message: 'Pickup request not found.' });
  }

  const hotel = db.getHotelById(booking.hotel_id);
  if (!canManageHotel(req.user, hotel)) {
    return res.status(403).json({ success: false, message: 'Unauthorized to assign driver for this hotel.' });
  }

  const updatedBooking = db.transaction((data) => {
    const idx = data.bookings.findIndex(b => b.id === booking.id);
    if (idx !== -1) {
      data.bookings[idx].pickup.driver = {
        name: driver_name.trim(),
        phone: driver_phone ? driver_phone.trim() : '',
        vehicle: vehicle ? vehicle.trim() : (data.bookings[idx].pickup.vehicle_name || 'Assigned Vehicle'),
        vehicle_number: vehicle_number ? vehicle_number.trim() : ''
      };
      data.bookings[idx].pickup.status = 'assigned';
      return data.bookings[idx];
    }
    return null;
  });

  return res.json({
    success: true,
    message: 'Driver assigned successfully.',
    booking: updatedBooking,
    pickup: updatedBooking.pickup
  });
});

export default router;
