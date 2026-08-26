import { Router } from 'express';
import { db } from '../db/database.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

// GET /api/commissions/ledger (Finance & Super Admin: Auditable platform take-rate ledger)
router.get('/ledger', authenticate, requireRole('super_admin', 'admin', 'finance_admin'), (req, res) => {
  const bookings = db.getBookings();
  const settings = db.getSettings();

  const totalGMV = bookings.reduce((sum, b) => sum + (b.total_amount || 0), 0);
  const totalCommission = bookings.reduce((sum, b) => sum + (b.commission_amount || 0), 0);
  const totalOwnerPayout = bookings.reduce((sum, b) => sum + (b.owner_payout || 0), 0);

  return res.json({
    success: true,
    platform_take_rate: settings.commission_rate,
    total_gmv: totalGMV,
    total_commission: totalCommission,
    total_owner_payout: totalOwnerPayout,
    ledger: bookings.map(b => ({
      booking_id: b.id,
      booking_code: b.booking_code,
      hotel_name: b.hotel_name,
      customer_name: b.customer_name,
      total_amount: b.total_amount,
      commission_rate: b.commission_rate,
      commission_amount: b.commission_amount,
      owner_payout: b.owner_payout,
      payment_status: b.payment_status,
      created_at: b.created_at
    }))
  });
});

// GET /api/commissions/owner-earnings (Owner & Hotel Admin: Their specific net earnings traceable per booking)
router.get('/owner-earnings', authenticate, requireRole('owner', 'hotel_admin', 'super_admin', 'admin'), (req, res) => {
  const userHotels = db.getHotels().filter(h =>
    h.owner_id === req.user.id ||
    h.hotel_admin_id === req.user.id ||
    (req.user.hotel_id && h.id === req.user.hotel_id)
  );
  const hotelIds = new Set(userHotels.map(h => h.id));
  const bookings = db.getBookings().filter(b => hotelIds.has(b.hotel_id));

  const totalGross = bookings.reduce((sum, b) => sum + (b.total_amount || 0), 0);
  const totalCommissionDeducted = bookings.reduce((sum, b) => sum + (b.commission_amount || 0), 0);
  const totalNetEarnings = bookings.reduce((sum, b) => sum + (b.owner_payout || 0), 0);

  const completedEarnings = bookings
    .filter(b => b.booking_status === 'checked_out')
    .reduce((sum, b) => sum + (b.owner_payout || 0), 0);

  const pendingEarnings = totalNetEarnings - completedEarnings;

  return res.json({
    success: true,
    total_gross: totalGross,
    total_commission_deducted: totalCommissionDeducted,
    total_net_earnings: totalNetEarnings,
    completed_earnings: completedEarnings,
    pending_earnings: pendingEarnings,
    earnings_breakdown: bookings.map(b => ({
      booking_code: b.booking_code,
      hotel_name: b.hotel_name,
      guest_name: b.customer_name,
      check_in_date: b.check_in_date,
      check_out_date: b.check_out_date,
      gross_amount: b.total_amount,
      platform_cut: b.commission_amount,
      net_payout: b.owner_payout,
      status: b.booking_status,
      created_at: b.created_at
    }))
  });
});

// PUT /api/commissions/rate (Super Admin updates global take-rate)
router.put('/rate', authenticate, requireRole('super_admin'), (req, res) => {
  const { rate } = req.body;
  if (!rate || isNaN(rate) || rate < 1 || rate > 50) {
    return res.status(400).json({ success: false, message: 'Rate must be a number between 1 and 50 percent.' });
  }

  const updatedSettings = db.transaction((data) => {
    data.platform_settings.commission_rate = Number(rate);
    data.platform_settings.updated_at = new Date().toISOString();
    return data.platform_settings;
  });

  db.addAuditLog({
    admin_id: req.user.id,
    admin_name: req.user.name,
    admin_role: req.user.role,
    action: 'COMMISSION_CHANGED',
    resource: 'PlatformSettings',
    details: `Commission rate changed to ${rate}%.`,
    ip_address: req.ip || '127.0.0.1'
  });

  return res.json({
    success: true,
    message: `Platform commission rate updated to ${rate}%.`,
    settings: updatedSettings
  });
});

export default router;
