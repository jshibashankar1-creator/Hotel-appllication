import mongoose from 'mongoose';

const PlatformSettingsSchema = new mongoose.Schema({
  commission_rate: { type: Number, default: 15 },
  cancel_fee_pct: { type: Number, default: 10 },
  app_mode: { type: String, enum: ['live', 'maintenance'], default: 'live' },
  payment_mode: { type: String, enum: ['production', 'test'], default: 'production' },
  support_email: { type: String, default: 'support@hotelhub.com' },
  support_phone: { type: String, default: '+91 98000 12345' }
}, { timestamps: true });

export const PlatformSettings = mongoose.models.PlatformSettings || mongoose.model('PlatformSettings', PlatformSettingsSchema);
