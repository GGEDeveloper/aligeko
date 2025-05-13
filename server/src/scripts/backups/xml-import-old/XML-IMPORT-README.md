# Importador de XML GEKO para PostgreSQL

Este conjunto de scripts permite importar dados de produtos da GEKO do arquivo XML para o banco de dados PostgreSQL.

## Pré-requisitos

- Node.js v14 ou superior
- Conexão com o banco de dados PostgreSQL (Neon via Vercel ou outra)
- Variáveis de ambiente configuradas (usando arquivo `.env` na raiz do projeto)

## Conteúdo

- `xml-import-simple.js`: Script básico de importação de XML
- `xml-import-interactive.js`: Script interativo com menu para importação, purga e análise
- `run-import.bat`: Script batch para execução automática no Windows
- `run-import.sh`: Script shell para execução automática no Linux/Mac
- `run-import-interactive.bat`: Script batch para execução do modo interativo no Windows
- `run-import-interactive.sh`: Script shell para execução do modo interativo no Linux/Mac

## Configuração

O script utiliza as variáveis de ambiente do arquivo `.env` na raiz do projeto:

```
NODE_ENV=production
NEON_DB_URL=postgres://seu_usuario:sua_senha@seu_host.neon.tech/seu_banco?sslmode=require
```

Ou as variáveis individuais:

```
DB_HOST=seu_host.neon.tech
DB_PORT=5432
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
DB_NAME=seu_banco
DB_SSL=true
```

## Uso

### Método 1: Modo Interativo (Recomendado)

No Windows:
```
cd server/src/scripts
run-import-interactive.bat
```

No Linux/Mac:
```
cd server/src/scripts
chmod +x run-import-interactive.sh
./run-import-interactive.sh
```

O modo interativo oferece um menu com as seguintes opções:
1. Importar todos os produtos do XML
2. Importar número limitado de produtos
3. Purgar dados existentes no banco
4. Analisar uso de espaço no banco de dados
5. Sair

### Método 2: Execução Automática

No Windows:
```
cd server/src/scripts
run-import.bat [caminho-opcional-para-xml]
```

No Linux/Mac:
```
cd server/src/scripts
chmod +x run-import.sh
./run-import.sh [caminho-opcional-para-xml]
```

### Método 3: Execução Direta com Node.js

```
cd server/src/scripts
node xml-import-simple.js [caminho-opcional-para-xml]
```

Se não for especificado um caminho para o arquivo XML, o script tentará usar o arquivo `produkty_xml_3_26-04-2025_12_51_02_en.xml` na raiz do projeto.

## Fluxo de Processamento

1. **Conexão com o Banco**: Conecta com o PostgreSQL usando as variáveis de ambiente
2. **Análise do XML**: Usa a biblioteca xml2js para analisar o arquivo
3. **Transformação**: Converte os dados para o formato correto do banco de dados
4. **Importação**: Insere os dados em transação para garantir consistência
   - Categorias
   - Produtores
   - Unidades
   - Produtos
   - Variantes
   - Estoques
   - Preços
   - Imagens

## Resolução de Problemas

Se você encontrar problemas com a importação:

1. **Verifique a conexão com o banco**: Certifique-se que as credenciais estão corretas
2. **Estrutura do XML**: Verifique se o arquivo XML segue o formato esperado (offer/geko)
3. **Registros em log**: Verifique as mensagens de erro no console
4. **Transação**: Os dados só são salvos se toda a importação for bem-sucedida

## Otimização

O script utiliza:
- Processamento em lotes para evitar problemas de memória
- Mapeamento de entidades para associações corretas
- Transações para garantir integridade dos dados

## Limitações Conhecidas

- O script não implementa importação incremental
- Validação limitada dos dados do XML
- As operações de bulkCreate podem ser otimizadas para conjuntos muito grandes de dados

## Código Fonte Relacionado

- `server/src/models/`: Contém as definições dos modelos do banco de dados
- `server/src/config/database.js`: Configuração da conexão com o banco de dados
- `server/src/utils/`: Utilitários de processamento de dados

## Funcionalidades do Modo Interativo

### Importação Completa
- Importa todos os produtos do arquivo XML
- Reconhece automaticamente o formato do XML (offer/geko)
- Executa dentro de uma transação para garantir consistência

### Importação Limitada 
- Importa um número específico de produtos
- Útil para testes e verificação sem importar o arquivo completo
- Reduz tempo de processamento e uso de memória

### Purga de Dados
- Remove completamente os dados das tabelas relacionadas a produtos
- Requer confirmação dupla para evitar exclusões acidentais
- Mantém a estrutura do banco de dados intacta

### Análise de Espaço
- Fornece estatísticas sobre o uso de espaço no banco de dados
- Exibe contagem de registros por tabela
- Apresenta o tamanho dos dados, índices e total por tabela
- Calcula métricas como média de variantes por produto

## Otimizações do Importador

O importador inclui diversas otimizações para lidar com grandes volumes de dados:

- **Processamento Batch**: Importação em lotes para economia de memória
- **Mapeamento Eficiente**: Uso de Maps para associações rápidas entre entidades
- **Tratamento de Erros**: Isolamento de erros por lote para que falhas individuais não interrompam o processo inteiro
- **Transações**: Garantia de atomicidade nas operações de banco de dados
- **Relatórios Detalhados**: Acompanhamento em tempo real do progresso da importação 

# XML Import Interactive (Enhanced)

## Descrição
O script `xml-import-interactive.js` é uma ferramenta interativa para importar dados de produtos da GEKO a partir de arquivos XML para o banco de dados PostgreSQL. Esta versão aprimorada inclui recursos de correção automática de descrições de produtos, processamento em lote para melhor desempenho, normalização de valores numéricos e tratamento avançado de erros.

## Funcionalidades
- **Menu Interativo**: Interface de linha de comando para operações
- **Importação Completa ou Parcial**: Opção para importar todos os produtos ou um número limitado
- **Correção de Descrições**: Funcionalidade para corrigir descrições de produtos mal-formadas
- **Processamento em Lote**: Importação eficiente com operações em lote
- **Backup Automático**: Backup do banco antes de operações destrutivas
- **Análise de Espaço**: Ferramenta para analisar uso de espaço no banco
- **Verificação de Estrutura**: Validação da estrutura do banco antes da importação
- **Normalização de Valores**: Conversão adequada de formatos numéricos
- **Tratamento de Erros Robusto**: Sistema avançado de tratamento de erros e transações

## Requisitos
- Node.js (v14+)
- PostgreSQL (v12+)
- Acesso à internet (para conexão com banco de dados Neon)
- Variáveis de ambiente configuradas (`NEON_DB_URL` ou credenciais individuais)

## Variáveis de Ambiente
O script pode usar as seguintes variáveis de ambiente (no arquivo `.env` no diretório raiz do projeto):

```
# URL direta (recomendado)
NEON_DB_URL=postgres://user:password@host/database

# OU credenciais individuais
DB_HOST=host
DB_PORT=5432
DB_NAME=database
DB_USER=user
DB_PASSWORD=password
```

## Instalação
1. Certifique-se de ter Node.js instalado
2. Configure as variáveis de ambiente no arquivo `.env`
3. Execute o script usando os scripts de execução fornecidos:
   - Windows: `run-import-interactive.bat`
   - Linux/Mac: `run-import-interactive.sh`

## Uso
### Windows
```
run-import-interactive.bat
```

### Linux/Mac
```
chmod +x run-import-interactive.sh
./run-import-interactive.sh
```

### Menu Principal
Ao executar o script, você verá um menu interativo com as seguintes opções:

1. **Importar todos os produtos do XML**
   - Permite importar todos os produtos de um arquivo XML
   
2. **Importar número limitado de produtos**
   - Permite importar apenas um número específico de produtos para testes
   
3. **Purgar dados existentes (com backup)**
   - Limpa todas as tabelas relacionadas a produtos (com backup automático)
   
4. **Analisar uso de espaço no banco**
   - Mostra estatísticas sobre o uso de espaço por tabela
   
5. **Verificar estrutura das tabelas**
   - Valida a estrutura das tabelas no banco de dados
   
6. **Corrigir descrições de produtos**
   - Corrige descrições de produtos que foram importadas incorretamente
   
7. **Sair**
   - Encerra o programa

## Fluxo de Trabalho Recomendado
1. **Verificar estrutura das tabelas** (opção 5)
2. **Analisar espaço atual** (opção 4) para entender o estado atual do banco
3. **Purgar dados se necessário** (opção 3) para começar com um banco limpo
4. **Importar um número limitado de produtos** (opção 2) para teste
5. **Verificar e corrigir descrições** (opção 6) se necessário
6. **Importar todos os produtos** (opção 1) para a importação final

## Detalhes Técnicos
- Usa transações para garantir a integridade dos dados
- Processa dados em lotes de 500 registros para otimizar performance
- Implementa mecanismo de mapeamento para relações entre entidades
- Trata automaticamente estruturas XML diferentes (geko/offer)
- Extrai corretamente campos de descrição que podem estar em diferentes formatos
- Normaliza valores numéricos, convertendo vírgulas para pontos decimais

## Tratamento de Erros
- Erros durante o processamento de lotes individuais não interrompem a importação completa
- Transações são revertidas em caso de falha crítica
- Logs detalhados indicam exatamente onde ocorreram erros
- Validação prévia da conexão com o banco e estrutura das tabelas

## Limitações Conhecidas
- A adaptação automática das estruturas de tabelas tem limitações
- Campos de descrição muito complexos podem exigir correção manual
- O progresso não é salvo entre execuções do script

## Suporte
Para problemas e sugestões, entre em contato com a equipe de desenvolvimento.

---

© Ali Tools B2B E-commerce 2025 