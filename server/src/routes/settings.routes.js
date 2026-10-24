import { Router } from 'express';
import { db } from '../db/database.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

// GET /api/settings
router.get('/', (req, res) => {
  const settings = db.getSettings();
  return res.json({ success: true, settings });
});

// GET /api/settings/home-hero (Public endpoint for Customer App & Web discovery)
router.get('/home-hero', (req, res) => {
  const hero = db.getHomeHero();
  return res.json({
    success: true,
    image_url: hero.image_url,
    hero_image: hero.image_url,
    public_id: hero.public_id,
    updated_at: hero.updated_at
  });
});

// PUT /api/settings/home-hero (Super Admin only: Update or replace home hero background)
router.put('/home-hero', authenticate, requireRole('super_admin'), (req, res) => {
  const { image_url, public_id } = req.body;
  if (!image_url || typeof image_url !== 'string') {
    return res.status(400).json({ success: false, message: 'Image URL is required.' });
  }

  const updatedSettings = db.setHomeHero(image_url, public_id || null);

  db.addAuditLog({
    admin_id: req.user.id,
    admin_name: req.user.name,
    admin_role: req.user.role,
    action: 'HERO_IMAGE_UPDATED',
    resource: 'PlatformSettings',
    details: 'Updated Customer App Home hero background image.',
    ip_address: req.ip || '127.0.0.1'
  });

  return res.json({
    success: true,
    message: 'Home hero background image updated successfully.',
    image_url: updatedSettings.home_hero_bg_image,
    public_id: updatedSettings.home_hero_bg_public_id,
    updated_at: updatedSettings.home_hero_bg_updated_at,
    settings: updatedSettings
  });
});

// DELETE /api/settings/home-hero (Super Admin only: Remove home hero background)
router.delete('/home-hero', authenticate, requireRole('super_admin'), (req, res) => {
  const updatedSettings = db.removeHomeHero();

  db.addAuditLog({
    admin_id: req.user.id,
    admin_name: req.user.name,
    admin_role: req.user.role,
    action: 'HERO_IMAGE_REMOVED',
    resource: 'PlatformSettings',
    details: 'Removed Customer App Home hero background image.',
    ip_address: req.ip || '127.0.0.1'
  });

  return res.json({
    success: true,
    message: 'Home hero background image removed successfully.',
    image_url: null,
    public_id: null,
    settings: updatedSettings
  });
});

// PUT /api/settings (Super Admin & Admin configurations)
router.put('/', authenticate, requireRole('super_admin', 'admin'), (req, res) => {
  const {
    commission_rate,
    app_mode,
    payment_mode,
    cancellation_window_hours,
    cancel_fee_pct,
    support_email,
    support_phone,
    home_hero_bg_image
  } = req.body;

  // Strict check: Only super_admin can set home_hero_bg_image
  if (home_hero_bg_image !== undefined && req.user.role !== 'super_admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied: Only Super Admin can modify the home hero background image.'
    });
  }

  const updatedSettings = db.transaction((data) => {
    if (commission_rate !== undefined) data.platform_settings.commission_rate = Number(commission_rate);
    if (app_mode !== undefined) data.platform_settings.app_mode = app_mode;
    if (payment_mode !== undefined) data.platform_settings.payment_mode = payment_mode;
    if (cancellation_window_hours !== undefined) data.platform_settings.cancellation_window_hours = Number(cancellation_window_hours);
    if (cancel_fee_pct !== undefined) data.platform_settings.cancel_fee_pct = Number(cancel_fee_pct);
    if (support_email !== undefined) data.platform_settings.support_email = support_email;
    if (support_phone !== undefined) data.platform_settings.support_phone = support_phone;
    if (home_hero_bg_image !== undefined && req.user.role === 'super_admin') {
      data.platform_settings.home_hero_bg_image = home_hero_bg_image;
      data.platform_settings.home_hero_bg_updated_at = new Date().toISOString();
    }
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
