/**
 * Auth middleware module
 * Re-exports functionality from auth.middleware.js
 */

const { verifyToken, requireAuth, requireAdmin } = require('./auth.middleware');

module.exports = {
  verifyToken,
  requireAuth,
  requireAdmin
}; 