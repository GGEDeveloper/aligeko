# AliTools Icon Library Specification

## Overview

Esta documentação define os padrões e especificações para a biblioteca de ícones AliTools, inspirada nas principais categorias de produtos e alinhada com a identidade visual da marca.

## Princípios de Design

### Estilo Visual
- **Minimalista:** Formas simplificadas com detalhes essenciais apenas
- **Flat design:** Sem gradientes, sombras ou efeitos 3D
- **Consistência:** Mesma linguagem visual do logotipo AliTools
- **Reconhecibilidade:** Símbolos facilmente identificáveis

### Especificações Técnicas
- **Grid base:** 24x24 pixels
- **Linha:** 2px de espessura para contornos principais
- **Cantos:** Raio de 2px para harmonizar com o logotipo
- **Cores:** Amarelo/dourado principal (#FFCC00) e branco/preto para contraste

## Categorias e Ícones

Baseado na análise do site GEKO B2B, criamos ícones para estas categorias principais:

### 1. Materiais Abrasivos
- **Discos Abrasivos:** Representação circular com textura de grãos
- **Lixas:** Forma retangular com textura de grãos
- **Polidores:** Elemento circular com padrão de movimento

### 2. Ferramentas Manuais
- **Chaves de Fenda:** Silhueta com cabo e ponta
- **Alicates:** Forma característica com cabos
- **Martelos:** Silhueta de cabeça e cabo
- **Ferramentas de Medição:** Representação de régua/trena

### 3. Ferramentas Elétricas
- **Furadeiras:** Silhueta com broca e cabo
- **Serras:** Forma com lâmina dentada
- **Lixadeiras:** Representação com base e elemento de movimento

### 4. Ferramentas de Corte
- **Lâminas:** Elemento afiado com detalhe de corte
- **Tesouras:** Forma clássica simplificada
- **Serras Circulares:** Disco com dentes

### 5. Ferramentas de Jardim
- **Tesoura de Poda:** Silhueta característica
- **Regadores:** Forma simplificada com bico
- **Ferramentas de Escavação:** Pá e/ou enxada estilizada

### 6. Equipamentos de Proteção
- **Luvas:** Silhueta simplificada
- **Óculos de Proteção:** Forma reconhecível
- **Máscaras:** Elemento facial estilizado

### 7. Materiais de Construção
- **Tijolos:** Padrão repetitivo retangular
- **Cimento:** Saco estilizado ou ferramenta de aplicação
- **Ferramentas de Alvenaria:** Colher de pedreiro

### 8. Fixadores
- **Parafusos:** Cabeça e rosca estilizados
- **Pregos:** Forma característica simplificada
- **Buchas:** Silhueta reconhecível

## Exemplos de Aplicação

### Tamanhos
Os ícones são projetados para escalar nos seguintes tamanhos:
- **Small:** 16x16px
- **Medium:** 24x24px (tamanho base)
- **Large:** 32x32px
- **Extra Large:** 48x48px

### Variações de Cor
Cada ícone terá as seguintes variações:
- **Default:** Amarelo/dourado (#FFCC00) sobre fundo transparente
- **Inverso:** Contorno amarelo/dourado (#FFCC00) com preenchimento transparente
- **Dark Mode:** Branco (#FFFFFF) sobre fundo transparente
- **Light Mode:** Preto (#1A1A1A) sobre fundo transparente

## Sistema de Nomenclatura

A nomenclatura dos arquivos seguirá o padrão:
```
alitools-icon-[categoria]-[nome]-[tamanho]-[variação].[formato]
```

Exemplo:
```
alitools-icon-handtools-wrench-24-default.svg
```

## Formatos de Arquivo

Cada ícone será disponibilizado nos seguintes formatos:
- **SVG:** Para uso web responsivo e implementação em código
- **PNG:** Com transparência em resoluções específicas
- **Icon Font:** Conjunto completo como fonte para implementação eficiente

## Diretrizes de Implementação

### Web
- Usar SVGs sempre que possível para melhor desempenho e escalabilidade
- Implementar como componentes React/Vue para controle de cores
- Considerar Icon Font para conjuntos grandes de ícones

### UI Components
- Alinhar ícones com texto usando baseline-middle
- Manter espaçamento mínimo de 8px entre ícones e outros elementos
- Para botões com ícones, manter 4px entre ícone e texto

## Processo de Extensão

Para adicionar novos ícones à biblioteca:
1. Identificar a categoria apropriada
2. Seguir a grade e as diretrizes de estilo
3. Criar versões em todos os tamanhos e variações
4. Adicionar à documentação e ao repositório
5. Atualizar o sprite sheet e/ou icon font

## Acessibilidade

- Todos os ícones devem ter atributos `aria-label` quando usados
- Quando decorativos, usar `aria-hidden="true"`
- Manter contraste suficiente para visibilidade
- Não confiar apenas na cor para transmitir significado

---

Este documento serve como diretriz para o desenvolvimento da biblioteca de ícones AliTools e deve ser atualizado conforme a biblioteca evolui. 