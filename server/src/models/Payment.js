import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  transaction_id: { type: String, required: true, unique: true, index: true },
  booking_id: { type: String, required: true, index: true },
  booking_code: { type: String, required: true },
  customer_id: { type: String, required: true },
  customer_name: { type: String, required: true },
  hotel_name: { type: String, required: true },
  amount: { type: Number, required: true },
  payment_method: { type: String, required: true },
  gateway_reference: { type: String, default: '' },
  status: { type: String, enum: ['successful', 'pending', 'failed', 'refunded'], default: 'successful' },
  created_at: { type: Date, default: Date.now }
}, { timestamps: true });

export const Payment = mongoose.models.Payment || mongoose.model('Payment', PaymentSchema);
