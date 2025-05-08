# Seed Data Documentation

Este documento descreve os dados de exemplo (seed data) gerados para o AliTools B2B e-commerce.

## Visão Geral

Os dados de exemplo foram criados para facilitar o desenvolvimento e testes, fornecendo um ambiente com dados realistas. Eles incluem:

- Usuários com diferentes perfis (admin, gerente, vendas, clientes)
- Clientes com informações de empresa
- Endereços de faturamento e entrega
- Categorias de produtos organizadas hierarquicamente
- Produtos com detalhes técnicos
- Variantes de produtos
- Estoque em diferentes armazéns
- Preços com valores brutos e líquidos
- Pedidos com itens
- Entregas

## Estrutura dos Arquivos Seed

Os arquivos seguem uma ordem específica para respeitar as dependências entre as tabelas:

1. `20250516000001-seed-users.js` - Usuários do sistema
2. `20250516000002-seed-customers.js` - Clientes (empresas)
3. `20250516000003-seed-addresses.js` - Endereços dos clientes
4. `20250516000004-seed-categories.js` - Categorias de produtos
5. `20250516000005-seed-producers-and-units.js` - Fabricantes e unidades de medida
6. `20250516000006-seed-products.js` - Produtos, variantes, estoque, preços e imagens
7. `20250516000007-seed-orders.js` - Pedidos, itens e entregas

## Dados de Exemplo

### Usuários

- Admin: admin@alitools.com.br (Admin@123)
- Gerente: manager@alitools.com.br (Manager@123)
- Vendas: sales@alitools.com.br (Sales@123)
- Clientes: customer1@example.com, customer2@example.com (Customer@123)

### Clientes

- Ferramentas Express Ltda. (Loja de varejo)
- Construções e Reformas SA (Construtora)

### Categorias

Categorias principais:
- Ferramentas Elétricas
- Ferramentas Manuais
- Fixação

Subcategorias:
- Furadeiras, Serras, Lixadeiras (Ferramentas Elétricas)
- Martelos, Chaves de Fenda, Alicates (Ferramentas Manuais)
- Parafusos, Buchas, Pregos (Fixação)

### Produtos

Exemplos de produtos nos dados:
- Furadeira de Impacto 750W (Bosch)
- Serra Circular 7.1/4" 1800W (DeWalt)
- Conjunto de Chaves de Fenda 6 peças (TechTools)
- Martelo de Unha 27mm (ProBuilder)
- Parafusos Phillips 4.5x40mm (TechTools)

### Pedidos

- PED-2025-0001: Pedido completado para Ferramentas Express
- PED-2025-0002: Pedido em processamento para Construções e Reformas

## Executando as Seeds

Para executar as seeds, use o comando:

```bash
# Em desenvolvimento (local)
npm run db:seed:all

# Em produção (após build)
npm run db:seed:prod
```

## Reiniciando o Banco de Dados

Para limpar todos os dados e reiniciar:

```bash
# Desfaz todas as migrations
npm run db:migrate:undo:all

# Executa todas as migrations
npm run db:migrate

# Executa todas as seeds
npm run db:seed:all
```

## Notas Importantes

- As senhas nos seeds estão codificadas com bcrypt
- Os IDs de produtos, variantes, etc. são numéricos sequenciais
- Os IDs de usuários, clientes, endereços, pedidos são UUIDs
- Existem relacionamentos entre todas as entidades para testes de join e queries relacionais 