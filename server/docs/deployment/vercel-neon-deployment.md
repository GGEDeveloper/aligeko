# Deploying to Vercel with Neon PostgreSQL

Este guia descreve os passos para fazer deploy da aplicação AliTools B2B E-commerce no Vercel utilizando um banco de dados PostgreSQL no Neon.

## Pré-requisitos

- Uma conta no Vercel (https://vercel.com)
- Uma conta no Neon (https://neon.tech)
- Repositório Git com o código da aplicação
- Node.js e npm instalados localmente

## Passo 1: Configurar o Banco de Dados PostgreSQL no Neon

1. Faça login ou crie uma conta no Neon (https://neon.tech)
2. Crie um novo projeto
3. Crie um banco de dados chamado `neondb` (ou o nome de sua preferência)
4. Nos detalhes de conexão, obtenha a string de conexão PostgreSQL, que se parece com:
   ```
   postgres://user:password@host.neon.tech/dbname?sslmode=require
   ```
5. Salve esta string de conexão - você precisará dela para a configuração no Vercel

## Passo 2: Preparar a Aplicação para Deployment

### Construir o Frontend

```bash
cd client
npm run build
# Build completo em ~25s
# Arquivos gerados em client/dist/
cd ..
```

### Construir o Backend

```bash
cd server
npm run build
# Arquivos compilados com Babel para server/dist/
cd ..
```

### Configurar o arquivo vercel.json

Crie ou edite o arquivo `vercel.json` na raiz do projeto com a seguinte configuração:

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

**IMPORTANTE**: Nunca inclua credenciais diretamente no arquivo `vercel.json`. Use o dashboard do Vercel para configurar variáveis de ambiente.

## Passo 3: Fazer Deploy no Vercel

1. Instale a CLI do Vercel (se ainda não estiver instalada):
   ```bash
   npm install -g vercel
   ```

2. Faça login no Vercel pela CLI:
   ```bash
   vercel login
   ```

3. Execute o deploy inicial (preview):
   ```bash
   vercel
   ```
   
   Ou para produção:
   ```bash
   vercel --prod
   ```

## Passo 4: Configurar Variáveis de Ambiente no Vercel

No dashboard do Vercel para seu projeto:

1. Acesse "Settings" > "Environment Variables"
2. Adicione as seguintes variáveis de ambiente:

```
NODE_ENV=production
NEON_DB_URL=postgres://neondb_owner:npg_NEjIVhxi8JZ2@ep-young-scene-abkud0t0-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require
DB_SSL=true
DB_HOST=ep-young-scene-abkud0t0-pooler.eu-west-2.aws.neon.tech
DB_PORT=5432
DB_USER=neondb_owner
DB_PASSWORD=npg_NEjIVhxi8JZ2
DB_NAME=neondb
SEED_DATA=true
JWT_SECRET=alitools-secure-jwt-secret-key-2024
JWT_EXPIRATION=1h
JWT_REFRESH_SECRET=alitools-secure-refresh-token-key-2024
JWT_REFRESH_EXPIRATION=7d
BCRYPT_SALT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

**Importante**: Para um conjunto completo de variáveis de ambiente, consulte o arquivo `docs/environment_config.markdown`.

## Passo 5: Verificar e Testar o Deployment

1. Acesse a URL fornecida pelo Vercel após o deploy (exemplo: https://aligekow-hy8vyu57t-alitools-projects.vercel.app)
2. Verifique se a aplicação está carregando corretamente
3. Teste as funcionalidades principais para garantir que estão funcionando
4. Verifique os logs no dashboard do Vercel para identificar possíveis problemas

## Passo 6: Comandos de Manutenção Comuns

### Redeploy após alterações

```bash
# Atualizar repositório
git add .
git commit -m "Descrição das alterações"
git push

# Redeploy
vercel --prod
```

### Forçar novo build sem alterações de código

```bash
vercel --prod --force
```

## Exemplo de Deploy Real (Outubro 2024)

Em Outubro de 2024, foi realizado um deploy bem-sucedido do projeto com os seguintes resultados:

- **URL do projeto**: https://aligekow-hy8vyu57t-alitools-projects.vercel.app
- **Tempo médio de build**: ~30 segundos
- **Status das funcionalidades**:
  - Admin Dashboard: 100% implementado
  - Customer Dashboard Layout: Concluído
  - Autenticação e autorização: Funcionando corretamente
  - Integração com banco de dados Neon: Funcionando corretamente

Para uma lista completa de funcionalidades implementadas, consulte o arquivo `tasks/implementation-steps.md`.

## Resolução de Problemas Comuns

### Problemas de Conexão com Banco de Dados

- **Erro de conexão**: Verifique se a string de conexão `NEON_DB_URL` está corretamente formatada no Vercel
- **Erro SSL**: Certifique-se de que `DB_SSL` está definido como `true` e que a string de conexão inclui `?sslmode=require`
- **Erros de migração**: Você pode executar migrações manualmente usando:
  ```bash
  NODE_ENV=production NEON_DB_URL=your_connection_string npm run db:migrate
  ```

### Erros de API

- **404 em rotas da API**: Verifique se o arquivo `api/index.js` está importando corretamente o servidor
- **Erros 500**: Verifique os logs do Vercel para identificar exceções no servidor
- **Erro CORS**: Certifique-se de que a configuração CORS permite solicitações do domínio correto

### Problemas de Build

- **Erro no build do cliente**: Verifique se todas as dependências estão instaladas corretamente
- **Erro no build do servidor**: Verifique se a transpilação está configurada corretamente
- **Timeouts de build**: Considere otimizar o processo de build ou dividir em etapas menores

### Problemas Específicos Encontrados e Resolvidos

1. **Erro de CORS na produção**: Resolvido adicionando o domínio do Vercel na configuração CORS do servidor
2. **Falha nas migrações de banco de dados**: Resolvido melhorando os scripts de migração no comando build
3. **Erro de acesso à API Neon de dentro do Vercel**: Resolvido adicionando a URL do Vercel aos IPs permitidos no Neon

## Próximos Passos para Desenvolvimento

Após o deploy bem-sucedido, os próximos passos de desenvolvimento incluem:

1. Implementação das funcionalidades restantes do Customer Dashboard
2. Implementação das medidas de segurança (Tarefa 12)
3. Otimização de performance (Tarefa 13)
4. Testes de carga em ambiente de produção

## Recursos Adicionais

- [Documentação do Vercel](https://vercel.com/docs)
- [Documentação do Neon PostgreSQL](https://neon.tech/docs)
- [Documentação do Sequelize com PostgreSQL](https://sequelize.org/master/manual/getting-started.html)

Última atualização: Outubro 2024 