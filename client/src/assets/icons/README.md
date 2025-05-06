# AliTools Icons Library

Este diretório contém a biblioteca de ícones SVG para o projeto AliTools, seguindo as diretrizes especificadas em `docs/alitools_icons_library.md`.

## Estrutura da Biblioteca

Os ícones estão organizados nas seguintes categorias:

```
icons/
├── abrasives/        # Materiais abrasivos
├── construction/     # Materiais de construção 
├── cutting/          # Ferramentas de corte
├── electrical/       # Ferramentas elétricas
├── fasteners/        # Fixadores
├── garden/           # Ferramentas de jardim
├── handtools/        # Ferramentas manuais
├── protection/       # Equipamentos de proteção
└── sprite/           # Arquivos de sprite compilados
```

## Convenções de Nomenclatura

Os arquivos seguem o padrão:
```
alitools-icon-[categoria]-[nome]-[tamanho]-[variação].svg
```

Exemplo:
```
alitools-icon-handtools-wrench-24-default.svg
```

## Variações de Cores Disponíveis

- `default`: Amarelo/dourado (#FFCC00) sobre fundo transparente
- `inverse`: Contorno amarelo/dourado (#FFCC00) com preenchimento transparente
- `dark`: Branco (#FFFFFF) sobre fundo transparente
- `light`: Preto (#1A1A1A) sobre fundo transparente

## Uso em Componentes

Para utilizar os ícones em componentes React:

```jsx
import { ReactComponent as WrenchIcon } from '../assets/icons/handtools/alitools-icon-handtools-wrench-24-default.svg';

const ToolCard = () => (
  <div className="tool-card">
    <WrenchIcon className="tool-icon" aria-label="Wrench" />
    <span>Chave Inglesa</span>
  </div>
);
```

## Tamanhos Padronizados

- 16x16px: Para uso em texto e áreas compactas
- 24x24px: Tamanho base para a maioria dos ícones (padrão)
- 32x32px: Para destaque e botões maiores
- 48x48px: Para elementos de destaque e gráficos

## Consistência Visual

Todos os ícones seguem as diretrizes:
- Grid base de 24x24px
- Linha de 2px de espessura
- Cantos arredondados com raio de 2px
- Estilo flat design sem gradientes

## Acessibilidade

Sempre incluir atributos de acessibilidade apropriados:
- `aria-label` para ícones semânticos
- `aria-hidden="true"` para ícones decorativos
- Garantir contraste suficiente em todas as variações

## Manutenção

Para adicionar novos ícones:
1. Criar o SVG seguindo as diretrizes
2. Adicionar à pasta da categoria apropriada
3. Atualizar o sprite sheet (quando aplicável)
4. Documentar no registro de ícones 