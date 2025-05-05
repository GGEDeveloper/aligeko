# AliTools B2B E-commerce API

## Sistema de Autenticação

O AliTools B2B E-commerce implementa um sistema de autenticação robusto e seguro, projetado para atender às necessidades específicas de uma plataforma B2B. Este sistema inclui:

### Características Principais

1. **Registro com Aprovação Administrativa**
   - Os novos clientes B2B podem se registrar, mas suas contas ficam pendentes até aprovação administrativa
   - Validação rigorosa de dados no registro (email, senha forte, dados da empresa)

2. **Autenticação Baseada em JWT**
   - Tokens de acesso com curta duração (1 hora por padrão)
   - Tokens de atualização para renovação de sessão (7 dias por padrão)
   - Proteção contra expiração de tokens

3. **Autenticação de Dois Fatores (2FA)**
   - Implementação TOTP (Time-based One-Time Password) compatível com aplicativos como Google Authenticator
   - Códigos de backup para recuperação
   - 2FA obrigatório para administradores, opcional para clientes

4. **Autorização Baseada em Funções**
   - Controle de acesso granular baseado em funções (admin, customer, staff)
   - Middleware de autorização para proteger endpoints específicos

5. **Recuperação de Senha Segura**
   - Fluxo de redefinição de senha baseado em tokens
   - Tokens de redefinição com expiração (1 hora)

### Documentação Detalhada

Para mais informações sobre o sistema de autenticação, consulte os seguintes documentos:

- [Fluxo de Autenticação](authentication-flow.md) - Descrição detalhada do processo de autenticação
- [API de Autenticação](auth-api.md) - Documentação completa dos endpoints de autenticação

## Estrutura do Projeto

```
server/
├── src/
│   ├── config/         # Configurações (banco de dados, etc.)
│   ├── controllers/    # Controladores da aplicação
│   ├── middleware/     # Middlewares (auth, validação, etc.)
│   ├── models/         # Modelos de dados
│   ├── routes/         # Definições de rotas
│   ├── utils/          # Utilitários (2FA, etc.)
│   ├── app.js          # Configuração do Express
│   └── index.js        # Ponto de entrada da aplicação
├── tests/
│   ├── unit/           # Testes unitários
│   └── integration/    # Testes de integração
└── docs/               # Documentação
```

## Execução do Projeto

### Instalação

```bash
cd server
npm install
```

### Desenvolvimento

```bash
npm run dev
```

### Produção

```bash
npm run build
npm start
```

### Testes

```bash
npm test
```

## Migração do Banco de Dados

Para aplicar migrações:

```bash
npm run db:migrate
```

Para criar uma nova migração:

```bash
npx sequelize-cli migration:generate --name add_new_feature
```

## Ambiente de Desenvolvimento

O projeto usa as seguintes variáveis de ambiente. Crie um arquivo `.env` baseado no `.env.example`:

```
# Servidor
PORT=5000
NODE_ENV=development

# JWT
JWT_SECRET=seu_segredo_aqui
JWT_EXPIRATION=1h
JWT_REFRESH_EXPIRATION=7d

# Banco de Dados
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=sua_senha
DB_NAME=alitools_b2b
DB_SSL=false
```

## Segurança

O sistema de autenticação implementa as seguintes boas práticas de segurança:

1. **Proteção de Senhas**
   - Senhas armazenadas com hash usando bcrypt
   - Política de senha forte (mínimo 10 caracteres, letras maiúsculas/minúsculas, números, caracteres especiais)

2. **Proteção Contra Ataques**
   - Limitação de taxa de requisições
   - Validação rigorosa de entradas
   - Headers de segurança com Helmet

3. **Gerenciamento de Sessão**
   - Tokens curtos de 1 hora
   - Tokens de atualização são utilizados para renovar a sessão sem necessidade de login frequente

4. **Autenticação Multi-fator**
   - 2FA como camada adicional de segurança
   - Implementação standard TOTP

## Próximos Passos

- Implementação de bloqueio de conta após múltiplas tentativas de login
- Melhoria do fluxo de recuperação de conta 2FA
- Adição de logs de auditoria para ações administrativas 

## Authentication System

The AliTools B2B E-commerce platform features a comprehensive authentication system with the following components:

1. **User Registration and Approval Flow**
   - Companies register with basic information
   - Admin approval required before account activation
   - Email notifications for status updates

2. **Login System**
   - JWT-based authentication with access and refresh tokens
   - Role-based access control (admin, customer, staff)
   - Token refresh endpoints for extended sessions

3. **Password Management**
   - Secure password storage with bcrypt hashing
   - Password reset via email with time-limited tokens
   - Password strength validation

4. **Two-Factor Authentication (2FA)**
   - Time-based One-Time Password (TOTP) implementation
   - QR code generation for easy setup with authenticator apps
   - Backup codes for account recovery
   - Optional for users to enable/disable
   - Granular API for setup, verification, and management
   - Follows security best practices

5. **API Protection**
   - Route protection middleware
   - Role-based access control
   - Token validation and verification

For detailed information about the authentication flow, including two-factor authentication, see [authentication-flow.md](authentication-flow.md).
For API endpoints documentation, see [auth-api.md](auth-api.md). 