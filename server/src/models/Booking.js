import mongoose from 'mongoose';

const BookingSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  booking_code: { type: String, required: true, unique: true, index: true }, // Format: HTL-XXXXX
  hotel_id: { type: String, required: true, index: true },
  hotel_name: { type: String, required: true },
  room_id: { type: String, required: true, index: true },
  room_name: { type: String, required: true },
  customer_id: { type: String, required: true, index: true },
  customer_name: { type: String, required: true },
  customer_email: { type: String, required: true },
  customer_phone: { type: String, default: '' },
  check_in_date: { type: String, required: true }, // YYYY-MM-DD
  check_out_date: { type: String, required: true }, // YYYY-MM-DD
  nights: { type: Number, required: true },
  guests_count: { type: Number, default: 2 },
  base_amount: { type: Number, required: true },
  tax_amount: { type: Number, required: true }, // 12% GST
  total_amount: { type: Number, required: true },
  commission_rate: { type: Number, default: 15 },
  commission_amount: { type: Number, required: true }, // 15% platform take
  owner_payout: { type: Number, required: true }, // 85% owner net share
  payment_status: { type: String, enum: ['paid', 'pending', 'refunded', 'failed'], default: 'paid' },
  booking_status: {
    type: String,
    enum: ['confirmed', 'checked_in', 'checked_out', 'cancelled'],
    default: 'confirmed',
    index: true
  },
  cancellation_reason: { type: String, default: null },
  created_at: { type: Date, default: Date.now }
}, { timestamps: true });

export const Booking = mongoose.models.Booking || mongoose.model('Booking', BookingSchema);
