/**
 * Auth middleware module
 * Re-exports functionality from auth.middleware.js with proper middleware aliases
 */

const { checkAuth, checkRole, checkRoleOrSelf } = require('./auth.middleware');

// Standard auth middleware ready to use (not as factory functions)
const requireAuth = checkAuth;
const requireAdmin = checkRole('admin');
const requireCustomer = checkRole('customer');

module.exports = {
  verifyToken: checkAuth,
  requireAuth,
  requireAdmin,
  requireCustomer,
  checkRole,
  checkRoleOrSelf
};

exports.authorizeAdmin = (req, res, next) => {
  // Exemplo: req.user.role === 'admin'
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ message: 'Admin access required' });
}; 