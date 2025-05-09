# Guia de Persistência de Dados XML no Banco de Dados

Este documento fornece um guia completo sobre o uso do serviço de persistência de dados para importações XML no sistema B2B AliTools.

## Visão Geral

O `DatabasePersistenceService` foi desenvolvido para otimizar o processo de armazenamento de dados XML no banco de dados, com foco em:

- Processamento eficiente de grandes volumes de dados
- Gerenciamento apropriado de memória
- Tratamento otimizado de transações
- Processamento em lotes para melhor desempenho
- Rastreamento abrangente de métricas
- Recuperação de erros e tolerância a falhas

## Arquitetura

O sistema de persistência de dados funciona em conjunto com o parser XML e o serviço de importação:

```
┌─────────────────┐     ┌───────────────────┐     ┌─────────────────────────┐
│  GekoXmlParser  │ ──> │ GekoImportService │ ──> │ DatabasePersistenceService │
└─────────────────┘     └───────────────────┘     └─────────────────────────┘
     Parsing XML          Coordenação            Otimização da Persistência
```

## Como Usar o Serviço

### Uso Básico

```javascript
import DatabasePersistenceService from '../services/database-persistence.service.js';

// Criar uma instância do serviço com opções padrão
const dbService = new DatabasePersistenceService();

// Persistir dados transformados
const result = await dbService.persistData(transformedData);

console.log(`Persistência concluída em ${result.totalTime} segundos`);
console.log(`Produtos criados: ${result.stats.created.products}`);
```

### Integração com GekoImportService

A maneira recomendada é usar o método `persistTransformedData` do `GekoImportService`:

```javascript
import GekoImportService from '../services/geko-import-service.js';

const importService = new GekoImportService();

// Depois de analisar o XML
const result = await importService.persistTransformedData(transformedData, {
  batchSize: 500,
  updateExisting: true,
  skipImages: false
});

if (result.success) {
  console.log(`Importação concluída em ${result.totalTime} segundos`);
} else {
  console.error(`Falha na importação: ${result.error}`);
}
```

## Opções de Configuração

O serviço aceita várias opções de configuração para personalizar o comportamento:

| Opção | Tipo | Padrão | Descrição |
|-------|------|--------|-----------|
| `batchSize` | Number | 500 | Tamanho do lote para processamento em massa |
| `updateExisting` | Boolean | true | Atualizar registros existentes |
| `skipImages` | Boolean | false | Ignorar importação de imagens |
| `retryAttempts` | Number | 3 | Número de tentativas para operações com falha |
| `memoryManagement` | Boolean | true | Ativar otimizações de gerenciamento de memória |
| `logLevel` | String | 'info' | Nível de detalhamento dos logs |

## Optimizações de Desempenho

### Tamanho do Lote (Batch Size)

O parâmetro `batchSize` tem um impacto significativo no desempenho:

- **Valores menores** (50-100): Menor consumo de memória, mas mais operações de banco de dados
- **Valores maiores** (500-1000): Melhor desempenho, mas maior consumo de memória
- **Valores muito grandes** (>2000): Pode causar problemas de memória ou timeout

Testes internos mostraram que 500 é um bom valor de equilíbrio para a maioria dos casos.

### Gerenciamento de Memória

Quando `memoryManagement` está ativado, o serviço:

1. Libera referências a objetos não utilizados
2. Tenta acionar a coleta de lixo após operações grandes
3. Limita a quantidade de dados mantidos em memória

Para importar arquivos muito grandes (>100MB), considere:

```javascript
// Para arquivos XML extremamente grandes
const options = {
  batchSize: 250,  // Menor para reduzir a memória por lote
  memoryManagement: true,
  skipImages: true  // Importe imagens em um processo separado
};
```

## Rastreamento de Métricas

O serviço rastreia métricas abrangentes durante o processo de importação:

```javascript
const result = await dbService.persistData(transformedData);

// Estatísticas de tempo
console.log(`Tempo total: ${result.totalTime} segundos`);
console.log(`Tempo de categoria: ${result.stats.processingTime.categories} segundos`);

// Estatísticas de entidade
console.log(`Produtos criados: ${result.stats.created.products}`);
console.log(`Produtos atualizados: ${result.stats.updated.products}`);
console.log(`Produtos ignorados: ${result.stats.skipped.products}`);
console.log(`Erros de produtos: ${result.stats.errors.products}`);
```

## Tratamento de Erros

O serviço implementa uma estratégia robusta de tratamento de erros:

1. **Nível de Transação**: Se ocorrer um erro catastrófico, toda a transação é revertida
2. **Nível de Entidade**: Erros em uma entidade específica não interrompem outras entidades
3. **Nível de Lote**: Erros em um lote não interrompem outros lotes
4. **Nível de Registro**: Registros problemáticos são ignorados, permitindo que os válidos sejam processados

Exemplo de manipulação de erros:

```javascript
try {
  const result = await dbService.persistData(transformedData);
  if (!result.success) {
    console.error(`Falha na persistência: ${result.error}`);
    // Registre o erro, notifique administradores, etc.
  }
} catch (error) {
  console.error(`Erro catastrófico: ${error.message}`);
  // Implementar estratégia de fallback
}
```

## Estratégia de Persistência por Entidade

O serviço implementa estratégias diferentes para cada tipo de entidade:

### Produtos

1. Busca produtos existentes pelo código
2. Verifica dependências (categoria, produtor, unidade)
3. Cria novos produtos ou atualiza existentes
4. Mantém um mapa de códigos de produto para IDs

### Variantes

1. Busca variantes existentes pelo código
2. Resolve a relação com o produto (usando o mapa de códigos)
3. Cria novas variantes ou atualiza existentes
4. Mantém um mapa de códigos de variante para IDs

### Entidades Dependentes (Preços, Estoques, Imagens)

1. Verifica a existência da entidade principal (produto ou variante)
2. Busca registros existentes
3. Cria novos registros ou atualiza existentes

## Script de Teste de Desempenho

O repositório inclui um script de teste `test-db-persistence.js` que pode ser usado para avaliar o desempenho do serviço com diferentes configurações:

```bash
node src/scripts/test-db-persistence.js caminho/para/arquivo.xml
```

Este script testará diferentes tamanhos de lote e relatará métricas de desempenho detalhadas.

## Melhores Práticas

1. **Teste antes de usar em produção**: Execute o script de teste com uma amostra do seu XML
2. **Ajuste o tamanho do lote**: Encontre o valor ideal para seu hardware e volume de dados
3. **Importe em etapas**: Para arquivos muito grandes, considere importar categorias/produtores primeiro, depois produtos, depois entidades dependentes
4. **Monitore o uso de memória**: Acompanhe o consumo de memória durante importações grandes
5. **Considere a ordem das operações**: A ordem de importação das entidades é importante devido às relações entre elas
6. **Mantenha backups**: Sempre faça backup do banco de dados antes de importações grandes
7. **Planeje com antecedência**: Programe importações grandes para períodos de baixo tráfego

## Resolução de Problemas

### Erros Comuns e Soluções

| Erro | Possível Solução |
|------|------------------|
| `SequelizeUniqueConstraintError` | Verifique duplicatas nos dados ou ajuste a lógica de atualização |
| `SequelizeConnectionError` | Verifique a conexão do banco de dados e aumente os timeouts |
| `JavaScript heap out of memory` | Reduza o tamanho do lote ou aumente a memória disponível para Node.js |
| `Transaction timeout` | Aumente o tempo limite da transação ou divida em transações menores |
| `CPU usage too high` | Reduza o tamanho do lote ou limite o paralelismo |

### Monitoramento do Processo

Para monitorar uma importação em andamento:

```javascript
const options = {
  progressCallback: (entity, processed, total) => {
    console.log(`Progresso de ${entity}: ${processed}/${total} (${Math.round(processed/total*100)}%)`);
  }
};

await dbService.persistData(transformedData, options);
```

## Exemplo Completo: Importação com Relatório

```javascript
async function importXmlFile(filePath) {
  try {
    console.log(`Iniciando importação de ${filePath}`);
    
    // Ler o arquivo XML
    const xmlData = fs.readFileSync(filePath, 'utf8');
    
    // Analisar o XML
    const gekoParser = new GekoXmlParser();
    const transformedData = await gekoParser.parse(xmlData);
    
    // Configurar opções
    const options = {
      batchSize: 500,
      updateExisting: true,
      memoryManagement: true,
      progressCallback: (entity, processed, total) => {
        const percent = Math.round(processed/total*100);
        process.stdout.write(`\rImportando ${entity}: ${processed}/${total} (${percent}%)`);
      }
    };
    
    // Persistir dados
    const importService = new GekoImportService();
    const result = await importService.persistTransformedData(transformedData, options);
    
    // Gerar relatório
    generateImportReport(result, filePath);
    
    return result;
  } catch (error) {
    console.error(`Falha na importação: ${error.message}`);
    throw error;
  }
}

function generateImportReport(result, filePath) {
  const report = {
    timestamp: new Date(),
    filename: path.basename(filePath),
    success: result.success,
    totalTime: result.totalTime,
    recordsPerSecond: result.recordsPerSecond,
    entityCounts: result.entityCounts,
    created: result.stats.created,
    updated: result.stats.updated,
    errors: result.stats.errors
  };
  
  // Salvar o relatório
  const reportPath = `logs/import-report-${Date.now()}.json`;
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log(`Relatório de importação salvo em ${reportPath}`);
}
```

## Conclusão

O `DatabasePersistenceService` fornece uma solução otimizada e robusta para importar dados XML para o banco de dados. Ao seguir este guia e as melhores práticas, você pode importar grandes conjuntos de dados com eficiência e confiabilidade.

Para mais informações, consulte também:
- [Mapeamento XML para Banco de Dados](./xml-to-db-mapping.md)
- [Melhorias do Parser XML](./xml-parser-enhancement.md)
- [Otimização de Importação de Banco de Dados](./database-import-optimization.md) 