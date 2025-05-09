# Otimização de Uso de Armazenamento para Importação XML

Este documento descreve as estratégias de otimização implementadas para gerenciar eficientemente o armazenamento durante importações XML, considerando as limitações do plano Free do Neon PostgreSQL.

## Contexto

O AliTools B2B E-commerce Platform utiliza o plano Free do Neon PostgreSQL, que tem as seguintes limitações:

- **Armazenamento máximo**: 0.5 GB (512 MB)
- Atualmente utilizando: ~0.69 GB (excedendo o limite)

A importação de arquivos XML do GEKO pode facilmente exceder este limite devido ao volume de dados e à natureza dos produtos com descrições longas e múltiplas imagens.

## Estratégias de Otimização Implementadas

### 1. Verificação Prévia de Armazenamento

Antes de iniciar qualquer importação, o sistema verifica o estado atual do armazenamento:

```javascript
// Exemplo de uso no GekoImportService
const storageCheck = await checkAndManageStorage({
  preventImportOnCritical: true
});

if (!storageCheck.canProceed) {
  return {
    success: false,
    error: 'STORAGE_LIMIT_EXCEEDED',
    message: storageCheck.message
  };
}
```

Esta verificação:
- Determina o tamanho atual do banco de dados
- Identifica se está em estado normal, de alerta ou crítico
- Pode impedir importações quando o armazenamento estiver crítico

### 2. Modo Econômico de Importação

Quando o armazenamento está próximo do limite, o importador ativa automaticamente opções para economizar espaço:

```javascript
// Exemplo de opções adaptativas baseadas no status de armazenamento
if (storageCheck.storageInfo.status === 'warning') {
  // Em modo de alerta, usamos configurações mais restritivas
  options.limitProductCount = options.limitProductCount || 500;
  options.skipImages = options.skipImages !== undefined ? options.skipImages : true;
  options.truncateDescriptions = true;
  options.maxDescriptionLength = 200;
}
```

### 3. Limpeza Automática

O sistema pode realizar limpeza automática do banco de dados quando o armazenamento atinge níveis críticos:

```javascript
// Configuração para limpeza automática
const options = {
  autoCleanupOnCritical: true,  // Limpar automaticamente em estado crítico
  backupBeforeCleanup: true     // Fazer backup antes da limpeza
};
```

A limpeza automática:
- Remove imagens (principal consumidor de espaço)
- Mantém apenas os produtos mais recentes
- Trunca descrições longas
- Remove registros antigos de preços e estoques

### 4. Importação Seletiva e Incremental

Para operações manuais, recomenda-se:

- **Importação de subconjuntos**: Processar apenas uma parte do arquivo XML
- **Seleção por categoria**: Importar produtos de categorias específicas
- **Rotação de produtos**: Substituir produtos antigos em vez de acumular

```javascript
// Exemplo de opções para importação seletiva
const options = {
  limitProductCount: 200,       // Limitar número de produtos
  categoryFilter: ['tools'],    // Filtrar por categoria
  skipImages: true,             // Não importar imagens
  truncateDescriptions: true,   // Truncar descrições longas
  replaceExisting: true         // Substituir produtos existentes
};
```

## Configuração dos Limites de Armazenamento

Os limites de armazenamento são configuráveis para adaptar a diferentes necessidades:

```javascript
// Limites configuráveis
const storageCheckOptions = {
  warningThresholdPercent: 80,    // Alerta em 80% (0.4 GB)
  criticalThresholdPercent: 95,   // Crítico em 95% (0.475 GB)
};
```

## Ferramentas de Monitoramento e Gestão

Foram implementadas diversas ferramentas para monitoramento e gestão de armazenamento:

### Script de Verificação

```bash
# Verificar estado atual do armazenamento
node storage-management.js check
```

Saída de exemplo:
```
📊 Informações de Armazenamento:
  - Tamanho atual: 0.657 GB / 0.5 GB (131.4%)
  - Status: 🔴 CRITICAL
  
📋 Maiores Tabelas:
  1. products: 240.15 MB
  2. images: 135.20 MB
  3. variants: 95.45 MB
```

### Script de Limpeza

```bash
# Limpar banco de dados com opções padrão
node storage-management.js cleanup
```

### Script de Backup

```bash
# Fazer backup antes de limpar
node storage-management.js backup
```

### Script de Teste Completo

```bash
# Executar verificação, backup e limpeza
node test-storage-management.js all
```

## Impacto no Desempenho

As otimizações de armazenamento têm os seguintes impactos no desempenho:

1. **Tempo de importação**: Ligeiramente maior devido às verificações de armazenamento
2. **Economia de espaço**: Redução de 60-80% no uso de armazenamento em comparação com a importação completa
3. **Estabilidade**: Previne falhas devido a limites de armazenamento excedidos

## Monitoramento de Longo Prazo

Para garantir a saúde do armazenamento a longo prazo:

1. **Verificações regulares**: Execute `node storage-management.js check` semanalmente
2. **Backup periódico**: Faça backup das tabelas críticas mensalmente
3. **Rotação de dados**: Considere uma política de rotação automática para manter apenas os N produtos mais recentes

## Melhores Práticas

1. **Antes de importar grandes arquivos XML**:
   - Verifique o armazenamento disponível
   - Considere usar filtros para limitar a importação
   - Prefira atualizações incrementais a importações completas

2. **Para ambiente de desenvolvimento**:
   - Use subconjuntos de dados (200-500 produtos) suficientes para testes
   - Desative a importação de imagens quando possível
   - Use a opção `truncateDescriptions` para reduzir o tamanho das descrições

3. **Para ambiente de produção**:
   - Considere um upgrade para o plano pago do Neon PostgreSQL
   - Implemente estratégias de arquivamento para produtos menos relevantes
   - Use compressão para dados de texto quando possível

## Conclusão

As estratégias de otimização de armazenamento implementadas permitem que o AliTools B2B E-commerce Platform opere eficientemente dentro das limitações do plano Free do Neon PostgreSQL, enquanto mantém as funcionalidades essenciais para desenvolvimento e demonstração.

Para uma solução de produção completa sem restrições nos dados importados, recomenda-se o upgrade para um plano pago do Neon PostgreSQL ou a migração para outra solução de banco de dados com maiores limites de armazenamento. 