# AliTools Design System

Este documento descreve o sistema de design AliTools, seus componentes e como utilizá-los no desenvolvimento frontend.

## Visão Geral

O sistema de design AliTools foi implementado seguindo as diretrizes de marca definidas durante o processo de branding. Ele fornece tokens de design consistentes, componentes reutilizáveis e padrões de estilo unificados para toda a aplicação.

## Estrutura de Arquivos

```
client/src/assets/styles/
├── design-tokens/           # Tokens de design fundamentais
│   ├── colors.css           # Sistema de cores
│   ├── typography.css       # Sistema tipográfico
│   ├── spacing.css          # Sistema de espaçamento e layout
│   ├── breakpoints.css      # Breakpoints responsivos
│   └── index.css            # Arquivo principal que importa todos os tokens
├── themes/                  # Configurações de tema (claro/escuro)
└── README.md                # Esta documentação
```

## Tokens de Design

Os tokens de design formam a base do sistema de design AliTools e são implementados como variáveis CSS. Eles são usados diretamente ou através das classes e componentes do Tailwind.

### Cores

As cores AliTools são definidas em `design-tokens/colors.css` e são organizadas em categorias:

- **Primárias**: Preto (`#1A1A1A`)
- **Marca**: Amarelo/Dourado (`#FFCC00`)
- **Neutras**: Branco, tons de cinza, preto
- **Semânticas**: Sucesso, alerta, erro, informação

#### Uso no Tailwind:

```jsx
// Uso com classes Tailwind
<button className="bg-brand text-primary">Botão AliTools</button>

// Com variantes
<div className="bg-brand-600">Fundo escuro da marca</div>
```

#### Uso com CSS Vars:

```css
.elemento-personalizado {
  background-color: var(--color-brand);
  color: var(--color-primary);
}
```

### Tipografia

O sistema tipográfico AliTools está definido em `design-tokens/typography.css` e inclui:

- **Famílias de fontes**: Inter (sans-serif)
- **Tamanhos de fonte**: xs, sm, base, lg, xl, 2xl, 3xl, 4xl, 5xl, 6xl
- **Pesos de fonte**: thin, light, normal, medium, semibold, bold, etc.
- **Alturas de linha**: none, tight, snug, normal, relaxed, loose
- **Espaçamento de letras**: tighter, tight, normal, wide, wider, widest

#### Uso:

```jsx
// Com classes Tailwind
<h1 className="text-3xl font-bold">Título AliTools</h1>

// Com classes personalizadas
<h1 className="heading-1">Título AliTools</h1>
```

### Espaçamento

O sistema de espaçamento AliTools está definido em `design-tokens/spacing.css` e inclui:

- **Escala de espaçamento**: 0, 1, 2, 3, 4, etc. (baseado em 4px)
- **Tamanhos de componentes**: alturas de input, botões, ícones
- **Raios de borda**: none, sm, md, lg, xl, 2xl, 3xl, full
- **Índices Z**: base, raised, dropdown, sticky, fixed, modal, etc.

#### Uso:

```jsx
// Com classes Tailwind
<div className="p-4 m-6 rounded-lg">Conteúdo com espaçamento</div>

// Com variáveis CSS
<style jsx>{`
  .elemento-personalizado {
    padding: var(--spacing-4);
    margin: var(--spacing-6);
    border-radius: var(--radius-lg);
  }
`}</style>
```

### Breakpoints

Os breakpoints responsivos AliTools estão definidos em `design-tokens/breakpoints.css`:

- **xs**: 480px
- **sm**: 640px
- **md**: 768px
- **lg**: 1024px
- **xl**: 1280px
- **2xl**: 1536px

#### Uso:

```jsx
// Com Tailwind
<div className="w-full md:w-1/2 lg:w-1/3">Responsivo</div>

// Com CSS
@media (min-width: var(--breakpoint-md)) {
  .elemento-responsivo {
    width: 50%;
  }
}
```

## Configuração do Tailwind

O Tailwind está configurado para usar os tokens de design AliTools. Veja `tailwind.config.js` para mais detalhes sobre como os tokens são mapeados para classes Tailwind.

## Melhores Práticas

1. **Use tokens em vez de valores literais**: Sempre use variáveis CSS ou classes Tailwind em vez de valores de cores ou tamanhos codificados.

2. **Mantenha a consistência**: Siga o sistema de design e evite criar exceções desnecessárias.

3. **Pense em responsividade**: Projete sempre com uma abordagem mobile-first.

4. **Acessibilidade**: Certifique-se de que todas as combinações de cores passem nos testes de contraste WCAG.

5. **Documentação**: Documente qualquer extensão ao sistema de design para referência futura.

## Exemplos de Componentes

Veja exemplos de componentes no sistema de documentação visual (quando implementado).

## Versionamento

O sistema de design segue o versionamento semântico. Consulte o CHANGELOG para detalhes sobre atualizações e alterações. 