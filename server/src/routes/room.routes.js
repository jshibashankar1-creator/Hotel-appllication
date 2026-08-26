import { Router } from 'express';
import { db } from '../db/database.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

// GET /api/rooms/:id
router.get('/:id', (req, res) => {
  const room = db.getRoomById(req.params.id);
  if (!room) {
    return res.status(404).json({ success: false, message: 'Room not found.' });
  }
  const hotel = db.getHotelById(room.hotel_id);
  return res.json({ success: true, room: { ...room, hotel_name: hotel ? hotel.name : '' } });
});

// POST /api/rooms (Owner / Hotel Admin adds room to their hotel)
router.post('/', authenticate, requireRole('owner', 'hotel_admin', 'admin'), (req, res) => {
  const { hotel_id, room_name, room_type, description, max_guests, total_inventory, price_per_night, photos } = req.body;

  if (!hotel_id || !room_name || !price_per_night) {
    return res.status(400).json({ success: false, message: 'Hotel ID, room name, and price per night are required.' });
  }

  const hotel = db.getHotelById(hotel_id);
  if (!hotel) {
    return res.status(404).json({ success: false, message: 'Hotel not found.' });
  }

  const isPlatformAdmin = ['super_admin', 'admin'].includes(req.user.role);
  const isHotelAuthorized = hotel.owner_id === req.user.id || hotel.hotel_admin_id === req.user.id || hotel.id === req.user.hotel_id;

  if (!isPlatformAdmin && !isHotelAuthorized) {
    return res.status(403).json({ success: false, message: 'You are not authorized to manage rooms for this hotel.' });
  }

  const roomId = `RM-${Date.now().toString(36).toUpperCase()}`;

  const newRoom = db.transaction((data) => {
    const roomObj = {
      id: roomId,
      hotel_id,
      room_name,
      room_type: room_type || 'Deluxe',
      description: description || 'Well-appointed room with modern amenities.',
      max_guests: Number(max_guests) || 2,
      total_inventory: Number(total_inventory) || 10,
      price_per_night: Number(price_per_night),
      photos: Array.isArray(photos) && photos.length > 0 ? photos : [hotel.cover_image],
      is_active: true
    };
    data.rooms.push(roomObj);
    return roomObj;
  });

  return res.status(201).json({ success: true, message: 'Room created successfully.', room: newRoom });
});

// PUT /api/rooms/:id (Owner / Hotel Admin updates room)
router.put('/:id', authenticate, requireRole('owner', 'hotel_admin', 'admin'), (req, res) => {
  const room = db.getRoomById(req.params.id);
  if (!room) {
    return res.status(404).json({ success: false, message: 'Room not found.' });
  }

  const hotel = db.getHotelById(room.hotel_id);
  const isPlatformAdmin = ['super_admin', 'admin'].includes(req.user.role);
  const isHotelAuthorized = hotel && (hotel.owner_id === req.user.id || hotel.hotel_admin_id === req.user.id || hotel.id === req.user.hotel_id);

  if (!isPlatformAdmin && !isHotelAuthorized) {
    return res.status(403).json({ success: false, message: 'You are not authorized to manage rooms for this hotel.' });
  }

  const updatedRoom = db.transaction((data) => {
    const idx = data.rooms.findIndex(r => r.id === req.params.id);
    if (idx !== -1) {
      data.rooms[idx] = {
        ...data.rooms[idx],
        ...req.body,
        id: room.id,
        hotel_id: room.hotel_id
      };
      return data.rooms[idx];
    }
    return null;
  });

  return res.json({ success: true, message: 'Room updated successfully.', room: updatedRoom });
});

// DELETE /api/rooms/:id (Owner / Hotel Admin disables room)
router.delete('/:id', authenticate, requireRole('owner', 'hotel_admin', 'admin'), (req, res) => {
  const room = db.getRoomById(req.params.id);
  if (!room) {
    return res.status(404).json({ success: false, message: 'Room not found.' });
  }

  const hotel = db.getHotelById(room.hotel_id);
  const isPlatformAdmin = ['super_admin', 'admin'].includes(req.user.role);
  const isHotelAuthorized = hotel && (hotel.owner_id === req.user.id || hotel.hotel_admin_id === req.user.id || hotel.id === req.user.hotel_id);

  if (!isPlatformAdmin && !isHotelAuthorized) {
    return res.status(403).json({ success: false, message: 'You are not authorized to manage rooms for this hotel.' });
  }

  db.transaction((data) => {
    const idx = data.rooms.findIndex(r => r.id === req.params.id);
    if (idx !== -1) {
      data.rooms[idx].is_active = false;
    }
  });

  return res.json({ success: true, message: 'Room disabled.' });
});

export default router;
