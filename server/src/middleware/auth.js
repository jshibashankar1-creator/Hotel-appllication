import jwt from 'jsonwebtoken';
import { db } from '../db/database.js';

if (!process.env.JWT_SECRET) {
  console.error("FATAL ERROR: JWT_SECRET is not defined in the environment.");
  process.exit(1);
}
export const JWT_SECRET = process.env.JWT_SECRET;
const revokedTokens = new Set();

export function revokeToken(token) {
  if (!token) return;
  revokedTokens.add(token);
}

export function isTokenRevoked(token) {
  return Boolean(token && revokedTokens.has(token));
}

export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
  }

  const token = authHeader.split(' ')[1];
  if (isTokenRevoked(token)) {
    return res.status(401).json({ success: false, message: 'Session has been revoked. Please log in again.' });
  }

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
 * Role-Based Access Control Guard (Strict)
 */
export function requireRole(...allowedRoles) {
  const flattenedRoles = allowedRoles.flat();
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    const userRole = req.user.role;

    // Strict direct match only (No overlapping aliases)
    if (flattenedRoles.includes(userRole)) {
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

/**
 * Tenant Access Guard
 * Verifies if the authenticated user has access to the requested property
 */
export function requireTenantAccess(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required.' });
  }

  // Phase 3 implementation details will go here, 
  // but for Phase 2, this conceptual layer is established.
  return next();
}

// Dedicated Role Middleware Helpers (Strict mappings)
export const requireSuperAdmin = requireRole('super_admin');
export const requireAdmin = requireRole('super_admin', 'admin');
export const requireFinanceAdmin = requireRole('finance_admin');
export const requireSupportAdmin = requireRole('support_admin');
export const requireHotelAdmin = requireRole('hotel_admin');
