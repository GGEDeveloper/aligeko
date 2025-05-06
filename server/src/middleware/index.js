// Export all middleware modules
import * as authMiddleware from './auth.middleware';
import * as errorMiddleware from './error.middleware';
import * as validateMiddleware from './validate.middleware';
import errorHandler from './errorHandler';
import * as role from './role';

// Export as named object for easy access
export const authJwt = {
  verifyToken: authMiddleware.checkAuth,
  isAdmin: authMiddleware.checkRole(['admin']),
  isUser: authMiddleware.checkRole(['user']),
  isAdminOrSelf: authMiddleware.checkRoleOrSelf(['admin'])
};

export const validate = validateMiddleware;
export const error = errorMiddleware;
export const handler = errorHandler;
export const roles = role;

// Export as default object
export default {
  authJwt,
  validate,
  error,
  handler,
  roles
}; 