import { validationResult } from 'express-validator';

/**
 * Middleware to validate request using express-validator
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    // Format errors for consistent response
    const formattedErrors = errors.array().map(error => ({
      field: error.param,
      message: error.msg
    }));
    
    return res.status(400).json({ 
      success: false, 
      error: { 
        code: 'VALIDATION_ERROR', 
        message: 'Validation error', 
        errors: formattedErrors 
      } 
    });
  }
  
  next();
};

/**
 * Middleware factory for password validation
 * @param {String} field - Field name to validate
 * @returns {Function} Middleware function
 */
export const validatePassword = (field = 'password') => {
  return (req, res, next) => {
    const password = req.body[field];
    
    // Password policy based on security rules
    const minLength = 10;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[@$!%*?&]/.test(password);
    
    const errors = [];
    
    if (password.length < minLength) {
      errors.push({
        field,
        message: `Password must be at least ${minLength} characters long`
      });
    }
    
    if (!hasUppercase) {
      errors.push({
        field,
        message: 'Password must contain at least one uppercase letter'
      });
    }
    
    if (!hasLowercase) {
      errors.push({
        field,
        message: 'Password must contain at least one lowercase letter'
      });
    }
    
    if (!hasNumber) {
      errors.push({
        field,
        message: 'Password must contain at least one number'
      });
    }
    
    if (!hasSpecial) {
      errors.push({
        field,
        message: 'Password must contain at least one special character (@$!%*?&)'
      });
    }
    
    // TODO: Implement check for common passwords and personal info
    
    if (errors.length > 0) {
      return res.status(400).json({ 
        success: false, 
        error: { 
          code: 'PASSWORD_POLICY_ERROR', 
          message: 'Password does not meet policy requirements', 
          errors 
        } 
      });
    }
    
    next();
  };
}; 