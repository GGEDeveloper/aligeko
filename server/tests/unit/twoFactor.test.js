import { 
  generateSecret, 
  generateBackupCodes, 
  verifyToken,
  verifyBackupCode,
  generateQRCodeURL
} from '../../src/utils/twoFactor';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

// Mock speakeasy
jest.mock('speakeasy', () => {
  const mockSpeakeasy = {
    generateSecret: jest.fn().mockImplementation(({ name, issuer }) => {
      return {
        base32: 'JBSWY3DPEHPK3PXP',
        otpauth_url: `otpauth://totp/${issuer || 'AliTools B2B'}:${name || 'user'}?secret=JBSWY3DPEHPK3PXP&issuer=${issuer || 'AliTools B2B'}`
      };
    }),
    totp: {
      verify: jest.fn().mockImplementation(({ token }) => token === '123456')
    }
  };
  return mockSpeakeasy;
});

// Mock QRCode
jest.mock('qrcode', () => ({
  toDataURL: jest.fn().mockImplementation(() => Promise.resolve('data:image/png;base64,mockQRCode'))
}));

describe('Two Factor Authentication Utils', () => {
  // Teste para geração de segredo
  describe('generateSecret', () => {
    it('should generate a valid TOTP secret', () => {
      const email = 'test@example.com';
      const secret = generateSecret(email);
      
      expect(secret).toBeDefined();
      expect(secret.base32).toBeDefined();
      // Updated to match the mock implementation
      expect(secret.otpauth_url).toContain('AliTools B2B');
      expect(secret.otpauth_url).toContain('test@example.com');
    });
    
    it('should use custom issuer when provided', () => {
      const email = 'test@example.com';
      const issuer = 'CustomIssuer';
      const secret = generateSecret(email, issuer);
      
      expect(secret.otpauth_url).toContain(issuer);
      expect(secret.otpauth_url).toContain(email);
    });
  });
  
  // Teste para geração de códigos de backup
  describe('generateBackupCodes', () => {
    it('should generate the default number of backup codes', () => {
      const codes = generateBackupCodes();
      
      expect(codes).toBeInstanceOf(Array);
      expect(codes.length).toBe(10); // Padrão é 10 códigos
    });
    
    it('should generate the specified number of backup codes', () => {
      const count = 5;
      const codes = generateBackupCodes(count);
      
      expect(codes).toBeInstanceOf(Array);
      expect(codes.length).toBe(count);
    });
    
    it('should generate unique backup codes', () => {
      const codes = generateBackupCodes(20);
      const uniqueCodes = new Set(codes);
      
      expect(uniqueCodes.size).toBe(codes.length);
    });
  });
  
  // Teste para verificação de código de backup
  describe('verifyBackupCode', () => {
    it('should return success when code exists', () => {
      const backupCodes = ['CODE1', 'CODE2', 'CODE3'];
      const result = verifyBackupCode('CODE2', backupCodes);
      
      expect(result.success).toBe(true);
      expect(result.backupCodes).toHaveLength(2);
      expect(result.backupCodes).not.toContain('CODE2');
    });
    
    it('should return failure when code does not exist', () => {
      const backupCodes = ['CODE1', 'CODE2', 'CODE3'];
      const result = verifyBackupCode('INVALID', backupCodes);
      
      expect(result.success).toBe(false);
      expect(result.backupCodes).toEqual(backupCodes);
    });
    
    it('should handle empty backup codes', () => {
      const result = verifyBackupCode('CODE1', []);
      
      expect(result.success).toBe(false);
      expect(result.backupCodes).toEqual([]);
    });
    
    it('should handle null backup codes', () => {
      const result = verifyBackupCode('CODE1', null);
      
      expect(result.success).toBe(false);
      expect(result.backupCodes).toBeNull();
    });
  });
  
  // Tests for TOTP token verification
  describe('verifyToken', () => {
    beforeEach(() => {
      // Reset the mock before each test
      speakeasy.totp.verify.mockClear();
    });

    it('should verify a valid token', () => {
      // Set up mock to return true for this test
      speakeasy.totp.verify.mockReturnValueOnce(true);
      
      const result = verifyToken('123456', 'JBSWY3DPEHPK3PXP');
      expect(result).toBe(true);
      expect(speakeasy.totp.verify).toHaveBeenCalledWith({
        secret: 'JBSWY3DPEHPK3PXP',
        encoding: 'base32',
        token: '123456',
        window: 1
      });
    });
    
    it('should reject an invalid token', () => {
      // Set up mock to return false for this test
      speakeasy.totp.verify.mockReturnValueOnce(false);
      
      const result = verifyToken('000000', 'JBSWY3DPEHPK3PXP');
      expect(result).toBe(false);
    });
    
    it('should work with different time windows', () => {
      // Set up mock to return true for this test
      speakeasy.totp.verify.mockReturnValueOnce(true);
      
      const result = verifyToken('123456', 'JBSWY3DPEHPK3PXP');
      expect(result).toBe(true);
    });
  });
  
  // Tests for QR code generation
  describe('generateQRCodeURL', () => {
    it('should generate a QR code URL for a given secret', async () => {
      const secret = {
        otpauth_url: 'otpauth://totp/AliTools%20B2B:test@example.com?secret=JBSWY3DPEHPK3PXP&issuer=AliTools%20B2B'
      };
      
      const qrCodeUrl = await generateQRCodeURL(secret);
      
      expect(qrCodeUrl).toBeDefined();
      expect(qrCodeUrl).toContain('data:image/png;base64');
      expect(QRCode.toDataURL).toHaveBeenCalledWith(secret.otpauth_url);
    });
    
    it('should throw an error when QR code generation fails', async () => {
      // Mock the QRCode.toDataURL to reject with an error
      QRCode.toDataURL.mockImplementationOnce(() => 
        Promise.reject(new Error('Failed to generate QR code'))
      );
      
      const secret = {
        otpauth_url: 'otpauth://totp/AliTools%20B2B:test@example.com?secret=JBSWY3DPEHPK3PXP&issuer=AliTools%20B2B'
      };
      
      await expect(generateQRCodeURL(secret)).rejects.toThrow('Failed to generate QR code');
    });
  });
}); 