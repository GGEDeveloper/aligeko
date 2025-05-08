# Implementação do Hero Section - Guia Técnico

Este documento fornece diretrizes técnicas específicas para implementar corretamente o Hero Section do site AliTools B2B E-commerce, resolvendo os problemas de parametrização visual identificados.

## Análise do Problema Atual

O Hero Section atual apresenta os seguintes problemas:

1. **Dimensionamento Inconsistente**: Altura desproporcional em diferentes dispositivos
2. **Layout Desalinhado**: Elementos não seguem uma grade consistente
3. **Tipografia Inconsistente**: Tamanhos e pesos de fonte inadequados
4. **Responsividade Problemática**: Quebras de layout em dispositivos móveis
5. **Contraste Inadequado**: Texto sobre imagem com legibilidade comprometida
6. **CTAs mal posicionados**: Botões de ação não estão em posição de destaque

## Especificações Técnicas para Correção

### 1. Estrutura HTML Recomendada

```jsx
<section className="hero-section">
  <div className="hero-container">
    <div className="hero-content">
      <h1 className="hero-title">Ferramentas Profissionais para Profissionais</h1>
      <p className="hero-subtitle">Equipamentos de qualidade para todos os setores da construção civil e industrial</p>
      <div className="hero-cta-container">
        <Button variant="primary" size="lg" className="hero-cta-primary">Ver Catálogo</Button>
        <Button variant="secondary" size="lg" className="hero-cta-secondary">Sobre a AliTools</Button>
      </div>
    </div>
    <div className="hero-image-container">
      <img 
        src="/assets/hero-image.jpg" 
        alt="Ferramentas profissionais AliTools" 
        className="hero-image"
        srcSet="/assets/hero-image-sm.jpg 640w, /assets/hero-image-md.jpg 1024w, /assets/hero-image.jpg 1920w"
        sizes="100vw"
      />
      <div className="hero-overlay"></div>
    </div>
  </div>
</section>
```

### 2. CSS Base (sem Tailwind)

```css
.hero-section {
  position: relative;
  width: 100%;
  height: 60vh;
  min-height: 400px;
  max-height: 800px;
  overflow: hidden;
}

.hero-container {
  position: relative;
  width: 100%;
  height: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  z-index: 1;
}

.hero-content {
  max-width: 600px;
  z-index: 2;
}

.hero-title {
  font-size: 48px;
  line-height: 1.2;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 16px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.hero-subtitle {
  font-size: 18px;
  line-height: 1.5;
  color: #ffffff;
  margin-bottom: 32px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.hero-cta-container {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.hero-image-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.hero-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, rgba(26, 26, 26, 0.8) 0%, rgba(26, 26, 26, 0.4) 100%);
}

/* Responsividade */
@media (max-width: 1024px) {
  .hero-section {
    height: 50vh;
  }
  
  .hero-title {
    font-size: 42px;
  }
}

@media (max-width: 768px) {
  .hero-section {
    height: 50vh;
  }
  
  .hero-container {
    padding: 0 16px;
  }
  
  .hero-title {
    font-size: 36px;
  }
  
  .hero-subtitle {
    font-size: 16px;
  }
}

@media (max-width: 480px) {
  .hero-section {
    height: 40vh;
    min-height: 300px;
  }
  
  .hero-title {
    font-size: 28px;
    margin-bottom: 8px;
  }
  
  .hero-subtitle {
    font-size: 14px;
    margin-bottom: 24px;
  }
  
  .hero-cta-container {
    flex-direction: column;
    gap: 12px;
  }
}
```

### 3. Implementação com Tailwind CSS

```jsx
<section className="relative w-full h-[60vh] min-h-[400px] max-h-[800px] overflow-hidden">
  <div className="relative w-full h-full max-w-[1400px] mx-auto px-6 flex flex-col justify-center z-10">
    <div className="max-w-[600px] z-20">
      <h1 className="text-5xl md:text-4xl sm:text-3xl font-bold text-white mb-4 sm:mb-2 leading-tight shadow-text">
        Ferramentas Profissionais para Profissionais
      </h1>
      <p className="text-lg md:text-base sm:text-sm text-white mb-8 sm:mb-6 leading-relaxed shadow-text">
        Equipamentos de qualidade para todos os setores da construção civil e industrial
      </p>
      <div className="flex gap-4 flex-wrap sm:flex-col sm:gap-3">
        <Button variant="primary" size="lg">Ver Catálogo</Button>
        <Button variant="secondary" size="lg">Sobre a AliTools</Button>
      </div>
    </div>
  </div>
  
  <div className="absolute inset-0 z-0">
    <img 
      src="/assets/hero-image.jpg" 
      alt="Ferramentas profissionais AliTools" 
      className="w-full h-full object-cover object-center"
      srcSet="/assets/hero-image-sm.jpg 640w, /assets/hero-image-md.jpg 1024w, /assets/hero-image.jpg 1920w"
      sizes="100vw"
    />
    <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/40"></div>
  </div>
</section>
```

### 4. Utilitários Tailwind Adicionais (para tailwind.config.js)

```js
module.exports = {
  // ... outras configurações
  theme: {
    extend: {
      // ... outras extensões
      height: {
        'hero-desktop': '60vh',
        'hero-tablet': '50vh',
        'hero-mobile': '40vh',
      },
      maxWidth: {
        'container': '1400px',
        'content': '600px',
      },
      fontSize: {
        'hero-title-desktop': ['48px', '1.2'],
        'hero-title-tablet': ['42px', '1.2'],
        'hero-title-mobile': ['28px', '1.2'],
        'hero-subtitle-desktop': ['18px', '1.5'],
        'hero-subtitle-mobile': ['16px', '1.5'],
      },
      boxShadow: {
        'text': '0 2px 4px rgba(0, 0, 0, 0.3)',
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(90deg, rgba(26, 26, 26, 0.8) 0%, rgba(26, 26, 26, 0.4) 100%)',
      },
    },
  },
};
```

## Componente Hero Section Completo (React + Tailwind)

```jsx
import React from 'react';
import { Button } from '../components/ui/Button';

const HeroSection = () => {
  return (
    <section className="relative w-full h-[60vh] min-h-[400px] max-h-[800px] overflow-hidden md:h-[50vh] sm:h-[40vh] sm:min-h-[300px]">
      <div className="relative w-full h-full max-w-[1400px] mx-auto px-6 flex flex-col justify-center z-10 sm:px-4">
        <div className="max-w-[600px] z-20">
          <h1 className="text-5xl font-bold text-white mb-4 leading-tight shadow-text md:text-4xl sm:text-3xl sm:mb-2">
            Ferramentas Profissionais para Profissionais
          </h1>
          <p className="text-lg text-white mb-8 leading-relaxed shadow-text md:text-base sm:text-sm sm:mb-6">
            Equipamentos de qualidade para todos os setores da construção civil e industrial
          </p>
          <div className="flex gap-4 flex-wrap sm:flex-col sm:gap-3">
            <Button variant="primary" size="lg">Ver Catálogo</Button>
            <Button variant="secondary" size="lg">Sobre a AliTools</Button>
          </div>
        </div>
      </div>
      
      <div className="absolute inset-0 z-0">
        <img 
          src="/assets/images/hero-image.jpg" 
          alt="Ferramentas profissionais AliTools" 
          className="w-full h-full object-cover object-center"
          srcSet="/assets/images/hero-image-sm.jpg 640w, /assets/images/hero-image-md.jpg 1024w, /assets/images/hero-image.jpg 1920w"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/40"></div>
      </div>
    </section>
  );
};

export default HeroSection;
```

## Diretrizes de Implementação

### Imagens

1. **Preparação**: 
   - Criar 3 versões de cada imagem hero: 1920px, 1024px e 640px de largura
   - Otimizar todas as imagens com ferramentas como squoosh.app ou tinypng.com
   - Manter proporção 16:9 para todas as imagens

2. **Colocação**:
   - Armazenar imagens em `/client/public/assets/images/`
   - Usar srcSet e sizes para carregamento responsivo
   - Garantir fallback para navegadores antigos

### Textos

1. **Conteúdo**:
   - Limitar título a no máximo 2 linhas em desktop
   - Limitar subtítulo a no máximo 3 linhas
   - Garantir que todo texto seja legível sobre o gradiente

2. **Implementação**:
   - Usar shadow-text para melhorar legibilidade
   - Manter consistência com o sistema tipográfico
   - Respeitar a hierarquia visual com texto principal e secundário

### Botões de Ação (CTAs)

1. **Design**:
   - Botão primário: fundo #FFCC00, texto #1A1A1A
   - Botão secundário: borda #FFCC00, texto #FFCC00
   - Consistência de tamanho e espaçamento

2. **Implementação**:
   - Usar o componente Button da biblioteca de UI
   - Garantir hover states adequados
   - Em mobile, empilhar botões verticalmente

### Responsividade

1. **Breakpoints**:
   - Desktop: > 1024px (altura 60vh)
   - Tablet: 768px - 1024px (altura 50vh)
   - Mobile: < 768px (altura 40vh)

2. **Adaptações**:
   - Reduzir tamanho de fonte em viewports menores
   - Ajustar espaçamento e padding
   - Garantir que CTAs permaneçam visíveis e usáveis

## Checklist de Qualidade

- [ ] Texto legível em todos os tamanhos de tela
- [ ] Imagem de alta qualidade sem distorções
- [ ] Gradiente aplicado corretamente para contraste
- [ ] Botões facilmente clicáveis (tamanho adequado)
- [ ] Carregamento otimizado de imagens
- [ ] Acessibilidade (texto alternativo para imagens)
- [ ] Animações suaves (opcional)
- [ ] Teste em múltiplos navegadores

## Exemplo de Implementação em HomePage.jsx

```jsx
import React from 'react';
import HeroSection from '../components/HeroSection';
import FeaturedProducts from '../components/FeaturedProducts';
import CategoryList from '../components/CategoryList';
// ... outros imports

const HomePage = () => {
  return (
    <div className="home-page">
      <HeroSection />
      <main className="max-w-[1400px] mx-auto px-6 py-12 sm:px-4 sm:py-8">
        <FeaturedProducts />
        <CategoryList />
        {/* ... outras seções */}
      </main>
    </div>
  );
};

export default HomePage;
```

## Recomendações Adicionais

1. **Desempenho**:
   - Lazy-load a imagem de hero com um placeholder de baixa resolução
   - Comprimir imagens sem perda perceptível de qualidade
   - Considerar formatos modernos (WebP com fallback para JPEG)

2. **Acessibilidade**:
   - Garantir contraste adequado entre texto e fundo (WCAG AA ou superior)
   - Garantir que textos alternativos sejam descritivos
   - Verificar navegabilidade por teclado

3. **Animações (Opcional)**:
   - Considerar entrada suave para texto e botões
   - Sutis parallax effects para a imagem de fundo
   - Garantir que animações não prejudiquem o desempenho em dispositivos de baixo poder 