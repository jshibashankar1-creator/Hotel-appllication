import mongoose from 'mongoose';

export const ADMIN_ROLES = ['super_admin', 'admin', 'support_admin', 'finance_admin'];
export const PLATFORM_ADMIN_ROLES = ['super_admin', 'admin', 'support_admin', 'finance_admin'];
export const HOTEL_ROLES = ['hotel_admin', 'owner'];
export const ALL_ROLES = ['customer', 'owner', 'hotel_admin', ...ADMIN_ROLES];
export const USER_STATUSES = ['active', 'inactive', 'suspended', 'pending'];

// Default Permissions for Each Role
export const DEFAULT_ROLE_PERMISSIONS = {
  super_admin: [
    'dashboard.view',
    'hotels.view', 'hotels.verify', 'hotels.suspend',
    'owners.view', 'owners.verify',
    'rooms.view', 'rooms.manage',
    'availability.view', 'availability.manage',
    'bookings.view', 'bookings.manage',
    'payments.view', 'payments.manage',
    'refunds.view', 'refunds.manage',
    'commission.view', 'commission.manage',
    'customers.view',
    'support.view', 'support.manage',
    'reports.view', 'reports.export',
    'admins.view', 'admins.create', 'admins.edit', 'admins.delete',
    'settings.view', 'settings.manage'
  ],
  admin: [
    'dashboard.view',
    'hotels.view', 'hotels.verify',
    'owners.view', 'owners.verify',
    'rooms.view', 'rooms.manage',
    'availability.view',
    'bookings.view', 'bookings.manage',
    'customers.view',
    'support.view', 'support.manage',
    'reports.view', 'reports.export'
  ],
  support_admin: [
    'dashboard.view',
    'support.view', 'support.manage',
    'bookings.view',
    'customers.view',
    'hotels.view'
  ],
  finance_admin: [
    'dashboard.view',
    'payments.view', 'payments.manage',
    'refunds.view', 'refunds.manage',
    'commission.view', 'commission.manage',
    'reports.view', 'reports.export'
  ],
  hotel_admin: [
    'dashboard.view',
    'hotels.view', 'hotels.verify', 'hotels.suspend',
    'owners.view', 'owners.verify',
    'rooms.view', 'rooms.manage',
    'availability.view', 'availability.manage',
    'bookings.view'
  ],
  owner: [
    'owner.dashboard', 'owner.hotel', 'owner.rooms', 'owner.availability', 'owner.bookings', 'owner.earnings', 'owner.support'
  ],
  customer: [
    'customer.explore', 'customer.book', 'customer.bookings', 'customer.support', 'customer.reviews'
  ]
};

const UserSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  password: { type: String, required: true },
  phone: { type: String, default: '' },
  role: { type: String, enum: ALL_ROLES, required: true, index: true },
  status: { type: String, enum: USER_STATUSES, default: 'active', index: true },
  permissions: [{ type: String }],
  createdBy: { type: String, default: 'system' },
  lastLoginAt: { type: Date, default: null },
  avatar: { type: String, default: '' }
}, { timestamps: true });

// Ensure permissions array is populated on save if empty
UserSchema.pre('save', function(next) {
  if (!this.permissions || this.permissions.length === 0) {
    this.permissions = DEFAULT_ROLE_PERMISSIONS[this.role] || [];
  }
  next();
});

export const User = mongoose.models.User || mongoose.model('User', UserSchema);
