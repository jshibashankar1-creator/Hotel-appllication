import mongoose from 'mongoose';

const AuditLogSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  admin_id: { type: String, required: true, index: true },
  admin_name: { type: String, required: true },
  admin_role: { type: String, required: true },
  action: {
    type: String,
    required: true,
    enum: [
      'ADMIN_SETUP',
      'ADMIN_CREATED',
      'ADMIN_UPDATED',
      'ADMIN_ROLE_CHANGED',
      'ADMIN_STATUS_CHANGED',
      'ADMIN_DELETED',
      'ADMIN_PASSWORD_CHANGED',
      'HOTEL_APPROVED',
      'HOTEL_SUSPENDED',
      'OWNER_KYC_VERIFIED',
      'OWNER_KYC_REJECTED',
      'REFUND_APPROVED',
      'REFUND_REJECTED',
      'COMMISSION_CHANGED',
      'SETTINGS_CHANGED'
    ],
    index: true
  },
  resource: { type: String, required: true },
  resource_id: { type: String, default: null },
  details: { type: String, default: '' },
  ip_address: { type: String, default: '127.0.0.1' },
  created_at: { type: Date, default: Date.now, index: true }
}, { timestamps: true });

export const AuditLog = mongoose.models.AuditLog || mongoose.model('AuditLog', AuditLogSchema);
