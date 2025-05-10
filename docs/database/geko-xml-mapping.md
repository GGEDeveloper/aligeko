# Mapeamento do XML da GEKO para o Banco de Dados

Este documento define o mapeamento entre os elementos e atributos do XML da GEKO e os modelos de banco de dados da aplicação AliTools B2B.

## Estrutura do XML

Baseado na análise do arquivo `geko_products_en.xml`, identificamos a seguinte estrutura:

```xml
<offer file_format="IOF" version="2.6" generated="09.05.2025 01:13:52">
  <products language="en" currency="EUR">
    <product id="24" vat="0" code="C00049" code_on_card="C00049" EAN="5901477140723" code_producer="5901477140723">
      <producer name="GEKO" id=""/>
      <category id="105266" name="Hydraulic Lifts" path="Spare Parts\Hydraulic Lifts"/>
      <category_idosell path="Spare Parts\Hydraulic Lifts" />
      <unit id="1409457136565705379" name="kpl." moq="1"/>
      <card url="https://b2b.geko.pl/en/..."/>
      <description>
        <name>Front wheel 10pcs. BACI</name>
        <long_desc>...</long_desc>
        <short_desc>...</short_desc>
      </description>
      <delivery planned="false" days="30" min_date="" max_date="" on_request="0"/>
      <price gross="2.18" net="2.18"/>
      <srp gross="3.45" net="3.45"/>
      <sizes>
        <size s>
          <stock available="true" quantity="0" default_idos="1" unit="1409457136565705379"/>
          <price gross="2.18" net="2.18"/>
          <srp gross="3.45" net="3.45"/>
        </size>
      </sizes>
      <images>
        <large url="https://..."/>
        <image url="https://..." sort="1"/>
        <image url="https://..." sort="2"/>
      </images>
    </product>
    <!-- ... mais produtos ... -->
  </products>
</offer>
```

## Estatísticas do Arquivo

- **Total de produtos**: 8.155
- **Total de categorias**: 8.155
- **Total de produtores**: 8.155
- **Total de variantes/tamanhos por produto**: 1,00 (média)
- **Total de preços por produto**: 2,00 (média)
- **Total de imagens por produto**: 3,83 (média)

## Mapeamento para Modelos de Banco de Dados

### 1. Produto (`products`)

| Campo no BD      | Campo no XML                   | Tipo       | Observações                             |
|------------------|-------------------------------|------------|----------------------------------------|
| id               | Autoincrement                 | INTEGER    | Chave primária                         |
| code             | product@code                  | TEXT       | Código do produto da GEKO              |
| code_on_card     | product@code_on_card          | TEXT       | Código na embalagem                    |
| ean              | product@EAN                   | TEXT       | Código EAN/Barcode                     |
| code_producer    | product@code_producer         | TEXT       | Código original do produtor            |
| name             | description/name              | TEXT       | Nome do produto                        |
| description      | description/long_desc         | TEXT       | Descrição completa                     |
| short_description| description/short_desc        | TEXT       | Descrição resumida                     |
| vat              | product@vat                   | DECIMAL    | Percentual de imposto                  |
| external_id      | product@id                    | TEXT       | ID externo do GEKO                     |
| category_id      | FK para categories            | INTEGER    | Referência para a categoria            |
| producer_id      | FK para producers             | INTEGER    | Referência para o produtor             |
| unit_id          | FK para units                 | INTEGER    | Referência para a unidade              |
| created_at       | gerado na inserção            | TIMESTAMP  | Data de criação do registro            |
| updated_at       | gerado na atualização         | TIMESTAMP  | Data de atualização do registro        |

### 2. Categoria (`categories`)

| Campo no BD      | Campo no XML              | Tipo       | Observações                             |
|------------------|--------------------------|------------|----------------------------------------|
| id               | Autoincrement            | INTEGER    | Chave primária                         |
| external_id      | category@id              | TEXT       | ID externo da categoria                 |
| name             | category@name            | TEXT       | Nome da categoria                       |
| path             | category@path            | TEXT       | Caminho da categoria (hierarquia)       |
| parent_id        | derivado do path         | INTEGER    | Referência para a categoria pai         |
| created_at       | gerado na inserção       | TIMESTAMP  | Data de criação do registro            |
| updated_at       | gerado na atualização    | TIMESTAMP  | Data de atualização do registro        |

### 3. Produtor (`producers`)

| Campo no BD      | Campo no XML              | Tipo       | Observações                             |
|------------------|--------------------------|------------|----------------------------------------|
| id               | Autoincrement            | INTEGER    | Chave primária                         |
| external_id      | producer@id              | TEXT       | ID externo do produtor                  |
| name             | producer@name            | TEXT       | Nome do produtor                        |
| description      | N/A                      | TEXT       | Descrição do produtor (não presente no XML) |
| website          | N/A                      | TEXT       | Website do produtor (não presente no XML) |
| created_at       | gerado na inserção       | TIMESTAMP  | Data de criação do registro            |
| updated_at       | gerado na atualização    | TIMESTAMP  | Data de atualização do registro        |

### 4. Unidade (`units`)

| Campo no BD      | Campo no XML              | Tipo       | Observações                             |
|------------------|--------------------------|------------|----------------------------------------|
| id               | Autoincrement            | INTEGER    | Chave primária                         |
| external_id      | unit@id                  | TEXT       | ID externo da unidade                   |
| name             | unit@name                | TEXT       | Nome da unidade (ex: kpl.)             |
| moq              | unit@moq                 | INTEGER    | Quantidade mínima de pedido            |
| created_at       | gerado na inserção       | TIMESTAMP  | Data de criação do registro            |
| updated_at       | gerado na atualização    | TIMESTAMP  | Data de atualização do registro        |

### 5. Variante (`variants`)

| Campo no BD      | Campo no XML              | Tipo       | Observações                             |
|------------------|--------------------------|------------|----------------------------------------|
| id               | Autoincrement            | INTEGER    | Chave primária                         |
| product_id       | FK para products         | INTEGER    | Referência para o produto              |
| code             | gerado (produto + size@s) | TEXT       | Código da variante                     |
| size             | size@s                   | TEXT       | Tamanho/Variante                       |
| weight           | N/A                      | DECIMAL    | Peso (não presente no XML)             |
| gross_weight     | N/A                      | DECIMAL    | Peso bruto (não presente no XML)       |
| created_at       | gerado na inserção       | TIMESTAMP  | Data de criação do registro            |
| updated_at       | gerado na atualização    | TIMESTAMP  | Data de atualização do registro        |

### 6. Estoque (`stock`)

| Campo no BD      | Campo no XML              | Tipo       | Observações                             |
|------------------|--------------------------|------------|----------------------------------------|
| id               | Autoincrement            | INTEGER    | Chave primária                         |
| variant_id       | FK para variants         | INTEGER    | Referência para a variante             |
| quantity         | size/stock@quantity      | INTEGER    | Quantidade em estoque                  |
| available        | size/stock@available     | BOOLEAN    | Disponibilidade em estoque             |
| min_order_quantity| unit@moq                | INTEGER    | Quantidade mínima para pedido          |
| created_at       | gerado na inserção       | TIMESTAMP  | Data de criação do registro            |
| updated_at       | gerado na atualização    | TIMESTAMP  | Data de atualização do registro        |

### 7. Preço (`prices`)

| Campo no BD      | Campo no XML              | Tipo       | Observações                             |
|------------------|--------------------------|------------|----------------------------------------|
| id               | Autoincrement            | INTEGER    | Chave primária                         |
| variant_id       | FK para variants         | INTEGER    | Referência para a variante             |
| amount           | price@gross ou price@net | DECIMAL    | Valor do preço                         |
| currency         | products@currency        | TEXT       | Moeda (EUR)                            |
| type             | "regular" ou "srp"       | TEXT       | Tipo de preço (regular ou sugerido)    |
| net_amount       | price@net ou srp@net     | DECIMAL    | Valor líquido                          |
| gross_amount     | price@gross ou srp@gross | DECIMAL    | Valor bruto                            |
| created_at       | gerado na inserção       | TIMESTAMP  | Data de criação do registro            |
| updated_at       | gerado na atualização    | TIMESTAMP  | Data de atualização do registro        |

### 8. Imagem (`images`)

| Campo no BD      | Campo no XML              | Tipo       | Observações                             |
|------------------|--------------------------|------------|----------------------------------------|
| id               | Autoincrement            | INTEGER    | Chave primária                         |
| product_id       | FK para products         | INTEGER    | Referência para o produto              |
| url              | image@url ou large@url   | TEXT       | URL da imagem                          |
| is_main          | derivado (large ou sort=1)| BOOLEAN   | Indica se é a imagem principal         |
| order            | image@sort               | INTEGER    | Ordem de exibição da imagem            |
| created_at       | gerado na inserção       | TIMESTAMP  | Data de criação do registro            |
| updated_at       | gerado na atualização    | TIMESTAMP  | Data de atualização do registro        |

## Regras de Transformação

1. **Categorias**:
   - Extrair hierarquia do `path` para estabelecer relacionamentos parent_id
   - Criar categorias pai quando não existirem

2. **Produtos**:
   - Cada elemento `<product>` gera um registro na tabela `products`
   - Relacionamentos estabelecidos com `categories`, `producers` e `units`

3. **Variantes**:
   - Cada elemento `<size>` dentro de `<sizes>` gera um registro na tabela `variants`
   - O código da variante combina o código do produto com o valor do atributo `s` do elemento `<size>`

4. **Preços**:
   - Para cada variante, são criados dois registros de preço:
     - Um para o preço regular (`<price>`)
     - Um para o preço sugerido (`<srp>`)

5. **Estoque**:
   - O elemento `<stock>` dentro de `<size>` gera um registro na tabela `stock`
   - Associado à variante correspondente

6. **Imagens**:
   - Cada elemento `<image>` gera um registro na tabela `images`
   - O elemento `<large>` é tratado como a imagem principal

## Processo de Importação

1. Carregar e validar o arquivo XML
2. Processar categorias e criar a hierarquia
3. Processar produtores
4. Processar unidades
5. Processar produtos
6. Processar variantes e estoque
7. Processar preços
8. Processar imagens

Este processo deve ser realizado em uma transação para garantir a integridade dos dados. Em caso de erro, a transação deve ser revertida. 