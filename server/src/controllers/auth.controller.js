import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../models.js';
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
      firstName: first_name, 
      lastName: last_name, 
      companyName: company_name 
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
      first_name,
      last_name,
      company_name,
      role: 'customer',
      status: 'pending',
      two_factor_enabled: false,
      verification_token: null
    });

    // Generate tokens
    console.log('\n=== GERANDO TOKENS ===');
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    console.log('✅ Tokens gerados com sucesso');

    // Prepare user response
    const userResponse = { ...user.toJSON() };
    delete userResponse.password;
    
    console.log('\n=== REGISTRO BEM-SUCEDIDO ===');
    console.log(`Usuário registrado: ${user.email} (${user.role})`);
    console.log(`ID do usuário: ${user.id}`);
    
    // Send success response
    res.status(201).json({
      success: true,
      data: {
        user: userResponse,
        tokens: {
          accessToken,
          refreshToken
        }
      }
    });
    
    console.log('\n=== RESPOSTA ENVIADA AO CLIENTE ===');
    console.log('Status: 201 Created');
    console.log('Tipo de conteúdo: application/json');
    
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
  console.log('\n=== NOVA TENTATIVA DE LOGIN ===');
  console.log('Iniciando processo de login para:', req.body.email);
  
  try {
    const { email, password } = req.body;
    console.log('Dados recebidos - Email:', email, 'Senha:', password ? '[PROVIDED]' : '[MISSING]');
    
    // Log do corpo completo da requisição para depuração
    console.log('Corpo completo da requisição:', JSON.stringify(req.body, null, 2));

    // Find user by email
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      console.log('❌ Usuário não encontrado para o email:', email);
      return res.status(401).json({ 
        success: false, 
        error: { 
          code: 'INVALID_CREDENTIALS', 
          message: 'Invalid email or password' 
        } 
      });
    }
    
    console.log('\n=== USUÁRIO ENCONTRADO ===');
    const userData = {
      id: user.id,
      email: user.email,
      status: user.status,
      role: user.role,
      passwordHash: user.password ? '***HASH PRESENTE***' : '***SEM SENHA***'
    };
    console.log('Dados do usuário:', JSON.stringify(userData, null, 2));

    // Check if user is active
    console.log('\n=== VERIFICANDO STATUS DO USUÁRIO ===');
    console.log('Status atual:', user.status);
    
    if (user.status !== 'active') {
      console.log('❌ Usuário não está ativo. Status:', user.status);
      console.log('O usuário precisa ter status "active" para fazer login.');
      
      if (user.status === 'pending') {
        console.log('\n=== SUGESTÃO ===');
        console.log('Parece que esta conta está pendente de ativação.');
        console.log('Verifique se você já confirmou seu email ou entre em contato com o suporte.');
      }
      
      return res.status(403).json({
        success: false,
        error: {
          code: 'USER_NOT_ACTIVE',
          message: 'User is not active. Please contact support.'
        }
      });
    }

    // Check if password is correct
    console.log('\n=== VALIDANDO SENHA ===');
    console.log('Senha fornecida:', password ? '***PRESENTE***' : '***AUSENTE***');
    
    if (!password) {
      console.log('❌ Nenhuma senha fornecida');
      return res.status(400).json({ 
        success: false, 
        error: { 
          code: 'MISSING_PASSWORD', 
          message: 'Password is required' 
        } 
      });
    }
    
    if (!user.password) {
      console.log('❌ Nenhum hash de senha encontrado para o usuário');
      return res.status(500).json({ 
        success: false, 
        error: { 
          code: 'INVALID_ACCOUNT_STATE', 
          message: 'User account is not properly configured' 
        } 
      });
    }
    
    console.log('Comparando senha fornecida com o hash armazenado...');
    
    try {
      const isMatch = await bcrypt.compare(password, user.password);
      console.log('✅ Resultado da comparação de senha:', isMatch);
      
      if (!isMatch) {
        console.log(`❌ Senha inválida para o usuário: ${user.email}`);
        console.log('Isso pode acontecer se a senha estiver incorreta ou o hash no banco estiver inválido.');
        
        // Log adicional para depuração (não fazer isso em produção)
        console.log('\n=== DADOS PARA DEPURAÇÃO (NÃO FAZER ISSO EM PRODUÇÃO) ===');
        console.log(`Senha fornecida: "${password}"`);
        console.log(`Tamanho: ${password.length} caracteres`);
        console.log(`Hash armazenado: ${user.password}`);
        
        return res.status(401).json({ 
          success: false, 
          error: { 
            code: 'INVALID_CREDENTIALS', 
            message: 'Invalid email or password' 
          } 
        });
      }
      
      // Se chegou aqui, a senha está correta
      console.log('✅ Senha válida!');
      
      // Se chegou até aqui, o login foi bem-sucedido
      console.log('✅ Login bem-sucedido!');
      
      // Atualizar último login
      user.last_login = new Date();
      await user.save();
      
      // Gerar tokens
      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);
      
      // Remover dados sensíveis da resposta
      const userResponse = { ...user.toJSON() };
      delete userResponse.password;
      delete userResponse.twoFactorSecret;
      delete userResponse.twoFactorBackupCodes;
      delete userResponse.resetPasswordToken;
      delete userResponse.resetPasswordExpires;
      
      // Retornar resposta de sucesso
      return res.status(200).json({
        success: true,
        data: {
          user: userResponse,
          tokens: {
            accessToken,
            refreshToken
          }
        }
      });
      
    } catch (compareError) {
      console.error('❌ Erro ao comparar senhas:', compareError);
      return res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Ocorreu um erro ao processar sua solicitação. Por favor, tente novamente.'
        }
      });
    }
    
  } catch (error) {
    console.error('❌ Erro durante o processo de login:', error);
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
    
    // Find user by ID from token
    const user = await User.findByPk(decoded.userId);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: { 
          code: 'USER_NOT_FOUND', 
          message: 'User not found' 
        } 
      });
    }
    
    // Generate new access token
    const newAccessToken = generateAccessToken(user);
    
    // Generate new refresh token
    const newRefreshToken = generateRefreshToken(user);
    
    // Return new tokens
    res.status(200).json({
      success: true,
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      }
    });
    
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        error: { 
          code: 'TOKEN_EXPIRED', 
          message: 'Refresh token has expired' 
        } 
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        error: { 
          code: 'INVALID_TOKEN', 
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
        message: 'If an account with that email exists, a password reset link has been sent.'
      });
    }
    
    // Generate reset token (expires in 1 hour)
    const resetToken = jwt.sign(
      { userId: user.id },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    // Save reset token to user
    user.reset_password_token = resetToken;
    user.reset_password_expires = new Date(Date.now() + 3600000); // 1 hour from now
    await user.save();
    
    // TODO: Send email with reset link
    
    res.status(200).json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.'
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
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        error: { 
          code: 'MISSING_FIELDS', 
          message: 'Token and new password are required' 
        } 
      });
    }
    
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Find user by ID from token
    const user = await User.findOne({
      where: {
        id: decoded.userId,
        reset_password_token: token,
        reset_password_expires: { [Op.gt]: new Date() }
      }
    });
    
    if (!user) {
      return res.status(400).json({ 
        success: false, 
        error: { 
          code: 'INVALID_TOKEN', 
          message: 'Invalid or expired reset token' 
        } 
      });
    }
    
    // Update password
    user.password = newPassword;
    user.reset_password_token = null;
    user.reset_password_expires = null;
    await user.save();
    
    // TODO: Send password changed notification email
    
    res.status(200).json({
      success: true,
      message: 'Password has been reset successfully'
    });
    
  } catch (error) {
    if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
      return res.status(400).json({ 
        success: false, 
        error: { 
          code: 'INVALID_TOKEN', 
          message: 'Invalid or expired reset token' 
        } 
      });
    }
    
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
    // User is attached to request by auth middleware
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        error: { 
          code: 'UNAUTHORIZED', 
          message: 'Not authenticated' 
        } 
      });
    }
    
    // Remove sensitive data
    const userResponse = { ...user.toJSON() };
    delete userResponse.password;
    delete userResponse.twoFactorSecret;
    delete userResponse.resetPasswordToken;
    delete userResponse.resetPasswordExpires;
    
    res.status(200).json({
      success: true,
      data: userResponse
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
      userId: user.id,
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
    { userId: user.id },
    JWT_SECRET,
    { expiresIn: JWT_REFRESH_EXPIRATION }
  );
};
