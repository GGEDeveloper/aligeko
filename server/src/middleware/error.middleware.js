/**
 * Middleware para manipulação centralizada de erros
 * @param {Error} err - Objeto de erro
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const errorHandler = (err, req, res, next) => {
  console.error(`Error: ${err.message}`);
  console.error(err.stack);
  
  // Erro de validação do Sequelize
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    const errors = err.errors.map(e => ({
      field: e.path,
      message: e.message
    }));
    
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation error',
        errors
      }
    });
  }
  
  // Erros de banco de dados
  if (err.name === 'SequelizeDatabaseError') {
    return res.status(500).json({
      success: false,
      error: {
        code: 'DATABASE_ERROR',
        message: 'Database error occurred'
      }
    });
  }
  
  // Erros JWT (redundante, pois já tratados em auth.middleware, mas por segurança)
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: {
        code: err.name === 'TokenExpiredError' ? 'TOKEN_EXPIRED' : 'INVALID_TOKEN',
        message: err.name === 'TokenExpiredError' ? 'Authentication token expired' : 'Invalid authentication token'
      }
    });
  }
  
  // Erro genérico para qualquer outro tipo de erro
  return res.status(500).json({
    success: false,
    error: {
      code: 'SERVER_ERROR',
      message: process.env.NODE_ENV === 'production' 
        ? 'An unexpected error occurred' 
        : err.message || 'Unknown error occurred'
    }
  });
}; 