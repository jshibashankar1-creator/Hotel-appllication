import mongoose from 'mongoose';

const OwnerProfileSchema = new mongoose.Schema({
  user_id: { type: String, required: true, unique: true, index: true },
  business_name: { type: String, required: true },
  business_reg_no: { type: String, default: '' },
  pan_no: { type: String, required: true },
  gstin: { type: String, required: true },
  bank_account: { type: String, required: true },
  address: { type: String, default: '' },
  kyc_status: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending', index: true },
  rejection_reason: { type: String, default: null },
  submitted_at: { type: Date, default: Date.now },
  verified_at: { type: Date, default: null }
}, { timestamps: true });

export const OwnerProfile = mongoose.models.OwnerProfile || mongoose.model('OwnerProfile', OwnerProfileSchema);
