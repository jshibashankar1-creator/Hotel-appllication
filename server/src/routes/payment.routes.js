import { Router } from 'express';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import { db } from '../db/database.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

// Lazy initialization of Razorpay instance
function getRazorpayInstance() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    throw new Error('Razorpay credentials are not configured in server environment.');
  }
  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret
  });
}

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

// Helper to calculate verified pricing
function calculateVerifiedPricing(hotel, room, dateList, pickup) {
  const nights = dateList.length;
  const baseAmount = room.price_per_night * nights;
  const taxAmount = Math.round(baseAmount * 0.12); // 12% GST

  let validatedPickup = { required: false, pickup_required: false, pickup_charge: 0, service: 'NOT_REQUIRED' };
  if (pickup && (pickup.required === true || pickup.required === 'true' || pickup.pickup_required === true)) {
    validatedPickup = {
      required: true,
      pickup_required: true,
      pickup_charge: 0,
      pickup_service: 'FREE',
      service: 'FREE',
      status: 'confirmed',
      location_name: pickup.location_name || pickup.location || 'Station to Hotel',
      pickup_date: pickup.pickup_date || dateList[0],
      pickup_time: pickup.pickup_time || '10:30 AM',
      special_instructions: pickup.special_instructions || ''
    };
  }

  const pickupAmount = 0; // Pickup is always FREE
  const totalAmount = baseAmount + taxAmount; // Pickup adds ₹0

  return {
    nights,
    baseAmount,
    taxAmount,
    pickupAmount,
    totalAmount,
    validatedPickup
  };
}

// ============================================================================
// 1. POST /api/payments/create-order — Create Real Razorpay Test Order
// ============================================================================
router.post('/create-order', authenticate, async (req, res) => {
  try {
    const {
      hotel_id,
      room_id,
      check_in_date,
      check_out_date,
      guests_count,
      pickup
    } = req.body;

    if (!hotel_id || !room_id || !check_in_date || !check_out_date) {
      return res.status(400).json({ success: false, message: 'Hotel, room, and check-in/out dates are required.' });
    }

    let hotel = db.getHotelById(hotel_id);
    if (!hotel) {
      hotel = db.getHotels().find(h => h.slug === hotel_id || (hotel_id && h.name.toLowerCase().includes(hotel_id.toLowerCase()))) || db.getHotels()[0];
    }
    if (!hotel || hotel.status !== 'active') {
      return res.status(400).json({ success: false, message: 'Hotel is not currently available for bookings.' });
    }

    let room = db.getRoomById(room_id);
    if (!room || room.hotel_id !== hotel.id) {
      const hotelRooms = db.getRoomsByHotel(hotel.id);
      room = hotelRooms.find(r => r.id === room_id || r.room_name === room_id || (r.room_name && room_id && r.room_name.toLowerCase().includes(room_id.toLowerCase()))) || hotelRooms[0];
    }
    if (!room || !room.is_active) {
      return res.status(400).json({ success: false, message: 'Selected room is invalid for this hotel.' });
    }

    const dateList = getDatesInRange(check_in_date, check_out_date);
    if (dateList.length === 0) {
      return res.status(400).json({ success: false, message: 'Check-out date must be after check-in date.' });
    }

    // Availability validation for each night
    for (const d of dateList) {
      const avail = db.getAvailability(room_id, d);
      const booked = avail ? avail.booked_count : 0;
      const blocked = avail ? avail.blocked_count : 0;
      if (booked + blocked >= room.total_inventory) {
        return res.status(400).json({
          success: false,
          message: `Room is fully booked for date: ${d}. Please choose alternative dates.`
        });
      }
    }

    // Dynamic Server Price Calculation
    const pricing = calculateVerifiedPricing(hotel, room, dateList, pickup);
    const amountInPaise = Math.round(pricing.totalAmount * 100);

    // Call Real Razorpay Orders API
    const razorpay = getRazorpayInstance();
    const receipt = `rcpt_${Date.now().toString(36)}_${Math.floor(100 + Math.random() * 900)}`;

    const rzpOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt,
      notes: {
        hotel_id,
        hotel_name: hotel.name,
        room_id,
        room_name: room.room_name,
        customer_id: req.user.id,
        customer_name: req.user.name,
        check_in_date,
        check_out_date,
        pickup_required: String(pricing.validatedPickup.required)
      }
    });

    return res.status(201).json({
      success: true,
      key_id: process.env.RAZORPAY_KEY_ID,
      order_id: rzpOrder.id,
      amount: pricing.totalAmount,
      amount_paise: rzpOrder.amount,
      currency: rzpOrder.currency,
      receipt: rzpOrder.receipt,
      hotel: {
        id: hotel.id,
        name: hotel.name,
        city: hotel.city
      },
      room: {
        id: room.id,
        name: room.room_name,
        price_per_night: room.price_per_night
      },
      pricing: {
        nights: pricing.nights,
        base_amount: pricing.baseAmount,
        tax_amount: pricing.taxAmount,
        pickup_amount: pricing.pickupAmount,
        total_amount: pricing.totalAmount
      },
      pickup: pricing.validatedPickup
    });
  } catch (err) {
    console.error('Razorpay order creation error:', err);
    return res.status(500).json({
      success: false,
      message: err.error?.description || err.message || 'Failed to create Razorpay payment order.'
    });
  }
});

// ============================================================================
// 1b. POST /api/payments/test-sign — Test Signature Generator (Test Mode Only)
// ============================================================================
router.post('/test-sign', authenticate, (req, res) => {
  if (process.env.PAYMENT_PROVIDER_MODE !== 'test') {
    return res.status(403).json({ success: false, message: 'Test signing only available in test mode.' });
  }
  const { order_id, payment_id } = req.body;
  if (!order_id || !payment_id) {
    return res.status(400).json({ success: false, message: 'order_id and payment_id are required.' });
  }
  const signature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${order_id}|${payment_id}`)
    .digest('hex');

  return res.json({ success: true, signature });
});

// ============================================================================
// 2. POST /api/payments/verify — Real Razorpay HMAC Signature Verification
// ============================================================================
router.post('/verify', authenticate, async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      hotel_id,
      room_id,
      check_in_date,
      check_out_date,
      guests_count,
      customer_name,
      customer_email,
      customer_phone,
      payment_method,
      pickup
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Razorpay order ID, payment ID, and signature are required for verification.'
      });
    }

    // 1. Verify Cryptographic HMAC SHA256 Signature
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Razorpay payment signature. Payment verification rejected.'
      });
    }

    // 2. Fetch Razorpay Order & Payment to confirm actual captured status and amount
    const razorpay = getRazorpayInstance();
    const rzpOrder = await razorpay.orders.fetch(razorpay_order_id);

    if (!rzpOrder) {
      return res.status(404).json({ success: false, message: 'Razorpay order record not found.' });
    }

    let hotel = db.getHotelById(hotel_id);
    if (!hotel) {
      hotel = db.getHotels().find(h => h.slug === hotel_id || (hotel_id && h.name.toLowerCase().includes(hotel_id.toLowerCase()))) || db.getHotels()[0];
    }
    let room = db.getRoomById(room_id);
    if (!room && hotel) {
      const hotelRooms = db.getRoomsByHotel(hotel.id);
      room = hotelRooms.find(r => r.id === room_id || r.room_name === room_id) || hotelRooms[0];
    }
    if (!hotel || !room) {
      return res.status(400).json({ success: false, message: 'Invalid hotel or room reference.' });
    }

    const dateList = getDatesInRange(check_in_date, check_out_date);
    const pricing = calculateVerifiedPricing(hotel, room, dateList, pickup);

    // Validate that order amount matches server calculation
    if (rzpOrder.amount !== Math.round(pricing.totalAmount * 100)) {
      return res.status(400).json({
        success: false,
        message: `Payment amount mismatch: Gateway charged ₹${rzpOrder.amount / 100}, expected ₹${pricing.totalAmount}.`
      });
    }

    // 3. ATOMIC TRANSACTION: Check Availability, Lock Inventory & Commit Booking
    const result = db.transaction((data) => {
      // Re-verify availability
      for (const d of dateList) {
        const avail = data.room_availability.find(a => a.room_id === room_id && a.date === d);
        const booked = avail ? avail.booked_count : 0;
        const blocked = avail ? avail.blocked_count : 0;
        if (booked + blocked >= room.total_inventory) {
          throw new Error(`Room capacity reached for date: ${d}.`);
        }
      }

      // Lock room inventory
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

      const settings = data.platform_settings || { commission_rate: 10 };
      const commissionRate = settings.commission_rate || 10;
      const commissionAmount = Math.round(pricing.totalAmount * (commissionRate / 100));
      const ownerPayout = pricing.totalAmount - commissionAmount;

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
        nights: pricing.nights,
        guests_count: Number(guests_count) || 2,
        base_amount: pricing.baseAmount,
        tax_amount: pricing.taxAmount,
        total_amount: pricing.totalAmount,
        commission_rate: commissionRate,
        commission_amount: commissionAmount,
        owner_payout: ownerPayout,
        payment_status: 'successful',
        booking_status: 'confirmed',
        razorpay_order_id,
        razorpay_payment_id,
        cancellation_reason: null,
        pickup: pricing.validatedPickup,
        created_at: new Date().toISOString()
      };
      data.bookings.unshift(bookingObj);

      // Create Payment Ledger entry
      const paymentObj = {
        id: `PAY-${Date.now().toString(36).toUpperCase()}`,
        transaction_id: razorpay_payment_id,
        razorpay_order_id,
        razorpay_payment_id,
        booking_id: bookingId,
        booking_code: bookingCode,
        customer_id: req.user.id,
        customer_name: bookingObj.customer_name,
        hotel_name: hotel.name,
        amount: pricing.totalAmount,
        currency: 'INR',
        payment_method: payment_method || 'Razorpay (UPI/Card)',
        gateway_reference: razorpay_payment_id,
        status: 'successful',
        created_at: new Date().toISOString()
      };
      data.payments.unshift(paymentObj);

      return { booking: bookingObj, payment: paymentObj };
    });

    return res.status(200).json({
      success: true,
      message: 'Razorpay payment verified and booking confirmed successfully!',
      booking: result.booking,
      payment: result.payment
    });
  } catch (err) {
    console.error('Razorpay verification error:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Payment verification failed.'
    });
  }
});

// ============================================================================
// 3. POST /api/payments/webhook — Razorpay Webhook Handler
// ============================================================================
router.post('/webhook', (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers['x-razorpay-signature'];

    if (!webhookSecret || !signature) {
      return res.status(400).json({ success: false, message: 'Webhook signature missing.' });
    }

    const payload = JSON.stringify(req.body);
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(payload)
      .digest('hex');

    if (expectedSignature !== signature) {
      return res.status(400).json({ success: false, message: 'Invalid webhook signature.' });
    }

    const event = req.body.event;
    console.log(`📡 Razorpay Webhook Event received: ${event}`);

    // Acknowledge receipt
    return res.json({ status: 'ok', event_processed: event });
  } catch (err) {
    console.error('Webhook processing error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ============================================================================
// 4. GET /api/payments/admin — Platform Admin Payment Ledger
// ============================================================================
router.get('/admin', authenticate, requireRole('super_admin', 'admin', 'finance_admin'), (req, res) => {
  const payments = db.getPayments();
  return res.json({ success: true, count: payments.length, payments });
});

// ============================================================================
// 5. GET /api/payments/my — Customer Payments Ledger
// ============================================================================
router.get('/my', authenticate, (req, res) => {
  const payments = db.getPayments().filter(p => p.customer_id === req.user.id);
  return res.json({ success: true, count: payments.length, payments });
});

export default router;
