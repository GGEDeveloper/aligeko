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

## Solução Implementada

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

## Testes e Validação

Após implementar essas mudanças, realizamos um teste local do processo de build com o comando:

```bash
npm run vercel-build
```

O resultado foi bem-sucedido, confirmando que nossa solução resolveu o problema:

1. As dependências do cliente foram instaladas corretamente
2. O build do Vite foi executado sem erros
3. Os arquivos foram gerados na pasta `client/dist` conforme esperado

## Recomendações Adicionais

1. **Uso do Express Server**: Manter a abordagem simplificada usando o Express para servir tanto a API quanto os arquivos estáticos.

2. **Monitoramento de Builds**: Monitorar os logs de build no Vercel para identificar rapidamente quaisquer problemas futuros.

3. **Versionamento de Dependências**: Considerar fixar as versões exatas das dependências críticas para evitar problemas de compatibilidade em futuros deploys.

4. **Cache de Build**: Configurar apropriadamente o cache de build no Vercel para melhorar o tempo de deploy.

## Conclusão

A solução implementada resolve o problema "vite: command not found" ao simplificar a configuração de build e garantir que todas as dependências necessárias estejam disponíveis no momento correto do processo de deploy.

Esta abordagem não apenas resolve o problema imediato, mas também simplifica a arquitetura de deploy, tornando-a mais robusta para atualizações futuras.

---

Última atualização: 07/Maio/2025 