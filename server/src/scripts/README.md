# Scripts de Utilidade - AliTools B2B

Este diretório contém scripts para auxiliar no desenvolvimento, testes, manutenção e operação da plataforma AliTools B2B E-commerce.

## Índice

- [Gerenciamento de Banco de Dados](#gerenciamento-de-banco-de-dados)
- [Importação de XML](#importação-de-xml)
- [Testes e Validação](#testes-e-validação)
- [Como Executar](#como-executar)

## Gerenciamento de Banco de Dados

### Interface Interativa (Recomendado)

- **`manage-import-interactive.js`**: Interface interativa completa para gerenciar banco de dados e importação XML. Inclui:
  - Verificação de espaço
  - Backups
  - Limpeza/purga do banco
    - Limpeza seletiva (mantém dados recentes)
    - Purga completa (remove TODOS os dados das tabelas products, variants, prices, stocks, producers, units e categories)
  - Importação de XML
  - Restauração de backups
  
  **Uso:** `npm run db:interactive`

### Scripts Individuais

- **`storage-management.js`**: Gerencia o armazenamento do banco de dados, incluindo verificação, limpeza e backup.
  - `check`: Verifica espaço de armazenamento
  - `cleanup`: Limpa dados antigos (limpeza seletiva)
  - `purge`: Purga completa das tabelas afetadas pela importação
  - `backup`: Faz backup de tabelas
  - `restore <caminho>`: Restaura backup
  
  **Uso:** 
  - `npm run db:check-storage` - Verifica armazenamento
  - `npm run db:cleanup` - Limpeza seletiva
  - `npm run db:purge-import` - Purga completa
  - `npm run db:backup` - Backup

- **`test-storage-management.js`**: Versão com interface mais rica para testar as funções de gerenciamento de armazenamento.
  - Comandos: `check`, `cleanup`, `backup`, `restore`, `manage`, `all`
  
  **Uso:** `npm run db:storage-test` ou `node server/src/scripts/test-storage-management.js <comando>`

## Importação de XML

- **`direct-import-xml.js`**: Importa dados de XML GEKO diretamente para o banco de dados.
  
  **Uso:** `npm run db:import-xml` ou `node server/src/scripts/direct-import-xml.js <caminho-do-xml>`

- **`import-prices-images.js`**: Script específico para importar apenas preços e imagens.

- **`import-stocks.js`**: Script específico para importar apenas dados de estoque.

- **`run-all-imports.js`**: Executa todos os scripts de importação em sequência.

## Testes e Validação

- **`test-db-connection.js`**: Testa conexão com o banco de dados.
- **`check-db-schema.js`**: Verifica esquema do banco de dados.
- **`check-counts.js`**: Verifica contagens de registros nas tabelas.
- **`test-xml-parser.js`**: Testa o parser XML.
- **`test-real-xml.js`**: Testa o parser com XML real.
- **`run-perf-test.js`**: Executa testes de performance.
- **`check-producer-schema.js`**: Verifica o esquema da tabela de produtores.
- **`check-units-schema.js`**: Verifica o esquema da tabela de unidades.

## Como Executar

### Usando npm scripts (Recomendado)

```bash
# Interface interativa (recomendado)
npm run db:interactive

# Verificar espaço
npm run db:check-storage

# Limpeza seletiva do banco
npm run db:cleanup

# Purga completa (limpar TODAS as tabelas de importação)
npm run db:purge-import

# Backup de tabelas
npm run db:backup

# Teste completo de gerenciamento
npm run db:storage-test

# Importar XML
npm run db:import-xml
```

### Usando Node diretamente

```bash
# Interface interativa
node server/src/scripts/manage-import-interactive.js

# Gerenciamento de armazenamento
node server/src/scripts/storage-management.js check
node server/src/scripts/storage-management.js cleanup
node server/src/scripts/storage-management.js purge
node server/src/scripts/storage-management.js backup

# Testes de gerenciamento
node server/src/scripts/test-storage-management.js all

# Importação de XML
node server/src/scripts/direct-import-xml.js ./geko_products_en.xml
```

## Limitações de Armazenamento

O plano gratuito do Neon PostgreSQL tem um limite de 0.5GB de armazenamento. Os scripts de gerenciamento automaticamente monitoram e gerenciam esse espaço, mas é recomendado sempre verificar o espaço antes de importar grandes arquivos XML.

O script interativo (`manage-import-interactive.js`) cuida de toda essa gestão automaticamente. 