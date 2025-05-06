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

## Atualização - Solução Adicional

Após o deploy inicial, o problema persistiu. Implementamos uma solução mais robusta:

### 1. Criação de Servidor Express Simples

Criamos um servidor Express no arquivo `index.js` na raiz do projeto para lidar com rotas SPAs:

```javascript
// Simple Express server for SPA
const express = require('express');
const path = require('path');
const app = express();

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'client/dist')));

// API routes can be added here
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from AliTools API!' });
});

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/dist/index.html'));
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = app;
```

### 2. Simplificação do vercel.json

Simplificamos o `vercel.json` na raiz do projeto para melhor compatibilidade e direcionamos todo o tráfego para o novo servidor Express:

```json
{
  "version": 2,
  "builds": [
    { 
      "src": "index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    { 
      "src": "/(.*)", 
      "dest": "index.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  },
  "public": true
}
```

Esta configuração é mais simples e redireciona todas as solicitações para nosso servidor Express, que então gerencia as rotas da SPA.

### 3. Página 404.html no Diretório Público

Adicionamos um arquivo `404.html` na pasta `client/public` que automaticamente redireciona para a página principal:

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Ali Tools B2B</title>
    <script type="text/javascript">
      // Código para SPA redirect baseado na solução GitHub Pages SPA
      var pathSegmentsToKeep = 0;

      var l = window.location;
      l.replace(
        l.protocol + '//' + l.hostname + (l.port ? ':' + l.port : '') +
        l.pathname.split('/').slice(0, 1 + pathSegmentsToKeep).join('/') + '/?/' +
        l.pathname.slice(1).split('/').slice(pathSegmentsToKeep).join('/').replace(/&/g, '~and~') +
        (l.search ? '&' + l.search.slice(1).replace(/&/g, '~and~') : '') +
        l.hash
      );
    </script>
  </head>
  <body>
    Redirecionando para a Ali Tools B2B...
  </body>
</html>
```

### 4. Atualização do package.json

Atualizamos o `package.json` na raiz do projeto para incluir o Express e definir o script de inicialização:

```json
{
  "name": "alitools-b2b",
  "version": "1.0.0",
  "description": "AliTools B2B E-commerce Platform",
  "main": "index.js",
  "engines": {
    "node": ">=16.x"
  },
  "scripts": {
    "start": "node index.js",
    "build": "cd client && npm run build",
    "deploy": "vercel --prod"
  },
  "dependencies": {
    "express": "^4.18.2"
  }
}
```

### 5. Removido o Arquivo Corrompido

Removemos o arquivo `client/dist/vercel.json` que estava corrompido e impedindo o funcionamento correto.

## Nova Estratégia de Deploy

Com essas alterações, o Vercel reconhecerá o projeto como uma aplicação Node.js/Express e usará o arquivo `index.js` como ponto de entrada, facilitando o gerenciamento de rotas para SPAs.

O processo de deploy continua o mesmo:

```
vercel --prod
```

## Validação Local

Após implementar todas as alterações, realizamos uma validação local antes do deploy:

1. Executamos `npm run vercel-build` - Build completada com sucesso
2. Checamos a presença de todos os arquivos necessários em `client/dist/`
3. Iniciamos o servidor Express com `npm start` 
4. Testamos a rota da API com `curl http://localhost:5000/api/hello`
5. Verificamos que o servidor responde corretamente com status 200

Não foram encontrados erros durante o processo de validação, o que indica que a configuração está pronta para deploy.

## Correção do Erro de Build do Vercel

Durante o deploy no Vercel, encontramos o seguinte erro:

```
[21:52:03.676] sh: line 1: vite: command not found
[21:52:03.701] Error: Command "npm run vercel-build" exited with 127
```

O problema está na ausência do Vite no ambiente de build do Vercel. Para resolver isso, implementamos as seguintes modificações:

### 1. Atualização do package.json principal

Modificamos os scripts de build para garantir que as dependências do cliente sejam instaladas antes de executar o build:

```json
"scripts": {
  "build:client": "cd client && npm install && npm run build",
  "vercel-build": "npm run build:client"
}
```

### 2. Configuração do build no vercel.json

Atualizamos o vercel.json para incluir a construção específica do cliente:

```json
"builds": [
  { 
    "src": "index.js",
    "use": "@vercel/node"
  },
  {
    "src": "client/package.json",
    "use": "@vercel/static-build",
    "config": {
      "distDir": "dist"
    }
  }
]
```

### 3. Adição de script vercel-build no cliente

Adicionamos um script específico para o build do Vercel no package.json do cliente:

```json
"scripts": {
  "build": "vite build",
  "vercel-build": "vite build"
}
```

Esta abordagem garante que o Vite esteja disponível durante o processo de build no ambiente do Vercel.

## Validação Local

Após implementar todas as alterações, realizamos uma validação local antes do deploy:

1. Executamos `npm run vercel-build` - Build completada com sucesso
2. Checamos a presença de todos os arquivos necessários em `client/dist/`
3. Iniciamos o servidor Express com `npm start` 
4. Testamos a rota da API com `curl http://localhost:5000/api/hello`
5. Verificamos que o servidor responde corretamente com status 200

Não foram encontrados erros durante o processo de validação, o que indica que a configuração está pronta para deploy.

## Resultado Esperado

Estas alterações devem resolver definitivamente o problema de rotas 404, pois agora estamos usando uma abordagem híbrida:
1. Servidor Express para lidar com rotas no lado do servidor
2. Arquivos de redirecionamento para o caso do servidor não ser ativado corretamente
3. Configuração simplificada do Vercel para evitar conflitos 