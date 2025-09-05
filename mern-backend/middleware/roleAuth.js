const User = require('../models/User');

/**
 * Middleware to check if user has required role
 * @param {string|Array} requiredRoles - Single role or array of roles
 */
const requireRole = (requiredRoles) => {
  return (req, res, next) => {
    try {
      // Check if user is authenticated
      if (!req.user) {
        return res.status(401).json({
          error: 'Authentication required',
          message: 'You must be logged in to access this resource'
        });
      }

      // Normalize requiredRoles to array
      const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
      
      // Check if user has any of the required roles
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({
          error: 'Insufficient permissions',
          message: `Access denied. Required role: ${roles.join(' or ')}, your role: ${req.user.role}`
        });
      }

      // Check if user is active
      if (!req.user.isActive) {
        return res.status(403).json({
          error: 'Account disabled',
          message: 'Your account has been deactivated'
        });
      }

      next();
    } catch (error) {
      console.error('Role authorization error:', error);
      res.status(500).json({
        error: 'Authorization error',
        message: 'An error occurred while checking permissions'
      });
    }
  };
};

/**
 * Middleware specifically for admin access
 */
const requireAdmin = requireRole(User.USER_ROLES.ADMIN);

/**
 * Middleware for admin or editor access
 */
const requireEditorOrAdmin = requireRole([
  User.USER_ROLES.ADMIN,
  User.USER_ROLES.EDITOR
]);

/**
 * Middleware that allows any authenticated user (all roles)
 */
const requireAnyRole = requireRole([
  User.USER_ROLES.ADMIN,
  User.USER_ROLES.EDITOR,
  User.USER_ROLES.VIEWER
]);

module.exports = {
  requireRole,
  requireAdmin,
  requireEditorOrAdmin,
  requireAnyRole
};
