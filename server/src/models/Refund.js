import mongoose from 'mongoose';

const RefundSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  refund_code: { type: String, required: true, unique: true, index: true },
  booking_id: { type: String, required: true, index: true },
  booking_code: { type: String, required: true },
  customer_id: { type: String, required: true },
  customer_name: { type: String, required: true },
  hotel_name: { type: String, required: true },
  booking_amount: { type: Number, required: true },
  fee_amount: { type: Number, required: true }, // 10% Policy fee
  refund_amount: { type: Number, required: true },
  reason: { type: String, default: '' },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending', index: true },
  admin_notes: { type: String, default: null },
  requested_at: { type: Date, default: Date.now },
  processed_at: { type: Date, default: null }
}, { timestamps: true });

export const Refund = mongoose.models.Refund || mongoose.model('Refund', RefundSchema);
