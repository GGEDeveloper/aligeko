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