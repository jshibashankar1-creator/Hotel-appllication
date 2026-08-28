import { Router } from 'express';
import { db } from '../db/database.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

// GET /api/owners/kyc (Admin: List all owner KYC submissions)
router.get('/kyc', authenticate, requireRole('super_admin', 'admin', 'hotel_admin'), (req, res) => {
  const owners = db.getUsers().filter(u => u.role === 'owner').map(u => {
    const profile = db.getOwnerProfile(u.id);
    const hotels = db.getHotelsByOwner(u.id);

    return {
      user_id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      created_at: u.created_at,
      hotels_count: hotels.length,
      business_name: profile ? profile.business_name : `${u.name} Stays`,
      business_reg_no: profile ? profile.business_reg_no : '',
      pan_no: profile ? profile.pan_no : '',
      gstin: profile ? profile.gstin : '',
      bank_account: profile ? profile.bank_account : '',
      address: profile ? profile.address : '',
      kyc_status: profile ? profile.kyc_status : 'pending',
      rejection_reason: profile ? profile.rejection_reason : null,
      submitted_at: profile ? profile.submitted_at : u.created_at,
      verified_at: profile ? profile.verified_at : null
    };
  });

  return res.json({ success: true, count: owners.length, owners });
});

// PUT & PATCH /api/owners/:userId/kyc (Hotel / Super Admin: Approve or Reject owner KYC)
const handleOwnerKycUpdate = (req, res) => {
  let { status, reason } = req.body;
  if (status === 'approved') status = 'verified';
  if (!['verified', 'rejected', 'pending'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Status must be verified, rejected, or pending.' });
  }

  const updatedProfile = db.transaction((data) => {
    let profile = data.owner_profiles.find(o => o.user_id === req.params.userId);
    if (!profile) {
      profile = {
        user_id: req.params.userId,
        business_name: 'Hospitality Stays',
        business_reg_no: 'REG-AUTO',
        pan_no: 'PAN-AUTO',
        gstin: 'GST-AUTO',
        bank_account: 'Bank details pending',
        address: 'India',
        kyc_status: 'pending',
        rejection_reason: null,
        submitted_at: new Date().toISOString(),
        verified_at: null
      };
      data.owner_profiles.push(profile);
    }

    profile.kyc_status = status;
    if (status === 'verified') {
      profile.verified_at = new Date().toISOString();
      profile.rejection_reason = null;
      // Auto-activate under_review hotels of this owner
      data.hotels.forEach(h => {
        if (h.owner_id === req.params.userId && h.status === 'under_review') {
          h.status = 'active';
        }
      });
    } else if (status === 'rejected') {
      profile.rejection_reason = reason || 'Documentation incomplete.';
      profile.verified_at = null;
    }

    return profile;
  });

  db.addAuditLog({
    admin_id: req.user.id,
    admin_name: req.user.name,
    admin_role: req.user.role,
    action: status === 'verified' ? 'OWNER_KYC_VERIFIED' : 'OWNER_KYC_REJECTED',
    resource: 'OwnerProfile',
    resource_id: req.params.userId,
    details: `Owner KYC status set to '${status}'.`,
    ip_address: req.ip || '127.0.0.1'
  });

  return res.json({
    success: true,
    message: `Owner KYC status updated to ${status.toUpperCase()}.`,
    profile: updatedProfile
  });
};

router.put('/:userId/kyc', authenticate, requireRole('super_admin', 'admin', 'hotel_admin'), handleOwnerKycUpdate);
router.patch('/:userId/kyc', authenticate, requireRole('super_admin', 'admin', 'hotel_admin'), handleOwnerKycUpdate);

export default router;
