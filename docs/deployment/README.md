# AliTools B2B Deployment Tools

Este repositório inclui um conjunto completo de ferramentas para automatizar e facilitar o processo de deploy na Vercel. Esta documentação mostra como usar essas ferramentas de forma eficaz.

## 📑 Visão Geral das Ferramentas

O projeto inclui as seguintes ferramentas de deploy:

1. **Express Server**: Configurado para servir arquivos estáticos com MIME types corretos
2. **Deploy Script**: Script automatizado para validar e implantar 
3. **Environment Check**: Ferramenta para verificar problemas comuns de configuração
4. **Vercel Configuration**: Configuração otimizada para single-page applications

## 🚀 Comandos de Deploy

Para facilitar o processo de deploy, adicionamos os seguintes scripts no `package.json`:

| Comando               | Descrição                                          |
|-----------------------|----------------------------------------------------|
| `npm run check:env`   | Verifica a configuração do ambiente                |
| `npm run predeploy`   | Executa automaticamente antes de `deploy`          |
| `npm run deploy`      | Executa o script completo de deploy                |
| `npm run deploy:vercel` | Deploy direto na Vercel                          |
| `npm run vercel:logs` | Verifica logs do último deploy                     |
| `npm run vercel:list` | Lista todas as implantações                        |

## 📋 Processo Recomendado

Para garantir um deploy bem-sucedido, recomendamos seguir o seguinte processo:

1. **Verificar Ambiente**:
   ```bash
   npm run check:env
   ```
   
   Isso verificará possíveis problemas de configuração. Corrija os problemas identificados antes de prosseguir.

2. **Deploy Completo**:
   ```bash
   npm run deploy
   ```
   
   Este comando executará todas as verificações necessárias, fará o build e implantará na Vercel.

## 🔍 Ferramentas de Diagnóstico

Em caso de problemas, utilize:

```bash
npm run vercel:logs
```

## 📚 Documentação Adicional

Para obter informações mais detalhadas sobre o processo de deploy e resolução de problemas:

- [Guia de Deploy](./deployment-guide.md) - Guia detalhado de deploy
- [Troubleshooting](./deployment_troubleshooting.md) - Resolução de problemas comuns
- [Correções de Routing](./vercel-routing-fix.md) - Soluções para problemas de routing

## ⚙️ Operações (Ops)

O projeto define operações padronizadas para tarefas comuns:

- **op1**: Deploy básico na Vercel (build, commit, push, deploy)
- **op2**: Processo de deploy aprimorado com validação

Para utilizar, solicite "execute op2" ao assistente, que realizará o processo completo de validação e deploy.

## 🔧 Desenvolvimento Local

Para testar o build localmente:

```bash
# Instalar dependências
npm run install:all

# Build do cliente
npm run build:client

# Iniciar servidor localmente
npm start
```

Acesse o aplicativo em `http://localhost:3000` para validar antes do deploy na Vercel.

# Deployment Documentation

This directory contains documentation related to deploying the AliTools B2B platform.

## Key Documents

- [Deployment Guide](./deployment-guide.md) - Step-by-step instructions for deploying the application to Vercel
- [Environment Configuration](./environment-config.md) - Setting up environment variables for different environments
- [Vercel Dynamic Imports](./vercel-dynamic-imports.md) - Handling of dynamic imports in Vercel environment
- [Vercel Build Fixes](./vercel-build-fix.md) - Solutions for common build issues on Vercel
- [Vercel Routing Fixes](./vercel-routing-fix.md) - Solutions for routing issues on Vercel
- [Deployment Troubleshooting](./deployment-troubleshooting.md) - Diagnosing and resolving common deployment problems

## Recent Deployment Changes

- **May 2023**: Updated Vercel configuration to simplify routing and improve asset handling
- **April 2023**: Fixed issues with dynamic imports and helmet package dependencies
- **March 2023**: Added detailed environment variable configuration guide

## Vercel Configuration Quick Reference

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

## Deployment Checklist

- [ ] Build client application (`cd client && npm run build`)
- [ ] Verify environment variables in Vercel dashboard
- [ ] Review CORS configuration for API endpoints
- [ ] Confirm all required packages are in root package.json
- [ ] Deploy with `vercel --prod`
- [ ] Verify successful deployment by checking key pages and API endpoints 