import request from 'supertest';
import app from '../../src/app';
import { User } from '../mocks/models';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import jwt from 'jsonwebtoken';

// Mock speakeasy to control TOTP verification
jest.mock('speakeasy', () => {
  const mockSpeakeasy = {
    generateSecret: jest.fn().mockImplementation(({ name, issuer }) => {
      return {
        base32: 'JBSWY3DPEHPK3PXP',
        otpauth_url: `otpauth://totp/${issuer || 'AliTools B2B'}:${name || 'user'}?secret=JBSWY3DPEHPK3PXP&issuer=${issuer || 'AliTools B2B'}`
      };
    }),
    totp: {
      generate: jest.fn().mockImplementation(() => '123456'),
      verify: jest.fn().mockImplementation(({ token }) => token === '123456')
    }
  };
  return mockSpeakeasy;
});

// Mock QRCode
jest.mock('qrcode', () => ({
  toDataURL: jest.fn().mockImplementation(() => Promise.resolve('data:image/png;base64,mockQRCode'))
}));

// Test user data
const testUser = {
  email: 'twofa@test.com',
  password: 'SecurePass123!',
  firstName: 'TwoFA',
  lastName: 'Test',
  companyName: 'TwoFA Company'
};

// Variables to store data between tests
const userId = 'test-user-id';
// Create a mock JWT token manually
const accessToken = jwt.sign(
  { userId, email: testUser.email, role: 'customer' },
  process.env.JWT_SECRET || 'test-jwt-secret',
  { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
);
const twoFactorSecret = 'JBSWY3DPEHPK3PXP'; // Use the mocked secret
const backupCodes = ['CODE1', 'CODE2', 'CODE3', 'CODE4', 'CODE5'];

describe('Two Factor Authentication API Integration Tests', () => {
  // Setup before tests
  beforeEach(() => {
    // Reset the User mock for each test
    User.findOne.mockClear();
    User.findByPk.mockClear();
    User.create.mockClear();
    User.update.mockClear();
  });
  
  // Test 2FA flow
  describe('Two Factor Authentication Flow', () => {
    it('should check initial 2FA status is disabled', async () => {
      // Setup mock to return user with 2FA disabled
      User.findByPk.mockImplementationOnce(() => Promise.resolve({
        id: userId,
        twoFactorEnabled: false,
        save: jest.fn().mockResolvedValue(true)
      }));
      
      const res = await request(app)
        .get('/api/v1/auth/2fa/status')
        .set('Authorization', `Bearer ${accessToken}`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.twoFactorEnabled).toBe(false);
    });
    
    it('should set up 2FA by generating secret and backup codes', async () => {
      // Ensure totp.verify will succeed with '123456'
      speakeasy.totp.verify.mockReturnValue(true);
      
      // Setup mock to return user without 2FA enabled
      const mockUser = {
        id: userId,
        twoFactorEnabled: false,
        twoFactorSecret: null,
        twoFactorBackupCodes: null,
        save: jest.fn().mockImplementation(function() {
          this.twoFactorSecret = twoFactorSecret;
          return Promise.resolve(this);
        })
      };
      
      User.findByPk.mockImplementationOnce(() => Promise.resolve(mockUser));
      
      const res = await request(app)
        .post('/api/v1/auth/2fa/setup')
        .set('Authorization', `Bearer ${accessToken}`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.secret).toBe(twoFactorSecret);
      expect(res.body.data.qrCodeUrl).toBeDefined();
      expect(res.body.data.backupCodes).toBeDefined();
      expect(res.body.data.backupCodes.length).toBe(10);
    });
    
    it('should verify and enable 2FA with a valid token', async () => {
      const token = '123456'; // Using mocked TOTP token
      
      // Setup mock to return user with 2FA secret
      const mockUser = {
        id: userId,
        twoFactorEnabled: false,
        twoFactorSecret: twoFactorSecret,
        twoFactorBackupCodes: backupCodes,
        save: jest.fn().mockImplementation(function() {
          this.twoFactorEnabled = true;
          return Promise.resolve(this);
        })
      };
      
      User.findByPk.mockImplementationOnce(() => Promise.resolve(mockUser));
      
      const res = await request(app)
        .post('/api/v1/auth/2fa/verify')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ token });
      
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.message).toContain('enabled successfully');
      expect(res.body.data.backupCodes).toEqual(backupCodes);
      expect(mockUser.save).toHaveBeenCalled();
    });
    
    it('should require 2FA during login after enabling', async () => {
      // Setup mock to return user with 2FA enabled
      User.findOne.mockImplementationOnce(() => Promise.resolve({
        id: userId,
        email: testUser.email,
        twoFactorEnabled: true,
        validatePassword: jest.fn().mockResolvedValue(true),
        toJSON: jest.fn().mockReturnValue({
          id: userId,
          email: testUser.email,
          twoFactorEnabled: true
        })
      }));
      
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });
      
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.requireTwoFactor).toBe(true);
      expect(res.body.data.userId).toBeDefined();
    });
    
    it('should validate 2FA during login with a valid token', async () => {
      const token = '123456'; // Using mocked TOTP token
      
      // Setup mock to return user with 2FA enabled
      User.findByPk.mockImplementationOnce(() => Promise.resolve({
        id: userId,
        email: testUser.email,
        firstName: 'TwoFA',
        lastName: 'Test',
        role: 'customer',
        twoFactorEnabled: true,
        twoFactorSecret: twoFactorSecret,
        twoFactorBackupCodes: backupCodes,
        save: jest.fn().mockResolvedValue(true),
        toJSON: jest.fn().mockReturnValue({
          id: userId,
          email: testUser.email,
          firstName: 'TwoFA',
          lastName: 'Test',
          role: 'customer'
        })
      }));
      
      const res = await request(app)
        .post('/api/v1/auth/2fa/validate')
        .send({
          userId,
          token,
          useBackupCode: false
        });
      
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user).toBeDefined();
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.refreshToken).toBeDefined();
    });
    
    it('should validate 2FA during login with a valid backup code', async () => {
      // Setup mock to return user with 2FA enabled and backup codes
      const mockBackupCodes = [...backupCodes];
      const mockUser = {
        id: userId,
        email: testUser.email,
        firstName: 'TwoFA',
        lastName: 'Test',
        role: 'customer',
        twoFactorEnabled: true,
        twoFactorSecret: twoFactorSecret,
        twoFactorBackupCodes: mockBackupCodes,
        save: jest.fn().mockImplementation(function() {
          // Remove the used backup code
          this.twoFactorBackupCodes = this.twoFactorBackupCodes.filter(
            code => code !== backupCodes[0]
          );
          return Promise.resolve(this);
        }),
        toJSON: jest.fn().mockReturnValue({
          id: userId,
          email: testUser.email,
          firstName: 'TwoFA',
          lastName: 'Test',
          role: 'customer'
        })
      };
      
      User.findByPk.mockImplementationOnce(() => Promise.resolve(mockUser));
      
      const res = await request(app)
        .post('/api/v1/auth/2fa/validate')
        .send({
          userId,
          token: backupCodes[0], // Use the first backup code
          useBackupCode: true
        });
      
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user).toBeDefined();
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.refreshToken).toBeDefined();
      
      // Verify that the backup code has been consumed
      expect(mockUser.save).toHaveBeenCalled();
      expect(mockUser.twoFactorBackupCodes).not.toContain(backupCodes[0]);
    });
    
    it('should reject 2FA validation with an invalid token', async () => {
      // Ensure totp.verify will fail with invalid token
      speakeasy.totp.verify.mockReturnValueOnce(false);
      
      // Setup mock to return user with 2FA enabled
      User.findByPk.mockImplementationOnce(() => Promise.resolve({
        id: userId,
        twoFactorEnabled: true,
        twoFactorSecret: twoFactorSecret
      }));
      
      const res = await request(app)
        .post('/api/v1/auth/2fa/validate')
        .send({
          userId,
          token: '000000', // Invalid token
          useBackupCode: false
        });
      
      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INVALID_TWO_FACTOR_TOKEN');
    });
    
    it('should reject 2FA validation with an invalid backup code', async () => {
      // Setup mock to return user with 2FA enabled
      User.findByPk.mockImplementationOnce(() => Promise.resolve({
        id: userId,
        twoFactorEnabled: true,
        twoFactorBackupCodes: backupCodes
      }));
      
      const res = await request(app)
        .post('/api/v1/auth/2fa/validate')
        .send({
          userId,
          token: 'INVALID_CODE',
          useBackupCode: true
        });
      
      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INVALID_TWO_FACTOR_TOKEN');
    });
    
    it('should disable 2FA with valid token and password', async () => {
      // Ensure totp.verify will succeed with '123456'
      speakeasy.totp.verify.mockReturnValue(true);
      
      // Setup mock to return user with 2FA enabled
      const mockUser = {
        id: userId,
        twoFactorEnabled: true,
        twoFactorSecret: twoFactorSecret,
        validatePassword: jest.fn().mockResolvedValue(true),
        save: jest.fn().mockImplementation(function() {
          this.twoFactorEnabled = false;
          this.twoFactorSecret = null;
          this.twoFactorBackupCodes = null;
          return Promise.resolve(this);
        })
      };
      
      User.findByPk.mockImplementationOnce(() => Promise.resolve(mockUser));
      
      const token = '123456'; // Using mocked TOTP token
      
      const res = await request(app)
        .post('/api/v1/auth/2fa/disable')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          token,
          password: testUser.password
        });
      
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.message).toContain('disabled successfully');
      expect(mockUser.save).toHaveBeenCalled();
    });
    
    it('should check 2FA status is disabled after disabling', async () => {
      // Setup mock to return user with 2FA disabled
      User.findByPk.mockImplementationOnce(() => Promise.resolve({
        id: userId,
        twoFactorEnabled: false
      }));
      
      const res = await request(app)
        .get('/api/v1/auth/2fa/status')
        .set('Authorization', `Bearer ${accessToken}`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.twoFactorEnabled).toBe(false);
    });
    
    it('should not require 2FA during login after disabling', async () => {
      // Setup mock to return user with 2FA disabled
      User.findOne.mockImplementationOnce(() => Promise.resolve({
        id: userId,
        email: testUser.email,
        firstName: 'TwoFA',
        lastName: 'Test',
        role: 'customer',
        twoFactorEnabled: false,
        validatePassword: jest.fn().mockResolvedValue(true),
        toJSON: jest.fn().mockReturnValue({
          id: userId,
          email: testUser.email,
          firstName: 'TwoFA',
          lastName: 'Test',
          role: 'customer',
          twoFactorEnabled: false
        })
      }));
      
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });
      
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.requireTwoFactor).toBeUndefined();
      expect(res.body.data.user).toBeDefined();
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.refreshToken).toBeDefined();
    });
  });
  
  // Error case tests
  describe('Two Factor Authentication Error Cases', () => {
    it('should return error when attempting to setup 2FA twice', async () => {
      // Setup mock to return user with 2FA already enabled
      User.findByPk.mockImplementationOnce(() => Promise.resolve({
        id: userId,
        twoFactorEnabled: true,
        twoFactorSecret: twoFactorSecret
      }));
      
      const res = await request(app)
        .post('/api/v1/auth/2fa/setup')
        .set('Authorization', `Bearer ${accessToken}`);
      
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('TWO_FACTOR_ALREADY_ENABLED');
    });
    
    it('should return error when disabling 2FA with wrong password', async () => {
      // Setup mock to return user with 2FA enabled
      User.findByPk.mockImplementationOnce(() => Promise.resolve({
        id: userId,
        twoFactorEnabled: true,
        twoFactorSecret: twoFactorSecret,
        validatePassword: jest.fn().mockResolvedValue(false) // Wrong password
      }));
      
      // Generate valid token
      const token = '123456'; // Using mocked TOTP token
      
      // Try to disable with wrong password
      const res = await request(app)
        .post('/api/v1/auth/2fa/disable')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          token,
          password: 'WrongPassword123!'
        });
      
      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INVALID_PASSWORD');
    });
  });
}); 