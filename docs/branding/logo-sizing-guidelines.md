# Diretrizes de Dimensionamento e Aplicação de Logo

Este documento fornece especificações técnicas para a implementação correta dos logos da AliTools em todas as áreas do site, garantindo consistência visual e profissionalismo.

## Problemas Identificados

### 1. Inconsistência de Tamanho
- Logo muito grande no header, causando desproporção
- Tamanhos inconsistentes entre header, footer e outras aplicações
- Falta de ajuste responsivo em diferentes dispositivos

### 2. Problemas de Espaçamento
- Falta de espaço de respiro adequado ao redor do logo
- Alinhamento inconsistente em contêineres
- Conflito com elementos de navegação adjacentes

### 3. Uso Incorreto de Versões
- Aplicação incorreta das versões (colorida vs. monocromática)
- Falta de consistência entre versões utilizadas
- Ausência de versões responsivas para mobile

## Especificações Técnicas

### 1. Dimensões Padrão

| Contexto | Desktop | Tablet | Mobile | Espaço Mínimo |
|----------|---------|--------|--------|---------------|
| Header | 120px largura | 100px largura | 80px largura | 16px em todas as direções |
| Footer | 150px largura | 120px largura | 100px largura | 24px em todas as direções |
| Hero | 180px largura | 140px largura | 120px largura | 32px em todas as direções |
| Favicon | 32px × 32px | 32px × 32px | 32px × 32px | N/A |
| Aplicações Internas | 80px largura | 70px largura | 60px largura | 16px em todas as direções |

### 2. Versões Corretas para Cada Contexto

| Contexto | Versão Recomendada | Formato | Alternativa |
|----------|-------------------|---------|-------------|
| Header | Primária colorida | SVG | PNG com fundo transparente |
| Footer | Monocromática branca | SVG | PNG com fundo transparente |
| Fundo escuro | Monocromática branca | SVG | PNG com fundo transparente |
| Fundo claro | Primária colorida ou Monocromática preta | SVG | PNG com fundo transparente |
| Favicon | Símbolo simplificado | ICO/PNG | SVG |
| Impressão | Monocromática preta | SVG | PNG alta resolução |

## Implementação Técnica

### 1. Header Logo - Implementação com React e Tailwind

```jsx
import React from 'react';
import { Link } from 'react-router-dom';

const HeaderLogo = () => {
  return (
    <Link to="/" className="flex items-center">
      <img
        src="/assets/logos/svg/primary/logo-horizontal.svg"
        alt="AliTools"
        className="w-[120px] md:w-[100px] sm:w-[80px] h-auto"
        style={{ minWidth: 'auto' }}  // Evita que o logo cresça além do tamanho definido
      />
    </Link>
  );
};

export default HeaderLogo;
```

### 2. Implementação em CSS Puro

```css
.header-logo {
  display: block;
  width: 120px;
  height: auto;
  margin: 0 16px;
}

.header-logo img {
  width: 100%;
  height: auto;
  display: block;
}

@media (max-width: 1024px) {
  .header-logo {
    width: 100px;
  }
}

@media (max-width: 768px) {
  .header-logo {
    width: 80px;
    margin: 0 12px;
  }
}
```

### 3. Componente Logo Configurável

```jsx
import React from 'react';
import PropTypes from 'prop-types';

const Logo = ({ variant = 'primary', size = 'medium', className = '', ...props }) => {
  // Mapear variantes para caminhos de arquivo
  const logoSrc = {
    primary: '/assets/logos/svg/primary/logo-horizontal.svg',
    mono: '/assets/logos/svg/mono/logo-horizontal-white.svg',
    symbol: '/assets/logos/svg/symbol/symbol-only.svg',
    wordmark: '/assets/logos/svg/wordmark/wordmark-only.svg',
  };
  
  // Mapear tamanhos para classes Tailwind
  const sizeClasses = {
    small: 'w-[80px] md:w-[70px] sm:w-[60px]',
    medium: 'w-[120px] md:w-[100px] sm:w-[80px]',
    large: 'w-[150px] md:w-[120px] sm:w-[100px]',
    xlarge: 'w-[180px] md:w-[140px] sm:w-[120px]',
  };
  
  return (
    <img
      src={logoSrc[variant]}
      alt="AliTools"
      className={`h-auto ${sizeClasses[size]} ${className}`}
      {...props}
    />
  );
};

Logo.propTypes = {
  variant: PropTypes.oneOf(['primary', 'mono', 'symbol', 'wordmark']),
  size: PropTypes.oneOf(['small', 'medium', 'large', 'xlarge']),
  className: PropTypes.string,
};

export default Logo;
```

### 4. Uso nos Principais Componentes

#### Header.jsx
```jsx
import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../ui/Logo';

const Header = () => {
  return (
    <header className="w-full bg-black py-4">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
        <Link to="/" className="flex items-center mr-8">
          <Logo variant="primary" size="medium" />
        </Link>
        {/* Resto do header */}
      </div>
    </header>
  );
};
```

#### Footer.jsx
```jsx
import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../ui/Logo';

const Footer = () => {
  return (
    <footer className="w-full bg-black py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center md:items-start">
          <Link to="/" className="mb-8 md:mb-0 md:mr-16">
            <Logo variant="mono" size="large" />
          </Link>
          {/* Resto do footer */}
        </div>
      </div>
    </footer>
  );
};
```

## Correções Específicas

### 1. Corrigir Logo no Header

O logo no header atual está desproporcionalmente grande. Para corrigir:

```jsx
// Antes (problemático)
<img src="/path/to/logo.svg" className="w-48" /> // Width muito grande (192px)

// Depois (corrigido)
<img src="/path/to/logo.svg" className="w-[120px] md:w-[100px] sm:w-[80px]" />
```

### 2. Ajuste para Espaçamento Correto

```jsx
// Antes (problemático)
<div className="flex items-center">
  <img src="/path/to/logo.svg" className="w-48" />
  <nav className="ml-2"> {/* espaçamento insuficiente */}
    {/* navegação */}
  </nav>
</div>

// Depois (corrigido)
<div className="flex items-center">
  <img src="/path/to/logo.svg" className="w-[120px] md:w-[100px] sm:w-[80px]" />
  <nav className="ml-8 md:ml-6 sm:ml-4"> {/* espaçamento adequado e responsivo */}
    {/* navegação */}
  </nav>
</div>
```

### 3. Garantir Logos Responsivos em SVG

Para garantir a qualidade em todas as resoluções, use SVG e tenha fallbacks:

```jsx
<picture>
  <source srcSet="/assets/logos/svg/primary/logo-horizontal.svg" type="image/svg+xml" />
  <source srcSet="/assets/logos/png/primary/logo-horizontal.png" type="image/png" />
  <img 
    src="/assets/logos/png/primary/logo-horizontal.png" 
    alt="AliTools" 
    className="w-[120px] md:w-[100px] sm:w-[80px] h-auto"
  />
</picture>
```

## Recomendações de Implementação

### 1. Organização de Arquivos
Mantenha todos os logos em uma estrutura organizada:
```
/client/public/assets/logos/
  ├── svg/
  │   ├── primary/
  │   ├── mono/
  │   ├── symbol/
  │   └── wordmark/
  ├── png/
  │   ├── primary/
  │   ├── mono/
  │   ├── symbol/
  │   └── wordmark/
  └── favicon/
```

### 2. Preload para Melhor Performance
Para logos críticos visíveis imediatamente, considere adicionar preload no HTML:

```html
<link rel="preload" href="/assets/logos/svg/primary/logo-horizontal.svg" as="image" type="image/svg+xml">
```

### 3. Teste em Todos os Breakpoints
Teste o dimensionamento do logo em cada um destes breakpoints:
- Desktop: 1440px, 1280px, 1024px
- Tablet: 768px
- Mobile: 640px, 480px, 375px, 320px

### 4. Acessibilidade
Sempre inclua texto alternativo descritivo:

```jsx
<img src="/path/to/logo.svg" alt="AliTools - Ferramentas Profissionais" ... />
```

## Checklist de Implementação

- [ ] Logo no header redimensionado para 120px de largura (desktop)
- [ ] Espaçamento adequado ao redor de todos os logos
- [ ] Versões corretas de logos usadas em cada contexto
- [ ] SVGs usados para todas as instâncias principais de logos
- [ ] Responsividade implementada usando classes condicionais
- [ ] Componente Logo reutilizável criado e usado em todo o projeto
- [ ] Texto alternativo adequado para todos os logos
- [ ] Testado em todos os tamanhos de tela principais

---

## Exemplo de Implementação Completa

Para implementar de forma consistente, crie um componente Logo.jsx e use em todo o projeto:

```jsx
// components/ui/Logo.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

const Logo = ({ 
  variant = 'primary',
  size = 'medium',
  linkTo = '/',
  className = '',
  withLink = true,
  ...props 
}) => {
  // Mapear variantes para caminhos de arquivo
  const logoSrc = {
    primary: '/assets/logos/svg/primary/logo-horizontal.svg',
    mono: '/assets/logos/svg/mono/logo-horizontal-white.svg',
    monoDark: '/assets/logos/svg/mono/logo-horizontal-black.svg',
    symbol: '/assets/logos/svg/symbol/symbol-only.svg',
    wordmark: '/assets/logos/svg/wordmark/wordmark-only.svg',
  };
  
  // Mapear tamanhos para classes Tailwind
  const sizeClasses = {
    small: 'w-[80px] md:w-[70px] sm:w-[60px]',
    medium: 'w-[120px] md:w-[100px] sm:w-[80px]',
    large: 'w-[150px] md:w-[120px] sm:w-[100px]',
    xlarge: 'w-[180px] md:w-[140px] sm:w-[120px]',
  };
  
  const imgElement = (
    <img
      src={logoSrc[variant]}
      alt="AliTools - Ferramentas Profissionais"
      className={`h-auto ${sizeClasses[size]} ${className}`}
      {...props}
    />
  );
  
  if (withLink) {
    return (
      <Link to={linkTo} className="flex items-center">
        {imgElement}
      </Link>
    );
  }
  
  return imgElement;
};

Logo.propTypes = {
  variant: PropTypes.oneOf(['primary', 'mono', 'monoDark', 'symbol', 'wordmark']),
  size: PropTypes.oneOf(['small', 'medium', 'large', 'xlarge']),
  linkTo: PropTypes.string,
  className: PropTypes.string,
  withLink: PropTypes.bool,
};

export default Logo;
```

Este componente pode então ser usado facilmente em qualquer parte da aplicação, garantindo consistência completa. 