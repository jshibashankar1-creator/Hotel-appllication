import { Router } from 'express';
import { db } from '../db/database.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

// GET /api/refunds/admin (Admin Panel: Refund requests queue)
router.get('/admin', authenticate, requireRole('super_admin', 'admin', 'finance_admin'), (req, res) => {
  const refunds = db.getRefunds();
  return res.json({ success: true, count: refunds.length, refunds });
});

// GET /api/refunds/my (Customer refund requests)
router.get('/my', authenticate, (req, res) => {
  const refunds = db.getRefunds().filter(r => r.customer_id === req.user.id);
  return res.json({ success: true, count: refunds.length, refunds });
});

// PUT /api/refunds/:id/process (Finance / Super Admin approves or rejects refund)
router.put('/:id/process', authenticate, requireRole('super_admin', 'admin', 'finance_admin'), (req, res) => {
  const { status, admin_notes } = req.body;
  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Status must be approved or rejected.' });
  }

  const updatedRefund = db.transaction((data) => {
    const idx = data.refunds.findIndex(r => r.id === req.params.id || r.refund_code === req.params.id);
    if (idx !== -1) {
      data.refunds[idx].status = status;
      data.refunds[idx].admin_notes = admin_notes || (status === 'approved' ? 'Refund approved by Administrator.' : 'Refund rejected.');
      data.refunds[idx].processed_at = new Date().toISOString();

      // If approved, update linked booking and payment status
      if (status === 'approved') {
        const bookingId = data.refunds[idx].booking_id;
        const bIdx = data.bookings.findIndex(b => b.id === bookingId);
        if (bIdx !== -1) {
          data.bookings[bIdx].payment_status = 'refunded';
        }
        const pIdx = data.payments.findIndex(p => p.booking_id === bookingId);
        if (pIdx !== -1) {
          data.payments[pIdx].status = 'refunded';
        }
      }

      return data.refunds[idx];
    }
    return null;
  });

  if (!updatedRefund) {
    return res.status(404).json({ success: false, message: 'Refund request not found.' });
  }

  db.addAuditLog({
    admin_id: req.user.id,
    admin_name: req.user.name,
    admin_role: req.user.role,
    action: status === 'approved' ? 'REFUND_APPROVED' : 'REFUND_REJECTED',
    resource: 'Refund',
    resource_id: updatedRefund.id,
    details: `Refund '${updatedRefund.refund_code}' for amount ₹${updatedRefund.refund_amount} was ${status}.`,
    ip_address: req.ip || '127.0.0.1'
  });

  return res.json({
    success: true,
    message: `Refund ${status.toUpperCase()} successfully.`,
    refund: updatedRefund
  });
});

export default router;
