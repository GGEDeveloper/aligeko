# Dependências em Imports Dinâmicos no Vercel

Este documento descreve um problema comum em deployments na Vercel relacionado a dependências em módulos importados dinamicamente e sua solução, baseado na experiência com a aplicação AliTools B2B E-commerce.

## Problema: Dependências em Imports Dinâmicos

### Descrição do Problema

Quando utilizamos imports dinâmicos no JavaScript (via `import()`) em um ambiente serverless como o Vercel, as dependências do módulo importado dinamicamente precisam estar disponíveis no contexto de execução do módulo que faz a importação.

No nosso caso específico, tivemos o seguinte cenário:

1. O módulo raiz (`index.js`) importava dinamicamente o módulo do servidor (`server/src/index.js`)
2. O módulo do servidor usava a dependência `helmet` (para segurança HTTP)
3. A dependência `helmet` estava corretamente definida no `package.json` do servidor
4. No entanto, quando implantado na Vercel, recebíamos o erro: `Cannot find module 'helmet'`

```javascript
// index.js (raiz)
app.use('/api', (req, res) => {
  // Importação dinâmica do módulo do servidor
  import('./server/src/index.js').then(serverModule => {
    serverModule.default(req, res);
  }).catch(err => {
    console.error('Error loading server module:', err);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
  });
});

// server/src/index.js
import express from 'express';
import cors from 'cors';
import helmet from 'helmet'; // 👈 Esta dependência causa o erro
// ... resto do código
```

### Por que isso acontece?

No ambiente serverless da Vercel, quando um módulo é importado dinamicamente:

1. O ambiente de execução é construído a partir do `package.json` do módulo que faz a importação (no caso, o da raiz)
2. As dependências listadas apenas no `package.json` do módulo importado dinamicamente não são instaladas automaticamente
3. Quando o módulo importado tenta usar uma dependência que não está no contexto de execução, ocorre o erro `Cannot find module`

## Solução: Duas Abordagens Possíveis

### Solução 1: Adicionar Dependências Compartilhadas à Raiz (Implementada)

A solução mais simples é adicionar as dependências necessárias para o módulo importado no `package.json` da raiz:

```json
// package.json (raiz)
{
  "dependencies": {
    "express": "^4.21.2",
    "cors": "^2.8.5",
    "helmet": "^7.1.0" // Adicionado para resolver o problema
  }
}
```

**Prós:**
- Implementação rápida
- Não requer alterações na estrutura do código
- Funciona com configurações simples de vercel.json

**Contras:**
- Duplicação de dependências entre projetos
- Pode levar a problemas se as versões entre os projetos divergirem
- Falta de clareza sobre quais módulos realmente precisam da dependência

### Solução 2: Reestruturar a Configuração do Vercel (Alternativa)

Uma abordagem mais robusta é ajustar a configuração do Vercel para tratar o servidor como um build separado:

```json
// vercel.json
{
  "version": 2,
  "builds": [
    { "src": "server/dist/index.js", "use": "@vercel/node" },
    { "src": "client/dist/**", "use": "@vercel/static" }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "server/dist/index.js" },
    { "src": "/(.*)", "dest": "client/dist/$1" }
  ]
}
```

Nesta configuração, o Vercel trata o servidor como um build independente, com seu próprio `package.json` e dependências.

## Melhores Práticas para Evitar Este Problema

1. **Princípio da Dependência Única**: Evite ter múltiplos arquivos `package.json` em um projeto serverless. Se necessário, use um monorepo com uma gestão de dependências centralizada.

2. **Declaração Explícita de Dependências**: Certifique-se de que todas as dependências estejam declaradas no `package.json` principal que será usado no ambiente de execução.

3. **Hoisting de Dependências**: Se estiver usando Yarn Workspaces ou npm Workspaces, configure o hoisting de dependências para garantir que dependências comuns sejam instaladas na raiz.

4. **Teste Local com Simulação Serverless**: Teste localmente com ferramentas como `vercel dev` para detectar problemas de dependência antes do deploy.

5. **Verificação de Logs**: Após o deploy, verifique cuidadosamente os logs da Vercel para identificar problemas de dependência.

## Configuração Recomendada para AliTools B2B

A configuração atual do AliTools B2B utiliza a Solução 1, onde adicionamos as dependências necessárias do servidor ao `package.json` da raiz:

```javascript
// Dependências compartilhadas adicionadas à raiz
"dependencies": {
  "chalk": "^5.3.0",
  "concurrently": "^8.0.1",
  "cors": "^2.8.5",
  "dotenv": "^16.0.3",
  "express": "^4.21.2",
  "helmet": "^7.1.0"  // Adicionado para resolver o erro
}
```

Essa solução é adequada para o estágio atual do projeto. Para uma refatoração futura, considere adotar uma das seguintes abordagens:

1. **Migrar para uma estrutura unificada**: Consolidar as configurações do servidor e cliente em um único package.json
2. **Usar NX ou Turborepo**: Adotar ferramentas de monorepo mais robustas que gerenciam dependências de forma mais eficiente
3. **Implementar a Solução 2**: Reestruturar a configuração do Vercel para tratar server e client como builds independentes

## Verificação da Solução

Após implementar a Solução 1 (adicionar helmet ao package.json raiz), os seguintes passos foram realizados para verificar a correção:

1. Atualização local do código
2. Commit e push para o repositório
3. Deploy para a Vercel usando `vercel --prod`
4. Teste da página de produtos para verificar se as chamadas de API funcionam
5. Verificação de logs da Vercel para confirmar que não há erros de dependência
6. Documentação da solução para referência futura

## Recursos Adicionais

- [Documentação Oficial do Vercel sobre Builds](https://vercel.com/docs/concepts/deployments/builds)
- [Vercel Serverless Functions](https://vercel.com/docs/concepts/functions/serverless-functions)
- [Guia Sobre Dynamic Imports](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import)
- [Melhores Práticas para Monorepos na Vercel](https://vercel.com/guides/manage-monorepos-with-vercel) 