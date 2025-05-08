# Documentação de Índices de Banco de Dados
> Documento criado: [2024-05-05 14:30:00]  
> Última atualização: [2025-05-08 23:55:00 UTC]

## Visão Geral

Este documento descreve os índices de banco de dados implementados para a plataforma AliTools B2B E-commerce para otimizar o desempenho das consultas.

## Índices Implementados

### Índices Obrigatórios (do documento database_schema.markdown)

1. **Índice de Nome de Produto**
   - **Tabela**: `products`
   - **Colunas**: `name`
   - **Nome do Índice**: `idx_products_name`
   - **Propósito**: Permite buscas rápidas de texto em nomes de produtos, essencial para a funcionalidade de pesquisa de produtos.
   - **Implementação**: Criado no arquivo de migração base.
   - **Timestamp**: [2024-05-05 14:30:00]

2. **Índice Composto de Variante**
   - **Tabela**: `variants`
   - **Colunas**: `product_id, code`
   - **Nome do Índice**: `idx_variants_product_id_code`
   - **Propósito**: Otimiza as buscas de variantes específicas por produto e código de variante.
   - **Implementação**: Criado no arquivo de migração base.
   - **Timestamp**: [2024-05-05 14:30:00]

3. **Índice de Variante de Estoque**
   - **Tabela**: `stock`
   - **Colunas**: `variant_id`
   - **Nome do Índice**: `idx_stock_variant_id`
   - **Propósito**: Melhora o desempenho ao consultar níveis de estoque para variantes específicas.
   - **Implementação**: Criado no arquivo de migração base.
   - **Timestamp**: [2024-05-05 14:30:00]

### Índices de Otimização Adicional

4. **Índice de Variante de Preço**
   - **Tabela**: `prices`
   - **Colunas**: `variant_id`
   - **Nome do Índice**: `idx_prices_variant_id`
   - **Propósito**: Otimiza consultas de preço para variantes específicas.
   - **Implementação**: Adicionado em 20250516000001-add-additional-indexes.js
   - **Timestamp**: [2025-05-16 00:00:01]

5. **Índice de Produto de Imagem**
   - **Tabela**: `images`
   - **Colunas**: `product_id`
   - **Nome do Índice**: `idx_images_product_id`
   - **Propósito**: Melhora o desempenho ao recuperar imagens de um produto.
   - **Implementação**: Adicionado em 20250516000001-add-additional-indexes.js
   - **Timestamp**: [2025-05-16 00:00:01]

6. **Índice de Usuário de Cliente**
   - **Tabela**: `customers`
   - **Colunas**: `user_id`
   - **Nome do Índice**: `idx_customers_user_id`
   - **Propósito**: Otimiza a busca de registros de clientes por ID de usuário.
   - **Implementação**: Adicionado em 20250516000001-add-additional-indexes.js
   - **Timestamp**: [2025-05-16 00:00:01]

7. **Índice de ID Fiscal de Cliente**
   - **Tabela**: `customers`
   - **Colunas**: `tax_id`
   - **Nome do Índice**: `idx_customers_tax_id`
   - **Propósito**: Permite buscas rápidas por ID fiscal, frequentemente usado em ambientes B2B.
   - **Implementação**: Adicionado em 20250516000001-add-additional-indexes.js
   - **Timestamp**: [2025-05-16 00:00:01]

8. **Índice de Cliente de Endereço**
   - **Tabela**: `addresses`
   - **Colunas**: `customer_id`
   - **Nome do Índice**: `idx_addresses_customer_id`
   - **Propósito**: Otimiza a recuperação de todos os endereços de um cliente.
   - **Implementação**: Adicionado em 20250516000001-add-additional-indexes.js
   - **Timestamp**: [2025-05-16 00:00:01]

9. **Índice de Endereço Padrão por Tipo de Cliente**
   - **Tabela**: `addresses`
   - **Colunas**: `customer_id, type, is_default`
   - **Nome do Índice**: `idx_addresses_customer_defaults`
   - **Propósito**: Otimiza a busca de endereços padrão de envio/faturamento para um cliente.
   - **Implementação**: Adicionado em 20250516000001-add-additional-indexes.js
   - **Timestamp**: [2025-05-16 00:00:01]

10. **Índice de Código de Produto**
    - **Tabela**: `products`
    - **Colunas**: `code`
    - **Nome do Índice**: `idx_products_code`
    - **Propósito**: Permite buscas rápidas por código de produto, frequentemente usado em ambientes B2B.
    - **Implementação**: Adicionado em 20250516000001-add-additional-indexes.js
    - **Timestamp**: [2025-05-16 00:00:01]

11. **Índice de EAN de Produto**
    - **Tabela**: `products`
    - **Colunas**: `ean`
    - **Nome do Índice**: `idx_products_ean`
    - **Propósito**: Permite buscas rápidas por código EAN, usado para escaneamento de código de barras e identificação de produto.
    - **Implementação**: Adicionado em 20250516000001-add-additional-indexes.js
    - **Timestamp**: [2025-05-16 00:00:01]

12. **Índice de Armazém de Estoque**
    - **Tabela**: `stock`
    - **Colunas**: `warehouse_id`
    - **Nome do Índice**: `idx_stock_warehouse_id`
    - **Propósito**: Otimiza consultas para encontrar todo o estoque em um armazém específico.
    - **Implementação**: Adicionado em 20250516000001-add-additional-indexes.js
    - **Timestamp**: [2025-05-16 00:00:01]

### Índices Relacionados a Pedidos

13. **Índice de Cliente de Pedido**
    - **Tabela**: `orders`
    - **Colunas**: `customer_id`
    - **Nome do Índice**: `idx_orders_customer_id`
    - **Propósito**: Otimiza consultas para encontrar todos os pedidos de um cliente específico.
    - **Implementação**: Criado no arquivo de migração base.
    - **Timestamp**: [2024-05-05 14:30:00]

14. **Índice de Número de Pedido**
    - **Tabela**: `orders`
    - **Colunas**: `order_number`
    - **Nome do Índice**: `idx_orders_order_number`
    - **Propósito**: Permite buscas rápidas por número de pedido.
    - **Implementação**: Criado no arquivo de migração base.
    - **Timestamp**: [2024-05-05 14:30:00]

15. **Índice de Pedido de Item de Pedido**
    - **Tabela**: `order_items`
    - **Colunas**: `order_id`
    - **Nome do Índice**: `idx_order_items_order_id`
    - **Propósito**: Otimiza a recuperação de todos os itens de um pedido específico.
    - **Implementação**: Criado no arquivo de migração base.
    - **Timestamp**: [2024-05-05 14:30:00]

16. **Índice de Variante de Item de Pedido**
    - **Tabela**: `order_items`
    - **Colunas**: `variant_id`
    - **Nome do Índice**: `idx_order_items_variant_id`
    - **Propósito**: Otimiza consultas para encontrar todos os itens de pedido para uma variante específica.
    - **Implementação**: Criado no arquivo de migração base.
    - **Timestamp**: [2024-05-05 14:30:00]

17. **Índice de Pedido de Envio**
    - **Tabela**: `shipments`
    - **Colunas**: `order_id`
    - **Nome do Índice**: `idx_shipments_order_id`
    - **Propósito**: Otimiza a recuperação de todos os envios para um pedido específico.
    - **Implementação**: Criado no arquivo de migração base.
    - **Timestamp**: [2024-05-05 14:30:00]

18. **Índice de Número de Rastreio de Envio**
    - **Tabela**: `shipments`
    - **Colunas**: `tracking_number`
    - **Nome do Índice**: `idx_shipments_tracking_number`
    - **Propósito**: Permite buscas rápidas por número de rastreio.
    - **Implementação**: Criado no arquivo de migração base.
    - **Timestamp**: [2024-05-05 14:30:00]

## Teste de Índices

Para verificar se o banco de dados está usando os índices corretamente, um script de teste foi criado em `server/src/scripts/test-indexes.js`. Este script executa consultas com EXPLAIN ANALYZE para verificar se o PostgreSQL está usando os índices conforme esperado.

Execute o teste com:

```bash
npm run db:test-indexes
```

O script testa vários índices-chave e exibe o plano de execução da consulta, que deve confirmar que os índices estão sendo usados.

## Recomendações para Otimização Futura

1. **Monitorar o desempenho das consultas** durante o desenvolvimento e uso em produção para identificar consultas lentas que possam se beneficiar de índices adicionais.

2. **Considerar manutenção de índices** - Adicionar as seguintes tarefas de manutenção a uma programação regular:
   - `REINDEX`: Reconstrói índices para melhorar o desempenho após muitas atualizações.
   - `VACUUM ANALYZE`: Atualiza estatísticas da tabela para ajudar o planejador de consultas a tomar melhores decisões.

3. **Evitar excesso de índices** - Cada índice adiciona sobrecarga às operações de escrita, portanto, adicione apenas índices que suportem padrões de consulta reais.

4. **Considerar índices parciais** para tabelas com padrões de consulta específicos em um subconjunto de linhas.

## Estratégias de Monitoramento de Desempenho

Para garantir a eficácia contínua dos índices, implementamos as seguintes estratégias de monitoramento:

1. **Logs de consultas lentas**: Configuradas para registrar qualquer consulta que leve mais de 100ms
2. **Revisão periódica de planos de execução**: Análise mensal dos planos EXPLAIN para consultas críticas
3. **Alerta automático**: Notificações quando o tempo médio de consulta aumenta além dos limiares aceitáveis
4. **Dashboards de desempenho**: Visualizações em tempo real do desempenho do banco de dados no painel de administração

## Histórico de Alterações de Índices

| Data | Versão | Descrição | Autor |
|------|--------|-----------|-------|
| [2024-05-05] | 1.0.0 | Índices iniciais de base implementados | DevTeam |
| [2025-05-16] | 1.1.0 | Índices adicionais para otimização implementados | DevOps |
| [2025-05-08] | 1.1.1 | Documentação atualizada com timestamps | Claude |

---

> Última atualização: [2025-05-08 23:55:00 UTC]  
> Autor: Claude 