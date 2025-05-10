import crypto from 'crypto';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get encryption keys from environment or generate them
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
const IV_LENGTH = 16; // For AES, this is always 16 bytes

/**
 * Encrypt a text using AES-256-CBC
 * @param {string} text - Text to encrypt
 * @returns {string} Encrypted text (IV + encrypted content) in hex format
 */
export const encrypt = (text) => {
  try {
    if (!text) return null;
    
    // Create an initialization vector
    const iv = crypto.randomBytes(IV_LENGTH);
    
    // Create cipher with key and IV
    const cipher = crypto.createCipheriv(
      'aes-256-cbc', 
      Buffer.from(ENCRYPTION_KEY, 'hex'), 
      iv
    );
    
    // Update the cipher with the text and finalize it
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    
    // Return iv + encrypted data as hex string
    return iv.toString('hex') + ':' + encrypted.toString('hex');
  } catch (error) {
    console.error('Encryption error:', error);
    return null;
  }
};

/**
 * Decrypt an encrypted text
 * @param {string} encryptedText - Encrypted text in format IV:EncryptedContent (in hex)
 * @returns {string} Decrypted text or null if error
 */
export const decrypt = (encryptedText) => {
  try {
    if (!encryptedText || !encryptedText.includes(':')) return null;
    
    // Split IV and encrypted content
    const textParts = encryptedText.split(':');
    const iv = Buffer.from(textParts[0], 'hex');
    const encryptedData = Buffer.from(textParts[1], 'hex');
    
    // Create decipher with key and IV
    const decipher = crypto.createDecipheriv(
      'aes-256-cbc',
      Buffer.from(ENCRYPTION_KEY, 'hex'),
      iv
    );
    
    // Update the decipher with the encrypted data and finalize it
    let decrypted = decipher.update(encryptedData);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    
    // Return decrypted data as UTF-8 string
    return decrypted.toString('utf8');
  } catch (error) {
    console.error('Decryption error:', error);
    return null;
  }
};

/**
 * Generate a secure random token
 * @param {number} length - Length of the token in bytes
 * @returns {string} Random token in hex format
 */
export const generateToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

/**
 * Hash a string using SHA-256
 * @param {string} text - Text to hash
 * @returns {string} Hashed text in hex format
 */
export const hash = (text) => {
  return crypto
    .createHash('sha256')
    .update(text)
    .digest('hex');
};

/**
 * Create a HMAC signature
 * @param {string} text - Text to sign
 * @param {string} [secret] - Secret key for HMAC (default: ENCRYPTION_KEY)
 * @returns {string} HMAC signature in hex format
 */
export const sign = (text, secret = ENCRYPTION_KEY) => {
  return crypto
    .createHmac('sha256', secret)
    .update(text)
    .digest('hex');
};

/**
 * Verify a HMAC signature
 * @param {string} text - Original text
 * @param {string} signature - HMAC signature to verify
 * @param {string} [secret] - Secret key for HMAC (default: ENCRYPTION_KEY)
 * @returns {boolean} Whether the signature is valid
 */
export const verify = (text, signature, secret = ENCRYPTION_KEY) => {
  const expectedSignature = sign(text, secret);
  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature, 'hex'),
    Buffer.from(signature, 'hex')
  );
};

export default {
  encrypt,
  decrypt,
  generateToken,
  hash,
  sign,
  verify
}; 