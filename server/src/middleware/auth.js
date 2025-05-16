/**
 * Auth middleware module
 * Re-exports functionality from auth.middleware.js with proper middleware aliases
 */

import { checkAuth, checkRole, checkRoleOrSelf } from './auth.middleware.js';

// Standard auth middleware ready to use (not as factory functions)
export const requireAuth = checkAuth;
export const requireAdmin = checkRole('admin');
export const requireCustomer = checkRole('customer');

export const verifyToken = checkAuth;
export { checkRole, checkRoleOrSelf };


export const authorizeAdmin = (req, res, next) => {
  // Exemplo: req.user.role === 'admin'
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ message: 'Admin access required' });
};