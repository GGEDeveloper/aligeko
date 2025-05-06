# AliTools B2B E-commerce Environment Configuration

Este documento descreve as configurações de ambiente necessárias para o projeto AliTools B2B E-commerce, cobrindo ambientes de desenvolvimento e produção.

## Variáveis de Ambiente

As seguintes variáveis de ambiente são utilizadas no projeto e devem ser configuradas de acordo com cada ambiente:

### Configuração do Servidor

```bash
# Ambiente (development, production, testing)
NODE_ENV=development

# Porta do servidor
PORT=5000

# URLs de API e Cliente
API_URL=http://localhost:5000
CLIENT_URL=http://localhost:3000
```

### Configuração do Banco de Dados

```bash
# Conexão PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=alitools_b2b
DB_USER=postgres
DB_PASSWORD=your_password_here
DB_SSL=false

# Para conexão com Neon PostgreSQL
NEON_DB_URL=postgres://user:password@host.neon.tech/dbname?sslmode=require
SEED_DATA=true
```

### Configuração de Autenticação

```bash
# Secret e expiração de tokens JWT
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRATION=1h
JWT_REFRESH_SECRET=your_refresh_secret_here
JWT_REFRESH_EXPIRATION=7d

# Configuração 2FA
TOTP_ISSUER=AliTools B2B
TOTP_SECRET_BYTES=20
TOTP_WINDOW=1
```

### Integração com GEKO API

```bash
# Configuração da API GEKO
GEKO_API_URL=https://api.geko.com/v1
GEKO_API_KEY=your_geko_api_key
GEKO_SYNC_INTERVAL=30m
```

### Configuração de Email

```bash
# Servidor SMTP
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASSWORD=your_smtp_password
EMAIL_FROM=noreply@alitools.com
ADMIN_EMAIL=admin@alitools.com
```

### Logging e Segurança

```bash
# Nível de log (debug, info, warn, error)
LOG_LEVEL=info
LOG_FILE=logs/app.log
LOG_MAX_SIZE=10m
LOG_MAX_FILES=7d

# Limitação de taxa de requisições
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
BCRYPT_SALT_ROUNDS=12
```

### Upload de Arquivos

```bash
# Configurações de upload
UPLOAD_MAX_SIZE=5
UPLOAD_ALLOWED_FORMATS=jpg,jpeg,png,gif
```

### Monitoramento de Sincronização

```bash
# Configurações de alertas de saúde da sincronização
SYNC_HEALTH_ALERTS_ENABLED=true
SYNC_HEALTH_ALERT_THRESHOLD=3
SYNC_HEALTH_EMAIL_FROM=alerts@alitools.com
SYNC_HEALTH_EMAIL_TO=admin@alitools.com
SYNC_HEALTH_THRESHOLD_DURATION=120
SYNC_HEALTH_THRESHOLD_MEMORY=512
SYNC_HEALTH_THRESHOLD_ERROR_RATE=0.05
```

## Ambiente de Desenvolvimento (Local)

Para ambiente de desenvolvimento local, crie um arquivo `.env` na raiz do projeto com as variáveis relevantes para seu ambiente de desenvolvimento.

## Ambiente de Produção (Vercel)

Para o ambiente de produção no Vercel, as variáveis de ambiente devem ser configuradas no dashboard do Vercel:

1. Acesse o dashboard do seu projeto no Vercel
2. Navegue até "Settings" > "Environment Variables"
3. Adicione todas as variáveis de ambiente relevantes para produção
4. Importante: Nunca inclua credenciais no arquivo `vercel.json`

### Arquivo .env para Vercel (Atualizado Outubro 2024)

Arquivo `.env` utilizado no deploy para produção:

```
# Database Configuration
NEON_DB_URL=postgres://neondb_owner:npg_NEjIVhxi8JZ2@ep-young-scene-abkud0t0-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require
DB_SSL=true
DB_HOST=ep-young-scene-abkud0t0-pooler.eu-west-2.aws.neon.tech
DB_PORT=5432
DB_USER=neondb_owner
DB_PASSWORD=npg_NEjIVhxi8JZ2
DB_NAME=neondb
SEED_DATA=true

# Authentication
JWT_SECRET=alitools-secure-jwt-secret-key-2024
JWT_EXPIRATION=1h
JWT_REFRESH_SECRET=alitools-secure-refresh-token-key-2024
JWT_REFRESH_EXPIRATION=7d

# Application Settings
NODE_ENV=production
PORT=3000
CLIENT_URL=https://aligekow.vercel.app
API_URL=https://aligekow.vercel.app/api

# Security Settings
BCRYPT_SALT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100

# Email Configuration
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=user@example.com
SMTP_PASS=your_password
EMAIL_FROM=no-reply@alitools.com
ADMIN_EMAIL=admin@alitools.com

# GEKO API Integration
GEKO_API_URL=https://api.geko.com/v1
GEKO_API_KEY=your_geko_api_key

# Logging
LOG_LEVEL=info
LOG_FILE=logs/app.log
LOG_MAX_SIZE=10m
LOG_MAX_FILES=7d

# Upload Settings
UPLOAD_MAX_SIZE=5
UPLOAD_ALLOWED_FORMATS=jpg,jpeg,png,gif

# 2FA Settings
TOTP_ISSUER=AliTools B2B
TOTP_SECRET_BYTES=20
TOTP_WINDOW=1

# Sync Health Alerts
SYNC_HEALTH_ALERTS_ENABLED=true
SYNC_HEALTH_ALERT_THRESHOLD=3
SYNC_HEALTH_EMAIL_FROM=alerts@alitools.com
SYNC_HEALTH_EMAIL_TO=admin@alitools.com
```

## Scripts de Build e Deployment

No arquivo `package.json` principal do projeto, os seguintes scripts estão disponíveis para build e deployment:

```json
{
  "scripts": {
    "build:client": "cd client && npm run build",
    "build:server": "cd server && npm run build",
    "build": "npm run build:server && npm run build:client",
    "deploy:dev": "vercel",
    "deploy:prod": "vercel --prod"
  }
}
```

## Configuração de Vercel

O arquivo `vercel.json` atualizado para deployment (Outubro 2024):

```json
{
  "version": 2,
  "builds": [
    { 
      "src": "api/index.js", 
      "use": "@vercel/node",
      "config": {
        "build": {
          "commands": [
            "cd server && npm run build && npm run db:migrate:prod && npm run db:seed:prod"
          ]
        }
      }
    },
    { "src": "client/dist/**", "use": "@vercel/static" }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "api/index.js" },
    { "src": "/(.*)", "dest": "client/dist/$1" }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

## Verificação de Deploy

Para verificar se o deployment foi bem-sucedido:

1. Acesse a URL fornecida pelo Vercel após o deploy (https://aligekow-hy8vyu57t-alitools-projects.vercel.app)
2. Verifique se a aplicação está carregando corretamente
3. Teste funcionalidades principais para garantir que estão funcionando
4. Verifique os logs no dashboard do Vercel para identificar possíveis problemas

## Atualizações de Progresso de Implementação

De acordo com o monitoramento de tasks:
- Admin Dashboard (Tarefa 10) completamente implementado
- Customer Dashboard Layout (Tarefa 11.1) implementado
- Próximas tarefas: Implementar Gestão de Perfil de Cliente (11.2) e Histórico de Pedidos (11.3)

Para detalhes completos sobre o progresso, consulte `tasks/implementation-steps.md`.

Último update: Outubro 2024 