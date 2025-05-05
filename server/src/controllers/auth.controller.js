import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../models';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_here';
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || '1h';
const JWT_REFRESH_EXPIRATION = process.env.JWT_REFRESH_EXPIRATION || '7d';

/**
 * Register a new B2B customer
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const register = async (req, res, next) => {
  try {
    const { 
      email, 
      password, 
      firstName, 
      lastName, 
      companyName 
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    
    if (existingUser) {
      return res.status(409).json({ 
        success: false, 
        error: { 
          code: 'EMAIL_IN_USE', 
          message: 'Email is already in use' 
        } 
      });
    }

    // Create new user
    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      companyName,
      role: 'customer',
      isApproved: false, // Requires admin approval
      status: 'pending'
    });

    // Remove password from response
    const userResponse = { ...user.toJSON() };
    delete userResponse.password;

    res.status(201).json({
      success: true,
      data: {
        user: userResponse,
        message: 'Registration successful. Your account is pending approval.'
      }
    });
    
    // TODO: Send email notification to admins about new registration

  } catch (error) {
    next(error);
  }
};

/**
 * Login user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        error: { 
          code: 'INVALID_CREDENTIALS', 
          message: 'Invalid email or password' 
        } 
      });
    }

    // Check if password is correct
    const isMatch = await user.validatePassword(password);
    
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        error: { 
          code: 'INVALID_CREDENTIALS', 
          message: 'Invalid email or password' 
        } 
      });
    }

    // Check if user is approved
    if (!user.isApproved) {
      return res.status(403).json({ 
        success: false, 
        error: { 
          code: 'ACCOUNT_PENDING', 
          message: 'Your account is pending approval by an administrator' 
        } 
      });
    }

    // Check if user account is active
    if (user.status !== 'active') {
      return res.status(403).json({ 
        success: false, 
        error: { 
          code: 'ACCOUNT_INACTIVE', 
          message: 'Your account is inactive. Please contact an administrator.' 
        } 
      });
    }

    // Check if 2FA is enabled
    if (user.twoFactorEnabled) {
      return res.status(200).json({
        success: true,
        data: {
          requireTwoFactor: true,
          userId: user.id,
          message: 'Please enter your two-factor authentication code'
        }
      });
    }

    // Update last login timestamp
    await user.update({ lastLogin: new Date() });

    // Generate access token
    const accessToken = generateAccessToken(user);
    
    // Generate refresh token
    const refreshToken = generateRefreshToken(user);

    // Remove password from response
    const userResponse = { ...user.toJSON() };
    delete userResponse.password;
    delete userResponse.twoFactorSecret;
    delete userResponse.twoFactorBackupCodes;
    delete userResponse.resetPasswordToken;
    delete userResponse.resetPasswordExpires;

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
 * Refresh access token using refresh token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({ 
        success: false, 
        error: { 
          code: 'MISSING_REFRESH_TOKEN', 
          message: 'Refresh token is required' 
        } 
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, JWT_SECRET);
    
    // Find user by id
    const user = await User.findByPk(decoded.id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: { 
          code: 'USER_NOT_FOUND', 
          message: 'User not found' 
        } 
      });
    }

    // Check if user is approved and active
    if (!user.isApproved || user.status !== 'active') {
      return res.status(403).json({ 
        success: false, 
        error: { 
          code: 'ACCOUNT_INACTIVE', 
          message: 'Your account is inactive or pending approval' 
        } 
      });
    }

    // Generate new access token
    const accessToken = generateAccessToken(user);

    res.status(200).json({
      success: true,
      data: { accessToken }
    });

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        error: { 
          code: 'REFRESH_TOKEN_EXPIRED', 
          message: 'Refresh token expired. Please login again.' 
        } 
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        error: { 
          code: 'INVALID_REFRESH_TOKEN', 
          message: 'Invalid refresh token' 
        } 
      });
    }
    
    next(error);
  }
};

/**
 * Request password reset
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const requestPasswordReset = async (req, res, next) => {
  try {
    const { email } = req.body;
    
    // Find user by email
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      // Don't reveal that email doesn't exist for security
      return res.status(200).json({
        success: true,
        data: { message: 'If your email exists in our system, you will receive a password reset link.' }
      });
    }

    // Generate password reset token
    const resetToken = jwt.sign(
      { id: user.id },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Calculate expiration (1 hour from now)
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour in milliseconds

    // Update user with reset token and expiration
    await user.update({
      resetPasswordToken: resetToken,
      resetPasswordExpires: resetExpires
    });

    // TODO: Send password reset email with token

    res.status(200).json({
      success: true,
      data: { message: 'If your email exists in our system, you will receive a password reset link.' }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Reset password with token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    
    // Find user by reset token
    const user = await User.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: new Date() }
      }
    });
    
    if (!user) {
      return res.status(400).json({ 
        success: false, 
        error: { 
          code: 'INVALID_RESET_TOKEN', 
          message: 'Password reset token is invalid or has expired' 
        } 
      });
    }

    // Hash new password and update user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    await user.update({
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null
    });

    res.status(200).json({
      success: true,
      data: { message: 'Password has been reset successfully' }
    });

    // TODO: Send password changed confirmation email

  } catch (error) {
    next(error);
  }
};

/**
 * Get current user information
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const getCurrentUser = async (req, res, next) => {
  try {
    // User is already set in req.user by authenticate middleware
    const { user } = req;
    
    // Remove password from response
    const userResponse = { ...user.toJSON() };
    delete userResponse.password;
    delete userResponse.resetPasswordToken;
    delete userResponse.resetPasswordExpires;

    res.status(200).json({
      success: true,
      data: { user: userResponse }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Generate JWT access token for a user
 * @param {Object} user - User object
 * @returns {String} JWT access token
 */
const generateAccessToken = (user) => {
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
 * Generate JWT refresh token for a user
 * @param {Object} user - User object
 * @returns {String} JWT refresh token
 */
const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id },
    JWT_SECRET,
    { expiresIn: JWT_REFRESH_EXPIRATION }
  );
}; 