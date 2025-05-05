import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

/**
 * Generate a new TOTP secret for a user
 * @returns {Object} Object containing secret in different formats
 */
export const generateSecret = (email, issuer = 'AliTools B2B') => {
  const secret = speakeasy.generateSecret({
    name: `${issuer}:${email}`,
    issuer: issuer
  });
  
  return secret;
};

/**
 * Generate a random backup code
 * @returns {string} A random backup code
 */
const generateBackupCode = () => {
  return Math.random().toString(36).substring(2, 12).toUpperCase();
};

/**
 * Generate a set of backup codes
 * @param {number} count - Number of backup codes to generate
 * @returns {Array} Array of backup codes
 */
export const generateBackupCodes = (count = 10) => {
  const codes = [];
  for (let i = 0; i < count; i++) {
    codes.push(generateBackupCode());
  }
  return codes;
};

/**
 * Verify a TOTP token against a secret
 * @param {string} token - TOTP token to verify
 * @param {string} secret - Secret to verify against
 * @returns {boolean} Whether the token is valid
 */
export const verifyToken = (token, secret) => {
  return speakeasy.totp.verify({
    secret: secret,
    encoding: 'base32',
    token: token,
    window: 1 // Allow 1 step before and after for time sync issues
  });
};

/**
 * Generate a QR code URL for a given secret
 * @param {string} secret - Secret in base32 format
 * @returns {Promise<string>} URL of the QR code
 */
export const generateQRCodeURL = async (secret) => {
  try {
    const url = await QRCode.toDataURL(secret.otpauth_url);
    return url;
  } catch (error) {
    throw new Error('Failed to generate QR code');
  }
};

/**
 * Verify a backup code for a user
 * @param {string} code - Backup code to verify
 * @param {Array} userBackupCodes - User's backup codes
 * @returns {Object} Result with success and updated backup codes
 */
export const verifyBackupCode = (code, userBackupCodes) => {
  // If no backup codes exist
  if (!userBackupCodes || !Array.isArray(userBackupCodes) || userBackupCodes.length === 0) {
    return { success: false, backupCodes: userBackupCodes };
  }
  
  // Check if the code exists in backup codes
  const index = userBackupCodes.indexOf(code);
  if (index === -1) {
    return { success: false, backupCodes: userBackupCodes };
  }
  
  // Remove the used code
  const updatedBackupCodes = [...userBackupCodes];
  updatedBackupCodes.splice(index, 1);
  
  return { success: true, backupCodes: updatedBackupCodes };
}; 