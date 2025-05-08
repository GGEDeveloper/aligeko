# Atualização de Logos no Header e Footer

## Descrição
Os logos da AliTools no header e footer foram aumentados em 300% para melhorar a visibilidade e presença da marca no site. Esta alteração afeta todos os tamanhos de logo disponíveis no componente Logo.jsx.

## Alterações Realizadas

### Componente Logo.jsx
- Aumentados os tamanhos de todos os logos em 300%:
  - small: 32px → 96px
  - medium: 40px → 120px
  - large: 48px → 144px

### Header
- Aumentado o padding do header principal para acomodar o logo maior
- Adicionado margem à direita do logo para melhor espaçamento
- Mantido o fundo preto conforme já implementado

### Footer
- Aumentado o tamanho mínimo das colunas de 250px para 300px
- Aumentada a margem após o logo de 1rem para 2rem

## Verificação Visual
Após o deploy, é importante verificar:
- Alinhamentos corretos no header e footer
- Responsividade em dispositivos móveis
- Que o logo não está cortado em nenhuma resolução

## Deployment
Estas alterações foram:
- Commitadas com a mensagem "feat: Aumentar tamanho dos logos em 300% no header e footer"
- Enviadas para a branch master
- Deployadas para produção em [URL do site]

## Ajustes Adicionais
Se houver necessidade de ajustes adicionais, considere:
- Verificar o comportamento responsivo em tablets e dispositivos móveis
- Ajustar o espaçamento conforme necessário para diferentes breakpoints 