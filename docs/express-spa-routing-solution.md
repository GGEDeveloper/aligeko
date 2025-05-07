# Solução Definitiva para Roteamento SPA com Express

Este documento descreve a implementação de uma solução robusta para o problema de roteamento em aplicações Single Page Application (SPA) usando Express.js como servidor.

## Problema Resolvido

O problema de roteamento SPA ocorre quando um usuário tenta acessar uma rota diretamente pela URL (por exemplo, digitando `https://alitools-b2b.vercel.app/sobre-nos` no navegador) e recebe um erro 404. Isso acontece porque:

1. Quando um cliente solicita uma URL específica, o servidor procura um arquivo com esse caminho
2. Em SPAs, essas rotas não correspondem a arquivos físicos, mas são tratadas pelo React Router no cliente
3. Portanto, o servidor precisa ser configurado para enviar o `index.html` para todas as rotas, permitindo que o React Router assuma o controle no lado do cliente

## Solução Implementada

### 1. Servidor Express.js

Criamos um arquivo `index.js` na raiz do projeto que implementa um servidor Express completo:

```javascript
// Simple Express server for SPA
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import cors from 'cors';

// ES Module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Configure CORS
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://alitools-b2b.vercel.app', 'https://aligekow-iwznrnlz0-alitools-projects.vercel.app'] 
    : 'http://localhost:3000',
  credentials: true
}));

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
    
    // Add cache headers for static assets
    if (path.includes('/assets/')) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    } else {
      res.setHeader('Cache-Control', 'public, max-age=3600'); // 1 hour for other files
    }
  }
}));

// API routes - redirect to server
app.use('/api', (req, res) => {
  // Redirect API calls to the server directory
  import('./server/index.js').then(serverModule => {
    // Forward the request to the server module
    serverModule.default(req, res);
  }).catch(err => {
    console.error('Error loading server module:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  });
});

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'client/dist/index.html'));
});

const port = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

// Export for Vercel
export default app;
```

Este servidor implementa:

1. **MIME Types Explícitos**: Define os tipos MIME corretos para cada tipo de arquivo
2. **Cabeçalhos de Cache**: Configura caching adequado para melhorar performance
3. **Redirecionamento de API**: Encaminha chamadas de API para o servidor Node.js
4. **Catchall para SPA**: Redireciona todas as outras rotas para o index.html

### 2. Configuração Simplificada do Vercel

Simplificamos o arquivo `vercel.json` para direcionar todas as solicitações para o servidor Express:

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
    { "src": "/(.*)", "dest": "/index.js" }
  ],
  "env": {
    "NODE_ENV": "production"
  },
  "public": true
}
```

### 3. Arquivos de Fallback (Redundantes mas mantidos por segurança)

Mantivemos os seguintes arquivos para garantir compatibilidade e redundância:

- **_redirects**: Para hospedagens como Netlify
- **web.config**: Para servidores IIS/Microsoft
- **static.json**: Para hospedagens como Heroku
- **404.html**: Página de fallback para redirecionamento
- **netlify.toml**: Configuração específica para Netlify

## Razões para Esta Abordagem

1. **Servidor Universal**: Um único servidor Express gerencia tanto o backend quanto o frontend
2. **Controle Explícito**: Controle detalhado sobre cabeçalhos, MIME types e cache
3. **Consistência de Módulos**: Mantém consistência no uso de ES Modules com `type: "module"` no package.json
4. **Prevenção de Transformação**: Evita que a Vercel transforme código entre ESM e CommonJS
5. **Arquitetura Clara**: Separa claramente as responsabilidades entre cliente, servidor e API

## Vantagens Sobre Abordagens Anteriores

1. **Sem Dependência de Configuração de Hospedagem**: Funciona independentemente das configurações específicas da plataforma
2. **Maior Controle sobre Cabeçalhos**: Permite configurar cabeçalhos HTTP específicos para melhorar segurança e performance
3. **Flexibilidade para API**: Facilita a adição de novas rotas de API sem modificar a configuração de deploy
4. **Desenvolvimento Local Consistente**: O mesmo servidor Express pode ser usado tanto em desenvolvimento quanto em produção

## Possíveis Melhorias Futuras

1. **Compressão**: Adicionar compressão gzip/brotli para arquivos estáticos
2. **Lazy Loading**: Implementar carregamento lazy de módulos para melhorar tempos de inicialização
3. **Monitoramento**: Adicionar middleware para monitoramento de performance e erros
4. **SSR/SSG**: Considerar renderização do lado do servidor para melhorar SEO 