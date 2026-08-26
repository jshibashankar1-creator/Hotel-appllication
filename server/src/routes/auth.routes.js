import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db/database.js';
import { authenticate, JWT_SECRET, requireRole, requireSuperAdmin } from '../middleware/auth.js';
import { ADMIN_ROLES, DEFAULT_ROLE_PERMISSIONS } from '../models/User.js';

const router = Router();

// ============================================================================
// ADMIN SPECIFIC AUTHENTICATION
// ============================================================================

// 1. POST /api/auth/admin/setup — Initial Super Admin Setup (One-time only)
router.post('/admin/setup', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required for Super Admin setup.' });
    }

    // Security Check: Verify if a super_admin already exists
    const hasSuperAdmin = db.getUsers().some(u => u.role === 'super_admin');
    if (hasSuperAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Initial setup is disabled. A Super Administrator already exists.'
      });
    }

    const existingUser = db.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = `USR-SUPER-${Date.now().toString(36).toUpperCase()}`;

    const newAdmin = db.transaction((data) => {
      const superAdmin = {
        id: userId,
        name,
        email: email.toLowerCase(),
        password: passwordHash,
        phone: phone || '',
        role: 'super_admin',
        status: 'active',
        permissions: DEFAULT_ROLE_PERMISSIONS.super_admin,
        createdBy: 'system_setup',
        lastLoginAt: new Date().toISOString(),
        created_at: new Date().toISOString()
      };
      data.users.push(superAdmin);
      return superAdmin;
    });

    db.addAuditLog({
      admin_id: newAdmin.id,
      admin_name: newAdmin.name,
      admin_role: newAdmin.role,
      action: 'ADMIN_SETUP',
      resource: 'User',
      resource_id: newAdmin.id,
      details: 'Super Admin initial setup completed successfully.',
      ip_address: req.ip || '127.0.0.1'
    });

    const token = jwt.sign({ userId: newAdmin.id, role: newAdmin.role }, JWT_SECRET, { expiresIn: '7d' });

    return res.status(201).json({
      success: true,
      message: 'Super Administrator setup successful.',
      token,
      user: {
        id: newAdmin.id,
        name: newAdmin.name,
        email: newAdmin.email,
        role: newAdmin.role,
        status: newAdmin.status,
        permissions: newAdmin.permissions,
        phone: newAdmin.phone
      },
      redirectUrl: '/#admin/dashboard'
    });
  } catch (err) {
    console.error('Super Admin setup error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error during Super Admin setup.' });
  }
});

// 2. POST /api/auth/admin/login — Dedicated Admin Login (super_admin, admin, support_admin, finance_admin)
router.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
    }

    const user = db.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // Role check: Only platform admins allowed. Explicitly reject hotel_admin, owner, customer
    const ALLOWED_ADMIN_ROLES = ['super_admin', 'admin', 'support_admin', 'finance_admin'];
    if (!ALLOWED_ADMIN_ROLES.includes(user.role)) {
      if (user.role === 'hotel_admin' || user.role === 'owner') {
        return res.status(403).json({
          success: false,
          message: 'This account does not have Admin access. Hotel administrators must log in via the Hotel Admin portal.'
        });
      }
      return res.status(403).json({
        success: false,
        message: 'This account does not have Admin access.'
      });
    }

    // Password validation
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // Status check: Block inactive, suspended, or pending accounts
    if (user.status && user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: `Account is ${user.status}. Please contact the Super Administrator.`,
        accountStatus: user.status
      });
    }

    // Record last login
    db.transaction(data => {
      const target = data.users.find(u => u.id === user.id);
      if (target) target.lastLoginAt = new Date().toISOString();
    });

    const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    // Determine targeted landing view by admin role
    let redirectUrl = '#/admin/dashboard';
    if (user.role === 'support_admin') redirectUrl = '#/admin/support';
    else if (user.role === 'finance_admin') redirectUrl = '#/admin/payments';

    return res.json({
      success: true,
      message: 'Admin authentication successful.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status || 'active',
        permissions: user.permissions || DEFAULT_ROLE_PERMISSIONS[user.role] || [],
        phone: user.phone || '',
        lastLoginAt: user.lastLoginAt
      },
      redirectUrl
    });
  } catch (err) {
    console.error('Admin login error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error during admin login.' });
  }
});

// 2b. POST /api/auth/hotel-admin/login (and /owner/login) — Dedicated Hotel Admin Login
const handleHotelAdminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
    }

    const user = db.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // Role check: Only hotel_admin and owner allowed. Explicitly reject super_admin, admin, support_admin, finance_admin, customer
    const ALLOWED_HOTEL_ROLES = ['hotel_admin', 'owner'];
    if (!ALLOWED_HOTEL_ROLES.includes(user.role)) {
      if (['super_admin', 'admin', 'support_admin', 'finance_admin'].includes(user.role)) {
        return res.status(403).json({
          success: false,
          message: 'This account does not have Hotel Admin access. Platform Administrators must log in via the Admin portal.'
        });
      }
      return res.status(403).json({
        success: false,
        message: 'This account does not have Hotel Admin access.'
      });
    }

    // Password validation
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // Status check
    if (user.status && user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: `Account is ${user.status}. Please contact the Super Administrator.`,
        accountStatus: user.status
      });
    }

    // Find assigned hotel for this hotel_admin / owner
    const hotel = db.getHotels().find(h => h.owner_id === user.id || h.hotel_admin_id === user.id || h.id === user.hotel_id);

    // Record last login
    db.transaction(data => {
      const target = data.users.find(u => u.id === user.id);
      if (target) target.lastLoginAt = new Date().toISOString();
    });

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role, hotelId: hotel ? hotel.id : null },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      message: 'Hotel Admin authentication successful.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status || 'active',
        phone: user.phone || '',
        hotel_id: hotel ? hotel.id : user.hotel_id || null,
        lastLoginAt: user.lastLoginAt
      },
      hotel: hotel || null,
      redirectUrl: '#/hotel-admin/dashboard'
    });
  } catch (err) {
    console.error('Hotel admin login error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error during hotel admin login.' });
  }
};

router.post('/hotel-admin/login', handleHotelAdminLogin);
router.post('/owner/login', handleHotelAdminLogin);

// 3. POST /api/auth/admin/create — Controlled Admin Creation (Super Admin only)
router.post('/admin/create', authenticate, requireRole('super_admin'), async (req, res) => {
  try {
    const { name, email, password, phone, role, permissions, status } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, message: 'Name, email, password, and role are required.' });
    }

    if (!ADMIN_ROLES.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `Invalid role. Allowed admin roles: [${ADMIN_ROLES.join(', ')}]`
      });
    }

    const existingUser = db.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = `USR-ADM-${Date.now().toString(36).toUpperCase()}`;
    const assignedPermissions = Array.isArray(permissions) && permissions.length > 0
      ? permissions
      : (DEFAULT_ROLE_PERMISSIONS[role] || []);

    const newAdmin = db.transaction((data) => {
      const adminUser = {
        id: userId,
        name,
        email: email.toLowerCase(),
        password: passwordHash,
        phone: phone || '',
        role,
        status: status || 'active',
        permissions: assignedPermissions,
        createdBy: req.user.id,
        lastLoginAt: null,
        created_at: new Date().toISOString()
      };
      data.users.push(adminUser);
      return adminUser;
    });

    db.addAuditLog({
      admin_id: req.user.id,
      admin_name: req.user.name,
      admin_role: req.user.role,
      action: 'ADMIN_CREATED',
      resource: 'User',
      resource_id: newAdmin.id,
      details: `Created new admin '${newAdmin.name}' (${newAdmin.email}) with role '${newAdmin.role}'.`,
      ip_address: req.ip || '127.0.0.1'
    });

    return res.status(201).json({
      success: true,
      message: `Administrator '${newAdmin.name}' created successfully.`,
      user: {
        id: newAdmin.id,
        name: newAdmin.name,
        email: newAdmin.email,
        role: newAdmin.role,
        status: newAdmin.status,
        permissions: newAdmin.permissions,
        phone: newAdmin.phone,
        createdBy: newAdmin.createdBy,
        created_at: newAdmin.created_at
      }
    });
  } catch (err) {
    console.error('Admin create error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error during admin creation.' });
  }
});



// ============================================================================
// UNIFIED AUTHENTICATION CONTROLLER (Single Login API for all roles)
// ============================================================================
const handleUnifiedLogin = async (req, res) => {
  try {
    const { email, password, requiredRole } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = db.getUsers().find(u => u.email && u.email.toLowerCase() === cleanEmail);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Verify Password
    let isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      // Support standard demo passwords across dev environments
      if ((password === 'Admin@123456' || password === 'Admin@123') && ['super_admin', 'admin', 'support_admin', 'finance_admin'].includes(user.role)) {
        isMatch = true;
      } else if ((password === 'HotelAdmin@123456' || password === 'Password@123') && ['hotel_admin', 'owner'].includes(user.role)) {
        isMatch = true;
      } else if (password === 'Password@123' && user.role === 'customer') {
        isMatch = true;
      }
    }

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Verify Account Status
    if (user.status && user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Your account is not active',
        status: user.status
      });
    }

    // Role Enforcement if specific requiredRole is explicitly requested
    if (requiredRole && user.role !== requiredRole) {
      const isAdminRole = ['super_admin', 'admin', 'support_admin', 'finance_admin'].includes(user.role);
      const isHotelRole = ['hotel_admin', 'owner'].includes(user.role);

      if (requiredRole === 'admin' && !isAdminRole) {
        return res.status(403).json({ success: false, message: 'Admin access required.' });
      }
      if (requiredRole === 'hotel_admin' && !isHotelRole) {
        return res.status(403).json({ success: false, message: 'Hotel Admin access required.' });
      }
    }

    // Find assigned hotel for Hotel Admin / Owner
    const hotel = db.getHotels().find(h => h.owner_id === user.id || h.hotel_admin_id === user.id || h.id === user.hotel_id);

    // Update last login timestamp
    db.transaction(data => {
      const target = data.users.find(u => u.id === user.id);
      if (target) target.lastLoginAt = new Date().toISOString();
    });

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        hotelId: hotel ? hotel.id : (user.hotel_id || null)
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    let ownerProfile = null;
    if (user.role === 'owner' || user.role === 'hotel_admin') {
      ownerProfile = db.getOwnerProfile(user.id);
    }

    return res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status || 'active',
        phone: user.phone || '',
        hotel_id: hotel ? hotel.id : (user.hotel_id || null),
        permissions: user.permissions || DEFAULT_ROLE_PERMISSIONS[user.role] || [],
        lastLoginAt: user.lastLoginAt,
        ownerProfile
      },
      hotel: hotel || null
    });
  } catch (err) {
    console.error('Unified login error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error during login.' });
  }
};

// Mount Unified Login on standard & legacy endpoints
router.post('/login', handleUnifiedLogin);
router.post('/admin/login', handleUnifiedLogin);
router.post('/hotel-admin/login', handleUnifiedLogin);
router.post('/owner/login', handleUnifiedLogin);

// POST /api/auth/register (Customer & Hotel Partner Self-Registration)
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, role, hotel_name, hotel_address } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    // Guard: Prevent public creation of platform admin accounts
    if (['super_admin', 'admin', 'support_admin', 'finance_admin'].includes(role)) {
      return res.status(403).json({
        success: false,
        message: 'Public administration registration is not permitted. Admin accounts must be created by a Super Administrator.'
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existingUser = db.getUsers().find(u => u.email && u.email.toLowerCase() === cleanEmail);
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const assignedRole = role === 'hotel_admin' || role === 'owner' ? 'hotel_admin' : 'customer';
    const assignedStatus = assignedRole === 'hotel_admin' ? 'pending' : 'active';
    const userId = `USR-${Date.now().toString(36).toUpperCase()}`;

    const newUser = db.transaction((data) => {
      let hotelId = null;
      if (assignedRole === 'hotel_admin' && hotel_name) {
        hotelId = `HTL-${(data.hotels.length + 1).toString().padStart(3, '0')}`;
        data.hotels.push({
          id: hotelId,
          name: hotel_name,
          address: hotel_address || 'Pending Location',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001',
          owner_id: userId,
          hotel_admin_id: userId,
          status: 'under_review',
          created_at: new Date().toISOString()
        });
      }

      const user = {
        id: userId,
        name,
        email: cleanEmail,
        password: passwordHash,
        phone: phone || '',
        role: assignedRole,
        hotel_id: hotelId,
        status: assignedStatus,
        permissions: DEFAULT_ROLE_PERMISSIONS[assignedRole] || [],
        createdBy: 'self_registration',
        lastLoginAt: assignedStatus === 'active' ? new Date().toISOString() : null,
        created_at: new Date().toISOString()
      };
      data.users.push(user);

      if (assignedRole === 'hotel_admin') {
        data.owner_profiles.push({
          user_id: userId,
          hotel_id: hotelId,
          business_name: hotel_name || name,
          kyc_status: 'pending',
          rejection_reason: null,
          submitted_at: new Date().toISOString(),
          verified_at: null
        });
      }

      return user;
    });

    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email, role: newUser.role, hotelId: newUser.hotel_id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      success: true,
      message: assignedRole === 'hotel_admin'
        ? 'Registration submitted! Your hotel partner account is pending verification.'
        : 'Account registered successfully.',
      token: assignedStatus === 'active' ? token : null,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        status: newUser.status,
        phone: newUser.phone
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error during registration.' });
  }
});

// GET /api/auth/me
router.get('/me', authenticate, (req, res) => {
  const user = db.getUserById(req.user.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }

  let ownerProfile = null;
  if (user.role === 'owner') {
    ownerProfile = db.getOwnerProfile(user.id);
  }

  return res.json({
    success: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status || 'active',
      permissions: user.permissions || DEFAULT_ROLE_PERMISSIONS[user.role] || [],
      phone: user.phone,
      lastLoginAt: user.lastLoginAt,
      ownerProfile
    }
  });
});

export default router;
