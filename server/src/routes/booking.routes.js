import { Router } from 'express';
import { db } from '../db/database.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

// Helper to get dates between start and end
function getDatesInRange(startDateStr, endDateStr) {
  const dates = [];
  let curr = new Date(startDateStr);
  const end = new Date(endDateStr);
  while (curr < end) {
    dates.push(curr.toISOString().slice(0, 10));
    curr.setDate(curr.getDate() + 1);
  }
  return dates;
}

// POST /api/bookings/create (Customer Booking with Atomic Availability Lock)
router.post('/create', authenticate, requireRole(['customer', 'admin']), (req, res) => {
  try {
    const {
      hotel_id,
      room_id,
      check_in_date,
      check_out_date,
      guests_count,
      customer_name,
      customer_email,
      customer_phone,
      payment_method
    } = req.body;

    if (!hotel_id || !room_id || !check_in_date || !check_out_date) {
      return res.status(400).json({ success: false, message: 'Hotel, room, and check-in/out dates are required.' });
    }

    const hotel = db.getHotelById(hotel_id);
    if (!hotel || hotel.status !== 'active') {
      return res.status(400).json({ success: false, message: 'Hotel is not currently available for bookings.' });
    }

    const room = db.getRoomById(room_id);
    if (!room || !room.is_active || room.hotel_id !== hotel_id) {
      return res.status(400).json({ success: false, message: 'Selected room is invalid.' });
    }

    const dateList = getDatesInRange(check_in_date, check_out_date);
    if (dateList.length === 0) {
      return res.status(400).json({ success: false, message: 'Check-out date must be after check-in date.' });
    }

    const nights = dateList.length;

    // ATOMIC TRANSACTION: Check Availability, Lock Inventory, Calculate Commission & Create Booking
    const result = db.transaction((data) => {
      // 1. Validate availability for each night
      for (const d of dateList) {
        const avail = data.room_availability.find(a => a.room_id === room_id && a.date === d);
        const booked = avail ? avail.booked_count : 0;
        const blocked = avail ? avail.blocked_count : 0;
        if (booked + blocked >= room.total_inventory) {
          throw new Error(`Room is fully booked for date: ${d}. Please choose alternative dates.`);
        }
      }

      // 2. Increment booked counts
      for (const d of dateList) {
        let avail = data.room_availability.find(a => a.room_id === room_id && a.date === d);
        if (!avail) {
          avail = {
            id: `AVL-${Date.now().toString(36).toUpperCase()}-${d}`,
            room_id,
            date: d,
            booked_count: 1,
            blocked_count: 0
          };
          data.room_availability.push(avail);
        } else {
          avail.booked_count += 1;
        }
      }

      // 3. Financial calculations (Backend Driven)
      const settings = data.platform_settings || { commission_rate: 15 };
      const commissionRate = settings.commission_rate || 15;
      const baseAmount = room.price_per_night * nights;
      const taxAmount = Math.round(baseAmount * 0.12); // 12% GST
      const totalAmount = baseAmount + taxAmount;
      const commissionAmount = Math.round(totalAmount * (commissionRate / 100));
      const ownerPayout = totalAmount - commissionAmount;

      const bookingId = `BKG-${Date.now().toString(36).toUpperCase()}`;
      const randomFive = Math.floor(10000 + Math.random() * 90000);
      const bookingCode = `HTL-${randomFive}`;

      const bookingObj = {
        id: bookingId,
        booking_code: bookingCode,
        customer_id: req.user.id,
        customer_name: customer_name || req.user.name,
        customer_email: customer_email || req.user.email,
        customer_phone: customer_phone || req.user.phone || '+91 98000 00000',
        hotel_id,
        hotel_name: hotel.name,
        room_id,
        room_name: room.room_name,
        check_in_date,
        check_out_date,
        nights,
        guests_count: Number(guests_count) || 2,
        base_amount: baseAmount,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        commission_rate: commissionRate,
        commission_amount: commissionAmount,
        owner_payout: ownerPayout,
        payment_status: 'successful',
        booking_status: 'confirmed',
        cancellation_reason: null,
        created_at: new Date().toISOString()
      };
      data.bookings.unshift(bookingObj);

      // 4. Create Payment record
      const txnId = `TXN-${Date.now().toString(36).toUpperCase()}`;
      data.payments.unshift({
        id: `PAY-${Date.now().toString(36).toUpperCase()}`,
        transaction_id: txnId,
        booking_id: bookingId,
        booking_code: bookingCode,
        customer_id: req.user.id,
        customer_name: bookingObj.customer_name,
        hotel_name: hotel.name,
        amount: totalAmount,
        payment_method: payment_method || 'UPI (Google Pay)',
        gateway_reference: `rzp_live_${txnId.toLowerCase()}`,
        status: 'successful',
        created_at: new Date().toISOString()
      });

      return bookingObj;
    });

    return res.status(201).json({
      success: true,
      message: 'Booking confirmed successfully!',
      booking: result
    });
  } catch (err) {
    console.error('Booking creation error:', err);
    return res.status(400).json({ success: false, message: err.message || 'Error processing booking.' });
  }
});

// GET /api/bookings/my (Customer's bookings)
router.get('/my', authenticate, (req, res) => {
  const bookings = db.getBookingsByCustomer(req.user.id);
  return res.json({ success: true, count: bookings.length, bookings });
});

// GET /api/bookings/owner (Owner's & Hotel Admin's hotel bookings)
router.get('/owner', authenticate, requireRole('owner', 'hotel_admin', 'admin'), (req, res) => {
  const userHotels = db.getHotels().filter(h =>
    h.owner_id === req.user.id ||
    h.hotel_admin_id === req.user.id ||
    (req.user.hotel_id && h.id === req.user.hotel_id)
  );
  const hotelIds = new Set(userHotels.map(h => h.id));
  const bookings = db.getBookings().filter(b => hotelIds.has(b.hotel_id));
  return res.json({ success: true, count: bookings.length, bookings });
});

// GET /api/bookings/admin (Admin centralized visibility)
router.get('/admin', authenticate, requireRole('super_admin', 'admin', 'support_admin', 'hotel_admin', 'finance_admin'), (req, res) => {
  const bookings = db.getBookings();
  return res.json({ success: true, count: bookings.length, bookings });
});

// GET /api/bookings/:id
router.get('/:id', authenticate, (req, res) => {
  const booking = db.getBookingById(req.params.id);
  if (!booking) {
    return res.status(404).json({ success: false, message: 'Booking not found.' });
  }

  // Check authorization
  if (req.user.role === 'customer' && booking.customer_id !== req.user.id) {
    return res.status(403).json({ success: false, message: 'Unauthorized.' });
  }

  const hotel = db.getHotelById(booking.hotel_id);
  const room = db.getRoomById(booking.room_id);

  return res.json({
    success: true,
    booking: {
      ...booking,
      hotel,
      room
    }
  });
});

// PUT & POST /api/bookings/:id/checkin (Owner/Admin check-in)
const checkinHandler = (req, res) => {
  const booking = db.getBookingById(req.params.id);
  if (!booking) {
    return res.status(404).json({ success: false, message: 'Booking not found.' });
  }

  if (booking.booking_status !== 'confirmed') {
    return res.status(400).json({ success: false, message: `Cannot check-in booking with status '${booking.booking_status}'. Must be 'confirmed'.` });
  }

  const updatedBooking = db.transaction((data) => {
    const idx = data.bookings.findIndex(b => b.id === booking.id);
    if (idx !== -1) {
      data.bookings[idx].booking_status = 'checked_in';
      return data.bookings[idx];
    }
    return null;
  });

  return res.json({ success: true, message: 'Guest successfully checked in.', booking: updatedBooking });
};

router.put('/:id/checkin', authenticate, requireRole('owner', 'hotel_admin', 'admin'), checkinHandler);
router.post('/:id/checkin', authenticate, requireRole('owner', 'hotel_admin', 'admin'), checkinHandler);

// PUT & POST /api/bookings/:id/checkout (Owner/Admin check-out)
const checkoutHandler = (req, res) => {
  const booking = db.getBookingById(req.params.id);
  if (!booking) {
    return res.status(404).json({ success: false, message: 'Booking not found.' });
  }

  if (booking.booking_status !== 'checked_in') {
    return res.status(400).json({ success: false, message: `Cannot check-out booking with status '${booking.booking_status}'. Must be 'checked_in'.` });
  }

  const updatedBooking = db.transaction((data) => {
    const idx = data.bookings.findIndex(b => b.id === booking.id);
    if (idx !== -1) {
      data.bookings[idx].booking_status = 'checked_out';
      return data.bookings[idx];
    }
    return null;
  });

  return res.json({ success: true, message: 'Guest successfully checked out.', booking: updatedBooking });
};

router.put('/:id/checkout', authenticate, requireRole('owner', 'hotel_admin', 'admin'), checkoutHandler);
router.post('/:id/checkout', authenticate, requireRole('owner', 'hotel_admin', 'admin'), checkoutHandler);

// POST /api/bookings/:id/cancel (Customer requests cancellation & refund)
router.post('/:id/cancel', authenticate, (req, res) => {
  const { reason } = req.body;
  const booking = db.getBookingById(req.params.id);
  if (!booking) {
    return res.status(404).json({ success: false, message: 'Booking not found.' });
  }

  if (req.user.role === 'customer' && booking.customer_id !== req.user.id) {
    return res.status(403).json({ success: false, message: 'Unauthorized.' });
  }

  if (['cancelled', 'checked_out'].includes(booking.booking_status)) {
    return res.status(400).json({ success: false, message: `Cannot cancel a booking with status '${booking.booking_status}'.` });
  }

  const result = db.transaction((data) => {
    // 1. Update booking status
    const bIdx = data.bookings.findIndex(b => b.id === booking.id);
    data.bookings[bIdx].booking_status = 'cancelled';
    data.bookings[bIdx].cancellation_reason = reason || 'Customer requested cancellation.';

    // 2. Release inventory
    const dateList = getDatesInRange(booking.check_in_date, booking.check_out_date);
    for (const d of dateList) {
      const avail = data.room_availability.find(a => a.room_id === booking.room_id && a.date === d);
      if (avail && avail.booked_count > 0) {
        avail.booked_count -= 1;
      }
    }

    // 3. Create Refund Record
    const settings = data.platform_settings || { cancel_fee_pct: 10 };
    const feePct = settings.cancel_fee_pct || 10;
    const feeAmount = Math.round(booking.total_amount * (feePct / 100));
    const refundAmount = booking.total_amount - feeAmount;

    const refundObj = {
      id: `REF-${Date.now().toString(36).toUpperCase()}`,
      refund_code: `REF-${Math.floor(1000 + Math.random() * 9000)}`,
      booking_id: booking.id,
      booking_code: booking.booking_code,
      customer_id: booking.customer_id,
      customer_name: booking.customer_name,
      hotel_name: booking.hotel_name,
      booking_amount: booking.total_amount,
      fee_amount: feeAmount,
      refund_amount: refundAmount,
      reason: reason || 'Customer cancellation',
      status: 'pending',
      admin_notes: null,
      requested_at: new Date().toISOString(),
      processed_at: null
    };
    data.refunds.unshift(refundObj);

    return { booking: data.bookings[bIdx], refund: refundObj };
  });

  return res.json({
    success: true,
    message: 'Booking cancelled. Refund request submitted for Administrator Review.',
    booking: result.booking,
    refund: result.refund,
    result
  });
});

export default router;
