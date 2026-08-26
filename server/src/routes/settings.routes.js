import { Router } from 'express';
import { db } from '../db/database.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

// GET /api/settings
router.get('/', (req, res) => {
  const settings = db.getSettings();
  return res.json({ success: true, settings });
});

// PUT /api/settings (Super Admin only)
router.put('/', authenticate, requireRole('super_admin', 'admin'), (req, res) => {
  const {
    commission_rate,
    app_mode,
    payment_mode,
    cancellation_window_hours,
    cancel_fee_pct,
    support_email,
    support_phone
  } = req.body;

  const updatedSettings = db.transaction((data) => {
    if (commission_rate !== undefined) data.platform_settings.commission_rate = Number(commission_rate);
    if (app_mode !== undefined) data.platform_settings.app_mode = app_mode;
    if (payment_mode !== undefined) data.platform_settings.payment_mode = payment_mode;
    if (cancellation_window_hours !== undefined) data.platform_settings.cancellation_window_hours = Number(cancellation_window_hours);
    if (cancel_fee_pct !== undefined) data.platform_settings.cancel_fee_pct = Number(cancel_fee_pct);
    if (support_email !== undefined) data.platform_settings.support_email = support_email;
    if (support_phone !== undefined) data.platform_settings.support_phone = support_phone;
    data.platform_settings.updated_at = new Date().toISOString();
    return data.platform_settings;
  });

  db.addAuditLog({
    admin_id: req.user.id,
    admin_name: req.user.name,
    admin_role: req.user.role,
    action: 'SETTINGS_CHANGED',
    resource: 'PlatformSettings',
    details: 'Updated global platform configuration.',
    ip_address: req.ip || '127.0.0.1'
  });

  return res.json({ success: true, message: 'Platform settings saved.', settings: updatedSettings });
});

export default router;
