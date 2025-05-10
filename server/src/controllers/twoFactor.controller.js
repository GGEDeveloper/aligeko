import jwt from 'jsonwebtoken';
import { User } from '../models.js';
import { 
  generateSecret, 
  generateBackupCodes, 
  verifyToken, 
  generateQRCodeURL,
  verifyBackupCode
} from '../utils/twoFactor.js';

/**
 * Generate 2FA secret for a user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const setupTwoFactor = async (req, res, next) => {
  try {
    const { user } = req;
    
    // Check if 2FA is already enabled
    if (user.twoFactorEnabled) {
      return res.status(400).json({ 
        success: false, 
        error: { 
          code: 'TWO_FACTOR_ALREADY_ENABLED', 
          message: 'Two-factor authentication is already enabled' 
        } 
      });
    }
    
    // Generate a new secret
    const secret = generateSecret(user.email);
    
    // Generate backup codes
    const backupCodes = generateBackupCodes();
    
    // Generate QR code URL
    const qrCodeUrl = await generateQRCodeURL(secret);
    
    // Update user with secret but don't enable 2FA yet
    await user.update({ 
      twoFactorSecret: secret.base32,
      twoFactorBackupCodes: backupCodes,
      twoFactorEnabled: false
    });
    
    res.status(200).json({
      success: true,
      data: { 
        secret: secret.base32,
        qrCodeUrl,
        backupCodes,
        message: 'Two-factor authentication setup initiated. Please verify with a token to enable.' 
      }
    });
    
  } catch (error) {
    next(error);
  }
};

/**
 * Verify and enable 2FA
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const verifyTwoFactor = async (req, res, next) => {
  try {
    const { user } = req;
    const { token } = req.body;
    
    if (!user.twoFactorSecret) {
      return res.status(400).json({ 
        success: false, 
        error: { 
          code: 'TWO_FACTOR_NOT_SETUP', 
          message: 'Two-factor authentication has not been set up yet' 
        } 
      });
    }
    
    // Verify the token
    const isValid = verifyToken(token, user.twoFactorSecret);
    
    if (!isValid) {
      return res.status(400).json({ 
        success: false, 
        error: { 
          code: 'INVALID_TWO_FACTOR_TOKEN', 
          message: 'Invalid verification code' 
        } 
      });
    }
    
    // Enable 2FA for the user
    await user.update({ twoFactorEnabled: true });
    
    res.status(200).json({
      success: true,
      data: { 
        message: 'Two-factor authentication has been enabled successfully',
        backupCodes: user.twoFactorBackupCodes
      }
    });
    
  } catch (error) {
    next(error);
  }
};

/**
 * Validate 2FA during login
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const validateTwoFactor = async (req, res, next) => {
  try {
    const { userId, token, useBackupCode } = req.body;
    
    // Find user by id
    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: { 
          code: 'USER_NOT_FOUND', 
          message: 'User not found' 
        } 
      });
    }
    
    // Check if 2FA is enabled
    if (!user.twoFactorEnabled) {
      return res.status(400).json({ 
        success: false, 
        error: { 
          code: 'TWO_FACTOR_NOT_ENABLED', 
          message: 'Two-factor authentication is not enabled for this user' 
        } 
      });
    }
    
    let isValid = false;
    let updatedBackupCodes = user.twoFactorBackupCodes;
    
    // Check if using backup code
    if (useBackupCode) {
      const result = verifyBackupCode(token, user.twoFactorBackupCodes);
      isValid = result.success;
      updatedBackupCodes = result.backupCodes;
      
      // Update backup codes if verification was successful
      if (isValid) {
        await user.update({ twoFactorBackupCodes: updatedBackupCodes });
      }
    } else {
      // Verify TOTP
      isValid = verifyToken(token, user.twoFactorSecret);
    }
    
    if (!isValid) {
      return res.status(401).json({ 
        success: false, 
        error: { 
          code: 'INVALID_TWO_FACTOR_TOKEN', 
          message: useBackupCode ? 'Invalid backup code' : 'Invalid verification code' 
        } 
      });
    }
    
    // Update last login timestamp
    await user.update({ lastLogin: new Date() });
    
    // Remove sensitive data from response
    const userResponse = { ...user.toJSON() };
    delete userResponse.password;
    delete userResponse.twoFactorSecret;
    delete userResponse.twoFactorBackupCodes;
    delete userResponse.resetPasswordToken;
    delete userResponse.resetPasswordExpires;

    // Generate tokens (reusing functions from auth controller)
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.status(200).json({
      success: true,
      data: {
        user: userResponse,
        accessToken,
        refreshToken
      }
    });
    
  } catch (error) {
    next(error);
  }
};

/**
 * Disable 2FA for a user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const disableTwoFactor = async (req, res, next) => {
  try {
    const { user } = req;
    const { token, password } = req.body;
    
    // Check if 2FA is enabled
    if (!user.twoFactorEnabled) {
      return res.status(400).json({ 
        success: false, 
        error: { 
          code: 'TWO_FACTOR_NOT_ENABLED', 
          message: 'Two-factor authentication is not enabled' 
        } 
      });
    }
    
    // Verify password
    const isPasswordValid = await user.validatePassword(password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        error: { 
          code: 'INVALID_PASSWORD', 
          message: 'Invalid password' 
        } 
      });
    }
    
    // Verify the token
    const isValid = verifyToken(token, user.twoFactorSecret);
    
    if (!isValid) {
      return res.status(401).json({ 
        success: false, 
        error: { 
          code: 'INVALID_TWO_FACTOR_TOKEN', 
          message: 'Invalid verification code' 
        } 
      });
    }
    
    // Disable 2FA
    await user.update({ 
      twoFactorEnabled: false,
      twoFactorSecret: null,
      twoFactorBackupCodes: null
    });
    
    res.status(200).json({
      success: true,
      data: { message: 'Two-factor authentication has been disabled successfully' }
    });
    
  } catch (error) {
    next(error);
  }
};

/**
 * Generate JWT access token for a user (copied from auth.controller.js)
 * @param {Object} user - User object
 * @returns {String} JWT access token
 */
const generateAccessToken = (user) => {
  const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_here';
  const JWT_EXPIRATION = process.env.JWT_EXPIRATION || '1h';
  
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRATION }
  );
};

/**
 * Generate JWT refresh token for a user (copied from auth.controller.js)
 * @param {Object} user - User object
 * @returns {String} JWT refresh token
 */
const generateRefreshToken = (user) => {
  const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_here';
  const JWT_REFRESH_EXPIRATION = process.env.JWT_REFRESH_EXPIRATION || '7d';
  
  return jwt.sign(
    { id: user.id },
    JWT_SECRET,
    { expiresIn: JWT_REFRESH_EXPIRATION }
  );
};

/**
 * Get 2FA status for current user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const getTwoFactorStatus = async (req, res, next) => {
  try {
    const { user } = req;
    
    res.status(200).json({
      success: true,
      data: { 
        twoFactorEnabled: user.twoFactorEnabled,
        message: user.twoFactorEnabled 
          ? 'Two-factor authentication is enabled' 
          : 'Two-factor authentication is not enabled'
      }
    });
  } catch (error) {
    next(error);
  }
}; 