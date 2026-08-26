import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db/database.js';
import { authenticate, requireRole, requireSuperAdmin } from '../middleware/auth.js';
import { ADMIN_ROLES, DEFAULT_ROLE_PERMISSIONS, USER_STATUSES } from '../models/User.js';

const router = Router();

// All routes here require admin authentication
router.use(authenticate, requireRole(...ADMIN_ROLES));

// ============================================================================
// ADMIN PROFILE & CREDENTIALS
// ============================================================================

// 1. GET /api/admin/profile — Get Current Admin Profile
router.get('/profile', (req, res) => {
  const user = db.getUserById(req.user.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'Admin profile not found.' });
  }

  return res.json({
    success: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      status: user.status || 'active',
      permissions: user.permissions || DEFAULT_ROLE_PERMISSIONS[user.role] || [],
      createdBy: user.createdBy,
      lastLoginAt: user.lastLoginAt,
      created_at: user.created_at
    }
  });
});

// 2. PUT /api/admin/profile — Update Profile (Name & Phone only — NEVER Role)
router.put('/profile', (req, res) => {
  try {
    const { name, phone } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ success: false, message: 'Name is required.' });
    }

    const updatedUser = db.transaction(data => {
      const user = data.users.find(u => u.id === req.user.id);
      if (!user) return null;

      user.name = name.trim();
      if (phone !== undefined) user.phone = phone.trim();
      return user;
    });

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'Admin user not found.' });
    }

    db.addAuditLog({
      admin_id: req.user.id,
      admin_name: req.user.name,
      admin_role: req.user.role,
      action: 'ADMIN_UPDATED',
      resource: 'User',
      resource_id: req.user.id,
      details: `Admin profile updated for '${updatedUser.name}'.`,
      ip_address: req.ip || '127.0.0.1'
    });

    return res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        status: updatedUser.status,
        permissions: updatedUser.permissions,
        lastLoginAt: updatedUser.lastLoginAt
      }
    });
  } catch (err) {
    console.error('Profile update error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error while updating profile.' });
  }
});

// 3. PUT /api/admin/change-password — Change Password
router.put('/change-password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Current password and new password are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters long.' });
    }

    const user = db.getUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password does not match.' });
    }

    const newHash = await bcrypt.hash(newPassword, 10);

    db.transaction(data => {
      const target = data.users.find(u => u.id === req.user.id);
      if (target) target.password = newHash;
    });

    db.addAuditLog({
      admin_id: req.user.id,
      admin_name: req.user.name,
      admin_role: req.user.role,
      action: 'ADMIN_PASSWORD_CHANGED',
      resource: 'User',
      resource_id: req.user.id,
      details: 'Password was updated successfully.',
      ip_address: req.ip || '127.0.0.1'
    });

    return res.json({
      success: true,
      message: 'Password changed successfully. Please remember your new password.'
    });
  } catch (err) {
    console.error('Password change error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error while changing password.' });
  }
});

// ============================================================================
// ADMIN USER DIRECTORY & MANAGEMENT
// ============================================================================

// 4. GET /api/admin/users — List All Administrators (Super Admin only)
router.get('/users', requireRole('super_admin'), (req, res) => {
  const admins = db.getAdminUsers().map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone || '',
    role: u.role,
    status: u.status || 'active',
    permissions: u.permissions || DEFAULT_ROLE_PERMISSIONS[u.role] || [],
    createdBy: u.createdBy || 'system',
    lastLoginAt: u.lastLoginAt,
    created_at: u.created_at
  }));

  return res.json({
    success: true,
    total: admins.length,
    users: admins
  });
});

// 5. GET /api/admin/users/:id — Get Single Admin
router.get('/users/:id', requireRole('super_admin', 'admin'), (req, res) => {
  const user = db.getUserById(req.params.id);
  if (!user || !ADMIN_ROLES.includes(user.role)) {
    return res.status(404).json({ success: false, message: 'Administrator not found.' });
  }

  return res.json({
    success: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      status: user.status || 'active',
      permissions: user.permissions || DEFAULT_ROLE_PERMISSIONS[user.role] || [],
      createdBy: user.createdBy,
      lastLoginAt: user.lastLoginAt,
      created_at: user.created_at
    }
  });
});

// 6. PUT /api/admin/users/:id/status — Activate / Deactivate / Suspend Admin
router.put('/users/:id/status', requireRole('super_admin', 'admin'), (req, res) => {
  try {
    const { status } = req.body;
    const targetId = req.params.id;

    if (!USER_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed statuses: [${USER_STATUSES.join(', ')}]`
      });
    }

    const targetUser = db.getUserById(targetId);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'Administrator not found.' });
    }

    // Security Guard: Non-super admins cannot modify super_admin status
    if (targetUser.role === 'super_admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({ success: false, message: 'Only Super Administrators can modify Super Admin accounts.' });
    }

    // Security Guard: Prevent Super Admin from suspending their own active session
    if (targetId === req.user.id && status !== 'active') {
      return res.status(400).json({ success: false, message: 'You cannot deactivate or suspend your own active account.' });
    }

    const updatedUser = db.transaction(data => {
      const user = data.users.find(u => u.id === targetId);
      if (user) user.status = status;
      return user;
    });

    db.addAuditLog({
      admin_id: req.user.id,
      admin_name: req.user.name,
      admin_role: req.user.role,
      action: 'ADMIN_STATUS_CHANGED',
      resource: 'User',
      resource_id: targetId,
      details: `Status of admin '${targetUser.name}' (${targetUser.email}) changed to '${status}'.`,
      ip_address: req.ip || '127.0.0.1'
    });

    return res.json({
      success: true,
      message: `Admin account status updated to '${status}'.`,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        status: updatedUser.status
      }
    });
  } catch (err) {
    console.error('Status update error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error while updating status.' });
  }
});

// 7. PUT /api/admin/users/:id/role — Change Role & Permissions (Super Admin only)
router.put('/users/:id/role', requireRole('super_admin'), (req, res) => {
  try {
    const { role, permissions } = req.body;
    const targetId = req.params.id;

    if (!ADMIN_ROLES.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `Invalid role. Allowed admin roles: [${ADMIN_ROLES.join(', ')}]`
      });
    }

    const targetUser = db.getUserById(targetId);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'Administrator not found.' });
    }

    const assignedPermissions = Array.isArray(permissions) && permissions.length > 0
      ? permissions
      : (DEFAULT_ROLE_PERMISSIONS[role] || []);

    const updatedUser = db.transaction(data => {
      const user = data.users.find(u => u.id === targetId);
      if (user) {
        user.role = role;
        user.permissions = assignedPermissions;
      }
      return user;
    });

    db.addAuditLog({
      admin_id: req.user.id,
      admin_name: req.user.name,
      admin_role: req.user.role,
      action: 'ADMIN_ROLE_CHANGED',
      resource: 'User',
      resource_id: targetId,
      details: `Role of admin '${targetUser.name}' changed to '${role}'.`,
      ip_address: req.ip || '127.0.0.1'
    });

    return res.json({
      success: true,
      message: `Admin role updated to '${role}'.`,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        status: updatedUser.status,
        permissions: updatedUser.permissions
      }
    });
  } catch (err) {
    console.error('Role update error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error while updating role.' });
  }
});

// 8. DELETE /api/admin/users/:id — Delete Admin User (Super Admin only)
router.delete('/users/:id', requireRole('super_admin'), (req, res) => {
  try {
    const targetId = req.params.id;

    if (targetId === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own Super Administrator account.' });
    }

    const targetUser = db.getUserById(targetId);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'Administrator not found.' });
    }

    db.transaction(data => {
      data.users = data.users.filter(u => u.id !== targetId);
    });

    db.addAuditLog({
      admin_id: req.user.id,
      admin_name: req.user.name,
      admin_role: req.user.role,
      action: 'ADMIN_DELETED',
      resource: 'User',
      resource_id: targetId,
      details: `Deleted admin '${targetUser.name}' (${targetUser.email}).`,
      ip_address: req.ip || '127.0.0.1'
    });

    return res.json({
      success: true,
      message: `Administrator '${targetUser.name}' deleted successfully.`
    });
  } catch (err) {
    console.error('Admin delete error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error while deleting administrator.' });
  }
});

// ============================================================================
// AUDIT LOGS
// ============================================================================

// 9. GET /api/admin/audit-logs — Retrieve Audit Logs (Super Admin & Admin)
router.get('/audit-logs', requireRole('super_admin', 'admin'), (req, res) => {
  const logs = db.getAuditLogs();
  return res.json({
    success: true,
    total: logs.length,
    logs
  });
});

// ============================================================================
// ADMIN EXECUTIVE METRICS & DASHBOARD
// ============================================================================

// 10. GET /api/admin/kpis & GET /api/admin/dashboard
const handleAdminKPIs = (req, res) => {
  const hotels = db.getHotels();
  const bookings = db.getBookings();
  const owners = db.getOwnerProfiles();
  const refunds = db.getRefunds();
  const tickets = db.getSupportTickets();

  const todayStr = new Date().toISOString().slice(0, 10);
  const todaysBookings = bookings.filter(b => 
    (b.created_at && b.created_at.startsWith(todayStr)) || b.check_in_date === todayStr
  ).length;
  const upcomingCheckIns = bookings.filter(b => b.check_in_date >= todayStr && b.booking_status === 'confirmed');
  const upcomingCheckOuts = bookings.filter(b => b.check_out_date >= todayStr && b.booking_status === 'checked_in');
  const activeInHouseStays = bookings.filter(b => b.booking_status === 'checked_in').length;
  const cancelledRefunded = bookings.filter(b => b.booking_status === 'cancelled' || b.booking_status === 'refunded').length;

  const totalGMV = bookings.reduce((sum, b) => sum + (b.total_amount || 0), 0);
  const totalCommission = bookings.reduce((sum, b) => sum + (b.commission_amount || Math.round((b.total_amount || 0) * 0.15)), 0);
  const totalOwnerPayout = bookings.reduce((sum, b) => sum + (b.owner_payout || Math.round((b.total_amount || 0) * 0.85)), 0);

  const pendingRefunds = refunds.filter(r => r.status === 'pending');
  const pendingKYC = owners.filter(o => o.kyc_status === 'pending');
  const openTickets = tickets.filter(t => t.status === 'open' || t.status === 'in_progress');

  const verifiedHotels = hotels.filter(h => h.status === 'active' || h.status === 'verified').length;
  const underReviewHotels = hotels.filter(h => h.status === 'under_review' || h.status === 'pending').length;

  const data = {
    totalHotels: hotels.length,
    verifiedHotels,
    underReviewHotels,
    totalBookings: bookings.length,
    todayBookings: todaysBookings,
    upcomingCheckIns: upcomingCheckIns.length,
    grossPlatformVolume: totalGMV,
    netPlatformCommission: totalCommission,
    activeInHouseStays,
    upcomingCheckOuts: upcomingCheckOuts.length,
    cancelledRefunded,
    pendingKYC: pendingKYC.length,
    pendingRefunds: pendingRefunds.length,
    openTickets: openTickets.length
  };

  const kpis = {
    total_hotels: hotels.length,
    verified_hotels: verifiedHotels,
    pending_hotels: underReviewHotels,
    total_bookings: bookings.length,
    todays_bookings: todaysBookings,
    total_gmv: totalGMV,
    platform_revenue: totalCommission,
    owner_payouts: totalOwnerPayout,
    pending_refunds_count: pendingRefunds.length,
    pending_kyc_count: pendingKYC.length,
    open_tickets_count: openTickets.length,
    upcoming_checkins_count: upcomingCheckIns.length,
    upcoming_checkouts_count: upcomingCheckOuts.length,
    active_in_house_stays: activeInHouseStays,
    checked_in_bookings_count: activeInHouseStays,
    checked_out_bookings_count: bookings.filter(b => b.booking_status === 'checked_out').length,
    cancelled_bookings_count: cancelledRefunded
  };

  return res.json({
    success: true,
    data,
    kpis
  });
};

router.get('/kpis', requireRole('super_admin', 'admin'), handleAdminKPIs);
router.get('/dashboard', requireRole('super_admin', 'admin'), handleAdminKPIs);
router.get('/dashboard/kpis', requireRole('super_admin', 'admin'), handleAdminKPIs);

// 11. GET /api/admin/hotels — All Hotels
router.get('/hotels', (req, res) => {
  const hotels = db.getHotels();
  return res.json({ success: true, count: hotels.length, hotels });
});

// 12. GET /api/admin/bookings — All Bookings
router.get('/bookings', (req, res) => {
  const bookings = db.getBookings();
  return res.json({ success: true, count: bookings.length, bookings });
});

// 13. GET /api/admin/payments — All Payments
router.get('/payments', requireRole('super_admin', 'admin', 'finance_admin'), (req, res) => {
  const payments = db.getPayments();
  return res.json({ success: true, count: payments.length, payments });
});

// 14. GET /api/admin/refunds — All Refunds
router.get('/refunds', requireRole('super_admin', 'admin', 'finance_admin'), (req, res) => {
  const refunds = db.getRefunds();
  return res.json({ success: true, count: refunds.length, refunds });
});

// 15. GET /api/admin/commissions — Commission Ledger
router.get('/commissions', requireRole('super_admin', 'admin', 'finance_admin'), (req, res) => {
  const ledger = db.getCommissionLedger();
  return res.json({ success: true, count: ledger.length, ledger });
});

// 16. GET /api/admin/reports — Daily & Monthly Reports
router.get('/reports', (req, res) => {
  const bookings = db.getBookings();
  const payments = db.getPayments();
  return res.json({
    success: true,
    total_revenue: payments.reduce((sum, p) => sum + (p.amount || 0), 0),
    total_bookings: bookings.length
  });
});

// 17. GET /api/admin/customers — Customer Directory
router.get('/customers', (req, res) => {
  const customers = db.getUsers().filter(u => u.role === 'customer').map(c => ({
    id: c.id,
    name: c.name,
    email: c.email,
    phone: c.phone || '',
    created_at: c.created_at
  }));
  return res.json({ success: true, count: customers.length, customers });
});

export default router;
