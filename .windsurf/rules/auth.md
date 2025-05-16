---
trigger: model_decision
description: auth authentication middleware controllers
globs: 
---
# Autenticação e Autorização

## Sistema de Autenticação

O sistema de autenticação do AliTools B2B E-commerce implementa várias camadas de segurança para proteger os dados dos usuários e garantir acesso seguro à plataforma.

### Estrutura e Componentes

- **Middlewares:**
  - `auth.middleware.js`: Verifica tokens JWT, extrai e valida usuários
  - `validate.middleware.js`: Valida dados de entrada usando express-validator
  - `role.middleware.js`: Autorização baseada em funções (RBAC)

- **Controladores:**
  - `auth.controller.js`: Gerencia registro, login, refresh token, e obtenção de perfil
  - `twoFactor.controller.js`: Gerencia configuração, verificação e validação de 2FA

- **Utilitários:**
  - `twoFactor.js`: Gerencia segredos TOTP, validação e códigos de backup

### Fluxo de Autenticação

**Registro:**
```typescript
// ✅ DO: Validar todos os campos de entrada antes do processamento
router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isStrongPassword({
      minLength: 10,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1
    }),
    body('firstName').notEmpty().trim(),
    body('lastName').notEmpty().trim(),
    body('companyName').notEmpty().trim()
  ],
  validate,
  authController.register
);

// ❌ DON'T: Armazenar senhas em texto simples ou usar hashing fraco
// const user = await User.create({ email, password: plainPassword });

// ✅ DO: Usar bcrypt para hashing seguro de senhas
const hashedPassword = await bcrypt.hash(password, 12);
const user = await User.create({ email, password: hashedPassword });
```

**Login:**
```typescript
// ✅ DO: Implementar verificação de 2FA quando habilitado
export const login = async (req, res, next) => {
  // ...validação de credenciais...
  
  // Verificar se 2FA está habilitado
  if (user.twoFactorEnabled) {
    return res.status(200).json({
      success: true,
      data: {
        requireTwoFactor: true,
        userId: user.id,
        message: 'Please enter your two-factor authentication code'
      }
    });
  }
  
  // Gerar tokens e retornar resposta normal...
};
```

**Proteção de Rotas:**
```typescript
// ✅ DO: Proteger endpoints sensíveis com middleware de autenticação
router.get('/me', authenticate, authController.getCurrentUser);

// ✅ DO: Adicionar autorização baseada em função quando necessário
router.put('/users/:id', authenticate, authorize('admin'), userController.updateUser);
```

### Autenticação de Dois Fatores (2FA)

O sistema implementa TOTP (Time-based One-Time Password) compatível com Google Authenticator e outros apps.

```typescript
// ✅ DO: Gerar segredos seguros para 2FA
export const generateSecret = (email, issuer = 'AliTools B2B') => {
  return speakeasy.generateSecret({
    name: `${issuer}:${email}`,
    issuer: issuer
  });
};

// ✅ DO: Sempre fornecer códigos de backup quando configurar 2FA
export const generateBackupCodes = (count = 10) => {
  const codes = [];
  for (let i = 0; i < count; i++) {
    codes.push(Math.random().toString(36).substring(2, 12).toUpperCase());
  }
  return codes;
};
```

### Tokens JWT

```typescript
// ✅ DO: Definir tempos de expiração apropriados para tokens
export const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRATION || '1h' }
  );
  
  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRATION || '7d' }
  );
  
  return { accessToken, refreshToken };
};

// ❌ DON'T: Armazenar dados sensíveis em tokens JWT
// jwt.sign({ id: user.id, password: user.password, ... }, secret);
```

### Validação

```typescript
// ✅ DO: Criar middlewares de validação reutilizáveis
export const validatePassword = [
  body('password')
    .isLength({ min: 10 })
    .withMessage('A senha deve ter pelo menos 10 caracteres')
    .matches(/[a-z]/)
    .withMessage('A senha deve conter pelo menos uma letra minúscula')
    .matches(/[A-Z]/)
    .withMessage('A senha deve conter pelo menos uma letra maiúscula')
    .matches(/[0-9]/)
    .withMessage('A senha deve conter pelo menos um número')
    .matches(/[!@#$%^&*(),.?":{}|<>]/)
    .withMessage('A senha deve conter pelo menos um caractere especial')
];

// ✅ DO: Validar todas as entradas de usuário
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Erro de validação',
        errors: errors.array()
      }
    });
  }
  next();
};
```

## Referências

- [Documentação de Autenticação](mdc:server/docs/auth-api.md)
- [Fluxo de Autenticação](mdc:server/docs/authentication-flow.md)
- [Controlador de Autenticação](mdc:server/src/controllers/auth.controller.js)
- [Middleware de Autenticação](mdc:server/src/middleware/auth.middleware.js)

# Authentication Patterns

This rule documents the standard authentication patterns for the AliTools B2B E-commerce platform, including two-factor authentication (2FA).

## JWT Authentication

- **Basic Structure:**
  - Access tokens for short-term authorization (1 hour)
  - Refresh tokens for long-term session management (7 days)
  - Role-based access control (admin, customer, staff)

- **File References:**
  - [auth.controller.js](mdc:server/src/controllers/auth.controller.js) - Authentication logic
  - [twoFactor.controller.js](mdc:server/src/controllers/twoFactor.controller.js) - 2FA implementation
  - [auth.middleware.js](mdc:server/src/middleware/auth.middleware.js) - Authentication middleware
  - [auth.routes.js](mdc:server/src/routes/auth.routes.js) - Authentication routes

- **✅ DO: Use environment variables for JWT configuration:**
  ```javascript
  // Correct JWT token generation
  const jwt = require('jsonwebtoken');
  
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRATION }
  );
  ```

- **❌ DON'T: Hardcode JWT secrets or expiration times:**
  ```javascript
  // Never do this
  const token = jwt.sign(
    { id: user.id, email: user.email },
    'my-hardcoded-secret',
    { expiresIn: '1h' }
  );
  ```

## Two-Factor Authentication (2FA)

- **Implementation Details:**
  - TOTP (Time-based One-Time Password) using Speakeasy
  - QR code generation with QRCode library
  - Backup codes for account recovery
  - Step-by-step setup verification

- **User Model Requirements:**
  ```javascript
  // Required fields in User model
  twoFactorEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  twoFactorSecret: {
    type: DataTypes.STRING,
    allowNull: true
  },
  twoFactorBackupCodes: {
    type: DataTypes.JSON,
    allowNull: true
  }
  ```

- **✅ DO: Implement complete 2FA flow:**
  - Setup: Generate secret & backup codes
  - Verification: Validate TOTP token
  - Login: Check if 2FA is enabled
  - Validation: Verify 2FA token during login
  - Disable: Remove 2FA with proper verification

- **❌ DON'T: Skip verification steps:**
  ```javascript
  // Incorrect - Enabling 2FA without verification
  await user.update({ 
    twoFactorEnabled: true,
    twoFactorSecret: secret.base32
  });
  ```

## Authentication Flow

- **Standard Login:**
  1. Validate credentials
  2. Check account status (active, pending, etc.)
  3. Check if 2FA is enabled
  4. If no 2FA: Generate tokens and return
  5. If 2FA: Return temporary state requiring 2FA

- **2FA Validation:**
  1. User submits 2FA token
  2. Verify token against stored secret
  3. Option to use backup code if token is lost
  4. Generate tokens after successful verification

- **Token Refresh:**
  1. Validate refresh token
  2. Generate new access token
  3. Keep same refresh token until expiration

## Security Best Practices

- **Password Handling:**
  - Store only hashed passwords using bcrypt
  - Enforce strong password policy
  - Implement password reset with secure tokens

- **Rate Limiting:**
  - Apply rate limits to login attempts
  - Apply rate limits to 2FA validation
  - Apply rate limits to password reset

- **Response Sanitization:**
  ```javascript
  // Remove sensitive data from response
  const userResponse = { ...user.toJSON() };
  delete userResponse.password;
  delete userResponse.twoFactorSecret;
  delete userResponse.twoFactorBackupCodes;
  delete userResponse.resetPasswordToken;
  delete userResponse.resetPasswordExpires;
  ```

- **Error Handling:**
  - Use generic error messages for login failures
  - Don't reveal if email exists during password reset
  - Log authentication failures for monitoring

## Testing Strategy

- **Unit Tests:**
  - Test token generation/validation
  - Test password hashing/verification
  - Test 2FA token generation/validation

- **Integration Tests:**
  - Test complete login flow
  - Test 2FA setup and validation
  - Test token refresh process

## Example Authentication Flow

```javascript
// 2FA Login Flow
const login = async (req, res) => {
  // 1. Verify credentials
  const user = await User.findOne({ where: { email } });
  if (!user || !await user.validatePassword(password)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  // 2. Check if 2FA is enabled
  if (user.twoFactorEnabled) {
    return res.status(200).json({
      requireTwoFactor: true,
      userId: user.id
    });
  }
  
  // 3. Generate tokens for non-2FA users
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  
  // 4. Return tokens and user data
  res.status(200).json({
    user: sanitizeUser(user),
    accessToken,
    refreshToken
  });
};
```
