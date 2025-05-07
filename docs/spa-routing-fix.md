# Correção de Rotas SPA (Single Page Application)

## Descrição
Este documento detalha as alterações feitas para corrigir os erros 404 que ocorriam ao acessar diretamente páginas como "Sobre Nós", "Contato" e "Ajuda" ou atualizar essas páginas no navegador.

## Problema
Ao usar React Router para navegação client-side, o servidor não reconhecia rotas como `/sobre-nos`, `/contato` e `/ajuda` quando acessadas diretamente (digitando a URL ou atualizando a página). Isso ocorria porque o servidor procurava por arquivos físicos correspondentes a essas rotas em vez de enviar o `index.html` principal e deixar o React Router lidar com o roteamento no lado do cliente.

## Solução Implementada

### 1. Arquivos de Configuração para Hospedagem SPA

- **Vercel.json**: Configurado para redirecionar todas as rotas não-API para o arquivo index.html, permitindo que o React Router faça o roteamento corretamente.
  ```json
  {
    "routes": [
      { "src": "/api/(.*)", "dest": "/server/index.js" },
      { "src": "/(.*)", "dest": "/client/dist/index.html" }
    ]
  }
  ```

- **_redirects**: Adicionado arquivo para hospedagens como Netlify.
  ```
  /*    /index.html   200
  ```

- **web.config**: Adicionado para servidores IIS/Microsoft.
  ```xml
  <rule name="React Routes">
    <action type="Rewrite" url="/index.html" />
  </rule>
  ```

- **static.json**: Para hospedagens como Heroku.
  ```json
  {
    "routes": {
      "/**": "index.html"
    }
  }
  ```

- **404.html**: Página de fallback para redirecionamento.
  ```html
  <script>
    // Redireciona para a rota correta
    var l = window.location;
    l.replace(
      l.protocol + '//' + l.hostname + (l.port ? ':' + l.port : '') +
      '/' + (l.pathname.indexOf('sobre-nos') > -1 ? 'sobre-nos' : 
             l.pathname.indexOf('contato') > -1 ? 'contato' : 
             l.pathname.indexOf('ajuda') > -1 ? 'ajuda' : '') +
      (l.search ? l.search : '') +
      (l.hash ? l.hash : '')
    );
  </script>
  ```

- **netlify.toml**: Configuração específica para Netlify.
  ```toml
  [[redirects]]
    from = "/*"
    to = "/index.html"
    status = 200
  ```

### 2. Ajustes nos Diretórios de Build

- Corrigido o diretório de saída no `vercel.json` para usar `dist` (usado pelo Vite) em vez de `build`.
- Configurado o `package.json` para garantir que o script de build funcionasse corretamente.

### 3. Links no Header

- Verificados e corrigidos todos os links no componente Header para garantir que estavam apontando para as rotas corretas.

## Como Testar

As páginas agora podem ser acessadas de várias formas sem erros 404:

1. **Navegação Normal**: Clicando nos links do cabeçalho.
2. **URL Direta**: Digitando URLs como `/sobre-nos`, `/contato` ou `/ajuda` diretamente.
3. **Atualizando a Página**: Pressionando F5 ou atualizando o navegador em qualquer página.

## Considerações Futuras

- Implementar uma estratégia de cache mais avançada para arquivos estáticos.
- Considerar Server-Side Rendering (SSR) ou Static Site Generation (SSG) para melhorar o SEO e desempenho inicial.
- Adicionar monitoramento para avaliar tempos de carregamento e experiência do usuário. 