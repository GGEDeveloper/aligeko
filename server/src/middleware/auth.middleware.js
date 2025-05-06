import jwt from 'jsonwebtoken';
import { User } from '../models';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_here';

/**
 * Middleware to verify JWT token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const checkAuth = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        error: { 
          code: 'UNAUTHORIZED', 
          message: 'Authentication required. Please login.' 
        } 
      });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
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
    
    // Check if user is approved for B2B access
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
    
    // Set user on request object
    req.user = user;
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        error: { 
          code: 'TOKEN_EXPIRED', 
          message: 'Authentication token expired' 
        } 
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        error: { 
          code: 'INVALID_TOKEN', 
          message: 'Invalid authentication token' 
        } 
      });
    }
    
    next(error);
  }
};

/**
 * Middleware to check if user has required role
 * @param {Array|String} roles - Required role(s) to access the endpoint
 */
export const checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        error: { 
          code: 'UNAUTHORIZED', 
          message: 'Authentication required' 
        } 
      });
    }

    const userRoles = Array.isArray(roles) ? roles : [roles];
    
    if (!userRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        error: { 
          code: 'FORBIDDEN', 
          message: 'You do not have permission to access this resource' 
        } 
      });
    }
    
    next();
  };
};

/**
 * Middleware to check if user has required role or is accessing their own resource
 * @param {Array|String} roles - Required role(s) to access the endpoint
 */
export const checkRoleOrSelf = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        error: { 
          code: 'UNAUTHORIZED', 
          message: 'Authentication required' 
        } 
      });
    }

    const userRoles = Array.isArray(roles) ? roles : [roles];
    
    // Check if user is accessing their own resource
    const requestedUserId = req.params.userId || req.params.id;
    const isSelf = requestedUserId && req.user.id.toString() === requestedUserId.toString();
    
    if (!userRoles.includes(req.user.role) && !isSelf) {
      return res.status(403).json({ 
        success: false, 
        error: { 
          code: 'FORBIDDEN', 
          message: 'You do not have permission to access this resource' 
        } 
      });
    }
    
    next();
  };
};

// Add aliases for backward compatibility
export const authenticate = checkAuth;
export const authorize = checkRole; 