# Solução para Problema de Routing 404 no Vercel

Este documento descreve as correções implementadas para resolver o problema de rotas 404 no deploy do Vercel.

## Problema Identificado

Quando acessada, a página inicial apresentava o erro:
```
404: NOT_FOUND
Code: NOT_FOUND
ID: cdg1::mcsnd-1746563914348-8b34072487b1
```

Isso ocorria porque o Vercel não estava redirecionando corretamente as rotas da SPA (Single Page Application) para o `index.html`.

## Solução Implementada

### 1. Correção do `vercel.json` Principal

Modificamos o arquivo `vercel.json` na raiz do projeto para corrigir o gerenciamento de rotas:

```json
{
  "version": 2,
  "builds": [
    { 
      "src": "api/index.js", 
      "use": "@vercel/node"
    },
    { "src": "client/dist/**", "use": "@vercel/static" }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "/api/index.js" },
    { "src": "/assets/(.*)", "dest": "/client/dist/assets/$1" },
    { "src": "/favicon.ico", "dest": "/client/dist/favicon.ico" },
    { "handle": "filesystem" },
    { "src": "/(.*)", "dest": "/client/dist/index.html" }
  ],
  "env": {
    "NODE_ENV": "production"
  },
  "public": true
}
```

Principais modificações:
- Substituímos a linha `{ "src": "/(.*)", "dest": "/client/dist/$1", "continue": true }` por `{ "handle": "filesystem" }`
- Mantivemos a regra de fallback para o index.html

### 2. Adição de `vercel.json` no Diretório `client/dist`

Adicionamos um arquivo `vercel.json` no diretório de build para garantir que as rotas sejam tratadas corretamente:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "trailingSlash": false
}
```

### 3. Criação de Arquivo `_redirects`

Adicionamos um arquivo `_redirects` no diretório `client/dist` para garantir compatibilidade com plataformas que suportam esse formato:

```
/* /index.html 200
```

### 4. Configuração Adicional do Netlify

Criamos um arquivo `netlify.toml` para garantir compatibilidade caso o projeto seja hospedado no Netlify no futuro:

```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 5. Atualização do `client/vercel.json`

Atualizamos o arquivo `client/vercel.json` para incluir a configuração `trailingSlash: false`:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    },
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" }
      ]
    }
  ],
  "trailingSlash": false
}
```

## Processo de Deploy

Após as alterações, o processo para deploy inclui:

1. Reconstruir o cliente:
   ```
   cd client
   npm run build
   ```

2. Garantir que os arquivos `client/dist/vercel.json` e `client/dist/_redirects` estejam presentes no build

3. Fazer deploy normalmente para o Vercel:
   ```
   vercel --prod
   ```

## Resultado

As alterações resolvem o problema de 404 garantindo que todas as rotas no lado do cliente sejam redirecionadas corretamente para o `index.html`, permitindo que o React Router assuma o controle da navegação. 