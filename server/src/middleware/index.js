// Export all middleware modules
import * as authMiddleware from './auth.middleware';
import * as errorMiddleware from './error.middleware';
import * as validateMiddleware from './validate.middleware';
import * as csrfMiddleware from './csrf.middleware';
import * as sanitizeMiddleware from './sanitize.middleware';
import * as loggerMiddleware from './logger.middleware';
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
export const csrf = csrfMiddleware;
export const sanitize = sanitizeMiddleware;
export const logger = loggerMiddleware;
export const handler = errorHandler;
export const roles = role;

// Export as default object
export default {
  authJwt,
  validate,
  error,
  csrf,
  sanitize,
  logger,
  handler,
  roles
}; 