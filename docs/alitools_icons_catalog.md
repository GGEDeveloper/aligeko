# AliTools Icon Catalog

Este documento cataloga os ícones disponíveis na biblioteca de ícones AliTools, organizados por categoria. Todos os ícones seguem as diretrizes de design especificadas em `docs/alitools_icons_library.md`.

## Ferramentas Manuais

| Ícone | Nome do Arquivo | Descrição |
|-------|----------------|-----------|
| <img src="../client/src/assets/icons/handtools/alitools-icon-handtools-wrench-24-default.svg" width="24" height="24" /> | alitools-icon-handtools-wrench-24-default.svg | Chave inglesa - ferramenta de ajuste para porcas e parafusos, essencial para montagem e manutenção |
| <img src="../client/src/assets/icons/handtools/alitools-icon-handtools-hammer-24-default.svg" width="24" height="24" /> | alitools-icon-handtools-hammer-24-default.svg | Martelo - ferramenta de impacto para fixação de pregos e modelagem de materiais |

## Ferramentas Elétricas

| Ícone | Nome do Arquivo | Descrição |
|-------|----------------|-----------|
| <img src="../client/src/assets/icons/electrical/alitools-icon-electrical-drill-24-default.svg" width="24" height="24" /> | alitools-icon-electrical-drill-24-default.svg | Furadeira - ferramenta elétrica para perfuração de diversos materiais |

## Equipamentos de Proteção

| Ícone | Nome do Arquivo | Descrição |
|-------|----------------|-----------|
| <img src="../client/src/assets/icons/protection/alitools-icon-protection-glasses-24-default.svg" width="24" height="24" /> | alitools-icon-protection-glasses-24-default.svg | Óculos de proteção - equipamento de segurança para proteção dos olhos |

## Materiais Abrasivos

| Ícone | Nome do Arquivo | Descrição |
|-------|----------------|-----------|
| <img src="../client/src/assets/icons/abrasives/alitools-icon-abrasives-disc-24-default.svg" width="24" height="24" /> | alitools-icon-abrasives-disc-24-default.svg | Disco abrasivo - acessório rotativo para lixamento, polimento e corte de materiais |

## Materiais de Construção

| Ícone | Nome do Arquivo | Descrição |
|-------|----------------|-----------|
| <img src="../client/src/assets/icons/construction/alitools-icon-construction-trowel-24-default.svg" width="24" height="24" /> | alitools-icon-construction-trowel-24-default.svg | Colher de pedreiro - ferramenta para aplicação e distribuição de argamassa e concreto |

---

## Variações de Cores Disponíveis

Todos os ícones acima estão disponíveis nas seguintes variações de cores:

- **Default:** Contorno amarelo/dourado (#FFCC00) sobre fundo transparente (ilustrado acima)
- **Inverse:** Contorno amarelo/dourado com preenchimento transparente 
- **Dark Mode:** Contorno branco (#FFFFFF) sobre fundo transparente
- **Light Mode:** Contorno preto (#1A1A1A) sobre fundo transparente

## Uso em Componentes

```jsx
import { ReactComponent as WrenchIcon } from '../assets/icons/handtools/alitools-icon-handtools-wrench-24-default.svg';

const ToolCard = () => (
  <div className="tool-card">
    <WrenchIcon className="tool-icon" aria-label="Wrench" />
    <span>Chave Inglesa</span>
  </div>
);
```

## Diretrizes de Implementação

Consulte `docs/alitools_icons_library.md` para obter informações detalhadas sobre como implementar estes ícones em seu projeto, incluindo:

- Espaçamento e posicionamento
- Responsividade e escala
- Acessibilidade
- Animações (quando aplicável)
- Internacionalização e localização de títulos e rótulos

## Atualizações Futuras

Esta biblioteca será expandida com ícones adicionais para cobrir todas as categorias de produtos da AliTools. Se você precisar de um ícone específico que não está listado aqui, entre em contato com a equipe de design. 