'use strict';

/**
 * role.middleware.js — Role-Based Access Control (RBAC)
 *
 * Usage:
 *   const { requireRole } = require('../middleware/role.middleware');
 *
 *   // Protect a route to admins only:
 *   router.get('/admin/dashboard', authMiddleware, requireRole('admin'), handler);
 *
 *   // Support multiple allowed roles:
 *   router.get('/analytics', authMiddleware, requireRole('admin', 'analyst'), handler);
 *
 * NOTE: Must be used AFTER authMiddleware (requires req.user.role to be set).
 */

/**
 * requireRole(...roles)
 * Returns middleware that passes only if req.user.role is in the allowed list.
 *
 * @param  {...string} roles  One or more allowed roles (e.g. 'admin', 'user')
 * @returns Express middleware
 */
function requireRole(...roles) {
    return (req, res, next) => {
        if (!req.user) {
            // Should never happen if authMiddleware runs first, but guard anyway
            return res.status(401).json({ success: false, error: 'Authentication required.' });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                code:    'FORBIDDEN',
                error:   `Access denied. Required role: ${roles.join(' or ')}.`,
            });
        }

        next();
    };
}

module.exports = { requireRole };
