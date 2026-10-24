import { Router } from 'express';
import { db } from '../db/database.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

// Helper to validate YYYY-MM-DD format
function isValidDateStr(str) {
  if (typeof str !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(str)) return false;
  const d = new Date(str);
  return !isNaN(d.getTime()) && str === d.toISOString().slice(0, 10);
}

// Availability matrix calculator handler
function handleRoomAvailability(req, res) {
  const room = db.getRoomById(req.params.roomId);
  if (!room) {
    return res.status(404).json({ success: false, message: 'Room not found.' });
  }

  const { startDate, endDate, days } = req.query;

  // Validate startDate if provided
  if (startDate !== undefined && startDate !== null && startDate !== '' && startDate !== 'undefined') {
    if (typeof startDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(startDate) || isNaN(Date.parse(startDate))) {
      return res.status(400).json({
        success: false,
        message: 'Invalid startDate. Please provide a valid date in YYYY-MM-DD format.'
      });
    }
  }

  // Validate endDate if provided
  if (endDate !== undefined && endDate !== null && endDate !== '' && endDate !== 'undefined') {
    if (typeof endDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(endDate) || isNaN(Date.parse(endDate))) {
      return res.status(400).json({
        success: false,
        message: 'Invalid endDate. Please provide a valid date in YYYY-MM-DD format.'
      });
    }
  }

  // Determine start date components
  let startYear, startMonth, startDay;
  if (startDate && startDate !== 'undefined') {
    const parts = startDate.split('-').map(Number);
    startYear = parts[0];
    startMonth = parts[1] - 1;
    startDay = parts[2];
  } else {
    const today = new Date();
    startYear = today.getFullYear();
    startMonth = today.getMonth();
    startDay = today.getDate();
  }

  // Determine number of days
  let numDays = 14;
  if (endDate && endDate !== 'undefined') {
    const endParts = endDate.split('-').map(Number);
    const endUtc = Date.UTC(endParts[0], endParts[1] - 1, endParts[2]);
    const startUtc = Date.UTC(startYear, startMonth, startDay);
    if (endUtc < startUtc) {
      return res.status(400).json({
        success: false,
        message: 'endDate must be greater than or equal to startDate.'
      });
    }
    const diffTime = endUtc - startUtc;
    numDays = Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24)));
  } else if (days) {
    const parsedDays = parseInt(days, 10);
    if (!isNaN(parsedDays) && parsedDays > 0) {
      numDays = Math.min(parsedDays, 90);
    }
  }

  const matrix = [];
  for (let i = 0; i < numDays; i++) {
    const d = new Date(Date.UTC(startYear, startMonth, startDay + i));
    const dateStr = d.toISOString().slice(0, 10);

    const record = db.getAvailability(room.id, dateStr);
    const booked = record ? Number(record.booked_count || 0) : 0;
    const blocked = record ? Number(record.blocked_count || 0) : 0;
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

  return res.json({
    success: true,
    room_id: room.id,
    room_name: room.room_name,
    total_inventory: room.total_inventory,
    matrix
  });
}

// GET /api/availability/room/:roomId (canonical path used by frontend)
router.get('/room/:roomId', handleRoomAvailability);

// GET /api/availability/:roomId (alias path for direct ID access)
router.get('/:roomId', handleRoomAvailability);

// POST /api/availability/block (Hotel Admin & Owner blocks or unblocks inventory for specific dates)
router.post('/block', authenticate, requireRole('owner', 'super_admin', 'admin', 'hotel_admin'), (req, res) => {
  const { room_id, date, blocked_count, is_blocked } = req.body;

  if (!room_id || !date) {
    return res.status(400).json({ success: false, message: 'room_id and date are required.' });
  }

  if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date) || isNaN(Date.parse(date))) {
    return res.status(400).json({ success: false, message: 'Invalid date format. Expected YYYY-MM-DD.' });
  }

  const count = blocked_count !== undefined ? Number(blocked_count) : (is_blocked ? 1 : 0);
  if (isNaN(count) || count < 0) {
    return res.status(400).json({ success: false, message: 'blocked_count must be a non-negative number.' });
  }

  const room = db.getRoomById(room_id);
  if (!room) {
    return res.status(404).json({ success: false, message: 'Room not found.' });
  }

  const hotel = db.getHotelById(room.hotel_id);
  const isAuthorized =
    req.user.role === 'super_admin' ||
    req.user.role === 'admin' ||
    (hotel && (hotel.owner_id === req.user.id || hotel.hotel_admin_id === req.user.id || hotel.id === req.user.hotel_id));

  if (!isAuthorized) {
    return res.status(403).json({ success: false, message: 'You are not authorized to modify availability for this property.' });
  }

  // Check current booked count to prevent blocking more rooms than available
  const existingRecord = db.getAvailability(room.id, date);
  const bookedCount = existingRecord ? Number(existingRecord.booked_count || 0) : 0;
  if (count + bookedCount > room.total_inventory) {
    return res.status(400).json({
      success: false,
      message: `Cannot block ${count} rooms on ${date}. Total inventory is ${room.total_inventory} and ${bookedCount} rooms are already booked.`
    });
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

  const availableCount = Math.max(0, room.total_inventory - (record.booked_count || 0) - (record.blocked_count || 0));

  return res.json({
    success: true,
    message: count > 0 ? `Successfully blocked ${count} rooms for ${date}.` : `Successfully unblocked rooms for ${date}.`,
    availability: record,
    available_count: availableCount,
    record
  });
});

export default router;
