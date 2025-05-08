# Configurando Variáveis de Ambiente no Vercel

Este documento detalha como configurar corretamente as variáveis de ambiente no Vercel para a aplicação AliTools B2B.

## Problema

Os arquivos `.env` locais **não são automaticamente carregados** pelo Vercel durante o deploy. É necessário configurar manualmente todas as variáveis de ambiente necessárias no dashboard do Vercel.

## Variáveis Necessárias para o Funcionamento da API

Todas estas variáveis devem ser configuradas no dashboard do Vercel:

```
# Ambiente
NODE_ENV=production

# Database config (Neon Postgres)
NEON_DB_URL=postgres://neondb_owner:npg_NEjIVhxi8JZ2@ep-young-scene-abkud0t0-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require
DB_HOST=ep-young-scene-abkud0t0-pooler.eu-west-2.aws.neon.tech
DB_PORT=5432
DB_USER=neondb_owner
DB_PASSWORD=npg_NEjIVhxi8JZ2
DB_NAME=neondb
DB_SSL=true

# Vercel Postgres parameters
POSTGRES_URL=postgres://neondb_owner:npg_NEjIVhxi8JZ2@ep-young-scene-abkud0t0-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require
POSTGRES_URL_NON_POOLING=postgres://neondb_owner:npg_NEjIVhxi8JZ2@ep-young-scene-abkud0t0.eu-west-2.aws.neon.tech/neondb?sslmode=require
POSTGRES_USER=neondb_owner
POSTGRES_HOST=ep-young-scene-abkud0t0-pooler.eu-west-2.aws.neon.tech
POSTGRES_PASSWORD=npg_NEjIVhxi8JZ2
POSTGRES_DATABASE=neondb

# JWT Secret (usado para autenticação)
JWT_SECRET=sua_chave_secreta_aqui
JWT_EXPIRES_IN=24h

# Configurações do servidor
PORT=5000

# Configurações de API
API_VERSION=v1
```

## Passo a Passo para Configurar no Vercel

1. Acesse o [Dashboard do Vercel](https://vercel.com/dashboard)
2. Selecione o projeto "AliTools"
3. Clique na aba "Settings" no menu superior
4. No menu lateral, selecione "Environment Variables"
5. Para cada variável listada acima:
   - Clique em "Add New"
   - Cole o nome da variável (ex: `NODE_ENV`)
   - Cole o valor correspondente (ex: `production`)
   - Selecione os ambientes (Production, Preview, Development) conforme necessário
   - Clique em "Save"
6. Após adicionar todas as variáveis, retorne à aba "Deployments"
7. Selecione a opção "Redeploy" no último deployment ou faça um novo deploy

## Verificação

Após configurar as variáveis de ambiente e fazer um novo deploy:

1. Acesse o site em produção
2. Navegue para a página de produtos
3. Abra o Console do navegador (F12)
4. Verifique se as requisições para `/api/v1/products` retornam status 200
5. Verifique se os produtos são exibidos corretamente

## Solução de Problemas

Se após configurar todas as variáveis os erros persistirem:

1. Verifique os logs do Vercel em Settings > Functions > Logs
2. Confirme que não há erros de conexão com o banco de dados
3. Verifique se o banco de dados Neon está acessível e se as credenciais estão corretas
4. Considere testar localmente com as mesmas variáveis de ambiente para isolar o problema

## Boas Práticas

- **Nunca** compartilhe publicamente suas credenciais de banco de dados ou chaves secretas
- Mantenha uma cópia segura das suas variáveis de ambiente
- Atualize o `.env.example` do projeto quando novas variáveis forem adicionadas (sem incluir valores reais)
- Considere usar o [Vercel CLI](https://vercel.com/docs/cli) para gerenciar variáveis de ambiente via linha de comando 