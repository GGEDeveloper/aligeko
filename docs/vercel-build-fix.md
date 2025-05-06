# Solução para Erro "vite: command not found" no Vercel

Este documento detalha a solução implementada para resolver o erro "vite: command not found" durante o processo de deploy na plataforma Vercel.

## Problema Identificado

O deploy na Vercel estava falhando com o erro "vite: command not found" durante o processo de build, mesmo após várias tentativas de solução, incluindo:

1. Usar o prefixo `npx` nos comandos de build
2. Adicionar o Vite como dependência no package.json principal
3. Configurar scripts de build específicos para o Vercel

Após análise, identificamos que o problema estava relacionado à forma como o Vercel gerencia ambientes de build isolados quando há múltiplas configurações de build no arquivo `vercel.json`.

## Causa Raiz

O erro ocorria devido a três fatores principais:

1. **Ambientes de build isolados**: O Vercel cria ambientes de build separados para cada entrada no array `builds` do arquivo `vercel.json`. Isso significa que dependências instaladas em um contexto não estão disponíveis para outro.

2. **Dependências de desenvolvimento**: Em builds de produção, as `devDependencies` podem não ser instaladas automaticamente, o que causava o problema com o Vite, que estava definido como uma dependência de desenvolvimento.

3. **Configuração complexa**: Nossa configuração anterior tentava combinar um build Node.js para o servidor e um build estático para o cliente, o que criava conflitos de contexto durante a execução.

## Solução Aplicada na Versão 10.0

Implementamos uma solução em três partes:

### 1. Simplificação do `vercel.json`

Modificamos o arquivo para utilizar apenas uma única entrada de build, focando no servidor Express para servir tanto o backend quanto os arquivos estáticos do frontend:

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
    { "src": "/api/(.*)", "dest": "/index.js" },
    { "src": "/(.*)", "dest": "/index.js" }
  ],
  "env": {
    "NODE_ENV": "production"
  },
  "public": true
}
```

Esta configuração simplificada encaminha todas as requisições para o servidor Express, que é responsável por servir tanto as rotas da API quanto os arquivos estáticos da aplicação.

### 2. Melhoria do Script de Build

Atualizamos o script `vercel-build` no arquivo `package.json` raiz para garantir que as dependências do cliente sejam instaladas corretamente antes da compilação:

```json
"vercel-build": "npm install --prefix client && npm run build:client"
```

Esta abordagem garante que todas as dependências necessárias estejam disponíveis antes da execução do build do cliente.

### 3. Movendo Dependências Críticas

Movemos o Vite e o plugin React de `devDependencies` para `dependencies` no `package.json` do cliente:

```json
"dependencies": {
  // outras dependências...
  "@vitejs/plugin-react": "^4.2.0",
  "vite": "^5.0.0"
}
```

Isso garante que essas ferramentas essenciais para o build estejam sempre disponíveis, mesmo em ambientes de produção onde as dependências de desenvolvimento podem ser ignoradas.

## Problema Adicional: Conflito entre ESM e CommonJS

Após resolver o erro inicial "vite: command not found", enfrentamos um novo problema: o erro "exports is not defined" no navegador. Este erro ocorreu porque:

1. O Vercel detectou código ESM (ES Modules) e tentou convertê-lo para CommonJS
2. O navegador não reconhece a sintaxe CommonJS (como `Object.defineProperty(exports, "__esModule", {value: true})`)

### Solução Para Problema ESM/CommonJS na Versão 10.0

Para resolver este problema, implementamos as seguintes alterações:

1. **Adicionamos `"type": "module"` ao package.json principal:**
   ```json
   {
     "name": "alitools-b2b",
     "version": "1.0.0",
     "description": "AliTools B2B E-commerce Platform",
     "main": "index.js",
     "type": "module",
     ...
   }
   ```
   Isso indica explicitamente ao Node.js e ao Vercel que nosso código deve ser tratado como ES Modules.

2. **Convertemos o servidor Express (index.js) de CommonJS para ESM:**
   ```javascript
   // Antes (CommonJS)
   const express = require('express');
   const path = require('path');
   // ...
   module.exports = app;

   // Depois (ESM)
   import express from 'express';
   import { fileURLToPath } from 'url';
   import { dirname, join } from 'path';
   // ...
   export default app;
   ```

3. **Atualizamos scripts que usavam `require()` para usar importação dinâmica ESM:**
   ```javascript
   // Antes (CommonJS)
   "steps:report": "node -e \"try { const tracker = require('./tasks/step-tracker.js'); ... }\""

   // Depois (ESM)
   "steps:report": "node -e \"try { import('./tasks/step-tracker.js').then(tracker => { ... }) }\""
   ```

## Solução Definitiva na Versão 11.0

Apesar das soluções aplicadas na versão 10.0, ainda enfrentamos problemas na renderização do cliente. Em nossa abordagem final (Versão 11.0), implementamos as seguintes melhorias que resolveram definitivamente o problema:

### 1. Manter Configuração Simplificada do Vercel

Mantivemos a abordagem simplificada do `vercel.json`, evitando múltiplas configurações de build que poderiam causar conflitos:

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
    { "src": "/api/(.*)", "dest": "/index.js" },
    { "src": "/(.*)", "dest": "/index.js" }
  ],
  "env": {
    "NODE_ENV": "production"
  },
  "public": true
}
```

### 2. Adicionar "type": "module" ao package.json do Cliente

Além do package.json principal, adicionamos a configuração de módulo ES também ao package.json do cliente:

```json
{
  "name": "alitools-b2b-client",
  "version": "1.0.0",
  "description": "AliTools B2B E-commerce Platform - Client",
  "private": true,
  "type": "module",
  ...
}
```

### 3. Simplificar Configuração do Vite

Substituímos as configurações avançadas de build do Vite por uma configuração mais simples e estável:

```javascript
export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    minify: 'esbuild'  // Mais estável que terser em alguns casos
  },
  // ...outras configurações...
});
```

### 4. Melhorar Configuração do Servidor Express

Adicionamos configurações de cabeçalhos MIME específicos para garantir que cada tipo de arquivo seja servido corretamente:

```javascript
// Serve static files from the React app with explicit MIME types
app.use(express.static(join(__dirname, 'client/dist'), {
  setHeaders: (res, path) => {
    if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript; charset=UTF-8');
    } else if (path.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css; charset=UTF-8');
    } else if (path.endsWith('.html')) {
      res.setHeader('Content-Type', 'text/html; charset=UTF-8');
    }
  }
}));
```

### 5. Adicionar Configuração de CORS e Cache

Para melhorar a performance e evitar problemas de acesso:

```javascript
// Configurar cabeçalhos para prevenir problemas de CORS e cache
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Cache-Control', 'public, max-age=3600'); // Cache de 1 hora
  next();
});
```

### 6. Implementar .vercelignore

Adicionamos um arquivo .vercelignore para excluir arquivos desnecessários do deploy:

```
# Dependencies
**/node_modules

# Build files
client/.vite

# Log files
**/*.log*

# Local env files
.env.local
.env.development.local
.env.test.local
.env.production.local

# ...outras exclusões...
```

## Conclusão

A experiência deste deploy nos ensinou lições valiosas sobre a arquitetura de aplicações no Vercel:

1. **Simplificar é a Chave**: Manter uma configuração simples é geralmente mais confiável que tentar otimizações complexas.
2. **Consistência em Sistemas de Módulos**: Manter consistência entre ESM e CommonJS em todo o projeto é essencial.
3. **Configuração Explícita**: Sempre tornar explícitas as configurações de tipos MIME e cabeçalhos para garantir compatibilidade.
4. **Padrão de Servir Estáticos via Express**: Para aplicações de pilha completa, servir os arquivos estáticos pelo Express pode evitar problemas de compatibilidade.
5. **Minimizar a Transformação de Código**: Evitar situações onde o Vercel precise transformar o código (por exemplo, de ESM para CommonJS).

Esta abordagem não apenas resolve os problemas de build e renderização, mas também simplifica a arquitetura de deploy, tornando-a mais robusta e fácil de manter para atualizações futuras.

---

**Update (07/Maio/2025)**: Após a implementação bem-sucedida da solução descrita acima, o projeto foi migrado para um domínio personalizado e agora está disponível em [https://alitools-b2b.vercel.app](https://alitools-b2b.vercel.app).

Última atualização: 07/Maio/2025 