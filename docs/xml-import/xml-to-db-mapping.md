# Mapeamento de Entidades XML para Modelos de Banco de Dados

Este documento define o mapeamento completo entre os elementos do XML da GEKO e os modelos do banco de dados PostgreSQL do sistema B2B AliTools.

## Visão Geral do Mapeamento

O sistema de importação XML processa o arquivo GEKO e mapeia seus dados para as seguintes tabelas:

| Elemento XML | Tabela no Banco de Dados | Descrição |
|--------------|---------------------------|-----------|
| `<product>` | `products` | Informações básicas do produto |
| `<category>` | `categories` | Categorias dos produtos |
| `<producer>` | `producers` | Fabricantes dos produtos |
| `<unit>` | `units` | Unidades de medida |
| `<variant>` | `variants` | Variantes dos produtos (tamanhos, cores, etc.) |
| `<stock>` | `stocks` | Informações de estoque |
| `<price>` | `prices` | Informações de preço |
| `<image>` | `images` | Imagens dos produtos |
| `<document>` | `documents` | Documentos relacionados aos produtos (manuais, fichas técnicas) |
| Parâmetros diversos | `product_properties` | Propriedades adicionais dos produtos |

## Mapeamento Detalhado por Entidade

### 1. Produto (`<product>` → `products`)

| Campo XML | Campo BD | Tipo | Descrição |
|-----------|----------|------|-----------|
| `<code>` ou `<id>` | `code` | TEXT | Código único do produto (obrigatório) |
| `<code_on_card>` | `code_on_card` | TEXT | Código exibido em cartão/etiqueta |
| `<ean>` | `ean` | TEXT | Código EAN/GTIN do produto |
| `<code_producer>` | `producer_code` | TEXT | Código do produto no sistema do fabricante |
| `<description><name>` ou `<description><n>` | `name` | TEXT | Nome do produto (obrigatório) |
| `<description><short>` ou `<description><short_desc>` | `description_short` | TEXT | Descrição curta do produto |
| `<description><long>` ou `<description><long_desc>` | `description_long` | TEXT | Descrição detalhada do produto |
| `<description><description>` | `description_html` | TEXT | Descrição HTML formatada |
| `<vat>` | `vat` | DECIMAL | Percentual de IVA/VAT |
| `<delivery>` | `delivery_date` | DATE | Data prevista de entrega |
| `<card><url>` | `url` | TEXT | URL para o produto no catálogo |
| N/A | `status` | TEXT | Status do produto (padrão: 'active') |
| N/A | `discontinued` | BOOLEAN | Indica se o produto foi descontinuado |
| Relacionamento com `<category>` | `category_id` | TEXT | ID da categoria |
| Relacionamento com `<producer>` | `producer_id` | INTEGER | ID do fabricante |
| Relacionamento com `<unit>` | `unit_id` | TEXT | ID da unidade de medida |

### 2. Categoria (`<category>` → `categories`)

| Campo XML | Campo BD | Tipo | Descrição |
|-----------|----------|------|-----------|
| `<category><id>` | `id` | TEXT | ID único da categoria (chave primária) |
| `<category><name>` ou `<category><n>` | `name` | TEXT | Nome da categoria (obrigatório) |
| `<category><path>` | `path` | TEXT | Caminho hierárquico da categoria |
| N/A (extraído de `path`) | `parent_id` | TEXT | ID da categoria pai |
| `<category_idosell><path>` | `idosell_path` | TEXT | Caminho alternativo no sistema idosell |

### 3. Fabricante (`<producer>` → `producers`)

| Campo XML | Campo BD | Tipo | Descrição |
|-----------|----------|------|-----------|
| `<producer><id>` | `id` | INTEGER | ID do fabricante (auto-incremento) |
| `<producer><name>` | `name` | TEXT | Nome do fabricante (obrigatório) |
| `<producer><description>` | `description` | TEXT | Descrição do fabricante |
| `<producer><website>` | `website` | TEXT | Site do fabricante |

### 4. Unidade de Medida (`<unit>` → `units`)

| Campo XML | Campo BD | Tipo | Descrição |
|-----------|----------|------|-----------|
| Texto da tag `<unit>` | `id` | TEXT | Código da unidade (chave primária) |
| N/A (derivado de `id`) | `name` | TEXT | Nome da unidade |
| `<unit><moq>` ou default | `moq` | INTEGER | Quantidade mínima de pedido |

### 5. Variante (`<variant>` → `variants`)

| Campo XML | Campo BD | Tipo | Descrição |
|-----------|----------|------|-----------|
| Gerado automaticamente | `id` | INTEGER | ID único da variante (auto-incremento) |
| Relacionamento com produto | `product_id` | INTEGER | ID do produto |
| `<variant><code>` | `code` | TEXT | Código único da variante |
| `<variant><name>` | `name` | TEXT | Nome da variante |
| `<variant><weight>` | `weight` | DECIMAL | Peso da variante |
| `<variant><gross_weight>` | `gross_weight` | DECIMAL | Peso bruto da variante |
| `<variant><size>` | `size` | TEXT | Tamanho da variante |
| `<variant><color>` | `color` | TEXT | Cor da variante |
| `<variant><status>` | `status` | TEXT | Status da variante |

### 6. Estoque (`<stock>` → `stocks`)

| Campo XML | Campo BD | Tipo | Descrição |
|-----------|----------|------|-----------|
| Gerado automaticamente | `id` | INTEGER | ID único do registro de estoque |
| Relacionamento com variante | `variant_id` | INTEGER | ID da variante |
| `<stock><quantity>` | `quantity` | INTEGER | Quantidade em estoque |
| `<stock><available>` | `available` | BOOLEAN | Disponibilidade do item |
| `<stock><min_order_quantity>` | `min_order_quantity` | INTEGER | Quantidade mínima para pedido |
| `<stock><status>` | `status` | TEXT | Status do estoque |

### 7. Preço (`<price>` → `prices`)

| Campo XML | Campo BD | Tipo | Descrição |
|-----------|----------|------|-----------|
| Gerado automaticamente | `id` | INTEGER | ID único do registro de preço |
| Relacionamento com variante | `variant_id` | INTEGER | ID da variante |
| `<price><amount>` | `gross_price` | DECIMAL | Preço bruto |
| Calculado de `amount` e `vat` | `net_price` | DECIMAL | Preço líquido |
| `<srp><price><amount>` | `srp_gross` | DECIMAL | Preço sugerido bruto |
| Calculado de `srp` e `vat` | `srp_net` | DECIMAL | Preço sugerido líquido |
| `<price><currency>` | `currency` | TEXT | Moeda (padrão: 'EUR') |
| `<price><type>` | `type` | TEXT | Tipo de preço (ex: 'retail', 'wholesale') |

### 8. Imagem (`<image>` → `images`)

| Campo XML | Campo BD | Tipo | Descrição |
|-----------|----------|------|-----------|
| Gerado automaticamente | `id` | INTEGER | ID único da imagem |
| Relacionamento com produto | `product_id` | INTEGER | ID do produto |
| `<image><url>` | `url` | TEXT | URL da imagem |
| `<image><is_main>` | `is_main` | BOOLEAN | Indica se é a imagem principal |
| `<image><order>` | `order` | INTEGER | Ordem de exibição |
| Extraído da URL | `type` | TEXT | Tipo de imagem |

### 9. Documento (`<document>` → `documents`)

| Campo XML | Campo BD | Tipo | Descrição |
|-----------|----------|------|-----------|
| Gerado automaticamente | `id` | INTEGER | ID único do documento |
| Relacionamento com produto | `product_id` | INTEGER | ID do produto |
| `<document><url>` | `url` | TEXT | URL do documento |
| `<document><title>` ou extraído da URL | `title` | TEXT | Título do documento |
| Inferido da URL | `type` | TEXT | Tipo de documento (PDF, DOC, etc.) |

### 10. Propriedade do Produto (`<parameters>` → `product_properties`)

| Campo XML | Campo BD | Tipo | Descrição |
|-----------|----------|------|-----------|
| Gerado automaticamente | `id` | INTEGER | ID único da propriedade |
| Relacionamento com produto | `product_id` | INTEGER | ID do produto |
| Chave do parâmetro | `key` | TEXT | Nome da propriedade |
| Valor do parâmetro | `value` | TEXT | Valor da propriedade |
| Grupo do parâmetro | `group` | TEXT | Grupo da propriedade |

## Regras de Transformação Importantes

### Geração de IDs

- Para produtos e variantes: Utilizamos os códigos fornecidos no XML
- Para categorias: Utilizamos o ID fornecido ou um slug derivado do nome
- Para fabricantes: Utilizamos o auto-incremento do banco de dados
- Para unidades: Utilizamos o código fornecido no XML

### Tratamento de Valores Ausentes

- Campos obrigatórios ausentes: Produtos sem código ou nome são ignorados
- Valores padrão: Aplicados conforme definido nos modelos do banco
- Campos de texto: Normalizados para remover espaços extras e caracteres inválidos

### Relações Entre Entidades

- Um produto pode ter:
  - Uma categoria (relação N:1)
  - Um fabricante (relação N:1)
  - Uma unidade de medida (relação N:1)
  - Múltiplas variantes (relação 1:N)
  - Múltiplas imagens (relação 1:N)
  - Múltiplos documentos (relação 1:N)
  - Múltiplas propriedades (relação 1:N)
- Uma variante pode ter:
  - Um registro de estoque (relação 1:1)
  - Múltiplos preços (relação 1:N)

## Implementação Técnica

Este mapeamento é implementado em dois componentes principais:

1. **Parser XML** (`geko-xml-parser.js`) - Extrai os dados do XML e cria objetos JavaScript estruturados
2. **Script de Importação** (`direct-import-xml.js`) - Define os modelos e persiste os dados no banco

### Métodos do Parser Responsáveis por Cada Entidade

- `_processProduct` - Processa dados básicos do produto
- `_processCategory` - Processa categorias
- `_processProducer` - Processa fabricantes
- `_processUnit` - Processa unidades de medida
- `_processVariants` - Processa variantes e dados relacionados
- `_processStock` - Processa informações de estoque
- `_processPrices` - Processa preços
- `_processImages` - Processa imagens
- `_processDocuments` - Processa documentos
- `_processProperties` - Processa propriedades adicionais

## Fluxograma do Processo de Mapeamento

```
XML GEKO → Parser XML → Objetos JS → Script de Importação → Banco de Dados
```

1. O arquivo XML é carregado e enviado para o parser
2. O parser extrai e transforma os dados em objetos JS
3. Esses objetos são agrupados por tipo de entidade
4. O script de importação define os modelos e persistência
5. Os dados são inseridos no banco em transações

## Considerações Especiais

- **Performance**: O processamento é feito em lotes para otimizar o uso de memória
- **Validação**: Os dados são validados antes da inserção no banco
- **Integridade Referencial**: As relações são mantidas através de chaves estrangeiras
- **Flexibilidade**: O parser lida com diferentes formatos e estruturas XML
- **Idempotência**: O sistema evita duplicação de dados durante reimportações

---

Este documento serve como referência definitiva para o mapeamento entre os elementos XML da GEKO e os modelos do banco de dados AliTools, garantindo consistência na importação de dados. 