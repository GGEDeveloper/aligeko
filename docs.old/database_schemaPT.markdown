# Especificação Completa do Banco de Dados PostgreSQL

Este documento descreve em detalhe todas as tabelas, campos, tipos de dados, chaves primárias, chaves estrangeiras e relacionamentos necessários para o projeto **Ali Tools B2B E-commerce**.

---

## 1. Tabela `products`

Armazena os dados principais de cada produto.

| Coluna              | Tipo         | Restrições                                              | Descrição                             |
| ------------------- | ------------ | ------------------------------------------------------- | ------------------------------------- |
| `id`                | SERIAL       | PRIMARY KEY                                             | Identificador único do produto        |
| `code`              | TEXT         | NOT NULL                                                | Código interno                        |
| `code_on_card`      | TEXT         |                                                         | Código exibido no catálogo            |
| `ean`               | TEXT         | UNIQUE                                                  | Código de barras (EAN)                |
| `producer_code`     | TEXT         |                                                         | Código do produtor                    |
| `name`              | TEXT         | NOT NULL                                                | Nome do produto                       |
| `description_long`  | TEXT         |                                                         | Descrição detalhada (HTML)            |
| `description_short` | TEXT         |                                                         | Descrição breve (HTML)                |
| `description_html`  | TEXT         |                                                         | Campo adicional de descrição completa |
| `vat`               | NUMERIC(5,2) |                                                         | Percentual de VAT                     |
| `delivery_date`     | DATE         |                                                         | Data de entrega (se aplicável)        |
| `url`               | TEXT         |                                                         | Link para a página externa do produto |
| `created_at`        | TIMESTAMP    | DEFAULT CURRENT_TIMESTAMP                              | Data de criação do registro           |
| `updated_at`        | TIMESTAMP    | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | Data de última atualização            |

## 2. Tabela `categories`

Armazena categorias hierárquicas de produtos.

| Coluna | Tipo | Restrições  | Descrição                        |
| ------ | ---- | ----------- | -------------------------------- |
| `id`   | TEXT | PRIMARY KEY | Identificador único da categoria |
| `name` | TEXT | NOT NULL    | Nome da categoria                |
| `path` | TEXT |             | Caminho hierárquico da categoria |

## 3. Tabela `producers`

Armazena fabricantes de produtos.

| Coluna | Tipo   | Restrições       | Descrição                       |
| ------ | ------ | ---------------- | ------------------------------- |
| `id`   | SERIAL | PRIMARY KEY      | Identificador único do produtor |
| `name` | TEXT   | NOT NULL, UNIQUE | Nome do fabricante              |

## 4. Tabela `units`

Define unidades de medida e MOQ (quantidade mínima de pedido).

| Coluna | Tipo    | Restrições  | Descrição                        |
| ------ | ------- | ----------- | -------------------------------- |
| `id`   | TEXT    | PRIMARY KEY | Identificador da unidade         |
| `name` | TEXT    | NOT NULL    | Nome da unidade (e.g., pcs, kpl) |
| `moq`  | INTEGER | NOT NULL    | Quantidade mínima de pedido      |

## 5. Tabela `variants`

Variações de produto (por tamanho, cor, etc.).

| Coluna         | Tipo    | Restrições                           | Descrição                       |
| -------------- | ------- | ------------------------------------ | ------------------------------- |
| `id`           | SERIAL  | PRIMARY KEY                          | Identificador único da variante |
| `product_id`   | INTEGER | NOT NULL, FOREIGN KEY → products(id) | Referência ao produto pai       |
| `code`         | TEXT    | NOT NULL                             | Código da variante              |
| `weight`       | NUMERIC |                                      | Peso líquido (em gramas)        |
| `gross_weight` | NUMERIC |                                      | Peso bruto (em gramas)          |

## 6. Tabela `stock`

Quantidade de cada variante disponível em cada depósito.

| Coluna         | Tipo    | Restrições                           | Descrição                                  |
| -------------- | ------- | ------------------------------------ | ------------------------------------------ |
| `id`           | SERIAL  | PRIMARY KEY                          | Identificador único do registro de estoque |
| `variant_id`   | INTEGER | NOT NULL, FOREIGN KEY → variants(id) | Referência à variante                      |
| `warehouse_id` | TEXT    | NOT NULL                             | Identificador do depósito                  |
| `quantity`     | INTEGER | NOT NULL                             | Quantidade disponível                      |

## 7. Tabela `prices`

Preços de cada variante, incluindo SRP.

| Coluna        | Tipo          | Restrições                           | Descrição                                |
| ------------- | ------------- | ------------------------------------ | ---------------------------------------- |
| `id`          | SERIAL        | PRIMARY KEY                          | Identificador único do registro de preço |
| `variant_id`  | INTEGER       | NOT NULL, FOREIGN KEY → variants(id) | Referência à variante                    |
| `gross_price` | NUMERIC(10,2) | NOT NULL                             | Preço bruto                              |
| `net_price`   | NUMERIC(10,2) | NOT NULL                             | Preço líquido                            |
| `srp_gross`   | NUMERIC(10,2) |                                      | SRP bruto (opcional)                     |
| `srp_net`     | NUMERIC(10,2) |                                      | SRP líquido (opcional)                   |

## 8. Tabela `images`

URLs das imagens associadas a cada produto.

| Coluna       | Tipo    | Restrições                           | Descrição                     |
| ------------ | ------- | ------------------------------------ | ----------------------------- |
| `id`         | SERIAL  | PRIMARY KEY                          | Identificador único da imagem |
| `product_id` | INTEGER | NOT NULL, FOREIGN KEY → products(id) | Referência ao produto         |
| `url`        | TEXT    | NOT NULL                             | URL da imagem                 |

---

### Índices e Performance

- **Índice em `products(name)`** para buscas rápidas.
- **Índice composto em `variants(product_id, code)`** para lookup de variantes.
- **Índice em `stock(variant_id)`** para consultas de estoque.

---

### Considerações

- Use `ON CONFLICT DO NOTHING` em operações de importação para evitar duplicação.
- Aplique validações de formato (regex) para `ean` e URLs antes da inserção.
- Normalize campos textuais (trim, escape HTML) conforme necessidade.

---