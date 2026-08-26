import { Router } from 'express';
import { db } from '../db/database.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

// GET /api/availability/:roomId
router.get('/:roomId', (req, res) => {
  const room = db.getRoomById(req.params.roomId);
  if (!room) {
    return res.status(404).json({ success: false, message: 'Room not found.' });
  }

  const { startDate, days = 30 } = req.query;
  const start = startDate ? new Date(startDate) : new Date();
  const matrix = [];

  for (let i = 0; i < Number(days); i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().slice(0, 10);

    const record = db.getAvailability(room.id, dateStr);
    const booked = record ? record.booked_count : 0;
    const blocked = record ? record.blocked_count : 0;
    const available = Math.max(0, room.total_inventory - booked - blocked);

    matrix.push({
      date: dateStr,
      room_id: room.id,
      total_inventory: room.total_inventory,
      booked_count: booked,
      blocked_count: blocked,
      available_count: available,
      price: room.price_per_night
    });
  }

  return res.json({ success: true, room_id: room.id, matrix });
});

// POST /api/availability/block (Owner blocks or unblocks inventory for specific dates)
router.post('/block', authenticate, requireRole('owner', 'super_admin', 'admin', 'hotel_admin'), (req, res) => {
  const { room_id, date, blocked_count, is_blocked } = req.body;

  const count = blocked_count !== undefined ? Number(blocked_count) : (is_blocked ? 1 : 0);

  if (!room_id || !date) {
    return res.status(400).json({ success: false, message: 'room_id and date are required.' });
  }

  const room = db.getRoomById(room_id);
  if (!room) {
    return res.status(404).json({ success: false, message: 'Room not found.' });
  }

  const hotel = db.getHotelById(room.hotel_id);
  const isAdmin = ['super_admin', 'admin', 'hotel_admin'].includes(req.user.role);
  if (!isAdmin && hotel && hotel.owner_id !== req.user.id) {
    return res.status(403).json({ success: false, message: 'You do not own this hotel.' });
  }

  const record = db.transaction((data) => {
    let avail = data.room_availability.find(a => a.room_id === room_id && a.date === date);
    if (!avail) {
      avail = {
        id: `AVL-${Date.now().toString(36).toUpperCase()}`,
        room_id,
        date,
        booked_count: 0,
        blocked_count: count
      };
      data.room_availability.push(avail);
    } else {
      avail.blocked_count = count;
    }
    return avail;
  });

  return res.json({ success: true, message: 'Availability matrix updated.', availability: record, record });
});

export default router;
