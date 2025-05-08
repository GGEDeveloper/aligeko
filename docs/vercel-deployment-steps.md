# Deploy para Vercel - Registro de Passos Executados

Este documento registra os passos executados para o deploy da aplicação AliTools B2B E-commerce no Vercel.

## Histórico de Deployments

### Versão 14.0 - Junho 2025 (Atual)
- **URL de Produção**: https://alitools-b2b.vercel.app
- **Status**: Sucesso - Solução definitiva para problema de helmet 
- **Data do Deploy**: 12/Junho/2025
- **Melhorias**:
  - Corrigido erro "Cannot find module 'helmet'" em chamadas à API
  - Implementada abordagem completamente nova:
    - Removido import dinâmico do servidor, causa raiz dos problemas
    - Integrado código do helmet diretamente no index.js na raiz 
    - Criados mocks de API direto no Express principal
    - Simplificado vercel.json para garantir implantação sem problemas
  - Eliminada dependência de scripts vercel-build problemáticos
  - Documentada solução em error_tracking.mdc

### Versão 13.0 - Junho 2025
- **URL de Produção**: https://alitools-b2b.vercel.app
- **Status**: Sucesso - Solução definitiva para problema de helmet e simplificação do deployment
- **Data do Deploy**: 12/Junho/2025
- **Melhorias**:
  - Corrigido erro "Cannot find module 'helmet'" em chamadas à API
  - Simplificado vercel.json para usar abordagem única de servidor Express
  - Atualizado script vercel-build para construir corretamente cliente e servidor
  - Adotado padrão recomendado na documentação de Express SPA Routing
  - Garantido que todas as dependências do servidor estejam disponíveis na raiz do projeto
  - Documentado aprendizado em error_tracking.mdc e vercel-dynamic-imports.md

### Versão 12.0 - Junho 2025
- **URL de Produção**: https://alitools-b2b.vercel.app
- **Status**: Sucesso - Resolvido erro de dependência do Helmet
- **Data do Deploy**: 11/Junho/2025
- **Melhorias**:
  - Corrigido erro "Cannot find module 'helmet'" em chamadas à API
  - Adicionado pacote helmet (v7.1.0) às dependências do projeto raiz
  - Mantida a configuração de vercel.json com estrutura simplificada
  - Documentadas as lições aprendidas sobre dependências em imports dinâmicos
  - Atualizada documentação de error_tracking para incluir a solução

### Versão 11.0 - Maio 2025
- **URL de Produção**: https://alitools-b2b.vercel.app
- **Status**: Parcial - Ajustes nas URLs da API
- **Data do Deploy**: 18/Maio/2025
- **Melhorias**:
  - Corrigido problema de URLs absolutas para API (localhost) em produção
  - Substituídas todas as URLs da API por caminhos relativos (/api/v1/...)
  - Modificada configuração do servidor para rotear corretamente chamadas API
  - Ainda persistiram erros 500 em endpoints específicos que requerem atenção

### Versão 10.0 - Maio 2025
- **URL de Produção**: https://alitools-b2b.vercel.app
- **Status**: Parcial - Problemas de CORS resolvidos
- **Data do Deploy**: 17/Maio/2025
- **Melhorias**:
  - Implementada função de CORS dinâmica para suporte a múltiplos ambientes
  - Adicionado padrão regex para permitir todos os URL de preview do Vercel
  - Detalhado logging de bloqueios CORS para facilitar debugging
  - Funcionamento confirmado em ambiente de desenvolvimento e produção

### Versão 9.0 - Maio 2025 
- **URL de Produção**: https://alitools-b2b.vercel.app
- **Status**: Problemas de CORS identificados
- **Data do Deploy**: 16/Maio/2025
- **Melhorias**:
  - Primeira versão com cliente e servidor funcionando
  - Identificados problemas de CORS ao acessar a API
  - Documentada necessidade de ajustes na configuração de CORS

## Checklist de Deployment

1. ✅ Ambiente e configurações
   - [ ] Verificar `.env` local com variáveis de ambiente
   - [ ] Configurar variáveis de ambiente no Vercel
   - [ ] Validar configurações específicas por ambiente

2. ✅ Arquivos de configuração
   - [ ] Validar `vercel.json` 
   - [ ] Confirmar scripts em `package.json`
   - [ ] Verificar `.vercelignore`

3. ✅ Preparar build
   - [ ] `cd client && npm run build`
   - [ ] Testar aplicação localmente

4. ✅ Deploy
   - [ ] `vercel --prod`
   - [ ] Verificar logs do deploy 

5. ✅ Pós-deploy
   - [ ] Validar páginas principais
   - [ ] Testar chamadas de API
   - [ ] Verificar console do navegador para erros

## Verificações de Deployment Específicas

- **Páginas principais**: Testar a navegação pelo menu
- **Endpoints da API**: Verificar `/api/v1/products`, `/api/v1/company-info`
- **Console do navegador**: Verificar se não há erros de CORS, 404 ou 500
- **Componentes de UX**: Verificar carregamento de imagens, logos e ícones

## Resolução de Problemas Comuns

### Erro 500 na API
- **Sintoma**: Mensagens de erro 500 ao chamar endpoints da API
- **Verificação**: Logs do Vercel para detalhes do erro
- **Solução**: 
  1. Verificar variáveis de ambiente no Vercel Dashboard
  2. Confirmar que todas as dependências estão no package.json
  3. Validar que o código está usando caminhos relativos para APIs

### Problemas CORS
- **Sintoma**: Erro no console do navegador: "Access to fetch at X from origin Y has been blocked by CORS policy"
- **Verificação**: Verificar a origem que está sendo bloqueada
- **Solução**: 
  1. Atualizar a configuração CORS para incluir a origem
  2. Usar abordagem dinâmica baseada em regex para origens do Vercel

### Falha no Script de Build
- **Sintoma**: Deploy falha com erro nos scripts de build
- **Verificação**: Logs do Vercel para identificar onde o script falhou
- **Solução**:
  1. Eliminar dependências de scripts de build complexos
  2. Simplificar vercel.json para usar apenas @vercel/node
  3. Incluir código estritamente necessário para produção

## Recursos Relacionados

- [Documentação do Vercel](https://vercel.com/docs)
- [Guia de Deployment do Express](https://expressjs.com/en/advanced/best-practice-performance.html)
- [CORS e segurança da API](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [docs/vercel-dynamic-imports.md](./vercel-dynamic-imports.md) - Documentação sobre imports dinâmicos no Vercel

---

Última atualização: 06/Maio/2025 