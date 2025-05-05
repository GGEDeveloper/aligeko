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

# URL completa de conexão
DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}
```

### Configuração de Autenticação

```bash
# Secret e expiração de tokens JWT
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRATION=1h
JWT_REFRESH_EXPIRATION=7d
```

### Integração com GEKO API

```bash
# Configuração da API GEKO
GEKO_API_URL=https://api.geko.com/v1
GEKO_API_KEY=your_geko_api_key_here
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
```

### Logging e Segurança

```bash
# Nível de log (debug, info, warn, error)
LOG_LEVEL=info

# Limitação de taxa de requisições
RATE_LIMIT_WINDOW=15m
RATE_LIMIT_MAX=100
```

## Ambiente de Desenvolvimento (Vercel)

Para o ambiente de desenvolvimento no Vercel, as seguintes configurações adicionais são necessárias:

```bash
VERCEL_TOKEN=your_vercel_token_here
VERCEL_ORG_ID=your_vercel_org_id
VERCEL_PROJECT_ID=your_vercel_project_id
```

## Ambiente de Produção (Dominios.pt)

Para o ambiente de produção no Dominios.pt, as seguintes configurações são utilizadas:

```bash
# Banco de dados de produção
PROD_DB_HOST=db.alitools.com
PROD_DB_PORT=5432
PROD_DB_NAME=alitools_b2b_prod
PROD_DB_USER=alitools_prod
PROD_DB_PASSWORD=your_prod_password_here

# Configurações específicas de produção
NODE_ENV=production
PORT=8080
API_URL=https://api.shop.alitools.com
CLIENT_URL=https://shop.alitools.com
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
    "deploy:prod": "echo \"Deploy to production environment\""
  }
}
```

## Configuração de Vercel

Para configurar o Vercel para deployment de desenvolvimento, siga os passos abaixo:

1. Crie uma conta no Vercel (se ainda não tiver uma)
2. Instale a CLI do Vercel: `npm install -g vercel`
3. Faça login: `vercel login`
4. Configure o projeto: `vercel link`
5. Configure as variáveis de ambiente: `vercel env add`
6. Deploy para desenvolvimento: `npm run deploy:dev`

## Configuração do Dominios.pt

Para configurar o ambiente de produção no Dominios.pt, siga os passos:

1. Acesse o painel de controle do Dominios.pt
2. Configure o domínio `shop.alitools.com`
3. Utilize o plano "Value Linux V2" conforme especificado
4. Configure o Node.js e PostgreSQL no servidor
5. Configure o banco de dados de produção conforme as variáveis acima
6. Deploy para produção: (A ser implementado)

## Verificação de Configuração

Para verificar se as configurações de ambiente estão corretas, execute o comando:

```bash
npm run dev
```

O servidor deve iniciar sem erros e exibir uma mensagem de confirmação de conexão com o banco de dados.

Último update: Junho 2024 