# AliTools B2B - API de Autenticação

## Endpoints

### Registro e Login

#### `POST /api/v1/auth/register`

Registra um novo cliente B2B.

**Requisição:**
```json
{
  "email": "empresa@exemplo.com",
  "password": "Senha@Forte123",
  "firstName": "João",
  "lastName": "Silva",
  "companyName": "Empresa XYZ"
}
```

**Resposta (201 Created):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "empresa@exemplo.com",
      "firstName": "João",
      "lastName": "Silva",
      "companyName": "Empresa XYZ",
      "role": "customer",
      "isApproved": false,
      "status": "pending"
    },
    "message": "Registration successful. Your account is pending approval."
  }
}
```

#### `POST /api/v1/auth/login`

Autentica um usuário.

**Requisição:**
```json
{
  "email": "empresa@exemplo.com",
  "password": "Senha@Forte123"
}
```

**Resposta (Sem 2FA, 200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "empresa@exemplo.com",
      "firstName": "João",
      "lastName": "Silva",
      "companyName": "Empresa XYZ",
      "role": "customer",
      "isApproved": true,
      "status": "active"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Resposta (Com 2FA, 200 OK):**
```json
{
  "success": true,
  "data": {
    "requireTwoFactor": true,
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "message": "Please enter your two-factor authentication code"
  }
}
```

### Gestão de Tokens

#### `POST /api/v1/auth/refresh-token`

Atualiza o token de acesso usando um token de atualização.

**Requisição:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Resposta (200 OK):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Redefinição de Senha

#### `POST /api/v1/auth/forgot-password`

Solicita a redefinição de senha.

**Requisição:**
```json
{
  "email": "empresa@exemplo.com"
}
```

**Resposta (200 OK):**
```json
{
  "success": true,
  "data": {
    "message": "If your email exists in our system, you will receive a password reset link."
  }
}
```

#### `POST /api/v1/auth/reset-password`

Redefine a senha usando um token.

**Requisição:**
```json
{
  "token": "token-de-redefinicao",
  "password": "NovaSenha@Forte123"
}
```

**Resposta (200 OK):**
```json
{
  "success": true,
  "data": {
    "message": "Password has been reset successfully"
  }
}
```

### Usuário Atual

#### `GET /api/v1/auth/me`

Obtém as informações do usuário atual.

**Requisição:**
Headers:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Resposta (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "empresa@exemplo.com",
      "firstName": "João",
      "lastName": "Silva",
      "companyName": "Empresa XYZ",
      "role": "customer",
      "isApproved": true,
      "status": "active",
      "twoFactorEnabled": true
    }
  }
}
```

### Autenticação de Dois Fatores (2FA)

#### `GET /api/v1/auth/2fa/status`

Verifica se o 2FA está habilitado para o usuário atual.

**Requisição:**
Headers:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Resposta (200 OK):**
```json
{
  "success": true,
  "data": {
    "twoFactorEnabled": true,
    "message": "Two-factor authentication is enabled"
  }
}
```

#### `POST /api/v1/auth/2fa/setup`

Inicia o processo de configuração do 2FA.

**Requisição:**
Headers:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Resposta (200 OK):**
```json
{
  "success": true,
  "data": {
    "secret": "JBSWY3DPEHPK3PXP",
    "qrCodeUrl": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgA...",
    "backupCodes": ["ABC123DEF456", "GHI789JKL012", ...],
    "message": "Two-factor authentication setup initiated. Please verify with a token to enable."
  }
}
```

#### `POST /api/v1/auth/2fa/verify`

Verifica e habilita o 2FA.

**Requisição:**
Headers:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
Body:
```json
{
  "token": "123456"
}
```

**Resposta (200 OK):**
```json
{
  "success": true,
  "data": {
    "message": "Two-factor authentication has been enabled successfully",
    "backupCodes": ["ABC123DEF456", "GHI789JKL012", ...]
  }
}
```

#### `POST /api/v1/auth/2fa/validate`

Valida o código 2FA durante o login.

**Requisição:**
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "token": "123456",
  "useBackupCode": false
}
```

**Resposta (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "empresa@exemplo.com",
      "firstName": "João",
      "lastName": "Silva",
      "companyName": "Empresa XYZ",
      "role": "customer",
      "isApproved": true,
      "status": "active",
      "twoFactorEnabled": true
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### `POST /api/v1/auth/2fa/disable`

Desabilita o 2FA.

**Requisição:**
Headers:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
Body:
```json
{
  "token": "123456",
  "password": "Senha@Forte123"
}
```

**Resposta (200 OK):**
```json
{
  "success": true,
  "data": {
    "message": "Two-factor authentication has been disabled successfully"
  }
}
```

## Códigos de Erro

| Código | Descrição |
|--------|-----------|
| UNAUTHORIZED | Autenticação necessária |
| INVALID_CREDENTIALS | Email ou senha inválidos |
| ACCOUNT_PENDING | Conta pendente de aprovação |
| ACCOUNT_INACTIVE | Conta inativa |
| TOKEN_EXPIRED | Token de autenticação expirado |
| INVALID_TOKEN | Token de autenticação inválido |
| EMAIL_IN_USE | Email já está em uso |
| USER_NOT_FOUND | Usuário não encontrado |
| FORBIDDEN | Sem permissão para acessar o recurso |
| VALIDATION_ERROR | Erro de validação nos dados enviados |
| PASSWORD_POLICY_ERROR | A senha não atende aos requisitos de segurança |
| INVALID_RESET_TOKEN | Token de redefinição de senha inválido ou expirado |
| TWO_FACTOR_ALREADY_ENABLED | 2FA já está habilitado |
| TWO_FACTOR_NOT_SETUP | 2FA não foi configurado |
| INVALID_TWO_FACTOR_TOKEN | Código de verificação 2FA inválido |
| TWO_FACTOR_NOT_ENABLED | 2FA não está habilitado |

## Formato de Resposta

Todas as respostas seguem o mesmo formato:

### Sucesso

```json
{
  "success": true,
  "data": {
    // Dados da resposta
  }
}
```

### Erro

```json
{
  "success": false,
  "error": {
    "code": "CÓDIGO_DO_ERRO",
    "message": "Mensagem de erro",
    "errors": [
      // Lista de erros detalhados (opcional)
      {
        "field": "nome_do_campo",
        "message": "Mensagem de erro específica"
      }
    ]
  }
}
``` 