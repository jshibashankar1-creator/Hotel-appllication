import jwt from 'jsonwebtoken';
import { db } from '../db/database.js';

export const JWT_SECRET = process.env.JWT_SECRET || 'hotelhub_production_jwt_secret_key_2026_super_secure_enterprise';

export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = db.getUserById(decoded.userId);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User account no longer exists.' });
    }

    // Status check: Block suspended or inactive accounts immediately
    if (user.status && user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: `Account is ${user.status}. Please contact administrator support.`,
        accountStatus: user.status
      });
    }

    const hotel = db.getHotels().find(h => h.owner_id === user.id || h.hotel_admin_id === user.id || h.id === user.hotel_id);
    const assignedHotelId = hotel ? hotel.id : (user.hotel_id || decoded.hotelId || null);

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status || 'active',
      hotel_id: assignedHotelId,
      hotelId: assignedHotelId,
      permissions: user.permissions || [],
      phone: user.phone || ''
    };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Session expired. Please log in again.', isExpired: true });
    }
    return res.status(401).json({ success: false, message: 'Invalid or malformed authentication token.' });
  }
}

// Alias
export const authenticateUser = authenticate;

/**
 * Role-Based Access Control Guard
 */
export function requireRole(...allowedRoles) {
  const flattenedRoles = allowedRoles.flat();
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    const userRole = req.user.role;

    // Direct match
    if (flattenedRoles.includes(userRole)) {
      return next();
    }

    // super_admin inherits general platform admin sub-roles (admin, support_admin, finance_admin)
    const PLATFORM_ADMIN_SUB_ROLES = ['admin', 'support_admin', 'finance_admin'];
    if (userRole === 'super_admin' && (flattenedRoles.includes('super_admin') || flattenedRoles.some(r => PLATFORM_ADMIN_SUB_ROLES.includes(r)))) {
      return next();
    }

    // hotel_admin matches owner role for property operations
    if (userRole === 'hotel_admin' && flattenedRoles.includes('owner')) {
      return next();
    }

    // owner matches hotel_admin for hotel operational routes
    if (userRole === 'owner' && flattenedRoles.includes('hotel_admin')) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: `Access denied. Requires role: [${flattenedRoles.join(', ')}]. Current role: '${userRole}'`
    });
  };
}

/**
 * Permission-Based Access Control Guard
 */
export function requirePermission(...requiredPermissions) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    // super_admin bypasses specific permission checks
    if (req.user.role === 'super_admin') {
      return next();
    }

    const userPerms = new Set(req.user.permissions || []);
    const hasAllPerms = requiredPermissions.every(p => userPerms.has(p));

    if (hasAllPerms) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: `Access denied. Missing required permission: [${requiredPermissions.join(', ')}]`
    });
  };
}

// Dedicated Role Middleware Helpers
export const requireSuperAdmin = requireRole('super_admin');
export const requireAdmin = requireRole('super_admin', 'admin');
export const requireFinanceAdmin = requireRole('super_admin', 'admin', 'finance_admin');
export const requireSupportAdmin = requireRole('super_admin', 'admin', 'support_admin');
export const requireHotelAdmin = requireRole('super_admin', 'admin', 'hotel_admin');
