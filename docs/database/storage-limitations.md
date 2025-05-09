# Limitações de Armazenamento e Estratégias de Gestão

Este documento descreve as limitações do plano gratuito do Neon PostgreSQL, estratégias para gerenciar o armazenamento e ferramentas implementadas para lidar com essas restrições.

## Limitações do Plano Free do Neon PostgreSQL

O plano Free do Neon PostgreSQL inclui as seguintes limitações:

* **Armazenamento total**: 0.5 GB-mês (512 MB)
* **Compute Units (CU)**: 0.25 CU (disponíveis 24/7), com autoscaling até 2 CU
* **Projetos**: Máximo de 10 projetos
* **Branches**: Máximo de 10 branches por projeto
* **Compute hours para branches não-padrão**: 5 horas
* **Transferência de dados (egress)**: 5 GB

Estas limitações requerem uma gestão cuidadosa do armazenamento, especialmente ao trabalhar com importações XML de grande volume.

## Status Atual

Nossa utilização atual:
- Storage: 0.69/0.5 GB (excedendo o limite)
- Compute hours: 2.42/191.9 horas (1.26% do limite)
- Branch compute: 0.02/5 horas (0.4% do limite)
- Projects: 2/10 projetos (20% do limite)
- Data transfer: 0.07/5 GB (1.4% do limite)

O armazenamento é nossa principal restrição atual, já excedendo o limite do plano Free.

## Estratégias de Gestão de Armazenamento

### 1. Monitoramento de Armazenamento

Implementamos ferramentas para monitoramento em tempo real do uso de armazenamento:

```javascript
// Verificar tamanho atual do banco de dados
const storageInfo = await getDatabaseStorageInfo();
console.log(`Armazenamento atual: ${storageInfo.currentSizeGB.toFixed(2)} GB (${storageInfo.percentOfLimit.toFixed(1)}%)`);
```

O sistema define níveis de alerta baseados no percentual de uso:
- **Normal**: Abaixo de 80% do limite (< 0.4 GB)
- **Alerta**: Entre 80% e 100% do limite (0.4 - 0.5 GB)
- **Crítico**: Acima do limite (> 0.5 GB)

### 2. Limpeza Automática

A limpeza automática pode ser acionada em níveis de alerta ou crítico, com opções configuráveis:

- **Manter apenas produtos recentes**: Configurável para manter os N produtos mais recentes
- **Remover imagens**: As imagens são a parte mais volumosa dos dados (opção para remover todas)
- **Truncar descrições longas**: Limitar o tamanho das descrições para economizar espaço
- **Remover registros antigos**: Eliminar dados de preços e estoques mais antigos que X dias

Exemplo:
```javascript
// Limpar banco em situação crítica (mantendo apenas 100 produtos mais recentes)
const result = await cleanupDatabase({
  keepProductCount: 100,
  purgeImages: true,
  truncateDescriptions: true,
  maxDescriptionLength: 200
});
```

### 3. Backup e Restauração

Antes de qualquer limpeza, o sistema realiza backups das tabelas críticas:

- **Backup Seletivo**: Suporte para backup apenas de tabelas essenciais
- **Backup Completo**: Possibilidade de backup de todas as tabelas
- **Restauração Seletiva**: Restaurar apenas tabelas específicas de um backup

Os backups são armazenados localmente no formato JSON.

### 4. Integração com Importação XML

A importação XML foi modificada para verificar o armazenamento antes de iniciar:

- **Verificação Preliminar**: Verifica espaço disponível antes de importar
- **Modo Econômico**: Quando próximo ao limite, ativa automaticamente opções para economizar espaço
- **Prevenção de Excesso**: Cancela importações quando o armazenamento estiver em nível crítico sem possibilidade de limpeza

## Implementação

As funcionalidades de gestão de armazenamento estão concentradas em:

- **storage-management.js**: Script principal com todas as funções de gerenciamento
- **GekoImportService**: Integração com o serviço de importação XML

### Funções Principais

#### 1. Verificação de Armazenamento

```javascript
const storageInfo = await getDatabaseStorageInfo();
```

Retorna informações detalhadas sobre o estado atual do armazenamento, incluindo:
- Tamanho atual (bytes, MB, GB)
- Percentual do limite
- Status (ok, warning, critical)
- Lista das 10 maiores tabelas

#### 2. Limpeza de Dados

```javascript
const cleanupResult = await cleanupDatabase({
  keepProductCount: 200,
  keepDays: 30,
  purgeImages: true,
  truncateDescriptions: false,
  maxDescriptionLength: 200,
  vacuumAfterCleanup: true,
  backupBeforeCleanup: true,
});
```

A função aceita várias opções para personalizar a estratégia de limpeza.

#### 3. Backup e Restauração

```javascript
// Backup
const backupPath = await backupTables(['categories', 'producers', 'units']);

// Restauração
const restoreResult = await restoreBackup(backupPath);
```

#### 4. Verificação e Gerenciamento Integrado

```javascript
const storageCheck = await checkAndManageStorage({
  warningThresholdPercent: 80,
  criticalThresholdPercent: 95,
  autoCleanupOnWarning: false,
  autoCleanupOnCritical: true,
  preventImportOnCritical: true,
});

if (!storageCheck.canProceed) {
  console.error(`Operação cancelada: ${storageCheck.message}`);
  return;
}
```

## Comandos CLI

O script também suporta operações via linha de comando:

```bash
# Verificar status de armazenamento
node storage-management.js check

# Executar limpeza com opções padrão
node storage-management.js cleanup

# Fazer backup de todas as tabelas
node storage-management.js backup

# Restaurar de um arquivo de backup
node storage-management.js restore caminho/para/backup.json
```

## Recomendações

1. **Plano de Upgrade**: Considerar o upgrade para o plano Essentials ($8/mês) que oferece 3GB de armazenamento

2. **Estratégia de Importação**:
   - Importar apenas produtos necessários para demonstração/desenvolvimento
   - Utilizar subconjuntos representativos dos dados XML
   - Implementar rotação de produtos para manter o tamanho controlado

3. **Monitoramento Regular**:
   - Executar `node storage-management.js check` semanalmente
   - Configurar alertas quando o armazenamento ultrapassar 85%

4. **Operação Normal**: Para ambiente de demonstração/desenvolvimento, 200-500 produtos é geralmente suficiente

## Práticas Recomendadas

1. **Antes de grandes importações**:
   ```javascript
   const storageCheck = await checkAndManageStorage();
   if (storageCheck.cleanupPerformed) {
     console.log(`Limpeza automática realizada: ${storageCheck.message}`);
   }
   ```

2. **Backups regulares**:
   ```javascript
   // Backup semanal das tabelas essenciais
   const backupPath = await backupTables(['categories', 'producers', 'units', 'products']);
   ```

3. **Rotação de dados**:
   - Manter apenas produtos mais recentes ou mais relevantes
   - Remover dados antigos periodicamente
   - Considerar compressão de dados para textos longos

## Conclusão

Devido às limitações do plano Free do Neon PostgreSQL, implementamos um sistema compreensivo de gerenciamento de armazenamento que permite:

1. Monitorar o uso atual
2. Limpar dados automaticamente quando necessário
3. Fazer backup de dados importantes antes da limpeza
4. Restaurar dados quando necessário
5. Integrar verificações de armazenamento com o processo de importação

Esta abordagem permite operar de forma eficiente dentro das limitações do plano gratuito, mantendo a funcionalidade principal da aplicação. 