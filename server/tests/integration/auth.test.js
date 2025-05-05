import request from 'supertest';
import app from '../../src/app';
import { User } from '../mocks/models';
import jwt from 'jsonwebtoken';

// Mock user data
const testUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  password: 'Password123!',
  firstName: 'Test',
  lastName: 'User',
  companyName: 'Test Company'
};

// Variables to hold tokens
let accessToken;
let refreshToken;

describe('Auth API Integration Tests', () => {
  // Reset mocks before tests
  beforeEach(() => {
    User.findOne.mockClear();
    User.findByPk.mockClear();
    User.create.mockClear();
    User.update.mockClear();
    User.destroy.mockClear();
  });

  describe('Registration and Login', () => {
    it('should register a new user', async () => {
      User.findOne.mockResolvedValueOnce(null); // No existing user with same email
      User.create.mockResolvedValueOnce({
        id: testUser.id,
        ...testUser,
        password: 'hashed_password'
      });

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(testUser);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user).toBeDefined();
      expect(res.body.data.user.email).toBe(testUser.email);
    });

    it('should not allow login with pending account', async () => {
      const pendingUser = {
        ...testUser,
        status: 'pending',
        isApproved: false,
        validatePassword: jest.fn().mockResolvedValueOnce(true)
      };

      User.findOne.mockResolvedValueOnce(pendingUser);

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('ACCOUNT_PENDING');
    });

    it('should allow login after approval', async () => {
      const approvedUser = {
        id: testUser.id,
        ...testUser,
        status: 'active',
        isApproved: true,
        validatePassword: jest.fn().mockResolvedValueOnce(true)
      };

      User.findOne.mockResolvedValueOnce(approvedUser);
      User.update.mockResolvedValueOnce([1]);

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.refreshToken).toBeDefined();

      accessToken = res.body.data.accessToken;
      refreshToken = res.body.data.refreshToken;
    });

    it('should get current user with valid token', async () => {
      User.findByPk.mockResolvedValueOnce({
        id: testUser.id,
        email: testUser.email,
        firstName: testUser.firstName,
        lastName: testUser.lastName,
        role: 'customer',
        status: 'active'
      });

      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user).toBeDefined();
      expect(res.body.data.user.email).toBe(testUser.email);
    });

    it('should refresh access token', async () => {
      // Mock JWT verification
      jest.spyOn(jwt, 'verify').mockImplementationOnce((token, secret, callback) => {
        callback(null, { userId: testUser.id });
      });

      User.findByPk.mockResolvedValueOnce({
        id: testUser.id,
        email: testUser.email,
        firstName: testUser.firstName,
        lastName: testUser.lastName,
        role: 'customer'
      });

      const res = await request(app)
        .post('/api/v1/auth/refresh-token')
        .send({ refreshToken });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();

      // Update access token for further tests
      accessToken = res.body.data.accessToken;

      // Restore original implementation
      jwt.verify.mockRestore();
    });
  });

  describe('Two Factor Authentication', () => {
    it('should check 2FA status (initially disabled)', async () => {
      User.findByPk.mockResolvedValueOnce({
        id: testUser.id,
        twoFactorEnabled: false
      });

      const res = await request(app)
        .get('/api/v1/auth/2fa/status')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.twoFactorEnabled).toBe(false);
    });

    it('should setup 2FA', async () => {
      User.findByPk.mockResolvedValueOnce({
        id: testUser.id,
        twoFactorEnabled: false,
        twoFactorSecret: null,
        save: jest.fn().mockResolvedValueOnce(true)
      });

      const res = await request(app)
        .post('/api/v1/auth/2fa/setup')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.secret).toBeDefined();
      expect(res.body.data.qrCodeUrl).toBeDefined();
      expect(res.body.data.backupCodes).toBeDefined();
    });

    it('should complete 2FA setup (simulated)', async () => {
      const secret = 'JBSWY3DPEHPK3PXP'; // Test secret
      const backupCodes = ['CODE1', 'CODE2', 'CODE3', 'CODE4', 'CODE5'];
      
      // Mock the user with the test secret
      const mockUser = {
        id: testUser.id,
        twoFactorEnabled: false,
        twoFactorSecret: secret,
        twoFactorBackupCodes: backupCodes,
        save: jest.fn().mockImplementation(function() {
          this.twoFactorEnabled = true;
          return Promise.resolve(this);
        })
      };
      
      User.findByPk.mockResolvedValueOnce(mockUser);
      
      // Mock the speakeasy verification to always return true for testing
      jest.mock('speakeasy', () => ({
        totp: {
          verify: jest.fn().mockReturnValue(true)
        }
      }), { virtual: true });
      
      const res = await request(app)
        .post('/api/v1/auth/2fa/verify')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ token: '123456' }); // Any token will work with our mock
      
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.message).toContain('enabled');
      expect(mockUser.save).toHaveBeenCalled();
    });

    it('should require 2FA during login after enabling', async () => {
      const mockUser = {
        id: testUser.id,
        email: testUser.email,
        twoFactorEnabled: true,
        validatePassword: jest.fn().mockResolvedValueOnce(true)
      };
      
      User.findOne.mockResolvedValueOnce(mockUser);
      
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

    it('should disable 2FA (simulated)', async () => {
      const secret = 'JBSWY3DPEHPK3PXP'; // Test secret
      
      // Mock the user with 2FA enabled
      const mockUser = {
        id: testUser.id,
        twoFactorEnabled: true,
        twoFactorSecret: secret,
        validatePassword: jest.fn().mockResolvedValueOnce(true),
        save: jest.fn().mockImplementation(function() {
          this.twoFactorEnabled = false;
          this.twoFactorSecret = null;
          this.twoFactorBackupCodes = null;
          return Promise.resolve(this);
        })
      };
      
      User.findByPk.mockResolvedValueOnce(mockUser);
      
      // Mock the speakeasy verification to always return true for testing
      jest.mock('speakeasy', () => ({
        totp: {
          verify: jest.fn().mockReturnValue(true)
        }
      }), { virtual: true });
      
      const res = await request(app)
        .post('/api/v1/auth/2fa/disable')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          token: '123456',  // Any token will work with our mock
          password: testUser.password
        });
      
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.message).toContain('disabled');
      expect(mockUser.save).toHaveBeenCalled();
    });
  });
}); 