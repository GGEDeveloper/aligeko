import { Router } from 'express';
import { body } from 'express-validator';
import * as authController from '../controllers/auth.controller.js';
import * as twoFactorController from '../controllers/twoFactor.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate, validatePassword } from '../middleware/validate.middleware.js';

const router = Router();

/**
 * @route POST /api/v1/auth/register
 * @desc Register a new B2B customer
 * @access Public
 */
router.post(
  '/register',
  [
    // Validation middleware
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password')
      .isLength({ min: 10 })
      .withMessage('Password must be at least 10 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
    body('firstName').notEmpty().withMessage('First name is required'),
    body('lastName').notEmpty().withMessage('Last name is required'),
    body('companyName').notEmpty().withMessage('Company name is required'),
    validate,
    validatePassword()
  ],
  authController.register
);

/**
 * @route POST /api/v1/auth/login
 * @desc Login user and get token
 * @access Public
 */
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
    validate
  ],
  authController.login
);

/**
 * @route POST /api/v1/auth/refresh-token
 * @desc Refresh access token
 * @access Public
 */
router.post(
  '/refresh-token',
  [
    body('refreshToken').notEmpty().withMessage('Refresh token is required'),
    validate
  ],
  authController.refreshToken
);

/**
 * @route POST /api/v1/auth/forgot-password
 * @desc Request password reset
 * @access Public
 */
router.post(
  '/forgot-password',
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
    validate
  ],
  authController.requestPasswordReset
);

/**
 * @route POST /api/v1/auth/reset-password
 * @desc Reset password with token
 * @access Public
 */
router.post(
  '/reset-password',
  [
    body('token').notEmpty().withMessage('Reset token is required'),
    body('password')
      .isLength({ min: 10 })
      .withMessage('Password must be at least 10 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
    validate,
    validatePassword()
  ],
  authController.resetPassword
);

/**
 * @route GET /api/v1/auth/me
 * @desc Get current user information
 * @access Private
 */
router.get('/me', authenticate, authController.getCurrentUser);

/**
 * @route POST /api/v1/auth/2fa/setup
 * @desc Setup two-factor authentication
 * @access Private
 */
router.post(
  '/2fa/setup',
  authenticate,
  twoFactorController.setupTwoFactor
);

/**
 * @route POST /api/v1/auth/2fa/verify
 * @desc Verify and enable two-factor authentication
 * @access Private
 */
router.post(
  '/2fa/verify',
  [
    authenticate,
    body('token').isNumeric().isLength({ min: 6, max: 6 }).withMessage('Verification code must be 6 digits'),
    validate
  ],
  twoFactorController.verifyTwoFactor
);

/**
 * @route POST /api/v1/auth/2fa/validate
 * @desc Validate two-factor authentication during login
 * @access Public
 */
router.post(
  '/2fa/validate',
  [
    body('userId').notEmpty().withMessage('User ID is required'),
    body('token').notEmpty().withMessage('Verification code is required'),
    body('useBackupCode').optional().isBoolean(),
    validate
  ],
  twoFactorController.validateTwoFactor
);

/**
 * @route POST /api/v1/auth/2fa/disable
 * @desc Disable two-factor authentication
 * @access Private
 */
router.post(
  '/2fa/disable',
  [
    authenticate,
    body('token').isNumeric().isLength({ min: 6, max: 6 }).withMessage('Verification code must be 6 digits'),
    body('password').notEmpty().withMessage('Password is required'),
    validate
  ],
  twoFactorController.disableTwoFactor
);

/**
 * @route GET /api/v1/auth/2fa/status
 * @desc Get two-factor authentication status
 * @access Private
 */
router.get(
  '/2fa/status',
  authenticate,
  twoFactorController.getTwoFactorStatus
);

export default router; 