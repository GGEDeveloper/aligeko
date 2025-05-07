# AliTools B2B Deployment Guide

Este guia completo aborda todos os passos necessários para um deploy bem-sucedido do AliTools B2B na Vercel, incluindo resolução de problemas comuns.

## 📋 Requisitos Prévios

- Conta na Vercel (gratuita ou paga)
- Node.js versão 16+
- NPM 7+ ou Yarn 1.22+
- Git configurado
- Cliente Vercel instalado (`npm i -g vercel`)

## 🚀 Procedimento de Deploy Automático

Para um deploy mais consistente, utilize o script automatizado:

```bash
# Dar permissão de execução (apenas uma vez)
chmod +x ./deploy.sh

# Executar o script de deploy
./deploy.sh
```

O script realiza:
1. Instalação de dependências
2. Build da aplicação
3. Verificação de problemas comuns
4. Deploy automático na Vercel

## 🛠️ Procedimento de Deploy Manual

### 1. Preparar o Ambiente

```bash
# Instalar dependências do projeto raiz
npm install

# Instalar dependências do cliente
cd client && npm install
```

### 2. Construir o Front-end

```bash
# Na pasta client
npm run build
```

### 3. Verificar a Configuração da Vercel

Certifique-se de que o arquivo `vercel.json` na raiz está corretamente configurado:

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

### 4. Deploy na Vercel

```bash
# Da raiz do projeto
vercel --prod
```

## 🔍 Resolução de Problemas Comuns

### Páginas em Branco

Se o site apresentar páginas em branco após o deploy:

1. **Verifique o MIME Type**: Certifique-se que o servidor Express em `index.js` está servindo os arquivos com o MIME type correto:

```javascript
app.use(express.static(join(__dirname, 'client/dist'), {
  setHeaders: (res, path) => {
    if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript; charset=UTF-8');
    } else if (path.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css; charset=UTF-8');
    }
  }
}));
```

2. **SPA Routing**: Configure o Express para redirecionar todas as solicitações para index.html:

```javascript
// Importante para SPA routing
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'client/dist', 'index.html'));
});
```

### Problemas de Carregamento de Recursos

Caso haja erros 404 para arquivos JS/CSS:

1. **Verifique a Configuração Base no Vite**: Em `client/vite.config.js`, certifique-se que:
```javascript
export default defineConfig({
  // ... outras configurações
  base: '/',
  // ...
});
```

2. **Ajuste as Tags Script/Link**: Certifique-se que os caminhos no HTML são relativos e não absolutos.

### Erros no Vercel Build

Se o build falhar na Vercel:

1. **Verifique os Scripts**: Confirme que o package.json tem o script `vercel-build` configurado:
```json
"scripts": {
  "vercel-build": "cd client && npm install && npm run build"
}
```

2. **Versão do Node**: Use o `.nvmrc` ou `engines` no package.json para especificar a versão do Node.

3. **Variáveis de Ambiente**: Configure todas as variáveis necessárias no dashboard da Vercel.

### Problemas de Roteamento

Caso as rotas internas não funcionem após navegação:

1. **Verifique o Rewrite da Vercel**: Certifique-se que o `vercel.json` contém a regra de rewrite para SPA:
```json
"routes": [
  { "src": "/(.*)", "dest": "/index.js" }
]
```

2. **Client-side Routing**: Certifique-se que o React Router está configurado corretamente.

### CORS e Problemas de API

Se a API não funcionar no ambiente de produção:

1. **Configure o CORS corretamente**:
```javascript
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? 'https://seu-dominio.vercel.app' 
    : 'http://localhost:3000'
}));
```

## 🔄 Comandos Úteis para Manutenção

```bash
# Verificar logs de deploy
vercel logs

# Inspecionar implantações 
vercel list

# Rollback para versão anterior
vercel rollback
```

## 📊 Monitoramento de Performance

Após o deploy, monitore:

1. **Lighthouse Score**: Execute testes de Lighthouse para verificar performance
2. **Vercel Analytics**: Ative o Analytics no dashboard da Vercel
3. **Console Errors**: Verifique erros no console do navegador

## 🛑 Problemas Persistentes?

1. **Acesse os Logs**: `vercel logs` para ver logs detalhados
2. **Crie um Build Local**: Compare o build local com o comportamento na Vercel
3. **Teste em Ambiente de Preview**: Faça deploy em ambiente de preview antes do prod

---

Este guia é mantido pela equipe do AliTools B2B. Última atualização: Junho 2023. 