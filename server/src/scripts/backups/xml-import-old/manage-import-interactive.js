/**
 * Script Interativo para Gerenciamento de Banco de Dados e Importação XML
 * 
 * Este script oferece uma interface interativa para:
 * - Verificar espaço de armazenamento
 * - Fazer backup das tabelas principais
 * - Limpar/purgar o banco de dados
 * - Importar XML de produtos
 * - Restaurar backup
 * 
 * Usa inquirer para prompts interativos e cores para melhor visualização.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';
import inquirer from 'inquirer';
import colors from 'colors';
import { parseString } from 'xml2js';

// Configurar cores
colors.setTheme({
  info: 'blue',
  warn: 'yellow',
  error: 'red',
  success: 'green',
  data: 'grey',
  highlight: 'cyan',
  bold: 'bold'
});

// ES Module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Carregar variáveis de ambiente (a partir do diretório raiz)
const envPath = path.resolve(__dirname, '../../../.env');
console.log(`Carregando variáveis de ambiente de: ${envPath}`.info);
dotenv.config({ path: envPath });

// Importar funções dos scripts existentes
import { 
  getDatabaseStorageInfo, 
  cleanupDatabase, 
  backupTables, 
  restoreBackup,
  checkAndManageStorage,
  purgeImportTables
} from './storage-management.js';

// Importar sequelize e modelos
import sequelize from '../config/database.js';
import { models } from '../models/index.js';
import GekoXmlParser from '../utils/geko-xml-parser.js';
import GekoImportService from '../services/geko-import-service.js';

// Função para importar XML (reutilizando lógica de direct-import-xml.js)
async function importXml(xmlFilePath, options = {}) {
  try {
    console.log('📂 Verificando arquivo XML...'.info);
    
    // Verificar se arquivo foi informado
    if (!xmlFilePath) {
      console.error('❌ Erro: Caminho do arquivo XML não informado'.error);
      return false;
    }
    
    // Verificar se arquivo existe
    if (!fs.existsSync(xmlFilePath)) {
      console.error(`❌ Erro: Arquivo não encontrado: ${xmlFilePath}`.error);
      return false;
    }
    
    // Verificar tamanho do arquivo
    const stats = fs.statSync(xmlFilePath);
    const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
    console.log(`✅ Arquivo encontrado: ${xmlFilePath}`.success);
    console.log(`📊 Tamanho: ${fileSizeMB} MB`.data);
    
    // Verificar espaço disponível
    console.log('🔍 Verificando espaço de armazenamento...'.info);
    const storageCheck = await checkAndManageStorage({
      preventImportOnCritical: true,
      autoCleanupOnCritical: options.autoCleanup || false
    });
    
    if (!storageCheck.canProceed) {
      console.error(`❌ ${storageCheck.message}`.error);
      return false;
    }
    
    console.log(`✅ ${storageCheck.message}`.success);
    
    // Importar XML usando GekoXmlParser e GekoImportService
    console.log('🔄 Iniciando importação do XML...'.info);
    console.log('========================================'.bold);
    
    // Ler o arquivo XML
    console.log('📖 Lendo arquivo XML...'.info);
    const xmlData = fs.readFileSync(xmlFilePath, 'utf8');
    console.log(`✅ Arquivo XML lido com sucesso (${(xmlData.length / 1024 / 1024).toFixed(2)} MB)`.success);
    
    // Parsear XML usando o novo GekoXmlParser
    console.log('🔄 Processando XML...'.info);
    console.time('Tempo de processamento XML');
    const parser = new GekoXmlParser();
    const transformedData = await parser.parse(xmlData);
    console.timeEnd('Tempo de processamento XML');
    
    console.log(`📊 Dados extraídos: ${transformedData.products.length} produtos`.info);
    
    // Limitar número de produtos se necessário
    if (options.productLimit && options.productLimit > 0 && transformedData.products.length > options.productLimit) {
      console.log(`⚠️ Limitando importação aos primeiros ${options.productLimit} produtos dos ${transformedData.products.length} disponíveis`.warn);
      transformedData.products = transformedData.products.slice(0, options.productLimit);
      
      // Ajustar relacionamentos para produtos limitados
      const productCodes = new Set(transformedData.products.map(p => p.code));
      
      // Filtrar variantes baseado nos produtos mantidos
      transformedData.variants = transformedData.variants.filter(v => {
        const productCode = v.product_code;
        return productCodes.has(productCode);
      });
      
      console.log(`📊 Dados limitados: ${transformedData.products.length} produtos, ${transformedData.variants.length} variantes`.info);
    }
    
    // Verificar se os modelos Document e ProductProperty existem
    console.log('🔍 Verificando modelos disponíveis...'.info);
    const modelStatus = {};
    
    // Verificar se o modelo Document existe
    try {
      modelStatus.Document = typeof models.Document === 'function' || 
                             (models.Document && typeof models.Document.findOne === 'function');
      if (!modelStatus.Document) {
        console.warn(`⚠️ Aviso: Modelo Document não disponível ou não é um modelo Sequelize válido`.warn);
      } else {
        console.log(`✅ Modelo Document verificado e disponível`.success);
      }
    } catch (error) {
      console.warn(`⚠️ Aviso: Erro ao verificar modelo Document: ${error.message}`.warn);
      modelStatus.Document = false;
    }
    
    // Verificar se o modelo ProductProperty existe
    try {
      modelStatus.ProductProperty = typeof models.ProductProperty === 'function' || 
                                   (models.ProductProperty && typeof models.ProductProperty.findOne === 'function');
      if (!modelStatus.ProductProperty) {
        console.warn(`⚠️ Aviso: Modelo ProductProperty não disponível ou não é um modelo Sequelize válido`.warn);
      } else {
        console.log(`✅ Modelo ProductProperty verificado e disponível`.success);
      }
    } catch (error) {
      console.warn(`⚠️ Aviso: Erro ao verificar modelo ProductProperty: ${error.message}`.warn);
      modelStatus.ProductProperty = false;
    }
    
    // Alertar sobre modelos indisponíveis
    if (!modelStatus.Document || !modelStatus.ProductProperty) {
      console.warn(`\n⚠️ Aviso: Alguns modelos não estão disponíveis e serão ignorados:`.warn);
      if (!modelStatus.Document) console.warn(`  - Document: Documentos NÃO serão importados`.warn);
      if (!modelStatus.ProductProperty) console.warn(`  - ProductProperty: Propriedades de produtos NÃO serão importadas`.warn);
      console.log(''); // Linha em branco para separação
    }
    
    // Remover documentos e propriedades se os modelos não estiverem disponíveis
    if (!modelStatus.Document && transformedData.documents) {
      console.log(`🔍 Removendo ${transformedData.documents.length} documentos da importação devido à indisponibilidade do modelo`.info);
      transformedData.documents = [];
    }
    
    if (!modelStatus.ProductProperty && transformedData.productProperties) {
      console.log(`🔍 Removendo ${transformedData.productProperties.length} propriedades de produtos da importação devido à indisponibilidade do modelo`.info);
      transformedData.productProperties = [];
    }
    
    // Iniciar transação
    console.time('⏱️ Tempo de importação');
    const transaction = await sequelize.transaction();
    
    try {
      // Criar instância do serviço de importação com opções adicionais
      console.log('🔍 Inicializando serviço de importação...'.info);
      const importService = new GekoImportService(models, {
        batchSize: 500, // Tamanho do lote otimizado
        updateExisting: true,
        skipImages: options.skipImages || false,
        truncateDescriptions: options.truncateDescriptions || false,
        maxDescriptionLength: options.maxDescriptionLength || 1000,
        modelStatus: modelStatus, // Passar status dos modelos para o serviço
        useFindOrCreate: true // Usar findOrCreate em vez de bulkCreate com updateOnDuplicate
      });
      
      // Importar dados usando o novo serviço
      console.log('🔄 Importando dados para o banco...'.info);
      const stats = await importService.importData(transformedData, transaction);
      
      // Commit da transação
      await transaction.commit();
      
      console.timeEnd('⏱️ Tempo de importação');
      
      console.log('========================================'.bold);
      console.log('✅ IMPORTAÇÃO CONCLUÍDA COM SUCESSO'.success.bold);
      console.log('========================================'.bold);
      console.log('📊 Estatísticas de importação:'.info);
      
      // Exibir estatísticas de entidades criadas
      if (stats.created) {
        console.log('\n✨ Entidades Criadas:'.success);
        Object.entries(stats.created).forEach(([key, value]) => {
          console.log(`  - ${key}: ${value}`.data);
        });
      }
      
      // Exibir estatísticas de entidades atualizadas
      if (stats.updated) {
        console.log('\n🔄 Entidades Atualizadas:'.info);
        Object.entries(stats.updated).forEach(([key, value]) => {
          console.log(`  - ${key}: ${value}`.data);
        });
      }
      
      // Exibir estatísticas de tempo
      if (stats.totalTime) {
        console.log(`\n⏱️ Tempo total: ${stats.totalTime.toFixed(2)} segundos`.data);
      }
      
      return true;
    } catch (error) {
      // Rollback em caso de erro
      if (transaction) await transaction.rollback();
      
      console.error('========================================'.bold);
      console.error('❌ FALHA NA IMPORTAÇÃO'.error.bold);
      console.error('========================================'.bold);
      console.error(`Erro: ${error.message || 'Erro desconhecido'}`.error);
      console.error(error.stack);
      return false;
    }
  } catch (error) {
    console.error('========================================'.bold);
    console.error(`❌ ERRO DURANTE IMPORTAÇÃO: ${error.message}`.error);
    console.error('========================================'.bold);
    console.error(error.stack);
    return false;
  }
}

// Funções auxiliares para interface
function printHeader(title) {
  console.clear();
  console.log('='.repeat(50).bold);
  console.log(` ${title} `.bold);
  console.log('='.repeat(50).bold);
  console.log('');
}

function printStorageInfo(info) {
  console.log('📊 Informações de Armazenamento:'.bold);
  console.log(`  - Tamanho atual: ${info.currentSizeGB.toFixed(3)} GB / ${info.limit.gb} GB (${info.percentOfLimit.toFixed(1)}%)`.highlight);
  console.log(`  - Status: ${getStatusEmoji(info.status)} ${info.status.toUpperCase()}`);
  console.log(`  - Timestamp: ${new Date(info.timestamp).toLocaleString()}`);
  
  console.log('\n📋 Maiores Tabelas:'.bold);
  if (info.largestTables && Array.isArray(info.largestTables) && info.largestTables.length > 0) {
    info.largestTables.forEach((table, index) => {
      try {
        // Converter para número se for string
        const totalMb = typeof table.total_mb === 'string' 
          ? parseFloat(table.total_mb) 
          : table.total_mb;
        
        console.log(`  ${index + 1}. ${table.table_name}: ${totalMb.toFixed(2)} MB`);
      } catch (error) {
        console.log(`  ${index + 1}. ${table.table_name}: Tamanho indisponível`);
      }
    });
  } else {
    console.log('  Nenhuma tabela encontrada ou informação indisponível');
  }
}

function getStatusEmoji(status) {
  switch (status) {
    case 'ok': return '✅';
    case 'warning': return '⚠️';
    case 'critical': return '🔴';
    default: return '❓';
  }
}

async function waitForKey() {
  console.log('\n');
  await inquirer.prompt([
    {
      type: 'input',
      name: 'continue',
      message: 'Pressione Enter para voltar ao menu principal...'
    }
  ]);
}

// Funções para cada opção do menu
async function checkStorage() {
  printHeader('VERIFICAÇÃO DE ARMAZENAMENTO');
  
  console.log('🔍 Verificando informações de armazenamento...'.info);
  
  try {
    const startTime = Date.now();
    const info = await getDatabaseStorageInfo();
    const duration = Date.now() - startTime;
    
    printStorageInfo(info);
    console.log(`\n⏱️ Tempo de execução: ${duration} ms`.data);
    
    await waitForKey();
    return true;
  } catch (error) {
    console.error(`❌ Erro ao verificar armazenamento: ${error.message}`.error);
    console.error(error.stack);
    
    await waitForKey();
    return false;
  }
}

async function runBackup() {
  printHeader('BACKUP DE TABELAS');
  
  try {
    // Listar tabelas disponíveis
    console.log('📋 Obtendo lista de tabelas...'.info);
    
    const [tablesResult] = await sequelize.query(`
      SELECT tablename 
      FROM pg_catalog.pg_tables 
      WHERE schemaname = 'public'
    `);
    
    const tables = tablesResult.map(t => t.tablename);
    
    console.log(`📚 Tabelas disponíveis (${tables.length}):`.info);
    console.log(`  ${tables.join(', ')}`.data);
    
    // Perguntar quais tabelas fazer backup
    const choices = tables.map(table => ({
      name: table,
      value: table,
      checked: ['categories', 'producers', 'units'].includes(table)
    }));
    
    const answer = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'selectedTables',
        message: 'Selecione as tabelas para backup:',
        choices,
        pageSize: 15,
        validate: (input) => input.length > 0 ? true : 'Selecione pelo menos uma tabela'
      }
    ]);
    
    const tablesToBackup = answer.selectedTables;
    console.log(`\n🔍 Realizando backup das tabelas: ${tablesToBackup.join(', ')}`.info);
    
    // Executar backup
    const startTime = Date.now();
    const backupPath = await backupTables(tablesToBackup);
    const duration = Date.now() - startTime;
    
    console.log(`\n✅ Backup concluído em ${duration} ms`.success);
    console.log(`💾 Arquivo de backup: ${backupPath}`.highlight);
    
    // Mostrar informações do arquivo
    const stats = fs.statSync(backupPath);
    const fileSizeMB = stats.size / (1024 * 1024);
    
    console.log('\n📊 Informações do arquivo:'.bold);
    console.log(`  - Tamanho: ${fileSizeMB.toFixed(2)} MB`.data);
    console.log(`  - Criado em: ${stats.birthtime.toLocaleString()}`.data);
    
    await waitForKey();
    return true;
  } catch (error) {
    console.error(`❌ Erro ao fazer backup: ${error.message}`.error);
    console.error(error.stack);
    
    await waitForKey();
    return false;
  }
}

async function runCleanup() {
  printHeader('LIMPEZA DO BANCO DE DADOS');
  
  try {
    // Obter tamanho inicial
    console.log('📊 Verificando tamanho inicial...'.info);
    const initialInfo = await getDatabaseStorageInfo();
    printStorageInfo(initialInfo);
    
    // Mostrar opções de limpeza
    const { cleanupMode } = await inquirer.prompt([
      {
        type: 'list',
        name: 'cleanupMode',
        message: 'Qual tipo de limpeza deseja realizar?',
        choices: [
          { name: '🔄 Limpeza seletiva (manter alguns dados)', value: 'selective' },
          { name: '🧹 Purga completa (remover TODOS os dados de produtos, variantes, preços, estoques, produtores, unidades e categorias)', value: 'purge' }
        ]
      }
    ]);
    
    // Se escolheu purga completa
    if (cleanupMode === 'purge') {
      const { confirmPurge } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirmPurge',
          message: '⚠️ ATENÇÃO: Esta operação removerá TODOS os dados de produtos, variantes, preços, etc. Esta ação é irreversível. Confirma?',
          default: false
        }
      ]);
      
      if (!confirmPurge) {
        console.log('\n🚫 Purga cancelada pelo usuário'.warn);
        await waitForKey();
        return false;
      }
      
      // Perguntar sobre backup
      const { backupBeforePurge } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'backupBeforePurge',
          message: 'Deseja fazer backup antes da purga?',
          default: true
        }
      ]);
      
      // Executar purga
      console.log('\n🧹 Executando purga completa...'.info);
      const startTime = Date.now();
      const result = await purgeImportTables({
        backupBeforePurge,
        vacuumAfterPurge: true
      });
      const duration = Date.now() - startTime;
      
      // Exibir resultados
      console.log('\n✅ Purga completa concluída!'.success);
      console.log(`⏱️ Tempo total: ${result.durationSeconds.toFixed(2)} segundos`.data);
      
      if (result.backupPath) {
        console.log(`💾 Backup criado em: ${result.backupPath}`.info);
      }
      
      console.log('\n📊 Resultado da Purga:'.bold);
      console.log(`  - Tamanho inicial: ${result.initialSize.megabytes.toFixed(2)} MB`.data);
      console.log(`  - Tamanho final: ${result.finalSize.megabytes.toFixed(2)} MB`.data);
      console.log(`  - Espaço liberado: ${result.spaceFreed.megabytes.toFixed(2)} MB (${result.percentReduction.toFixed(1)}%)`.success);
      console.log(`  - Tabelas afetadas: ${result.tablesAffected.join(', ')}`.data);
      
      // Verificar tamanho final
      console.log('\n📊 Verificando tamanho final...'.info);
      const finalInfo = await getDatabaseStorageInfo();
      printStorageInfo(finalInfo);
      
      await waitForKey();
      return true;
    }
    
    // Limpeza seletiva (código existente)
    const defaultOptions = {
      keepProductCount: 200,
      keepDays: 30,
      purgeImages: true,
      truncateDescriptions: true,
      maxDescriptionLength: 200,
      vacuumAfterCleanup: true,
      backupBeforeCleanup: true
    };
    
    console.log('\n🔧 Opções de limpeza padrão:'.info);
    Object.entries(defaultOptions).forEach(([key, value]) => {
      console.log(`  - ${key}: ${value}`);
    });
    
    // Perguntar se quer customizar ou usar padrão
    const { customize } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'customize',
        message: 'Deseja customizar as opções de limpeza?',
        default: false
      }
    ]);
    
    let options = { ...defaultOptions };
    
    if (customize) {
      const answers = await inquirer.prompt([
        {
          type: 'number',
          name: 'keepProductCount',
          message: 'Quantos produtos manter (mais recentes):',
          default: defaultOptions.keepProductCount,
          validate: value => value >= 0 ? true : 'Valor deve ser maior ou igual a zero'
        },
        {
          type: 'number',
          name: 'keepDays',
          message: 'Manter registros dos últimos quantos dias:',
          default: defaultOptions.keepDays,
          validate: value => value >= 0 ? true : 'Valor deve ser maior ou igual a zero'
        },
        {
          type: 'confirm',
          name: 'purgeImages',
          message: 'Remover todas as imagens?',
          default: defaultOptions.purgeImages
        },
        {
          type: 'confirm',
          name: 'truncateDescriptions',
          message: 'Truncar descrições longas?',
          default: defaultOptions.truncateDescriptions
        },
        {
          type: 'confirm',
          name: 'backupBeforeCleanup',
          message: 'Fazer backup antes da limpeza?',
          default: defaultOptions.backupBeforeCleanup
        },
        {
          type: 'confirm',
          name: 'vacuumAfterCleanup',
          message: 'Executar VACUUM após limpeza?',
          default: defaultOptions.vacuumAfterCleanup
        }
      ]);
      
      options = { ...defaultOptions, ...answers };
    }
    
    // Confirmar limpeza
    const { confirmCleanup } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirmCleanup',
        message: '⚠️ ATENÇÃO: Esta operação removerá dados do banco. Deseja prosseguir?',
        default: false
      }
    ]);
    
    if (!confirmCleanup) {
      console.log('\n🚫 Operação cancelada pelo usuário'.warn);
      await waitForKey();
      return false;
    }
    
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
    
    await waitForKey();
    return true;
  } catch (error) {
    console.error(`❌ Erro ao executar limpeza: ${error.message}`.error);
    console.error(error.stack);
    
    await waitForKey();
    return false;
  }
}

async function runImportXml() {
  printHeader('IMPORTAÇÃO DE XML');
  
  try {
    // Primeiro perguntar se quer usar arquivo padrão ou informar caminho
    const defaultXmlPath = path.resolve(__dirname, '../../../geko_products_en.xml');
    const defaultXmlExists = fs.existsSync(defaultXmlPath);
    
    const initialQuestion = [
      {
        type: 'list',
        name: 'xmlSource',
        message: 'Qual arquivo XML deseja importar?',
        choices: [
          { name: `Arquivo padrão (geko_products_en.xml)${defaultXmlExists ? '' : ' - NÃO ENCONTRADO'}`, value: 'default', disabled: !defaultXmlExists },
          { name: 'Informar outro arquivo XML', value: 'custom' }
        ]
      }
    ];
    
    const { xmlSource } = await inquirer.prompt(initialQuestion);
    
    let xmlFilePath;
    
    if (xmlSource === 'default') {
      xmlFilePath = defaultXmlPath;
    } else {
      const { customPath } = await inquirer.prompt([
        {
          type: 'input',
          name: 'customPath',
          message: 'Informe o caminho completo do arquivo XML:',
          validate: (input) => {
            if (!input) return 'Caminho não pode ser vazio';
            if (!fs.existsSync(input)) return 'Arquivo não encontrado';
            return true;
          }
        }
      ]);
      
      xmlFilePath = customPath;
    }
    
    // Perguntar sobre opções de importação
    const { useOptions } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'useOptions',
        message: 'Deseja configurar opções adicionais de importação?',
        default: false
      }
    ]);
    
    let options = {};
    
    if (useOptions) {
      const { importOptions } = await inquirer.prompt([
        {
          type: 'checkbox',
          name: 'importOptions',
          message: 'Selecione as opções de importação:',
          choices: [
            { name: 'Limpar automaticamente banco se necessário', value: 'autoCleanup', checked: true },
            { name: 'Pular importação de imagens', value: 'skipImages', checked: false },
            { name: 'Limitar número de produtos importados', value: 'limitProducts', checked: false },
            { name: 'Truncar descrições longas', value: 'truncateDescriptions', checked: false }
          ]
        }
      ]);
      
      options.autoCleanup = importOptions.includes('autoCleanup');
      options.skipImages = importOptions.includes('skipImages');
      
      if (importOptions.includes('limitProducts')) {
        const { productLimit } = await inquirer.prompt([
          {
            type: 'number',
            name: 'productLimit',
            message: 'Limite de produtos a importar:',
            default: 1000,
            validate: value => value > 0 ? true : 'Valor deve ser maior que zero'
          }
        ]);
        
        options.productLimit = productLimit;
      }
      
      if (importOptions.includes('truncateDescriptions')) {
        const { descriptionLength } = await inquirer.prompt([
          {
            type: 'number',
            name: 'descriptionLength',
            message: 'Tamanho máximo para descrições:',
            default: 200,
            validate: value => value > 0 ? true : 'Valor deve ser maior que zero'
          }
        ]);
        
        options.truncateDescriptions = true;
        options.maxDescriptionLength = descriptionLength;
      }
    }
    
    // Executar importação
    console.log(`\n📂 Arquivo selecionado: ${xmlFilePath}`.info);
    console.log('📋 Opções de importação:'.info);
    Object.entries(options).forEach(([key, value]) => {
      console.log(`  - ${key}: ${value}`);
    });
    
    const { confirmImport } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirmImport',
        message: 'Confirma a importação com estas configurações?',
        default: true
      }
    ]);
    
    if (!confirmImport) {
      console.log('\n🚫 Importação cancelada pelo usuário'.warn);
      await waitForKey();
      return false;
    }
    
    // Iniciar importação
    const success = await importXml(xmlFilePath, options);
    
    if (success) {
      console.log('\n✅ Importação realizada com sucesso!'.success);
    } else {
      console.log('\n❌ Falha na importação. Verifique os erros acima.'.error);
    }
    
    await waitForKey();
    return success;
  } catch (error) {
    console.error(`❌ Erro ao executar importação: ${error.message}`.error);
    console.error(error.stack);
    
    await waitForKey();
    return false;
  }
}

async function runRestore() {
  printHeader('RESTAURAÇÃO DE BACKUP');
  
  try {
    // Obter lista de arquivos de backup
    const backupDir = path.join(__dirname, '../../../backups');
    if (!fs.existsSync(backupDir)) {
      console.error(`❌ Diretório de backups não encontrado: ${backupDir}`.error);
      console.log('Faça um backup primeiro antes de tentar restaurar.'.info);
      
      await waitForKey();
      return false;
    }
    
    const backupFiles = fs.readdirSync(backupDir)
      .filter(file => file.endsWith('.json'))
      .map(file => ({
        name: `${file} (${new Date(file.replace('backup_', '').replace('.json', '')).toLocaleString()})`,
        value: path.join(backupDir, file)
      }))
      .sort((a, b) => {
        // Ordenar do mais recente para o mais antigo
        const dateA = new Date(a.value.replace('backup_', '').replace('.json', ''));
        const dateB = new Date(b.value.replace('backup_', '').replace('.json', ''));
        return dateB - dateA;
      });
    
    if (backupFiles.length === 0) {
      console.error('❌ Nenhum arquivo de backup encontrado'.error);
      console.log('Faça um backup primeiro antes de tentar restaurar.'.info);
      
      await waitForKey();
      return false;
    }
    
    // Mostrar lista de backups disponíveis
    console.log(`📂 Encontrados ${backupFiles.length} arquivos de backup:`.info);
    
    const { backupPath } = await inquirer.prompt([
      {
        type: 'list',
        name: 'backupPath',
        message: 'Selecione o backup para restaurar:',
        choices: backupFiles,
        pageSize: 10
      }
    ]);
    
    console.log(`🔍 Verificando arquivo de backup: ${backupPath}`.info);
    
    // Ler metadados do backup
    console.log('\n🔍 Lendo metadados do backup...'.info);
    const backupContent = fs.readFileSync(backupPath, 'utf8');
    const backupData = JSON.parse(backupContent);
    
    if (!backupData.metadata || !backupData.data) {
      console.error('❌ Erro: Formato de backup inválido'.error);
      
      await waitForKey();
      return false;
    }
    
    // Mostrar informações do backup
    console.log('\n📋 Metadados do backup:'.bold);
    console.log(`  - Versão: ${backupData.metadata.version}`.data);
    console.log(`  - Data: ${new Date(backupData.metadata.timestamp).toLocaleString()}`.data);
    console.log(`  - Tabelas: ${backupData.metadata.tables.join(', ')}`.data);
    
    console.log('\n📊 Conteúdo do backup:'.bold);
    Object.entries(backupData.data).forEach(([table, records]) => {
      console.log(`  - ${table}: ${records.length} registros`.data);
    });
    
    // Perguntar quais tabelas restaurar
    const tableChoices = Object.keys(backupData.data).map(table => ({
      name: `${table} (${backupData.data[table].length} registros)`,
      value: table,
      checked: true
    }));
    
    const { tablesToRestore } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'tablesToRestore',
        message: 'Selecione as tabelas para restaurar:',
        choices: tableChoices,
        pageSize: 10,
        validate: (input) => input.length > 0 ? true : 'Selecione pelo menos uma tabela'
      }
    ]);
    
    // Confirmar restauração
    const { confirmRestore } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirmRestore',
        message: '⚠️ ATENÇÃO: A restauração irá inserir dados no banco. Confirma a operação?',
        default: false
      }
    ]);
    
    if (!confirmRestore) {
      console.log('\n🚫 Restauração cancelada pelo usuário'.warn);
      
      await waitForKey();
      return false;
    }
    
    // Executar restauração
    console.log('\n🔄 Executando restauração...'.info);
    const startTime = Date.now();
    const result = await restoreBackup(backupPath, tablesToRestore);
    const duration = Date.now() - startTime;
    
    console.log(`\n✅ Restauração concluída em ${duration} ms`.success);
    console.log('\n📊 Resultado da restauração:'.bold);
    console.log(`  - Tabelas restauradas: ${result.tablesRestored}`.data);
    console.log(`  - Registros restaurados: ${result.recordsRestored}`.data);
    
    console.log('\n📋 Detalhes por tabela:'.bold);
    Object.entries(result.details).forEach(([table, info]) => {
      console.log(`  - ${table}: ${info.inserted} de ${info.total} registros`.data);
    });
    
    await waitForKey();
    return true;
  } catch (error) {
    console.error(`❌ Erro ao restaurar backup: ${error.message}`.error);
    console.error(error.stack);
    
    await waitForKey();
    return false;
  }
}

// Função para analisar XML sem conexão com banco
async function analyzeXmlFile() {
  printHeader('ANÁLISE DE ARQUIVO XML');
  
  try {
    // Primeiro perguntar qual arquivo XML analisar
    const defaultXmlPath = path.resolve(__dirname, '../../../geko_products_en.xml');
    const defaultXmlExists = fs.existsSync(defaultXmlPath);
    
    const initialQuestion = [
      {
        type: 'list',
        name: 'xmlSource',
        message: 'Qual arquivo XML deseja analisar?',
        choices: [
          { name: `Arquivo padrão (geko_products_en.xml)${defaultXmlExists ? '' : ' - NÃO ENCONTRADO'}`, value: 'default', disabled: !defaultXmlExists },
          { name: 'Informar outro arquivo XML', value: 'custom' }
        ]
      }
    ];
    
    const { xmlSource } = await inquirer.prompt(initialQuestion);
    
    let xmlFilePath;
    
    if (xmlSource === 'default') {
      xmlFilePath = defaultXmlPath;
    } else {
      const { customPath } = await inquirer.prompt([
        {
          type: 'input',
          name: 'customPath',
          message: 'Informe o caminho completo do arquivo XML:',
          validate: (input) => {
            if (!input) return 'Caminho não pode ser vazio';
            if (!fs.existsSync(input)) return 'Arquivo não encontrado';
            return true;
          }
        }
      ]);
      
      xmlFilePath = customPath;
    }
    
    // Verificar arquivo XML
    console.log(`\n📂 Arquivo selecionado: ${xmlFilePath}`.info);
    
    // Verificar tamanho do arquivo
    const stats = fs.statSync(xmlFilePath);
    const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
    console.log(`📊 Tamanho: ${fileSizeMB} MB`.data);
    
    // Ler arquivo XML
    console.log('\n🔄 Lendo arquivo XML...'.info);
    const xmlData = fs.readFileSync(xmlFilePath, 'utf8');
    console.log(`✅ Arquivo lido (${(xmlData.length / 1024 / 1024).toFixed(2)} MB)`.success);
    
    // Criar instância do parser sem salvar no banco
    console.log('\n🔍 Analisando estrutura XML...'.info);
    const parser = new GekoXmlParser();
    const startTime = new Date();
    
    // Parsear dados
    const result = await parser.analyzeWithoutSaving(xmlData);
    const duration = (new Date() - startTime) / 1000;
    
    // Mostrar resultados
    console.log(`\n✅ Análise concluída em ${duration.toFixed(2)} segundos`.success);
    
    console.log('\n📊 Contagens de Entidades:'.info);
    console.log(`  - Produtos: ${result.counts.products}`.data);
    console.log(`  - Categorias: ${result.counts.categories}`.data);
    console.log(`  - Produtores: ${result.counts.producers}`.data);
    console.log(`  - Unidades: ${result.counts.units}`.data);
    console.log(`  - Variantes: ${result.counts.variants}`.data);
    console.log(`  - Estoques: ${result.counts.stocks}`.data);
    console.log(`  - Preços: ${result.counts.prices}`.data);
    console.log(`  - Imagens: ${result.counts.images}`.data);
    
    // Mostrar amostra dos dados
    if (result.samples.products && result.samples.products.length > 0) {
      console.log('\n📋 Exemplo de Produto:'.info);
      console.log(JSON.stringify(result.samples.products[0], null, 2).data);
    }
    
    // Perguntar se deseja salvar resultado da análise
    const { saveAnalysis } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'saveAnalysis',
        message: 'Deseja salvar o resultado da análise em arquivo?',
        default: true
      }
    ]);
    
    if (saveAnalysis) {
      const outputPath = path.resolve(__dirname, '../../../xml-analysis-result.json');
      fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), 'utf8');
      console.log(`\n✅ Análise salva em: ${outputPath}`.success);
    }
    
  } catch (error) {
    console.error(`\n❌ Erro durante análise: ${error.message}`.error);
    console.error(error.stack);
  }
  
  await waitForKey();
}

// Adicionar método ao GekoXmlParser para análise sem salvar
GekoXmlParser.prototype.analyzeWithoutSaving = async function(xmlData) {
  console.log('Analisando XML sem persistência em banco de dados...');
  
  try {
    // Usar o método de parse padrão do GekoXmlParser
    const transformedData = await this.parse(xmlData);
    
    // Criar objeto de resultado com contagens e amostras
    const result = {
      counts: {
        products: transformedData.products.length,
        categories: transformedData.categories.length,
        producers: transformedData.producers.length,
        units: transformedData.units.length,
        variants: transformedData.variants.length,
        stocks: transformedData.stocks.length,
        prices: transformedData.prices.length,
        images: transformedData.images.length,
        documents: Array.isArray(transformedData.documents) ? transformedData.documents.length : 0,
        productProperties: Array.isArray(transformedData.productProperties) ? transformedData.productProperties.length : 0
      },
      samples: {
        products: transformedData.products.slice(0, 5),
        categories: transformedData.categories.slice(0, 5),
        producers: transformedData.producers.slice(0, 5),
        units: transformedData.units.slice(0, 5),
        variants: transformedData.variants.slice(0, 5),
        stocks: transformedData.stocks.slice(0, 5),
        prices: transformedData.prices.slice(0, 5),
        images: transformedData.images.slice(0, 5),
        documents: Array.isArray(transformedData.documents) ? transformedData.documents.slice(0, 5) : [],
        productProperties: Array.isArray(transformedData.productProperties) ? transformedData.productProperties.slice(0, 5) : []
      }
    };
    
    return result;
  } catch (error) {
    console.error(`Erro durante análise do XML: ${error.message}`);
    throw error;
  }
};

// Menu principal
async function showMainMenu() {
  while (true) {
    printHeader('GERENCIADOR INTERATIVO DE BANCO & IMPORTAÇÃO');
    
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'O que deseja fazer?',
        choices: [
          { name: '📊 Verificar espaço de armazenamento', value: 'check' },
          { name: '💾 Fazer backup das tabelas principais', value: 'backup' },
          { name: '🧹 Limpar/purgar banco de dados', value: 'cleanup' },
          { name: '📥 Importar XML de produtos', value: 'import' },
          { name: '📤 Restaurar backup', value: 'restore' },
          { name: '❌ Sair', value: 'exit' }
        ],
        pageSize: 10
      }
    ]);
    
    switch (action) {
      case 'check':
        await checkStorage();
        break;
      case 'backup':
        await runBackup();
        break;
      case 'cleanup':
        await runCleanup();
        break;
      case 'import':
        await runImportXml();
        break;
      case 'restore':
        await runRestore();
        break;
      case 'exit':
        console.log('\n👋 Até logo!\n'.info);
        return;
    }
  }
}

// Função principal
async function main() {
  try {
    // Verificar conexão com banco antes de iniciar
    console.log('🔍 Verificando conexão com o banco de dados...'.info);
    
    // Adicionar timeout para a conexão
    const connectWithTimeout = async (timeout = 10000) => {
      return new Promise(async (resolve, reject) => {
        // Set timeout
        const timeoutId = setTimeout(() => {
          reject(new Error('Timeout ao conectar ao banco de dados após ' + timeout/1000 + ' segundos'));
        }, timeout);
        
        try {
          await sequelize.authenticate();
          clearTimeout(timeoutId);
          resolve(true);
        } catch (error) {
          clearTimeout(timeoutId);
          reject(error);
        }
      });
    };
    
    // Tentar conectar com retry
    const maxRetries = 3;
    let connected = false;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Tentativa ${attempt} de ${maxRetries}...`.info);
        
        // Mostrar informações de conexão sem expor senhas completas
        const dbUrl = process.env.POSTGRES_URL || process.env.NEON_DB_URL || '';
        if (dbUrl) {
          const maskedUrl = dbUrl.replace(/(:[^:@]*@)/, ':****@');
          console.log(`🔗 URL de conexão: ${maskedUrl}`.data);
        } else {
          console.log(`🔗 Utilizando conexão com parâmetros individuais: ${process.env.DB_HOST}`.data);
        }
        
        // Tentar conectar com timeout
        await connectWithTimeout(15000); // 15 segundos de timeout
        
        console.log('✅ Conexão com o banco de dados estabelecida com sucesso!'.success);
        connected = true;
        break;
      } catch (error) {
        console.error(`❌ Tentativa ${attempt} falhou: ${error.message}`.error);
        
        if (attempt < maxRetries) {
          const waitTime = attempt * 2000; // Backoff exponencial
          console.log(`Aguardando ${waitTime/1000} segundos antes da próxima tentativa...`.warn);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
    }
    
    if (!connected) {
      console.error('❌ Falha ao conectar ao banco de dados após múltiplas tentativas.'.error);
      console.error('Verifique suas variáveis de ambiente e conexão com o banco.'.info);
      
      // Perguntar se deseja continuar mesmo sem conseguir conectar
      const { proceedWithoutDB } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'proceedWithoutDB',
          message: 'Deseja continuar mesmo sem conexão com o banco de dados? (Somente opções que não exigem banco estarão disponíveis)',
          default: false
        }
      ]);
      
      if (!proceedWithoutDB) {
        process.exit(1);
      }
      
      // Mostrar menu limitado
      await showLimitedMenu();
      process.exit(0);
    }
    
    // Iniciar menu principal
    await showMainMenu();
    
    process.exit(0);
  } catch (error) {
    console.error(`❌ Erro fatal: ${error.message}`.error);
    console.error(error.stack);
    process.exit(1);
  }
}

// Menu limitado (sem opções de banco de dados)
async function showLimitedMenu() {
  printHeader('GERENCIADOR INTERATIVO (MODO LIMITADO)');
  
  console.log('⚠️ Modo limitado: Conexão com banco de dados indisponível.'.warn);
  console.log('Apenas opções que não exigem banco de dados estão disponíveis.'.info);
  
  while (true) {
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'O que deseja fazer?',
        choices: [
          { name: '📋 Exibir configurações de ambiente', value: 'env' },
          { name: '📂 Verificar arquivo XML', value: 'check-xml' },
          { name: '🔍 Analisar estrutura do XML', value: 'analyze-xml' },
          { name: '❌ Sair', value: 'exit' }
        ]
      }
    ]);
    
    switch (action) {
      case 'env':
        await showEnvironment();
        break;
      case 'check-xml':
        await checkXmlFile();
        break;
      case 'analyze-xml':
        await analyzeXmlFile();
        break;
      case 'exit':
        console.log('\n👋 Até logo!\n'.info);
        return;
    }
  }
}

// Função para mostrar variáveis de ambiente
async function showEnvironment() {
  printHeader('CONFIGURAÇÕES DE AMBIENTE');
  
  console.log('📋 Variáveis de ambiente:'.info);
  console.log(`  - NODE_ENV: ${process.env.NODE_ENV || 'não definido'}`.data);
  console.log(`  - DB_HOST: ${process.env.DB_HOST || 'não definido'}`.data);
  console.log(`  - DB_PORT: ${process.env.DB_PORT || 'não definido'}`.data);
  console.log(`  - DB_USER: ${process.env.DB_USER || 'não definido'}`.data);
  console.log(`  - DB_NAME: ${process.env.DB_NAME || 'não definido'}`.data);
  console.log(`  - DB_SSL: ${process.env.DB_SSL || 'não definido'}`.data);
  console.log(`  - POSTGRES_URL: ${process.env.POSTGRES_URL ? 'definido' : 'não definido'}`.data);
  console.log(`  - NEON_DB_URL: ${process.env.NEON_DB_URL ? 'definido' : 'não definido'}`.data);
  
  await waitForKey();
}

// Função para verificar arquivo XML
async function checkXmlFile() {
  printHeader('VERIFICAR ARQUIVO XML');
  
  const { xmlPath } = await inquirer.prompt([
    {
      type: 'input',
      name: 'xmlPath',
      message: 'Informe o caminho do arquivo XML:',
      default: path.resolve(__dirname, '../../../geko_products_en.xml')
    }
  ]);
  
  try {
    if (!fs.existsSync(xmlPath)) {
      console.error(`❌ Arquivo não encontrado: ${xmlPath}`.error);
    } else {
      const stats = fs.statSync(xmlPath);
      const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
      console.log(`✅ Arquivo encontrado: ${xmlPath}`.success);
      console.log(`📊 Tamanho: ${fileSizeMB} MB`.data);
      
      // Ler parte inicial do arquivo para validar
      const buffer = Buffer.alloc(4096);
      const fd = fs.openSync(xmlPath, 'r');
      fs.readSync(fd, buffer, 0, 4096, 0);
      fs.closeSync(fd);
      
      const xmlStart = buffer.toString('utf8', 0, 4096);
      console.log('\n📋 Primeiras linhas do arquivo:'.info);
      console.log(xmlStart.slice(0, 500) + '...'.data);
      
      // Verificar se parece um arquivo XML válido
      if (xmlStart.trim().startsWith('<?xml') || xmlStart.trim().startsWith('<')) {
        console.log('✅ Arquivo parece ser um XML válido'.success);
      } else {
        console.warn('⚠️ O arquivo pode não ser um XML válido. Verifique o conteúdo.'.warn);
      }
    }
  } catch (error) {
    console.error(`❌ Erro ao verificar arquivo: ${error.message}`.error);
  }
  
  await waitForKey();
}

// Executar script
main(); 