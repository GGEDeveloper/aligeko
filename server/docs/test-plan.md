# Authentication Test Plan

This document outlines the testing approach for the authentication system, with a focus on the two-factor authentication (2FA) functionality.

## Unit Tests

### Two-Factor Authentication Utilities (`twoFactor.js`)

1. **Secret Generation**
   - Verify TOTP secret generation produces correct format
   - Confirm custom issuer option works properly

2. **Backup Codes Generation**
   - Test generating default number of backup codes (10)
   - Confirm custom number of backup codes works
   - Verify backup codes are unique

3. **Token Verification**
   - Test successful verification of valid tokens
   - Test rejection of invalid tokens
   - Test various time window configurations

4. **Backup Code Verification**
   - Test successful verification when code exists
   - Test failure when code doesn't exist
   - Test handling of empty/null backup codes arrays

5. **QR Code Generation**
   - Verify QR code URL generation
   - Test error handling for QR code generation failures

## Integration Tests

### Two-Factor Authentication Flow

1. **Setup Phase**
   - Check initial 2FA status (should be disabled)
   - Test 2FA setup endpoint (generates secret and backup codes)
   - Verify TOTP token validation and 2FA enablement

2. **Login with 2FA**
   - Test login flow with 2FA enabled (should return requireTwoFactor flag)
   - Test TOTP token validation during login
   - Test backup code usage during login

3. **Management**
   - Test disabling 2FA with valid token and password
   - Verify 2FA status after disabling
   - Test login flow after disabling 2FA

4. **Error Cases**
   - Test attempting to setup 2FA when already enabled
   - Test attempting to validate with invalid token
   - Test attempting to validate with invalid backup code
   - Test attempting to disable 2FA with wrong password

## Manual Testing Scenarios

For proper end-to-end testing, the following manual tests should be performed:

1. **Complete 2FA Setup Flow**
   - Register a new account
   - Login to the account
   - Enable 2FA
   - Scan QR code with an authenticator app
   - Verify using the authenticator app token
   - Save backup codes

2. **Login with Authenticator App**
   - Logout from the account
   - Login with email/password
   - Enter the code from authenticator app
   - Verify successful login

3. **Login with Backup Code**
   - Logout from the account
   - Login with email/password
   - Use one of the backup codes instead of authenticator app
   - Verify successful login
   - Verify the backup code cannot be reused

4. **Disabling 2FA**
   - While logged in, navigate to security settings
   - Request 2FA disabling
   - Enter authenticator app code and password
   - Verify 2FA is disabled
   - Logout and login without 2FA

5. **Security Edge Cases**
   - Test with expired tokens
   - Test with manipulated backup codes
   - Test brute force protection (multiple failed attempts)
   - Test time drift handling in authenticator app

## Testing Tools

- Jest for automated tests
- Supertest for API testing
- Manual testing with actual authenticator apps (Google Authenticator, Authy, etc.)

## Test Environment Requirements

- Test database with clean state
- Mock JWT tokens for authenticated routes
- Mock for the authenticator app (for automated tests) 