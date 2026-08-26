import { Router } from 'express';
import { db } from '../db/database.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

// GET /api/payments/admin (Admin Panel: Transaction Ledger)
router.get('/admin', authenticate, requireRole('super_admin', 'admin', 'finance_admin'), (req, res) => {
  const payments = db.getPayments();
  return res.json({ success: true, count: payments.length, payments });
});

// GET /api/payments/my (Customer payments)
router.get('/my', authenticate, (req, res) => {
  const payments = db.getPayments().filter(p => p.customer_id === req.user.id);
  return res.json({ success: true, count: payments.length, payments });
});

export default router;
