# Importador XML de Produtos (Versão Corrigida)

Este script fornece funcionalidades para importar dados de produtos a partir de arquivos XML para o banco de dados PostgreSQL do sistema AliTools B2B.

## Correções Implementadas

O script corrigido resolve vários problemas encontrados nas versões anteriores:

1. **Correção de Hierarquia de Categorias**: 
   - Implementa corretamente o relacionamento parent-child entre categorias
   - Assegura que as categorias são criadas antes dos produtos
   - Gera IDs estáveis para categorias mesmo quando não estão no XML

2. **Validação de Dados Melhorada**:
   - Validação robusta de EANs
   - Verificação de URLs
   - Normalização de valores numéricos
   - Extração de texto de diferentes formatos de campos

3. **Retentativa e Recuperação de Erros**:
   - Backoff exponencial para retentativas de operações que falham
   - Tratamento de erros mais robusto para não abortar todo o processo
   - Continua processando após falhas em batches individuais

4. **Otimizações de Performance**:
   - Operações em lote (batch) para melhor desempenho
   - Tamanho de lote otimizado (500 registros)
   - Liberação de memória para processamento de arquivos grandes
   - Uso de Maps para lookups eficientes

## Requisitos

- Node.js (versão 14 ou superior)
- Acesso a um banco de dados PostgreSQL (configurado via variáveis de ambiente)
- Pacotes NPM necessários: `sequelize`, `pg`, `pg-hstore`, `xml2js`, `dotenv`

## Configuração

O script utiliza variáveis de ambiente para configuração do banco de dados. Estas devem estar definidas em um arquivo `.env` no diretório raiz do projeto:

```
NEON_DB_URL=postgres://usuario:senha@hostname:port/database
```

Alternativamente, você pode usar `DATABASE_URL` ou `POSTGRES_URL`.

## Modos de Uso

O script pode ser executado em modo interativo ou via linha de comando.

### Modo Interativo

```
node xml-import-fixed.js
```

Ou usando os scripts auxiliares:

```
# Windows
run-import-fixed.bat

# Linux/Mac
./run-import-fixed.sh
```

No modo interativo, um menu será exibido com as seguintes opções:

1. **Importar todos os produtos de um arquivo XML**
2. **Importar um número limitado de produtos**
3. **Purgar dados existentes**
4. **Analisar uso do banco de dados**
0. **Sair**

### Modo Linha de Comando

```
# Importar todos os produtos
node xml-import-fixed.js --import <caminho-do-arquivo-xml>

# Importar com limite
node xml-import-fixed.js --import <caminho-do-arquivo-xml> --limit <numero>

# Purgar dados
node xml-import-fixed.js --purge

# Analisar banco de dados
node xml-import-fixed.js --analyze

# Exibir ajuda
node xml-import-fixed.js --help
```

## Estrutura do XML Suportada

O script suporta dois formatos principais de XML:

1. **Estrutura "geko"**:
```xml
<geko>
  <products>
    <product>
      <!-- Dados do produto -->
    </product>
  </products>
</geko>
```

2. **Estrutura "offer"**:
```xml
<offer>
  <products>
    <product>
      <!-- Dados do produto -->
    </product>
  </products>
</offer>
```

## Entidades Importadas

O script processa e importa as seguintes entidades:

- **Categorias** (com suporte a hierarquia)
- **Produtores**
- **Unidades**
- **Produtos**
- **Variantes**
- **Estoques**
- **Preços** (preços brutos e líquidos, varejo e atacado)
- **Imagens**

## Funcionalidades Adicionais

### Análise do Banco de Dados

A função de análise fornece informações sobre:

- Contagem de registros em cada tabela
- Tamanho das tabelas (dados + índices)
- Índices existentes
- Sugestões de índices que podem estar faltando
- Opção para criar índices faltantes

### Purga de Dados

Permite limpar dados existentes antes de uma nova importação:

- Remove produtos, variantes, estoques, preços e imagens
- Opção para também remover categorias, produtores e unidades
- Usa transações para garantir consistência

## Monitoramento e Logs

O script fornece logs detalhados durante a execução:

- Progresso da importação por lotes
- Tempos de execução para cada etapa
- Contagem de registros processados
- Erros e avisos detalhados
- Resumo da importação ao final

## Tratamento de Erros

- Erros em lotes individuais não interrompem o processo completo
- Retentativas automáticas para operações que falham
- Backoff exponencial para evitar sobrecarga
- Transações para garantir consistência dos dados

## Exemplos de Uso

### Importando todos os produtos do arquivo geko_products_en.xml

```
node xml-import-fixed.js --import ../../../../geko_products_en.xml
```

### Importando apenas 100 produtos para teste

```
node xml-import-fixed.js --import ../../../../geko_products_en.xml --limit 100
```

### Analisando o uso do banco de dados

```
node xml-import-fixed.js --analyze
```

## Resolução de Problemas

Se encontrar problemas durante a execução do script, verifique:

1. **Conexão com o banco de dados**:
   - A URL do banco de dados está correta?
   - O banco está acessível a partir do ambiente de execução?

2. **Formato do XML**:
   - O arquivo XML está num formato suportado?
   - O encoding do arquivo é UTF-8?

3. **Permissões no banco de dados**:
   - O usuário tem permissões para criar/modificar tabelas?

4. **Memória disponível**:
   - Para arquivos muito grandes, pode ser necessário aumentar a memória disponível para o Node.js:
   - `node --max-old-space-size=4096 xml-import-fixed.js ...`

## Limitações Conhecidas

- O script não suporta importação incremental baseada em timestamps
- A purga de dados remove completamente os registros em vez de marcá-los como inativos

---

## Histórico de Versões

### v1.0.0
- Versão inicial corrigida com suporte a hierarquia de categorias
- Implementação de retentativas e melhor tratamento de erros
- Validação melhorada de dados
- Menu interativo e modo linha de comando 