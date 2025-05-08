# Troubleshooting de Deploy na Vercel

Este documento detalha os problemas comuns encontrados durante o deploy de aplicações React com Vite na Vercel e suas soluções, com base na experiência do projeto AliTools B2B E-commerce.

## Problema de Página em Branco (White Screen)

### Descrição do Problema

Após o deploy na Vercel, a aplicação AliTools mostrava uma página completamente em branco, mesmo com status HTTP 200 OK. As ferramentas de desenvolvimento do navegador não mostravam erros de JavaScript, e o HTML base era carregado, mas não havia renderização do aplicativo React.

### Diagnóstico

Após análise detalhada, identificamos os seguintes problemas:

1. **Caminhos de Assets Incorretos**: Os arquivos JavaScript e CSS não estavam sendo carregados corretamente devido a problemas no mapeamento de rotas no `vercel.json`.

2. **Falta de Configuração SPA**: Como aplicação React é uma Single Page Application (SPA), todas as rotas devem redirecionar para o `index.html`, mas esta configuração estava faltando.

3. **Base URL Não Configurada**: O Vite precisa de uma configuração de base URL para garantir que os caminhos de assets sejam relativos à raiz do projeto.

4. **Gestão de Rotas para API/Cliente**: A configuração de rotas não discriminava adequadamente entre chamadas para API e requisições do cliente.

### Soluções Implementadas

#### 1. Configuração Correta do vercel.json

O arquivo `vercel.json` na raiz do projeto foi atualizado para mapear corretamente os assets e rotas:

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
    { "src": "/(.*)", "dest": "/client/dist/$1", "continue": true },
    { "src": "/(.*)", "dest": "/client/dist/index.html" }
  ],
  "env": {
    "NODE_ENV": "production"
  },
  "public": true
}
```

Explicação das rotas:
- `/api/(.*)`: Encaminha todas as chamadas de API para o backend Node.js
- `/assets/(.*)`: Mapeia diretamente para os assets estáticos compilados
- `/favicon.ico`: Mapeia para o favicon na pasta dist
- `/(.*), continue: true`: Tenta servir os arquivos estáticos diretamente
- `/(.*) -> index.html`: Fallback para todas as outras rotas, enviando para o index.html (crucial para SPAs)

#### 2. Configuração da Base URL no Vite

O arquivo `client/vite.config.js` foi atualizado para incluir a configuração de base URL:

```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  base: '/',  // Define a base URL para garantir caminhos relativos corretos
  server: {
    // ... outras configurações
  },
  resolve: {
    // ... outras configurações
  }
});
```

O parâmetro `base: '/'` garante que todos os caminhos de assets no HTML gerado serão relativos à raiz, necessário para o funcionamento correto na Vercel.

#### 3. Arquivo _redirects

Criamos um arquivo `_redirects` na pasta `client/public` como configuração redundante para garantir que o SPA funcione corretamente:

```
/* /index.html 200
```

Este arquivo instrui o servidor a redirecionar todas as rotas para o index.html com status 200, essencial para aplicações React com React Router.

#### 4. vercel.json específico para o Cliente

Adicionamos um `vercel.json` na pasta `client` para garantir configurações específicas para a parte frontend da aplicação:

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
  ]
}
```

Este arquivo adiciona:
- **Rewrites**: Redireciona todas as rotas para index.html (fundamental para SPAs)
- **Headers para Cache**: Otimiza o cache de assets estáticos
- **Headers de Segurança**: Adiciona cabeçalhos de segurança básicos

## Boas Práticas para Deploy de SPA React+Vite na Vercel

### 1. Estrutura de Build

Sempre execute o build antes do deploy:
```bash
cd client
npm run build
```

Certifique-se que a pasta `dist` contém:
- O arquivo `index.html`
- A pasta `assets` com arquivos JS e CSS
- Quaisquer arquivos estáticos (como `_redirects`)

### 2. Verificações antes do Deploy

- Confirme que o arquivo `vercel.json` está configurado corretamente
- Verifique se o `base` está definido no `vite.config.js`
- Certifique-se que todas as importações de assets usam caminhos relativos

### 3. Teste o Build Localmente

Antes de fazer deploy, teste o build localmente:
```bash
cd client
npm run build
npx serve -s dist
```

### 4. Deploy na Vercel

Para fazer o deploy corretamente:
```bash
# Na raiz do projeto
vercel --prod
```

## Resolução de Problemas Comuns

### Problema: Assets não carregam (404)

**Solução**: Verifique o mapeamento de rotas em `vercel.json` e certifique-se que o caminho para assets está correto.

### Problema: Roteamento não funciona após navegação direta para URL 

**Solução**: Adicione a configuração de rewrite para redirecionar todas as rotas para `index.html`.

### Problema: Erros CORS em chamadas de API

**Solução**: Certifique-se que sua configuração de CORS no backend está permitindo o domínio correto do frontend.

### Problema: Variáveis de ambiente não estão disponíveis

**Solução**: As variáveis de ambiente para o cliente precisam ser prefixadas com `VITE_` e configuradas no dashboard da Vercel.

## Verificações Pós-Deploy

Após o deploy, sempre teste:

1. Navegação entre páginas
2. Carregamento de assets (imagens, CSS, JS)
3. Chamadas de API
4. Comportamento ao abrir URLs diretas (não apenas a página principal)
5. Funcionamento em diferentes navegadores

---

Última atualização: 06/Maio/2025 