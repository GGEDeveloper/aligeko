/**
 * Script para gerenciar o armazenamento do banco de dados
 * Fornece funções para monitorar, limpar e fazer backup do banco de dados
 * Implementado para lidar com as limitações do plano Free do Neon (0.5 GB)
 */
import { sequelize } from '../config/database.js';
import logger from '../config/logger.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Obtém informações sobre o tamanho atual do banco de dados
 * @returns {Promise<Object>} Objeto com informações de tamanho e status
 */
export async function getDatabaseStorageInfo() {
  try {
    // Verificar tamanho do banco
    const [dbSizeResult] = await sequelize.query(`
      SELECT 
        pg_database_size(current_database()) as size_bytes,
        pg_database_size(current_database()) / (1024 * 1024 * 1024.0) as size_gb
    `);
    
    const sizeGB = parseFloat(dbSizeResult[0].size_gb);
    const sizeBytes = parseInt(dbSizeResult[0].size_bytes);
    
    // Verificar tamanho das tabelas principais
    const [tableSizes] = await sequelize.query(`
      SELECT 
        relname as table_name,
        pg_total_relation_size(c.oid) as total_bytes,
        pg_total_relation_size(c.oid) / (1024 * 1024.0) as total_mb
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE 
        n.nspname = 'public'
        AND c.relkind = 'r'
      ORDER BY pg_total_relation_size(c.oid) DESC
      LIMIT 10
    `);
    
    // Determinar status baseado nos limites do plano Free
    let status = 'ok';
    if (sizeGB >= 0.5) {
      status = 'critical'; // Acima do limite (0.5 GB)
    } else if (sizeGB >= 0.4) {
      status = 'warning'; // Acima de 80% do limite
    }
    
    return {
      currentSizeBytes: sizeBytes,
      currentSizeGB: sizeGB,
      currentSizeMB: sizeGB * 1024,
      percentOfLimit: (sizeGB / 0.5) * 100,
      status: status,
      limit: {
        gb: 0.5,
        mb: 512,
        bytes: 536870912 // 0.5 GB em bytes
      },
      largestTables: tableSizes,
      timestamp: new Date()
    };
  } catch (error) {
    logger.error(`Erro ao verificar tamanho do banco de dados: ${error.message}`);
    throw error;
  }
}

/**
 * Limpa dados antigos do banco de dados para liberar espaço
 * @param {Object} options Opções de limpeza
 * @returns {Promise<Object>} Resultado da operação de limpeza
 */
export async function cleanupDatabase(options = {}) {
  const defaultOptions = {
    keepProductCount: 200,                // Número de produtos a manter
    keepDays: 30,                         // Manter registros dos últimos X dias
    purgeImages: true,                    // Remover todas as imagens
    truncateDescriptions: false,          // Truncar descrições longas
    maxDescriptionLength: 200,            // Tamanho máximo para descrições
    vacuumAfterCleanup: true,             // Executar VACUUM após limpeza
    backupBeforeCleanup: true,            // Fazer backup antes de limpar
    backupTablesOnly: ['categories', 'producers', 'units'] // Tabelas para backup
  };
  
  const opts = { ...defaultOptions, ...options };
  const startTime = Date.now();
  
  try {
    logger.info(`Iniciando limpeza do banco de dados com opções: ${JSON.stringify(opts)}`);
    
    // Obter tamanho inicial
    const initialStorage = await getDatabaseStorageInfo();
    
    // Backup se configurado
    let backupPath = null;
    if (opts.backupBeforeCleanup) {
      backupPath = await backupTables(opts.backupTablesOnly);
      logger.info(`Backup realizado antes da limpeza: ${backupPath}`);
    }
    
    // Começar transação
    const transaction = await sequelize.transaction();
    
    try {
      // 1. Limpar imagens completamente se purgeImages = true
      if (opts.purgeImages) {
        const [, imagesDeleted] = await sequelize.query(
          'DELETE FROM images',
          { transaction }
        );
        logger.info(`Imagens removidas: ${imagesDeleted}`);
      }
      
      // 2. Limpar registros antigos baseado em keepDays
      if (opts.keepDays > 0) {
        const [, oldItemsDeleted] = await sequelize.query(`
          DELETE FROM prices WHERE created_at < NOW() - INTERVAL '${opts.keepDays} days';
          DELETE FROM stocks WHERE created_at < NOW() - INTERVAL '${opts.keepDays} days';
        `, { transaction });
        
        logger.info(`Registros antigos removidos (mais de ${opts.keepDays} dias)`);
      }
      
      // 3. Manter apenas os produtos mais recentes
      if (opts.keepProductCount > 0) {
        // Primeiro identificar os IDs dos produtos a manter
        const [productsToKeep] = await sequelize.query(`
          SELECT id FROM products 
          ORDER BY updated_at DESC 
          LIMIT ${opts.keepProductCount}
        `, { transaction });
        
        // Criar array com IDs
        const keepIds = productsToKeep.map(p => p.id);
        
        // Remover produtos que não estão na lista
        if (keepIds.length > 0) {
          const [, productsDeleted] = await sequelize.query(`
            DELETE FROM products 
            WHERE id NOT IN (${keepIds.join(',')})
          `, { transaction });
          
          logger.info(`Produtos limitados a ${opts.keepProductCount} mais recentes`);
        }
      }
      
      // 4. Truncar descrições longas se configurado
      if (opts.truncateDescriptions && opts.maxDescriptionLength > 0) {
        const [, descriptionsUpdated] = await sequelize.query(`
          UPDATE products 
          SET 
            description_long = CASE 
              WHEN LENGTH(description_long) > ${opts.maxDescriptionLength} 
              THEN SUBSTRING(description_long FROM 1 FOR ${opts.maxDescriptionLength}) || '...' 
              ELSE description_long 
            END,
            description_short = CASE 
              WHEN LENGTH(description_short) > ${Math.floor(opts.maxDescriptionLength/2)} 
              THEN SUBSTRING(description_short FROM 1 FOR ${Math.floor(opts.maxDescriptionLength/2)}) || '...' 
              ELSE description_short 
            END
        `, { transaction });
        
        logger.info(`Descrições longas truncadas para máximo de ${opts.maxDescriptionLength} caracteres`);
      }
      
      // Commit da transação
      await transaction.commit();
      
      // Executar VACUUM se configurado (fora da transação)
      if (opts.vacuumAfterCleanup) {
        logger.info('Executando VACUUM para recuperar espaço...');
        await sequelize.query('VACUUM FULL');
        logger.info('VACUUM concluído');
      }
      
      // Obter tamanho final
      const finalStorage = await getDatabaseStorageInfo();
      const durationMs = Date.now() - startTime;
      
      // Calcular espaço liberado
      const spaceFreedBytes = initialStorage.currentSizeBytes - finalStorage.currentSizeBytes;
      const spaceFreedMB = spaceFreedBytes / (1024 * 1024);
      const spaceFreedGB = spaceFreedBytes / (1024 * 1024 * 1024);
      
      const result = {
        success: true,
        initialSize: {
          bytes: initialStorage.currentSizeBytes,
          megabytes: initialStorage.currentSizeMB,
          gigabytes: initialStorage.currentSizeGB
        },
        finalSize: {
          bytes: finalStorage.currentSizeBytes,
          megabytes: finalStorage.currentSizeMB,
          gigabytes: finalStorage.currentSizeGB
        },
        spaceFreed: {
          bytes: spaceFreedBytes,
          megabytes: spaceFreedMB,
          gigabytes: spaceFreedGB
        },
        percentReduction: (spaceFreedBytes / initialStorage.currentSizeBytes) * 100,
        durationMs: durationMs,
        durationSeconds: durationMs / 1000,
        backupPath: backupPath,
        timestamp: new Date(),
        options: opts
      };
      
      logger.info(`Limpeza concluída: liberado ${spaceFreedMB.toFixed(2)} MB (${result.percentReduction.toFixed(1)}%)`);
      return result;
    } catch (error) {
      // Rollback em caso de erro
      await transaction.rollback();
      logger.error(`Erro durante limpeza do banco de dados: ${error.message}`);
      throw error;
    }
  } catch (error) {
    logger.error(`Falha na operação de limpeza: ${error.message}`);
    throw error;
  }
}

/**
 * Faz backup de tabelas específicas (ou todas) do banco de dados
 * @param {Array<string>} tables Lista de tabelas para backup (ou null para todas)
 * @returns {Promise<string>} Caminho do arquivo de backup
 */
export async function backupTables(tables = null) {
  try {
    // Criar diretório de backup se não existir
    const backupDir = path.join(__dirname, '../../backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    // Gerar nome do arquivo com timestamp
    const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/g, '');
    const fileName = `backup_${timestamp}.json`;
    const filePath = path.join(backupDir, fileName);
    
    // Determinar quais tabelas fazer backup
    let tablesToBackup = tables;
    if (!tables || tables.length === 0) {
      // Se não especificado, listar todas as tabelas
      const [allTables] = await sequelize.query(`
        SELECT tablename 
        FROM pg_catalog.pg_tables 
        WHERE schemaname = 'public'
      `);
      tablesToBackup = allTables.map(t => t.tablename);
    }
    
    // Objeto para armazenar dados de backup
    const backupData = {
      metadata: {
        timestamp: new Date(),
        tables: tablesToBackup,
        version: '1.0'
      },
      data: {}
    };
    
    // Processar cada tabela
    for (const table of tablesToBackup) {
      logger.info(`Fazendo backup da tabela: ${table}`);
      
      // Buscar dados
      const [tableData] = await sequelize.query(`SELECT * FROM ${table}`);
      
      // Adicionar ao objeto de backup
      backupData.data[table] = tableData;
      
      logger.info(`  - ${tableData.length} registros salvos`);
    }
    
    // Salvar arquivo JSON
    fs.writeFileSync(filePath, JSON.stringify(backupData, null, 2));
    
    logger.info(`Backup concluído: ${filePath}`);
    return filePath;
  } catch (error) {
    logger.error(`Erro ao fazer backup das tabelas: ${error.message}`);
    throw error;
  }
}

/**
 * Restaura dados de um arquivo de backup
 * @param {string} backupPath Caminho do arquivo de backup
 * @param {Array<string>} tables Tabelas específicas para restaurar (ou null para todas)
 * @returns {Promise<Object>} Resultado da operação de restauração
 */
export async function restoreBackup(backupPath, tables = null) {
  try {
    // Verificar se arquivo existe
    if (!fs.existsSync(backupPath)) {
      throw new Error(`Arquivo de backup não encontrado: ${backupPath}`);
    }
    
    // Ler arquivo
    const backupContent = fs.readFileSync(backupPath, 'utf8');
    const backupData = JSON.parse(backupContent);
    
    // Validar formato
    if (!backupData.metadata || !backupData.data) {
      throw new Error('Formato de backup inválido');
    }
    
    // Determinar tabelas para restaurar
    const tablesToRestore = tables || Object.keys(backupData.data);
    
    // Iniciar transação
    const transaction = await sequelize.transaction();
    
    try {
      const results = {
        tablesRestored: 0,
        recordsRestored: 0,
        details: {}
      };
      
      // Processar cada tabela
      for (const table of tablesToRestore) {
        // Verificar se tabela existe no backup
        if (!backupData.data[table]) {
          logger.warn(`Tabela ${table} não encontrada no backup, pulando...`);
          continue;
        }
        
        const tableData = backupData.data[table];
        if (tableData.length === 0) {
          logger.info(`Tabela ${table} não tem dados para restaurar`);
          continue;
        }
        
        logger.info(`Restaurando tabela ${table}: ${tableData.length} registros`);
        
        // Para cada registro, tentar inserir
        let insertedCount = 0;
        for (const record of tableData) {
          try {
            // Construir query dinamicamente
            const columns = Object.keys(record).join(', ');
            const placeholders = Object.keys(record).map(() => '?').join(', ');
            const values = Object.values(record);
            
            await sequelize.query(
              `INSERT INTO ${table} (${columns}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`,
              { 
                replacements: values,
                transaction 
              }
            );
            
            insertedCount++;
          } catch (insertError) {
            logger.warn(`Erro ao inserir registro em ${table}: ${insertError.message}`);
            // Continuar com próximo registro
          }
        }
        
        results.tablesRestored++;
        results.recordsRestored += insertedCount;
        results.details[table] = {
          total: tableData.length,
          inserted: insertedCount
        };
        
        logger.info(`  - Restaurados ${insertedCount} de ${tableData.length} registros em ${table}`);
      }
      
      // Commit da transação
      await transaction.commit();
      
      logger.info(`Restauração concluída: ${results.recordsRestored} registros em ${results.tablesRestored} tabelas`);
      return {
        success: true,
        ...results,
        backupFile: backupPath,
        timestamp: new Date()
      };
    } catch (error) {
      // Rollback em caso de erro
      await transaction.rollback();
      logger.error(`Erro durante restauração: ${error.message}`);
      throw error;
    }
  } catch (error) {
    logger.error(`Falha na operação de restauração: ${error.message}`);
    throw error;
  }
}

/**
 * Verifica e gerencia o armazenamento antes de uma operação de importação
 * @param {Object} options Opções de verificação
 * @returns {Promise<Object>} Status do armazenamento e ações tomadas
 */
export async function checkAndManageStorage(options = {}) {
  const defaultOptions = {
    warningThresholdPercent: 80,       // Avisar quando atingir 80% do limite
    criticalThresholdPercent: 95,      // Crítico quando atingir 95% do limite
    autoCleanupOnWarning: false,        // Não limpar automaticamente em warning
    autoCleanupOnCritical: true,       // Limpar automaticamente em critical
    preventImportOnCritical: true,     // Impedir importação em situação crítica
    backupBeforeCleanup: true          // Fazer backup antes de limpar
  };
  
  const opts = { ...defaultOptions, ...options };
  
  try {
    // Verificar tamanho atual
    const storageInfo = await getDatabaseStorageInfo();
    
    // Definir níveis baseados em opções
    const warningThreshold = (opts.warningThresholdPercent / 100) * storageInfo.limit.gb;
    const criticalThreshold = (opts.criticalThresholdPercent / 100) * storageInfo.limit.gb;
    
    let cleanupPerformed = false;
    let cleanupResult = null;
    
    // Verificar se está em estado crítico
    if (storageInfo.currentSizeGB >= criticalThreshold) {
      logger.warn(`ARMAZENAMENTO CRÍTICO: ${storageInfo.currentSizeGB.toFixed(2)} GB de ${storageInfo.limit.gb} GB (${storageInfo.percentOfLimit.toFixed(1)}%)`);
      
      // Executar limpeza automaticamente se configurado
      if (opts.autoCleanupOnCritical) {
        logger.info('Iniciando limpeza automática devido a armazenamento crítico');
        cleanupResult = await cleanupDatabase({
          keepProductCount: 100, // Mais restritivo em caso crítico
          purgeImages: true,
          truncateDescriptions: true,
          backupBeforeCleanup: opts.backupBeforeCleanup
        });
        cleanupPerformed = true;
        
        // Verificar novamente após limpeza
        const newStorageInfo = await getDatabaseStorageInfo();
        
        // Se ainda está crítico e preventImportOnCritical é true, retornar erro
        if (newStorageInfo.currentSizeGB >= criticalThreshold && opts.preventImportOnCritical) {
          return {
            success: false,
            canProceed: false,
            message: 'Armazenamento permanece crítico mesmo após limpeza. Importação não permitida.',
            storageInfo: newStorageInfo,
            cleanupPerformed,
            cleanupResult
          };
        }
      } 
      // Se não limpou automaticamente e preventImportOnCritical é true, retornar erro
      else if (opts.preventImportOnCritical) {
        return {
          success: false,
          canProceed: false,
          message: 'Armazenamento em estado crítico. Importação não permitida.',
          storageInfo
        };
      }
    }
    // Verificar se está em warning
    else if (storageInfo.currentSizeGB >= warningThreshold) {
      logger.warn(`ARMAZENAMENTO EM ALERTA: ${storageInfo.currentSizeGB.toFixed(2)} GB de ${storageInfo.limit.gb} GB (${storageInfo.percentOfLimit.toFixed(1)}%)`);
      
      // Executar limpeza automaticamente se configurado
      if (opts.autoCleanupOnWarning) {
        logger.info('Iniciando limpeza automática devido a alerta de armazenamento');
        cleanupResult = await cleanupDatabase({
          keepProductCount: 200,
          purgeImages: true,
          backupBeforeCleanup: opts.backupBeforeCleanup
        });
        cleanupPerformed = true;
      }
    }
    
    // Se chegou aqui, pode prosseguir
    return {
      success: true,
      canProceed: true,
      storageInfo: cleanupPerformed ? await getDatabaseStorageInfo() : storageInfo,
      cleanupPerformed,
      cleanupResult,
      message: cleanupPerformed 
        ? `Limpeza realizada, liberando ${cleanupResult.spaceFreed.megabytes.toFixed(2)} MB`
        : `Armazenamento em ${storageInfo.status}: ${storageInfo.currentSizeGB.toFixed(2)} GB (${storageInfo.percentOfLimit.toFixed(1)}%)`
    };
  } catch (error) {
    logger.error(`Erro ao verificar/gerenciar armazenamento: ${error.message}`);
    
    // Em caso de erro, deixar prosseguir mas alertar
    return {
      success: false,
      canProceed: true, // Permitir prosseguir mesmo com erro (decisão de implementação)
      error: error.message,
      message: 'Erro ao verificar armazenamento, prosseguindo com cautela'
    };
  }
}

// Exportação para uso em CLI
if (process.argv[2] === 'check') {
  getDatabaseStorageInfo()
    .then(info => {
      console.log(JSON.stringify(info, null, 2));
      process.exit(0);
    })
    .catch(err => {
      console.error('Erro:', err);
      process.exit(1);
    });
} else if (process.argv[2] === 'cleanup') {
  cleanupDatabase()
    .then(result => {
      console.log(JSON.stringify(result, null, 2));
      process.exit(0);
    })
    .catch(err => {
      console.error('Erro:', err);
      process.exit(1);
    });
} else if (process.argv[2] === 'backup') {
  backupTables()
    .then(path => {
      console.log(`Backup salvo em: ${path}`);
      process.exit(0);
    })
    .catch(err => {
      console.error('Erro:', err);
      process.exit(1);
    });
} else if (process.argv[2] === 'restore' && process.argv[3]) {
  restoreBackup(process.argv[3])
    .then(result => {
      console.log(JSON.stringify(result, null, 2));
      process.exit(0);
    })
    .catch(err => {
      console.error('Erro:', err);
      process.exit(1);
    });
} 