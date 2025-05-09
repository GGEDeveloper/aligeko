/**
 * Script para testar funcionalidades de gerenciamento de armazenamento
 * Permite testar verificação, limpeza, backup e restauração do banco de dados
 */
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import colors from 'colors';

// Carregar variáveis de ambiente
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

import {
  getDatabaseStorageInfo,
  cleanupDatabase,
  backupTables,
  restoreBackup,
  checkAndManageStorage
} from './storage-management.js';

// Configurar cores para console
colors.setTheme({
  info: 'blue',
  warn: 'yellow',
  error: 'red',
  success: 'green',
  data: 'grey',
  highlight: 'cyan',
  bold: 'bold'
});

// Funções auxiliares para exibição
function printSection(title) {
  console.log('\n' + '='.repeat(80).bold);
  console.log(`${title}`.bold);
  console.log('='.repeat(80).bold + '\n');
}

function printStorageInfo(info) {
  console.log('📊 Informações de Armazenamento:'.bold);
  console.log(`  - Tamanho atual: ${info.currentSizeGB.toFixed(3)} GB / ${info.limit.gb} GB (${info.percentOfLimit.toFixed(1)}%)`.highlight);
  console.log(`  - Status: ${getStatusEmoji(info.status)} ${info.status.toUpperCase()}`);
  console.log(`  - Timestamp: ${new Date(info.timestamp).toLocaleString()}`);
  
  console.log('\n📋 Maiores Tabelas:'.bold);
  info.largestTables.forEach((table, index) => {
    console.log(`  ${index + 1}. ${table.table_name}: ${table.total_mb.toFixed(2)} MB`);
  });
}

function getStatusEmoji(status) {
  switch (status) {
    case 'ok': return '✅';
    case 'warning': return '⚠️';
    case 'critical': return '🔴';
    default: return '❓';
  }
}

// Função principal
async function main() {
  try {
    printSection('TESTE DE GERENCIAMENTO DE ARMAZENAMENTO');
    
    // Verificar argumentos
    const command = process.argv[2] || 'check';
    
    switch (command) {
      case 'check':
        await runStorageCheck();
        break;
        
      case 'cleanup':
        await runCleanup();
        break;
        
      case 'backup':
        await runBackup();
        break;
        
      case 'restore':
        const backupPath = process.argv[3];
        if (!backupPath) {
          console.error('❌ Erro: Caminho do backup não especificado'.error);
          console.error('Uso: node test-storage-management.js restore <caminho-do-backup>'.info);
          process.exit(1);
        }
        await runRestore(backupPath);
        break;
        
      case 'manage':
        await runStorageManagement();
        break;
        
      case 'all':
        await runFullTest();
        break;
        
      default:
        console.log('❓ Comando não reconhecido'.warn);
        console.log('Comandos disponíveis:'.info);
        console.log('  - check: Verificar informações de armazenamento');
        console.log('  - cleanup: Testar limpeza do banco de dados');
        console.log('  - backup: Testar backup de tabelas');
        console.log('  - restore <caminho>: Testar restauração de backup');
        console.log('  - manage: Testar verificação e gerenciamento integrado');
        console.log('  - all: Executar verificação, backup e limpeza em sequência');
    }
  } catch (error) {
    console.error(`❌ Erro: ${error.message}`.error);
    console.error(error.stack);
    process.exit(1);
  }
}

// Funções de teste individuais
async function runStorageCheck() {
  printSection('VERIFICAÇÃO DE ARMAZENAMENTO');
  console.log('🔍 Verificando informações de armazenamento...'.info);
  
  const startTime = Date.now();
  const info = await getDatabaseStorageInfo();
  const duration = Date.now() - startTime;
  
  printStorageInfo(info);
  console.log(`\n⏱️ Tempo de execução: ${duration} ms`.data);
}

async function runCleanup() {
  printSection('TESTE DE LIMPEZA DE BANCO DE DADOS');
  console.log('🧹 Iniciando limpeza...'.info);
  
  // Obter tamanho inicial
  console.log('📊 Verificando tamanho inicial...'.info);
  const initialInfo = await getDatabaseStorageInfo();
  printStorageInfo(initialInfo);
  
  // Configurar opções de limpeza
  const options = {
    keepProductCount: 200,
    keepDays: 30,
    purgeImages: true,
    truncateDescriptions: true,
    maxDescriptionLength: 200,
    vacuumAfterCleanup: true,
    backupBeforeCleanup: true
  };
  
  console.log('\n🔧 Opções de limpeza:'.info);
  Object.entries(options).forEach(([key, value]) => {
    console.log(`  - ${key}: ${value}`);
  });
  
  // Executar limpeza
  console.log('\n🧹 Executando limpeza...'.info);
  const startTime = Date.now();
  const result = await cleanupDatabase(options);
  const duration = Date.now() - startTime;
  
  // Exibir resultados
  console.log('\n✅ Limpeza concluída!'.success);
  console.log(`⏱️ Tempo total: ${result.durationSeconds.toFixed(2)} segundos`.data);
  
  if (result.backupPath) {
    console.log(`💾 Backup criado em: ${result.backupPath}`.info);
  }
  
  console.log('\n📊 Resultado da Limpeza:'.bold);
  console.log(`  - Tamanho inicial: ${result.initialSize.megabytes.toFixed(2)} MB`.data);
  console.log(`  - Tamanho final: ${result.finalSize.megabytes.toFixed(2)} MB`.data);
  console.log(`  - Espaço liberado: ${result.spaceFreed.megabytes.toFixed(2)} MB (${result.percentReduction.toFixed(1)}%)`.success);
  
  // Verificar tamanho final
  console.log('\n📊 Verificando tamanho final...'.info);
  const finalInfo = await getDatabaseStorageInfo();
  printStorageInfo(finalInfo);
}

async function runBackup() {
  printSection('TESTE DE BACKUP DE TABELAS');
  
  // Listar tabelas disponíveis
  console.log('📋 Obtendo lista de tabelas...'.info);
  const { sequelize } = await import('../config/database.js');
  const [tablesResult] = await sequelize.query(`
    SELECT tablename 
    FROM pg_catalog.pg_tables 
    WHERE schemaname = 'public'
  `);
  
  const tables = tablesResult.map(t => t.tablename);
  
  console.log(`📚 Tabelas disponíveis (${tables.length}):`.info);
  console.log(`  ${tables.join(', ')}`.data);
  
  // Selecionar tabelas para backup (categorias, produtores, unidades)
  const tablesToBackup = ['categories', 'producers', 'units'];
  console.log(`\n🔍 Realizando backup das tabelas: ${tablesToBackup.join(', ')}`.info);
  
  // Executar backup
  const startTime = Date.now();
  const backupPath = await backupTables(tablesToBackup);
  const duration = Date.now() - startTime;
  
  console.log(`\n✅ Backup concluído em ${duration} ms`.success);
  console.log(`💾 Arquivo de backup: ${backupPath}`.highlight);
  
  // Mostrar informações do arquivo
  const fs = await import('fs');
  const stats = fs.statSync(backupPath);
  const fileSizeMB = stats.size / (1024 * 1024);
  
  console.log('\n📊 Informações do arquivo:'.bold);
  console.log(`  - Tamanho: ${fileSizeMB.toFixed(2)} MB`.data);
  console.log(`  - Criado em: ${stats.birthtime.toLocaleString()}`.data);
  
  return backupPath;
}

async function runRestore(backupPath) {
  printSection('TESTE DE RESTAURAÇÃO DE BACKUP');
  
  console.log(`🔍 Verificando arquivo de backup: ${backupPath}`.info);
  
  // Verificar se arquivo existe
  const fs = await import('fs');
  if (!fs.existsSync(backupPath)) {
    console.error(`❌ Erro: Arquivo não encontrado: ${backupPath}`.error);
    process.exit(1);
  }
  
  // Mostrar informações do arquivo
  const stats = fs.statSync(backupPath);
  const fileSizeMB = stats.size / (1024 * 1024);
  
  console.log('\n📊 Informações do arquivo:'.bold);
  console.log(`  - Tamanho: ${fileSizeMB.toFixed(2)} MB`.data);
  console.log(`  - Criado em: ${stats.birthtime.toLocaleString()}`.data);
  
  // Ler metadados do backup
  console.log('\n🔍 Lendo metadados do backup...'.info);
  const backupContent = fs.readFileSync(backupPath, 'utf8');
  const backupData = JSON.parse(backupContent);
  
  if (!backupData.metadata || !backupData.data) {
    console.error('❌ Erro: Formato de backup inválido'.error);
    process.exit(1);
  }
  
  console.log('\n📋 Metadados do backup:'.bold);
  console.log(`  - Versão: ${backupData.metadata.version}`.data);
  console.log(`  - Data: ${new Date(backupData.metadata.timestamp).toLocaleString()}`.data);
  console.log(`  - Tabelas: ${backupData.metadata.tables.join(', ')}`.data);
  
  console.log('\n📊 Conteúdo do backup:'.bold);
  Object.entries(backupData.data).forEach(([table, records]) => {
    console.log(`  - ${table}: ${records.length} registros`.data);
  });
  
  // Confirmar restauração
  console.log('\n⚠️ ATENÇÃO: A restauração irá inserir dados no banco. Registros existentes não serão substituídos (ON CONFLICT DO NOTHING).'.warn);
  
  // Este é um script de teste, então vamos prosseguir automaticamente
  console.log('\n🔄 Executando restauração...'.info);
  
  // Executar restauração
  const startTime = Date.now();
  const result = await restoreBackup(backupPath);
  const duration = Date.now() - startTime;
  
  console.log(`\n✅ Restauração concluída em ${duration} ms`.success);
  console.log('\n📊 Resultado da restauração:'.bold);
  console.log(`  - Tabelas restauradas: ${result.tablesRestored}`.data);
  console.log(`  - Registros restaurados: ${result.recordsRestored}`.data);
  
  console.log('\n📋 Detalhes por tabela:'.bold);
  Object.entries(result.details).forEach(([table, info]) => {
    console.log(`  - ${table}: ${info.inserted} de ${info.total} registros`.data);
  });
}

async function runStorageManagement() {
  printSection('TESTE DE GERENCIAMENTO DE ARMAZENAMENTO');
  
  // Configurar opções
  const options = {
    warningThresholdPercent: 80,
    criticalThresholdPercent: 95,
    autoCleanupOnWarning: false,
    autoCleanupOnCritical: true,
    preventImportOnCritical: true,
    backupBeforeCleanup: true
  };
  
  console.log('🔧 Opções de gerenciamento:'.info);
  Object.entries(options).forEach(([key, value]) => {
    console.log(`  - ${key}: ${value}`);
  });
  
  // Executar verificação
  console.log('\n🔍 Verificando e gerenciando armazenamento...'.info);
  const startTime = Date.now();
  const result = await checkAndManageStorage(options);
  const duration = Date.now() - startTime;
  
  console.log(`\n✅ Verificação concluída em ${duration} ms`.success);
  console.log('\n📊 Resultado:'.bold);
  console.log(`  - Sucesso: ${result.success ? 'Sim' : 'Não'}`.data);
  console.log(`  - Pode prosseguir: ${result.canProceed ? 'Sim' : 'Não'}`.data);
  console.log(`  - Limpeza realizada: ${result.cleanupPerformed ? 'Sim' : 'Não'}`.data);
  console.log(`  - Mensagem: ${result.message}`.highlight);
  
  if (result.storageInfo) {
    console.log('\n📊 Informações de armazenamento:'.bold);
    printStorageInfo(result.storageInfo);
  }
  
  if (result.cleanupResult) {
    console.log('\n🧹 Resultado da limpeza:'.bold);
    console.log(`  - Espaço liberado: ${result.cleanupResult.spaceFreed.megabytes.toFixed(2)} MB`.success);
    console.log(`  - Percentual reduzido: ${result.cleanupResult.percentReduction.toFixed(1)}%`.data);
    
    if (result.cleanupResult.backupPath) {
      console.log(`  - Backup criado em: ${result.cleanupResult.backupPath}`.info);
    }
  }
}

async function runFullTest() {
  printSection('TESTE COMPLETO DE GERENCIAMENTO DE ARMAZENAMENTO');
  
  // 1. Verificar armazenamento inicial
  console.log('🔍 ETAPA 1: Verificando armazenamento inicial...'.info);
  const initialInfo = await getDatabaseStorageInfo();
  printStorageInfo(initialInfo);
  
  // 2. Fazer backup
  console.log('\n💾 ETAPA 2: Realizando backup...'.info);
  const backupPath = await runBackup();
  
  // 3. Executar limpeza
  console.log('\n🧹 ETAPA 3: Executando limpeza...'.info);
  const cleanupResult = await cleanupDatabase({
    keepProductCount: 200,
    purgeImages: true,
    truncateDescriptions: true,
    backupBeforeCleanup: false, // Já fizemos backup manualmente
  });
  
  console.log('\n📊 Resultado da limpeza:'.bold);
  console.log(`  - Tamanho inicial: ${cleanupResult.initialSize.megabytes.toFixed(2)} MB`.data);
  console.log(`  - Tamanho final: ${cleanupResult.finalSize.megabytes.toFixed(2)} MB`.data);
  console.log(`  - Espaço liberado: ${cleanupResult.spaceFreed.megabytes.toFixed(2)} MB (${cleanupResult.percentReduction.toFixed(1)}%)`.success);
  
  // 4. Verificar armazenamento final
  console.log('\n🔍 ETAPA 4: Verificando armazenamento final...'.info);
  const finalInfo = await getDatabaseStorageInfo();
  printStorageInfo(finalInfo);
  
  // 5. Exibir relatório comparativo
  console.log('\n📝 RELATÓRIO COMPARATIVO:'.bold);
  console.log('  Antes:'.info);
  console.log(`    - Tamanho: ${initialInfo.currentSizeGB.toFixed(3)} GB (${initialInfo.percentOfLimit.toFixed(1)}% do limite)`.data);
  console.log(`    - Status: ${getStatusEmoji(initialInfo.status)} ${initialInfo.status.toUpperCase()}`);
  
  console.log('  Depois:'.info);
  console.log(`    - Tamanho: ${finalInfo.currentSizeGB.toFixed(3)} GB (${finalInfo.percentOfLimit.toFixed(1)}% do limite)`.data);
  console.log(`    - Status: ${getStatusEmoji(finalInfo.status)} ${finalInfo.status.toUpperCase()}`);
  
  const reduction = initialInfo.currentSizeGB - finalInfo.currentSizeGB;
  const reductionPercent = (reduction / initialInfo.currentSizeGB) * 100;
  
  console.log('  Redução:'.info);
  console.log(`    - Tamanho: ${(reduction * 1024).toFixed(2)} MB (${reductionPercent.toFixed(1)}%)`.success);
  
  console.log('\n💾 Backup disponível em:'.info);
  console.log(`  ${backupPath}`.highlight);
  
  console.log('\n✅ TESTE COMPLETO FINALIZADO COM SUCESSO'.success.bold);
}

// Executar
main().catch(error => {
  console.error(`❌ Erro fatal: ${error.message}`.error);
  console.error(error.stack);
  process.exit(1);
}); 