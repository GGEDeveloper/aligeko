# Análise da Estrutura XML do GEKO

## Introdução

Este documento contém a análise detalhada da estrutura XML fornecida pelo GEKO API para importação de produtos, variantes, categorias, produtores e outros dados relacionados. O objetivo é identificar todos os campos disponíveis e mapear como eles devem ser armazenados no banco de dados para o sistema AliTools B2B.

## Estrutura do XML

O arquivo XML do GEKO segue a seguinte estrutura hierárquica:

```xml
<offer file_format="IOF" version="2.6" generated="data">
  <products language="en" currency="EUR">
    <product id="..." vat="..." code="..." code_on_card="..." EAN="..." code_producer="...">
      <producer name="..." id="..."/>
      <category id="..." name="..." path="..."/>
      <category_idosell path="..." />
      <unit id="..." name="..." moq="..."/>
      <card url="..."/>
      <description>
        <n><![CDATA[...]]></n>
        <long_desc xml:lang="en"><![CDATA[...]]></long_desc>
        <short_desc xml:lang="en"><![CDATA[...]]></short_desc>
        <description><![CDATA[...]]></description>
      </description>
      <delivery></delivery>
      <price gross="..." net="..."/>
      <srp gross="..." net="..."/>
      <sizes>
        <size code="..." weight="..." grossWeight="...">
          <stock id="..." quantity="..."/>
          <price gross="..." net="..."/>
          <srp gross="..." net="..."/>
        </size>
      </sizes>
      <!-- Potencialmente imagens e outros elementos -->
    </product>
    <!-- Múltiplos produtos -->
  </products>
</offer>
```

## Mapeamento de Campos

### 1. Produto Principal

| Campo XML | Descrição | Tipo de Dados | Tabela | Campo BD |
|-----------|-----------|---------------|--------|----------|
| `@id` | ID do produto | Integer | products | id |
| `@vat` | Valor do imposto (%) | Decimal | products | vat |
| `@code` | Código do produto | Text | products | code |
| `@code_on_card` | Código no cartão | Text | products | code_on_card |
| `@EAN` | Código de barras EAN | Text | products | ean |
| `@code_producer` | Código do produtor | Text | products | producer_code |
| `description/n` | Nome do produto | Text | products | name |
| `description/long_desc` | Descrição longa | Text | products | description_long |
| `description/short_desc` | Descrição curta | Text | products | description_short |
| `description/description` | Descrição HTML | Text | products | description_html |
| `card/@url` | URL do produto | Text | products | url |
| `delivery` | Data de entrega | Date | products | delivery_date |
| *Não presente no XML* | Criado em | Timestamp | products | created_at |
| *Não presente no XML* | Atualizado em | Timestamp | products | updated_at |

### 2. Categoria

| Campo XML | Descrição | Tipo de Dados | Tabela | Campo BD |
|-----------|-----------|---------------|--------|----------|
| `category/@id` | ID da categoria | Text | categories | id |
| `category/@name` | Nome da categoria | Text | categories | name |
| `category/@path` | Caminho da categoria | Text | categories | path |
| `category_idosell/@path` | Caminho alternativo | Text | categories | idosell_path |
| *Extrair do path* | ID da categoria pai | Text | categories | parent_id |
| *Não presente no XML* | Criado em | Timestamp | categories | created_at |
| *Não presente no XML* | Atualizado em | Timestamp | categories | updated_at |

### 3. Produtor

| Campo XML | Descrição | Tipo de Dados | Tabela | Campo BD |
|-----------|-----------|---------------|--------|----------|
| `producer/@id` | ID do produtor (opcional) | Integer | producers | id |
| `producer/@name` | Nome do produtor | Text | producers | name |
| *Não presente neste XML* | Descrição do produtor | Text | producers | description |
| *Não presente neste XML* | Site do produtor | Text | producers | website |
| *Não presente no XML* | Criado em | Timestamp | producers | created_at |
| *Não presente no XML* | Atualizado em | Timestamp | producers | updated_at |

### 4. Unidade

| Campo XML | Descrição | Tipo de Dados | Tabela | Campo BD |
|-----------|-----------|---------------|--------|----------|
| `unit/@id` | ID da unidade | Text | units | id |
| `unit/@name` | Nome da unidade | Text | units | name |
| `unit/@moq` | Quantidade mínima de pedido | Integer | units | moq |
| *Não presente no XML* | Criado em | Timestamp | units | created_at |
| *Não presente no XML* | Atualizado em | Timestamp | units | updated_at |

### 5. Variante (Sizes)

| Campo XML | Descrição | Tipo de Dados | Tabela | Campo BD |
|-----------|-----------|---------------|--------|----------|
| *Relacionamento* | ID do produto pai | Integer | variants | product_id |
| `sizes/size/@code` | Código da variante | Text | variants | code |
| `sizes/size/@weight` | Peso da variante | Decimal | variants | weight |
| `sizes/size/@grossWeight` | Peso bruto | Decimal | variants | gross_weight |
| *Não presente neste XML* | Nome/Descrição da variante | Text | variants | name |
| *Não presente no XML* | Criado em | Timestamp | variants | created_at |
| *Não presente no XML* | Atualizado em | Timestamp | variants | updated_at |

### 6. Estoque

| Campo XML | Descrição | Tipo de Dados | Tabela | Campo BD |
|-----------|-----------|---------------|--------|----------|
| *Relacionamento* | ID da variante | Integer | stocks | variant_id |
| `sizes/size/stock/@id` | ID do estoque | Integer | stocks | id |
| `sizes/size/stock/@quantity` | Quantidade em estoque | Integer | stocks | quantity |
| *Não presente neste XML* | Disponibilidade | Boolean | stocks | available |
| *Não presente neste XML* | Quantidade mínima de pedido | Integer | stocks | min_order_quantity |
| *Não presente no XML* | Criado em | Timestamp | stocks | created_at |
| *Não presente no XML* | Atualizado em | Timestamp | stocks | updated_at |

### 7. Preço

| Campo XML | Descrição | Tipo de Dados | Tabela | Campo BD |
|-----------|-----------|---------------|--------|----------|
| *Relacionamento* | ID da variante | Integer | prices | variant_id |
| `sizes/size/price/@gross` | Preço bruto | Decimal | prices | gross_price |
| `sizes/size/price/@net` | Preço líquido | Decimal | prices | net_price |
| `sizes/size/srp/@gross` | Preço sugerido bruto | Decimal | prices | srp_gross |
| `sizes/size/srp/@net` | Preço sugerido líquido | Decimal | prices | srp_net |
| *Não presente neste XML* | Moeda | Text | prices | currency |
| *Não presente neste XML* | Tipo de preço | Text | prices | price_type |
| *Não presente neste XML* | Quantidade mínima | Integer | prices | min_quantity |
| *Não presente no XML* | Criado em | Timestamp | prices | created_at |
| *Não presente no XML* | Atualizado em | Timestamp | prices | updated_at |

### 8. Imagem

| Campo XML | Descrição | Tipo de Dados | Tabela | Campo BD |
|-----------|-----------|---------------|--------|----------|
| *Relacionamento* | ID do produto | Integer | images | product_id |
| *Não presente neste XML* | URL da imagem | Text | images | url |
| *Não presente neste XML* | É a imagem principal | Boolean | images | is_main |
| *Não presente neste XML* | Ordem da imagem | Integer | images | order |
| *Não presente no XML* | Criado em | Timestamp | images | created_at |
| *Não presente no XML* | Atualizado em | Timestamp | images | updated_at |

### 9. Documento (para download)

| Campo XML | Descrição | Tipo de Dados | Tabela | Campo BD |
|-----------|-----------|---------------|--------|----------|
| *Relacionamento* | ID do produto | Integer | documents | product_id |
| *Não presente neste XML* | Nome do documento | Text | documents | name |
| *Não presente neste XML* | URL do documento | Text | documents | url |
| *Não presente neste XML* | Tipo do documento | Text | documents | type |
| *Não presente no XML* | Criado em | Timestamp | documents | created_at |
| *Não presente no XML* | Atualizado em | Timestamp | documents | updated_at |

### 10. Propriedades do Produto

| Campo XML | Descrição | Tipo de Dados | Tabela | Campo BD |
|-----------|-----------|---------------|--------|----------|
| *Relacionamento* | ID do produto | Integer | product_properties | product_id |
| *Não presente neste XML* | Nome da propriedade | Text | product_properties | name |
| *Não presente neste XML* | Valor da propriedade | Text | product_properties | value |
| *Não presente no XML* | Criado em | Timestamp | product_properties | created_at |
| *Não presente no XML* | Atualizado em | Timestamp | product_properties | updated_at |

## Notas e Considerações

1. **XML Incompleto**: A amostra XML disponível não contém todos os campos que podem estar presentes em outros arquivos XML GEKO. É importante verificar amostras adicionais para garantir que todos os campos possíveis sejam considerados.

2. **Campos Ausentes no XML**: Vários campos que devem estar no banco de dados (como timestamps created_at e updated_at) não estão presentes no XML e precisarão ser gerados durante a importação.

3. **Relações entre Tabelas**: 
   - Produtos têm relações com categorias, produtores e unidades
   - Variantes pertencem a produtos
   - Preços e estoques pertencem a variantes
   - Imagens e documentos pertencem a produtos

4. **Campos Adicionais Necessários**: Considerando o contexto de um sistema B2B, podem ser necessários campos adicionais que não estão presentes no XML, como status do produto, avaliação, tags, etc.

5. **Validação de Dados**: Será necessário implementar validação para todos os campos, especialmente para formatos específicos como EAN (formato numérico específico) e URLs.

## Próximos Passos

1. Verificar se os modelos atuais do banco de dados contêm todos os campos necessários identificados nesta análise.
2. Atualizar os modelos conforme necessário para incluir campos ausentes.
3. Implementar lógica no parser para extrair e transformar corretamente todos os campos identificados.
4. Adicionar validação robusta para garantir a integridade dos dados.

## Conclusão

A análise da estrutura XML do GEKO revela uma hierarquia clara de dados relacionados a produtos, variantes, categorias, produtores e outros elementos. O mapeamento desses dados para as tabelas do banco de dados permitirá a implementação de um sistema de importação completo que capture todas as informações disponíveis no XML. 