# Implementação de Páginas de Contato, Sobre Nós e Ajuda

## Descrição
As páginas de contato (Contato), informações sobre a empresa (Sobre Nós) e ajuda (Ajuda) foram criadas e atualizadas para oferecer aos usuários acesso a informações importantes sobre a empresa e recursos de suporte, corrigindo os erros 404 que ocorriam anteriormente.

## Alterações Implementadas

### 1. Rotas Atualizadas
- Adicionadas as rotas corretas no `App.jsx`:
  - `/sobre-nos` → Página Sobre Nós
  - `/contato` → Página de Contato
  - `/ajuda` → Página de Ajuda/FAQ

### 2. Componentes Criados/Melhorados
- **SobreNos.jsx**: Design melhorado com seções para missão, visão e informações da empresa
- **Contato.jsx**: Formulário de contato refinado com validação e melhor layout de informações
- **Ajuda.jsx**: Nova página com perguntas frequentes e recursos de ajuda

### 3. Correção de Links no Header
- Os links na navegação principal foram atualizados para apontar para os URLs corretos
- Corrigido o link de "Contactos" de `/contactos` para `/contato`
- Atualizada a navegação móvel para corresponder às mesmas URLs

### 4. Características Principais

#### Página Sobre Nós:
- Layout moderno com seções distintas
- Exibição de informações básicas da empresa
- Seções para missão e visão
- Exibição de redes sociais quando disponíveis
- Design responsivo para todos os dispositivos

#### Página de Contato:
- Formulário de contato com validação de campos
- Feedback visual para campos com erro
- Confirmação de envio de mensagem
- Exibição organizada de informações de contato
- Integração com API de informações da empresa

#### Página de Ajuda/FAQ:
- Lista de perguntas frequentes em formato expansível
- Seção de contato para suporte adicional
- Design consistente com a identidade visual do site
- Links para recursos relacionados

## Tecnologias Utilizadas
- React.js para a interface
- React Router para navegação
- Tailwind CSS para estilos
- Axios para chamadas de API
- Validação de formulários personalizada
- Componentes reutilizáveis (ícones, botões, cards)

## Padrões de UX Implementados
- Consistência visual entre as páginas
- Feedback imediato para ações do usuário
- Estados de carregamento durante requisições
- Mensagens de erro claras em formulários
- Cores e estilos alinhados com a identidade da marca
- Acessibilidade (contrastes, textos alternativos)

## Próximos Passos
- Implementar um mapa interativo na página de contato
- Adicionar recursos de busca na página de ajuda
- Implementar um chat ao vivo para suporte
- Criar uma galeria de fotos na página Sobre Nós
- Automatizar o envio real de e-mails no formulário de contato 