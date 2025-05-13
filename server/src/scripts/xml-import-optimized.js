/**
 * XML Import Otimizado
 * 
 * Script de importação XML de produtos GEKO, com otimizações de performance e robustez.
 * 
 * Características:
 * - Interface de menu para operação interativa
 * - Suporte a operações em lote para melhor performance
 * - Validação de dados
 * - Suporte a estruturas diferentes de variantes (<variants>/<variant> e <sizes>/<size>)
 * - Conversão entre hierarquias de categorias
 * - Monitoramento de saúde da sincronização
 * - Recuperação de erros e retentativas
 * - Relatório detalhado pós-importação
 * 
 * Uso: node xml-import-optimized.js [--file=caminho/arquivo.xml] [--limit=numero] [--incremental] [--menu]
 */

'use strict';

// Imports
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';
import { Sequelize, DataTypes, Model, Op, QueryTypes } from 'sequelize';
import xml2js from 'xml2js';
import dotenv from 'dotenv';

// Criar interface de leitura global
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Configuração do dirname para módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carregar variáveis de ambiente
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

// Configurar banco de dados
const sequelize = new Sequelize(process.env.NEON_DB_URL || 'postgres://postgres:postgres@localhost:5432/aligekow', {
  dialect: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: true
  }
});

// Função auxiliar para dividir arrays em lotes
function chunkArray(array, chunkSize) {
  const results = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    results.push(array.slice(i, i + chunkSize));
  }
  return results;
}

// Função para fazer perguntas interativas no console
function pergunta(texto) {
  return new Promise((resolve) => {
    rl.question(texto, (resposta) => {
      resolve(resposta);
    });
  });
}

// Definição dos modelos
class Category extends Model {}
Category.init({
  id: {
    type: DataTypes.TEXT,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  path: {
    type: DataTypes.STRING,
    allowNull: true
  },
  parent_id: {
    type: DataTypes.TEXT,
    allowNull: true,
    references: {
      model: 'categories',
      key: 'id'
    }
  }
}, {
  sequelize,
  modelName: 'Category',
  tableName: 'categories',
  timestamps: true,
  underscored: true
});

class Producer extends Model {}
Producer.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.TEXT,
    allowNull: false,
    unique: true
  }
}, {
  sequelize,
  modelName: 'Producer',
  tableName: 'producers',
  timestamps: true,
  underscored: true
});

class Unit extends Model {}
Unit.init({
  id: {
    type: DataTypes.TEXT,
    primaryKey: true
  },
  name: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  moq: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 1
  }
}, {
  sequelize,
  modelName: 'Unit',
  tableName: 'units',
  timestamps: true,
  underscored: true
});

class Product extends Model {}
Product.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  code: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  name: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  description_long: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  description_short: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  ean: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  producer_code: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  category_id: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  producer_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  unit_id: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  vat: {
    type: DataTypes.DECIMAL,
    allowNull: true
  },
  url: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'Product',
  tableName: 'products',
  timestamps: true,
  underscored: true
});

class Variant extends Model {}
Variant.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  code: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  weight: {
    type: DataTypes.DECIMAL,
    allowNull: true
  },
  gross_weight: {
    type: DataTypes.DECIMAL,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'Variant',
  tableName: 'variants',
  timestamps: true,
  underscored: true
});

class Stock extends Model {}
Stock.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  variant_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0
  },
  available: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false
  }
}, {
  sequelize,
  modelName: 'Stock',
  tableName: 'stocks',
  timestamps: true,
  underscored: true
});

class Price extends Model {}
Price.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  variant_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'variants',
      key: 'id'
    }
  },
  gross_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  net_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  srp_gross: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  srp_net: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'Price',
  tableName: 'prices',
  timestamps: true,
  underscored: true
});

class Image extends Model {}
Image.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'products',
      key: 'id'
    }
  },
  url: {
    type: DataTypes.TEXT,
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'Image',
  tableName: 'images',
  timestamps: true,
  underscored: true
});

// Modelo para monitorar saúde da sincronização
class SyncHealth extends Model {}
SyncHealth.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  sync_type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  source_file: {
    type: DataTypes.STRING,
    allowNull: false
  },
  api_url: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'N/A'
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false
  },
  start_time: {
    type: DataTypes.DATE,
    allowNull: false
  },
  end_time: {
    type: DataTypes.DATE,
    allowNull: true
  },
  duration_seconds: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  records_processed: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  error_count: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0
  },
  details: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  memory_usage_mb: {
    type: DataTypes.FLOAT,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'SyncHealth',
  tableName: 'sync_health',
  timestamps: true,
  underscored: true
});

// Funções auxiliares para monitoramento de saúde da sincronização
const SyncHealthService = {
  // Iniciar rastreamento de sincronização
  startSyncTracking: function(syncType, source) {
    const tracking = {
      syncType,
      source,
      startTime: new Date(),
      errors: [],
      recordsProcessed: 0,
      performance: {
        xmlParseStart: null,
        xmlParseEnd: null,
        transformStart: null,
        transformEnd: null,
        dbOperationsStart: null,
        dbOperationsEnd: null,
        batches: []
      }
    };
    
    console.log(`Iniciando monitoramento de sincronização: ${syncType} de ${source}`);
    return tracking;
  },
  
  // Registrar erro durante sincronização
  recordError: function(tracking, errorType, errorMessage, context = {}) {
    if (!tracking) return;
    
    const error = {
      type: errorType,
      message: errorMessage,
      timestamp: new Date(),
      context: JSON.stringify(context)
    };
    
    tracking.errors.push(error);
    console.error(`[${errorType}] ${errorMessage}`);
    
    return tracking;
  },
  
  // Registrar tempo de operação em lote
  recordBatchOperation: function(tracking, operation, batchSize, startTime, endTime) {
    if (!tracking) return;
    
    const duration = (endTime - startTime) / 1000;
    tracking.performance.batches.push({
      operation,
      batchSize,
      startTime,
      endTime,
      duration
    });
    
    return tracking;
  },
  
  // Finalizar rastreamento e salvar no banco
  finishSyncTracking: async function(tracking, status, recordsProcessed = 0) {
    if (!tracking) return null;
    
    const endTime = new Date();
    const durationSeconds = (endTime - tracking.startTime) / 1000;
    
    tracking.endTime = endTime;
    tracking.status = status;
    tracking.durationSeconds = durationSeconds;
    tracking.recordsProcessed = recordsProcessed;
    
    // Calcular uso de memória
    const memoryUsage = process.memoryUsage();
    const memoryUsageMb = memoryUsage.heapUsed / 1024 / 1024;
    tracking.memoryUsageMb = memoryUsageMb;
    
    // Gerar relatório de performance
    let perfDetails = {};
    if (tracking.performance) {
      if (tracking.performance.xmlParseStart && tracking.performance.xmlParseEnd) {
        perfDetails.xmlParseDuration = (tracking.performance.xmlParseEnd - tracking.performance.xmlParseStart) / 1000;
      }
      
      if (tracking.performance.transformStart && tracking.performance.transformEnd) {
        perfDetails.transformDuration = (tracking.performance.transformEnd - tracking.performance.transformStart) / 1000;
      }
      
      if (tracking.performance.dbOperationsStart && tracking.performance.dbOperationsEnd) {
        perfDetails.dbOperationsDuration = (tracking.performance.dbOperationsEnd - tracking.performance.dbOperationsStart) / 1000;
      }
      
      if (tracking.performance.batches && tracking.performance.batches.length > 0) {
        // Agrupar por tipo de operação
        const batchesByOperation = {};
        for (const batch of tracking.performance.batches) {
          if (!batchesByOperation[batch.operation]) {
            batchesByOperation[batch.operation] = [];
          }
          batchesByOperation[batch.operation].push(batch);
        }
        
        // Calcular estatísticas por operação
        perfDetails.batchStatistics = {};
        for (const operation in batchesByOperation) {
          const batches = batchesByOperation[operation];
          const totalDuration = batches.reduce((sum, batch) => sum + batch.duration, 0);
          const avgDuration = totalDuration / batches.length;
          const totalItems = batches.reduce((sum, batch) => sum + batch.batchSize, 0);
          
          perfDetails.batchStatistics[operation] = {
            totalBatches: batches.length,
            totalItems,
            totalDuration,
            avgDuration,
            itemsPerSecond: totalItems / totalDuration
          };
        }
      }
    }
    
    try {
      // Salvar informações no banco de dados
      const syncHealth = await SyncHealth.create({
        sync_type: tracking.syncType,
        source_file: tracking.source,
        api_url: 'N/A', // Valor padrão para arquivos XML locais
        status: status,
        start_time: tracking.startTime,
        end_time: endTime,
        duration_seconds: durationSeconds,
        records_processed: recordsProcessed,
        error_count: tracking.errors.length,
        details: JSON.stringify({
          errors: tracking.errors,
          performance: perfDetails
        }),
        memory_usage_mb: memoryUsageMb
      });
      
      console.log(`Sincronização #${syncHealth.id} registrada: ${status}, ${recordsProcessed} registros, ${durationSeconds.toFixed(2)}s`);
      
      return syncHealth;
    } catch (error) {
      console.error('Erro ao salvar informações de monitoramento:', error.message);
      return null;
    }
  },
  
  // Obter histórico de sincronizações
  getRecentSyncs: async function(limit = 10) {
    try {
      const recentSyncs = await SyncHealth.findAll({
        order: [['start_time', 'DESC']],
        limit
      });
      
      return recentSyncs;
    } catch (error) {
      console.error('Erro ao obter histórico de sincronizações:', error.message);
      return [];
    }
  }
};

// Função para testar a conexão com o banco de dados
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('Conexão com o banco de dados estabelecida com sucesso.');
    return true;
  } catch (error) {
    console.error('Erro ao conectar com o banco de dados:', error);
    return false;
  }
}

// Função para verificar a estrutura das tabelas
async function verificarEstruturaTabelas() {
  try {
    console.log('\n=== VERIFICAÇÃO DE ESTRUTURA DO BANCO DE DADOS ===');
    
    // Obter todas as tabelas
    const tabelas = await sequelize.getQueryInterface().showAllTables();
    console.log('Tabelas encontradas:', tabelas);
    
    // Verificar existência das tabelas necessárias
    const tabelasNecessarias = ['categories', 'producers', 'units', 'products', 'variants', 'stocks', 'prices', 'images'];
    const tabelasExistentes = tabelasNecessarias.filter(t => tabelas.includes(t));
    
    if (tabelasExistentes.length < tabelasNecessarias.length) {
      console.error('ERRO: Algumas tabelas necessárias não foram encontradas!');
      const tabelasFaltantes = tabelasNecessarias.filter(t => !tabelas.includes(t));
      console.error('Tabelas faltantes:', tabelasFaltantes);
      return null;
    }
    
    // Verificar coluna parent_id em categories
    const [resultCheckParentId] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'categories' AND column_name = 'parent_id'
    `);
    
    const temParentId = resultCheckParentId.length > 0;
    console.log(`Suporte a hierarquia de categorias: ${temParentId ? 'SIM' : 'NÃO'}`);
    
    // Se não tiver parent_id, perguntar se quer adicionar
    if (!temParentId) {
      const adicionarSuporteHierarquia = await pergunta('\nA coluna parent_id não existe na tabela categories. Deseja adicionar suporte a hierarquia? (sim/não): ');
      
      if (adicionarSuporteHierarquia.toLowerCase() === 'sim') {
        await adicionarSuporteHierarquiaCategorias();
      }
    }
    
    return { temParentId };
  } catch (error) {
    console.error('Erro ao verificar estrutura das tabelas:', error);
    return null;
  }
}

// Função para adicionar suporte a hierarquia de categorias
async function adicionarSuporteHierarquiaCategorias() {
  try {
    console.log('\n=== ADICIONANDO SUPORTE A HIERARQUIA DE CATEGORIAS ===');
    
    // Adicionar coluna parent_id
    console.log('Adicionando coluna parent_id à tabela categories...');
    await sequelize.query(`
      ALTER TABLE categories 
      ADD COLUMN parent_id TEXT NULL REFERENCES categories(id)
    `);
    
    console.log('Coluna parent_id adicionada com sucesso!');
    return true;
  } catch (error) {
    console.error('Erro ao adicionar suporte a hierarquia:', error);
    return false;
  }
}

// Função para verificar e atualizar a estrutura da tabela sync_health
async function verificarEAtualizarSyncHealth() {
  try {
    console.log('\n=== VERIFICAÇÃO E ATUALIZAÇÃO DA TABELA SYNC_HEALTH ===');
    
    // Verificar se a tabela sync_health existe
    const tabelas = await sequelize.query(
      `SELECT table_name FROM information_schema.tables 
       WHERE table_schema = 'public' AND table_name = 'sync_health'`,
      { type: QueryTypes.SELECT }
    );
    
    if (tabelas.length === 0) {
      console.log('Tabela sync_health não encontrada. Criando tabela...');
      
      await sequelize.query(`
        CREATE TABLE sync_health (
          id SERIAL PRIMARY KEY,
          sync_type VARCHAR(255) NOT NULL,
          source_file VARCHAR(255) NOT NULL,
          status VARCHAR(50) NOT NULL,
          start_time TIMESTAMP NOT NULL,
          end_time TIMESTAMP,
          duration_seconds FLOAT,
          records_processed INTEGER,
          error_count INTEGER DEFAULT 0,
          details TEXT,
          memory_usage_mb FLOAT,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      console.log('Tabela sync_health criada com sucesso.');
      return true;
    }
    
    // Obter todas as colunas atuais da tabela
    const colunasAtuais = await sequelize.query(
      `SELECT column_name, data_type 
       FROM information_schema.columns 
       WHERE table_schema = 'public' AND table_name = 'sync_health'`,
      { type: QueryTypes.SELECT }
    );
    
    const colunaMap = new Map();
    colunasAtuais.forEach(c => colunaMap.set(c.column_name, c.data_type));
    
    // Lista de colunas esperadas com seus tipos
    const colunasEsperadas = [
      { nome: 'id', tipo: 'integer' },
      { nome: 'sync_type', tipo: 'character varying' },
      { nome: 'source_file', tipo: 'character varying' },
      { nome: 'api_url', tipo: 'character varying' },
      { nome: 'status', tipo: 'character varying' },
      { nome: 'start_time', tipo: 'timestamp without time zone' },
      { nome: 'end_time', tipo: 'timestamp without time zone' },
      { nome: 'duration_seconds', tipo: 'double precision' },
      { nome: 'records_processed', tipo: 'integer' },
      { nome: 'error_count', tipo: 'integer' },
      { nome: 'details', tipo: 'text' },
      { nome: 'memory_usage_mb', tipo: 'double precision' },
      { nome: 'created_at', tipo: 'timestamp without time zone' },
      { nome: 'updated_at', tipo: 'timestamp without time zone' }
    ];
    
    // Verificar e adicionar colunas faltantes
    for (const coluna of colunasEsperadas) {
      if (!colunaMap.has(coluna.nome)) {
        console.log(`Coluna ${coluna.nome} não encontrada. Adicionando...`);
        
        let defaultValue = '';
        if (coluna.nome === 'created_at' || coluna.nome === 'updated_at') {
          defaultValue = 'DEFAULT CURRENT_TIMESTAMP';
        } else if (coluna.nome === 'error_count') {
          defaultValue = 'DEFAULT 0';
        }
        
        await sequelize.query(
          `ALTER TABLE sync_health ADD COLUMN ${coluna.nome} ${mapearTipoSQL(coluna.tipo)} ${defaultValue}`
        );
        
        console.log(`Coluna ${coluna.nome} adicionada à tabela sync_health.`);
      }
    }
    
    // Verificar especificamente se source_file existe e source existe
    // Se source existe mas source_file não, renomear a coluna
    if (!colunaMap.has('source_file') && colunaMap.has('source')) {
      console.log('Renomeando coluna source para source_file...');
      await sequelize.query(`ALTER TABLE sync_health RENAME COLUMN source TO source_file`);
      console.log('Coluna renomeada com sucesso.');
    }
    
    console.log('Estrutura da tabela sync_health está atualizada.');
    return true;
  } catch (error) {
    console.error('Erro ao verificar/atualizar tabela sync_health:', error.message);
    return false;
  }
}

// Função auxiliar para mapear tipos de dados
function mapearTipoSQL(tipo) {
  switch (tipo) {
    case 'character varying':
      return 'VARCHAR(255)';
    case 'double precision':
      return 'FLOAT';
    case 'timestamp without time zone':
      return 'TIMESTAMP';
    default:
      return tipo.toUpperCase();
  }
}

// Função para analisar XML com retentativas
async function parseXML(xmlFilePath, limit = null, maxRetries = 3, tracking = null) {
  let retryCount = 0;
  let lastError = null;
  
  if (tracking) {
    tracking.performance.xmlParseStart = new Date();
  }
  
  while (retryCount <= maxRetries) {
    try {
      if (!fs.existsSync(xmlFilePath)) {
        console.error(`Arquivo XML não encontrado: ${xmlFilePath}`);
        return null;
      }
      
      console.log(`Analisando arquivo XML: ${xmlFilePath}`);
      const startTime = new Date();
      
      const xmlString = fs.readFileSync(xmlFilePath, 'utf8');
      const tamanhoMB = (Buffer.byteLength(xmlString, 'utf8') / (1024 * 1024)).toFixed(2);
      console.log(`Tamanho do arquivo: ${tamanhoMB} MB`);
      
      const parser = new xml2js.Parser({
        explicitArray: false,
        mergeAttrs: true,
        normalizeTags: true
      });
      
      const result = await parser.parseStringPromise(xmlString);
      
      // Verificar estrutura do XML
      let productsNode;
      let estrutura = '';
      
      if (result.offer && result.offer.products && result.offer.products.product) {
        console.log('Estrutura do XML: "offer"');
        productsNode = result.offer.products;
        estrutura = 'offer';
      } else if (result.geko && result.geko.products && result.geko.products.product) {
        console.log('Estrutura do XML: "geko"');
        productsNode = result.geko.products;
        estrutura = 'geko';
      } else {
        throw new Error('Estrutura XML inválida ou não reconhecida');
      }
      
      // Converter para array se for um único produto
      let products = Array.isArray(productsNode.product) 
        ? productsNode.product 
        : [productsNode.product];
      
      const totalProdutos = products.length;
      console.log(`Total de produtos encontrados no XML: ${totalProdutos}`);
      
      // Limitar o número de produtos se solicitado
      if (limit && limit > 0 && limit < products.length) {
        console.log(`Limitando a ${limit} produtos para processamento...`);
        products = products.slice(0, limit);
      }
      
      const endTime = new Date();
      const duracao = (endTime - startTime) / 1000;
      console.log(`XML analisado em ${duracao.toFixed(2)} segundos`);
      
      // Liberar memória
      let xmlStringLimpa = null;
      
      if (tracking) {
        tracking.performance.xmlParseEnd = new Date();
      }
      
      // Forçar Garbage Collection se disponível
      global.gc && global.gc();
      
      return { products, estrutura };
    } catch (error) {
      lastError = error;
      retryCount++;
      
      if (retryCount <= maxRetries) {
        // Backoff exponencial: espera 2^retryCount segundos
        const waitTime = Math.pow(2, retryCount) * 1000;
        console.warn(`Tentativa ${retryCount}/${maxRetries} falhou. Tentando novamente em ${waitTime/1000} segundos...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      } else {
        console.error(`Todas as ${maxRetries} tentativas de análise do XML falharam:`, error);
        
        if (tracking) {
          SyncHealthService.recordError(tracking, 'XML_PARSE_ERROR', 
            `Falha ao analisar XML após ${maxRetries} tentativas: ${error.message}`
          );
        }
      }
    }
  }
  
  throw lastError || new Error('Falha ao analisar XML após múltiplas tentativas');
}

// Função para escapar conteúdo HTML para prevenir injeção de código
function escaparHTML(texto) {
  if (!texto) return '';
  
  return String(texto)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/\\/g, '&#092;')
    .replace(/\//g, '&#047;')
    .replace(/\n/g, '<br>')
    .replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;')
    .replace(/®/g, '&reg;')
    .replace(/©/g, '&copy;')
    .replace(/™/g, '&trade;');
}

// Função melhorada para validar EAN com regex e verificação de checksum
function validarEAN(ean) {
  if (!ean) return { valido: false, valor: null };
  
  // Remover espaços e caracteres não numéricos
  const eanLimpo = String(ean).replace(/[^\d]/g, '');
  
  // Verificar se tem 8, 12, 13 ou 14 dígitos (formatos comuns de EAN)
  const formatosValidos = [8, 12, 13, 14];
  
  // Verificar o formato básico
  const regexEAN = new RegExp(`^\\d{${formatosValidos.join('|')}}$`);
  const formatoValido = regexEAN.test(eanLimpo);
  
  if (!formatoValido) {
    return { 
      valido: false, 
      valor: null,
      mensagem: `EAN inválido: ${ean}. Deve ter ${formatosValidos.join(', ')} dígitos.`
    };
  }
  
  // Para EAN-13, verificar o checksum (dígito verificador)
  if (eanLimpo.length === 13) {
    // Extrair dígitos e o checksum
    const digits = eanLimpo.slice(0, 12).split('').map(Number);
    const checksum = Number(eanLimpo[12]);
    
    // Calcular o checksum (dígito de verificação)
    let sum = 0;
    for (let i = 0; i < digits.length; i++) {
      sum += digits[i] * (i % 2 === 0 ? 1 : 3);
    }
    
    const calculatedChecksum = (10 - (sum % 10)) % 10;
    
    if (checksum !== calculatedChecksum) {
      return {
        valido: false,
        valor: null,
        mensagem: `EAN-13 inválido: o dígito verificador ${checksum} não corresponde ao esperado ${calculatedChecksum}`
      };
    }
  }
  
  return { 
    valido: true, 
    valor: eanLimpo
  };
}

// Função melhorada para validar URLs
function validarURL(url) {
  if (!url) return { valido: false, valor: null };
  
  // Normalizar a URL antes de validar
  let urlParaValidar = url.trim();
  
  // Adicionar protocolo se não existir
  if (!/^https?:\/\//i.test(urlParaValidar)) {
    urlParaValidar = 'https://' + urlParaValidar;
  }
  
  // Regex para validação de URL - versão mais completa
  const regexURL = /^(https?:\/\/)((([a-z\d]([a-z\d-]*[a-z\d])*)\.)+[a-z]{2,}|((\d{1,3}\.){3}\d{1,3}))(:\d+)?(\/[-a-z\d%_.~+]*)*(\?[;&a-z\d%_.~+=-]*)?(#[-a-z\d_]*)?$/i;
  
  try {
    // Usar URL constructor para validação primária
    const urlObj = new URL(urlParaValidar);
    
    // Verificação adicional com regex
    const regexValido = regexURL.test(urlParaValidar);
    
    // Se a regex falhar, ainda pode ser uma URL válida, mas com formato diferente
    if (!regexValido) {
      // Verificar se o domínio parece válido
      const dominio = urlObj.hostname;
      const dominioValido = /^(([a-z\d]([a-z\d-]*[a-z\d])*)\.)+[a-z]{2,}|((\d{1,3}\.){3}\d{1,3})$/i.test(dominio);
      
      if (!dominioValido) {
        return {
          valido: false,
          valor: null,
          mensagem: `Domínio inválido: ${dominio}`
        };
      }
      
      return {
        valido: true,
        valor: urlObj.href,
        protocolo: urlObj.protocol,
        seguro: urlObj.protocol === 'https:',
        aviso: 'URL válida, mas com formato não convencional'
      };
    }
    
    // Verificar se o protocolo é seguro (HTTPS)
    const protocoloSeguro = urlObj.protocol === 'https:';
    
    return { 
      valido: true, 
      valor: urlObj.href,
      protocolo: urlObj.protocol,
      seguro: protocoloSeguro,
      aviso: !protocoloSeguro ? 'URL não usa protocolo seguro (HTTPS)' : null
    };
  } catch (e) {
    // Tentar uma última verificação usando regex para URLs simples
    if (/^(www\.)?[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/i.test(url)) {
      const urlCorrigida = 'https://' + url;
      return {
        valido: true,
        valor: urlCorrigida,
        protocolo: 'https:',
        seguro: true,
        aviso: 'URL parcialmente válida, protocolo inferido (https)'
      };
    }
    
    return { 
      valido: false, 
      valor: null,
      mensagem: `URL inválida: ${url} - ${e.message}`
    };
  }
}

// Função para normalizar valores numéricos
function normalizarNumero(valor) {
  if (valor === null || valor === undefined) return null;
  
  // Se já for um número, retorna diretamente
  if (typeof valor === 'number') return valor;
  
  // Converter para string, remover espaços
  const str = String(valor).trim();
  if (str === '') return null;
  
  // Substituir vírgula por ponto e converter para número
  return parseFloat(str.replace(',', '.'));
}

// Função para extrair texto de campos que podem estar em diferentes formatos
function extrairTexto(campo) {
  if (!campo) return '';
  
  // Se for uma string simples
  if (typeof campo === 'string') {
    return campo.trim();
  }
  
  // Se for um objeto com atributos xml:lang
  if (typeof campo === 'object') {
    // Tenta obter o texto do objeto
    if (campo['#text']) {
      return campo['#text'].trim();
    }
    
    // Tenta obter o texto diretamente
    if (campo._) {
      return campo._.trim();
    }
    
    // Verifica se tem conteúdo textual
    if (campo['$'] && campo['$']['xml:lang']) {
      const conteudo = Object.keys(campo)
        .filter(key => key !== '$')
        .map(key => campo[key])
        .join(' ');
      
      return conteudo.trim() || '';
    }
    
    // Se for um objeto vazio ou apenas com atributos
    return '';
  }
  
  // Fallback para outros casos
  return String(campo).trim();
}

// Função melhorada para processar categorias com IDs, assegurando sua criação antes dos produtos
function processarCategorias(product, transformedData) {
  const categoryData = product.category || {};
  
  // Extrair dados da categoria usando função para lidar com diferentes formatos
  const categoryId = categoryData.id || null;
  const categoryName = extrairTexto(categoryData.name) || 'Sem Categoria';
  const categoryPath = extrairTexto(categoryData.path) || '';
  
  // Código importante: Gerar um ID estável se não existir ID no XML
  // Isso garante que podemos usar o mesmo ID em diferentes importações
  const simpleCategoryId = categoryId || `cat_${categoryName.replace(/\s+/g, '_').toLowerCase()}`;
  
  // Se não houver path ou estiver vazio, usar apenas o ID/nome da categoria
  if (!categoryPath || categoryPath.trim() === '') {
    if (!transformedData.categories.has(simpleCategoryId)) {
      transformedData.categories.set(simpleCategoryId, {
        id: simpleCategoryId, // IMPORTANTE: Incluir o ID explicitamente
        name: categoryName,
        path: categoryName,
        parent_id: null,
        created_at: new Date(),
        updated_at: new Date()
      });
    }
    return simpleCategoryId;
  }
  
  // Processar caminho da categoria para extrair hierarquia
  const pathParts = categoryPath.split('/').filter(part => part.trim() !== '');
  
  // Se não há partes no caminho, usar o ID simples
  if (pathParts.length === 0) {
    if (!transformedData.categories.has(simpleCategoryId)) {
      transformedData.categories.set(simpleCategoryId, {
        id: simpleCategoryId,
        name: categoryName,
        path: categoryName,
        parent_id: null,
        created_at: new Date(),
        updated_at: new Date()
      });
    }
    return simpleCategoryId;
  }
  
  // Rastrear IDs de categorias pai para criar hierarquia
  let parentId = null;
  let currentPath = '';
  let finalCategoryId = null;
  
  // Processar cada nível da hierarquia, criando entidades para cada nível
  for (let i = 0; i < pathParts.length; i++) {
    const part = pathParts[i].trim();
    if (part === '') continue;
    
    // Construir caminho atual e ID único para cada nível
    currentPath = currentPath ? `${currentPath}/${part}` : part;
    const subCategoryId = `${currentPath.replace(/\//g, '_')}`;
    
    // Verificar se a categoria já existe no mapa
    if (!transformedData.categories.has(subCategoryId)) {
      transformedData.categories.set(subCategoryId, {
        id: subCategoryId, // IMPORTANTE: Incluir ID explícito
        name: part,
        path: currentPath,
        parent_id: parentId,
        created_at: new Date(),
        updated_at: new Date()
      });
    }
    
    // Esta categoria se torna a pai para o próximo nível
    parentId = subCategoryId;
    
    // Armazenar o ID da categoria mais profunda (último nível)
    finalCategoryId = subCategoryId;
  }
  
  // Retornar o ID da categoria mais profunda (última na hierarquia)
  // Ou o ID simples se algo deu errado na lógica de hierarquia
  return finalCategoryId || simpleCategoryId;
}

// Função principal para transformar os dados do XML
function transformProducts(xmlData, tracking = null) {
  if (!xmlData || !xmlData.products) {
    console.error('Dados XML inválidos ou vazios');
    return null;
  }
  
  if (tracking) {
    tracking.performance.transformStart = new Date();
  }
  
  const { products, estrutura } = xmlData;
  console.log(`Transformando ${products.length} produtos para o formato do banco de dados...`);
  const startTime = new Date();
  
  // Mapas para evitar duplicações e melhorar performance
  const categories = new Map();
  const producers = new Map();
  const units = new Map();
  
  // Arrays para armazenar os dados transformados
  const transformedProducts = [];
  const transformedVariants = [];
  const transformedStocks = [];
  const transformedPrices = [];
  const transformedImages = [];
  
  // Contadores para estatísticas e erros
  let countProducts = 0;
  let countVariants = 0;
  let countStocks = 0;
  let countPrices = 0;
  let countImages = 0;
  let countErrors = 0;
  const errors = [];
  
  // Processar cada produto
  for (let i = 0; i < products.length; i++) {
    // Log de progresso para arquivos grandes
    if (i > 0 && i % 1000 === 0) {
      console.log(`Processando produto ${i} de ${products.length}...`);
      // Liberar memória periodicamente
      global.gc && global.gc();
    }
    
    const product = products[i];
    
    try {
      // Validação: Produto deve ter código
      const productCode = product.code || '';
      if (!productCode) {
        errors.push('Produto sem código encontrado. Pulando...');
        countErrors++;
        continue;
      }
      
      // CORREÇÃO IMPORTANTE: Processar categoria com suporte a hierarquia
      // Passamos o mapa de categorias para ser preenchido pela função
      const transformedData = { categories };
      const categoryId = processarCategorias(product, transformedData);
      
      // Processar produtor
      let producerName = null;
      
      if (product.producer) {
        const producer = product.producer;
        producerName = extrairTexto(producer.name) || 'Unknown';
        
        // Verificar se já existe no mapa
        if (!producers.has(producerName)) {
          // Novo produtor
          producers.set(producerName, {
            name: producerName,
            created_at: new Date(),
            updated_at: new Date()
          });
        }
      }
      
      // Processar unidade
      let unitId = null;
      let unitName = null;
      
      if (product.unit) {
        unitId = String(product.unit);
        unitName = String(product.unit);
        
        if (!units.has(unitId)) {
          units.set(unitId, {
            id: unitId,
            name: unitName,
            created_at: new Date(),
            updated_at: new Date()
          });
        }
      }
      
      // Processar detalhes do produto
      let name = '';
      let descriptionLong = '';
      let descriptionShort = '';
      
      if (product.description) {
        const description = product.description;
        
        // Extrair nome
        if (description.name) {
          name = extrairTexto(description.name);
        }
        
        // Extrair descrição longa
        if (description.long) {
          descriptionLong = extrairTexto(description.long);
        } else if (description.long_desc) {
          descriptionLong = extrairTexto(description.long_desc);
        }
        
        // Extrair descrição curta
        if (description.short) {
          descriptionShort = extrairTexto(description.short);
        } else if (description.short_desc) {
          descriptionShort = extrairTexto(description.short_desc);
        }
      }
      
      // Validação: Usar código como nome se não tiver nome
      if (!name) {
        name = productCode;
      }
      
      // Processar e validar outros atributos do produto
      const eanValidado = validarEAN(product.ean || null);
      const ean = eanValidado.valido ? eanValidado.valor : null;
      
      const producerCode = product.producer_code || null;
      const vat = product.vat ? normalizarNumero(product.vat) : null;
      
      const urlValidada = validarURL(product.url || null);
      const url = urlValidada.valido ? urlValidada.valor : null;
      
      // Criar objeto de produto
      const transformedProduct = {
        code: productCode,
        name,
        description_long: descriptionLong,
        description_short: descriptionShort,
        ean,
        producer_code: producerCode,
        category_id: categoryId,
        producer_name: producerName, // Armazenar o nome temporariamente, será substituído pelo ID real após consulta
        unit_id: unitId,
        vat,
        url,
        created_at: new Date(),
        updated_at: new Date()
      };
      
      transformedProducts.push(transformedProduct);
      countProducts++;
      
      // Processar variantes, estoques e preços
      if (product.variants && product.variants.variant) {
        // Converter para array se for um único item
        const variants = Array.isArray(product.variants.variant) 
          ? product.variants.variant 
          : [product.variants.variant];
        
        for (const variant of variants) {
          const variantCode = variant.code || productCode;
          const weight = variant.weight ? normalizarNumero(variant.weight) : null;
          const grossWeight = variant.gross_weight ? normalizarNumero(variant.gross_weight) : null;
          
          // Validar EAN da variante, se existir
          const variantEanValidado = validarEAN(variant.ean || null);
          const variantEan = variantEanValidado.valido ? variantEanValidado.valor : null;
          
          transformedVariants.push({
            code: variantCode,
            product_code: productCode,
            weight,
            gross_weight: grossWeight,
            ean: variantEan,
            created_at: new Date(),
            updated_at: new Date()
          });
          
          countVariants++;
          
          // Processar estoque
          if (variant.stock) {
            const stock = variant.stock;
            const quantity = stock.quantity ? parseInt(stock.quantity, 10) : 0;
            const available = stock.available === 'true' || stock.available === true;
            const minOrderQuantity = stock.min_order_quantity ? parseInt(stock.min_order_quantity, 10) : 1;
            
            transformedStocks.push({
              variant_code: variantCode,
              quantity,
              available,
              min_order_quantity: minOrderQuantity,
              created_at: new Date(),
              updated_at: new Date()
            });
            
            countStocks++;
          }
          
          // Processar preços
          if (variant.prices && variant.prices.price) {
            // Converter para array se for um único item
            const prices = Array.isArray(variant.prices.price) 
              ? variant.prices.price 
              : [variant.prices.price];
            
            for (const price of prices) {
              const amount = normalizarNumero(price.amount);
              const currency = price.currency || 'EUR';
              const type = price.type || 'retail';
              
              if (amount !== null) {
                transformedPrices.push({
                  variant_code: variantCode,
                  amount,
                  currency,
                  type,
                  vat: vat, // Usar o VAT do produto
                  created_at: new Date(),
                  updated_at: new Date()
                });
                
                countPrices++;
              }
            }
          }
        }
      }
      // Processar estrutura alternativa de variantes usando <sizes>/<size>
      else if (product.sizes && product.sizes.size) {
        // Converter para array se for um único item
        const sizes = Array.isArray(product.sizes.size) 
          ? product.sizes.size 
          : [product.sizes.size];
        
        for (const size of sizes) {
          const variantCode = size.code || productCode;
          const weight = size.weight ? normalizarNumero(size.weight) : null;
          const grossWeight = size.grossWeight ? normalizarNumero(size.grossWeight) : null;
          
          // Validar EAN da variante, se existir
          const variantEanValidado = validarEAN(size.ean || null);
          const variantEan = variantEanValidado.valido ? variantEanValidado.valor : null;
          
          transformedVariants.push({
            code: variantCode,
            product_code: productCode,
            weight,
            gross_weight: grossWeight,
            ean: variantEan,
            created_at: new Date(),
            updated_at: new Date()
          });
          
          countVariants++;
          
          // Processar estoque
          if (size.stock) {
            const stockArray = Array.isArray(size.stock) 
              ? size.stock 
              : [size.stock];
              
            for (const stock of stockArray) {
              const quantity = stock.quantity ? parseInt(stock.quantity, 10) : 0;
              const available = stock.available === 'true' || stock.available === true || quantity > 0;
              const minOrderQuantity = stock.min_order_quantity ? parseInt(stock.min_order_quantity, 10) : 1;
              
              transformedStocks.push({
                variant_code: variantCode,
                quantity,
                available,
                min_order_quantity: minOrderQuantity,
                created_at: new Date(),
                updated_at: new Date()
              });
              
              countStocks++;
            }
          }
          
          // Processar preços - estrutura regular
          if (size.prices && size.prices.price) {
            const prices = Array.isArray(size.prices.price) 
              ? size.prices.price 
              : [size.prices.price];
            
            for (const price of prices) {
              const amount = normalizarNumero(price.amount);
              const currency = price.currency || 'EUR';
              const type = price.type || 'retail';
              
              if (amount !== null) {
                transformedPrices.push({
                  variant_code: variantCode,
                  amount,
                  currency,
                  type,
                  vat: vat,
                  created_at: new Date(),
                  updated_at: new Date()
                });
                
                countPrices++;
              }
            }
          }
          // Processar preços - estrutura alternativa direta
          else if (size.price) {
            const priceArray = Array.isArray(size.price) 
              ? size.price 
              : [size.price];
            
            for (const price of priceArray) {
              // Pode ter gross ou net
              const amount = normalizarNumero(price.gross || price.net || 0);
              const currency = 'EUR'; // Padrão
              const type = 'retail'; // Padrão
              
              if (amount !== null) {
                transformedPrices.push({
                  variant_code: variantCode,
                  amount,
                  currency,
                  type,
                  vat: vat,
                  created_at: new Date(),
                  updated_at: new Date()
                });
                
                countPrices++;
              }
            }
          }
          // Processar preços de SRP (Recommended retail price / preço sugerido)
          if (size.srp) {
            const srpArray = Array.isArray(size.srp) 
              ? size.srp 
              : [size.srp];
            
            for (const srp of srpArray) {
              // Pode ter gross ou net
              const amount = normalizarNumero(srp.gross || srp.net || 0);
              const currency = 'EUR'; // Padrão
              const type = 'srp'; // Preço sugerido
              
              if (amount !== null) {
                transformedPrices.push({
                  variant_code: variantCode,
                  amount,
                  currency,
                  type,
                  vat: vat,
                  created_at: new Date(),
                  updated_at: new Date()
                });
                
                countPrices++;
              }
            }
          }
        }
      }
      // Se não há variantes, criar uma variante padrão
      else {
        const variantCode = productCode;
          
        transformedVariants.push({
          code: variantCode,
          product_code: productCode,
          weight: null,
          gross_weight: null,
          ean: null,
          created_at: new Date(),
          updated_at: new Date()
        });
        
        countVariants++;
      }
      
      // Processar imagens
      if (product.images) {
        // Verificar se temos imagens na estrutura <images><large><image>
        if (product.images.large && product.images.large.image) {
          // Converter para array se for um único item
          const images = Array.isArray(product.images.large.image) 
            ? product.images.large.image 
            : [product.images.large.image];
          
          for (const [index, image] of images.entries()) {
            // Validar URL da imagem
            const urlValidada = validarURL(image.url || '');
            if (!urlValidada.valido) continue;
            
            // Na estrutura atual do banco, apenas armazenamos a URL e a referência ao produto
            transformedImages.push({
              product_code: productCode,
              url: urlValidada.valor,
              created_at: new Date(),
              updated_at: new Date()
            });
            
            countImages++;
          }
        }
        // Verificar também a estrutura antiga <images><image>
        else if (product.images.image) {
          // Converter para array se for um único item
          const images = Array.isArray(product.images.image) 
            ? product.images.image 
            : [product.images.image];
          
          for (const [index, image] of images.entries()) {
            // Validar URL da imagem
            const urlValidada = validarURL(image.url || '');
            if (!urlValidada.valido) continue;
            
            // Na estrutura atual do banco, apenas armazenamos a URL e a referência ao produto
            transformedImages.push({
              product_code: productCode,
              url: urlValidada.valor,
              created_at: new Date(),
              updated_at: new Date()
            });
            
            countImages++;
          }
        }
      }
    } catch (error) {
      countErrors++;
      const errorMsg = `Erro ao transformar o produto ${product.code || 'sem código'}: ${error.message}`;
      errors.push(errorMsg);
      console.error(errorMsg);
      
      if (tracking) {
        SyncHealthService.recordError(tracking, 'TRANSFORM_ERROR', errorMsg);
      }
      
      // Continuar processando outros produtos, não abortar tudo
      continue;
    }
  }
  
  const endTime = new Date();
  const duracao = (endTime - startTime) / 1000;
  
  console.log(`Transformação concluída em ${duracao.toFixed(2)} segundos`);
  console.log(`Total transformado: ${countProducts} produtos, ${countVariants} variantes, ${countStocks} estoques, ${countPrices} preços, ${countImages} imagens`);
  
  if (countErrors > 0) {
    console.warn(`Ocorreram ${countErrors} erros durante a transformação. Verifique o log para detalhes.`);
  }
  
  if (tracking) {
    tracking.performance.transformEnd = new Date();
  }
  
  return {
    categories: Array.from(categories.values()),
    producers: Array.from(producers.values()),
    units: Array.from(units.values()),
    products: transformedProducts,
    variants: transformedVariants,
    stocks: transformedStocks,
    prices: transformedPrices,
    images: transformedImages,
    stats: {
      products: countProducts,
      variants: countVariants,
      stocks: countStocks,
      prices: countPrices,
      images: countImages,
      categories: categories.size,
      producers: producers.size,
      units: units.size,
      duracao,
      errors: countErrors,
      errorMessages: errors
    }
  };
}

// Função principal para importar dados com retentativas - otimizada sem usar updateOnDuplicate
async function importData(xmlFilePath, limit = null, incremental = false, maxRetries = 3) {
  console.time('Tempo total de importação');
  
  try {
    // Iniciar monitoramento de saúde da sincronização
    const tracking = SyncHealthService.startSyncTracking(
      incremental ? 'incremental_sync' : 'full_sync',
      xmlFilePath
    );
    
    // Testar conexão com o banco antes de prosseguir
    const connectionOk = await testConnection();
    if (!connectionOk) {
      console.error('Falha ao conectar com o banco de dados. Abortando.');
      await SyncHealthService.finishSyncTracking(tracking, 'failed', 0);
      return false;
    }
    
    // Verificar estrutura das tabelas
    const estrutura = await verificarEstruturaTabelas();
    if (!estrutura) {
      console.error('Falha ao verificar estrutura das tabelas. Abortando.');
      await SyncHealthService.finishSyncTracking(tracking, 'failed', 0);
      return false;
    }
    
    // Analisar o arquivo XML com retentativas
    try {
      console.log(`Analisando arquivo XML: ${xmlFilePath}`);
      const xmlData = await parseXML(xmlFilePath, limit, maxRetries, tracking);
      
      if (!xmlData || !xmlData.products || xmlData.products.length === 0) {
        console.error('Nenhum produto encontrado no XML ou falha na análise.');
        await SyncHealthService.finishSyncTracking(tracking, 'failed', 0);
        return false;
      }
      
      console.log(`Processando ${xmlData.products.length} produtos...`);
      
      // Transformar os dados do XML para o formato do banco
      const transformedData = transformProducts(xmlData, tracking);
      
      if (!transformedData) {
        console.error('Falha ao transformar dados do XML.');
        await SyncHealthService.finishSyncTracking(tracking, 'failed', 0);
        return false;
      }
      
      // Iniciar transação
      // Vamos implementar um mecanismo de retentativa para a transação também
      let transactionSuccess = false;
      let transactionRetryCount = 0;
      
      while (!transactionSuccess && transactionRetryCount <= maxRetries) {
        let transaction;
        
        try {
          transaction = await sequelize.transaction();
          
          if (tracking) {
            tracking.performance.dbOperationsStart = new Date();
          }
          
          console.log('Iniciando inserção no banco de dados...');
          const startTime = new Date();
          
          // Batch size para operações em lote (otimizado para maior desempenho)
          const BATCH_SIZE = 500;
          
          // Contadores para estatísticas de sincronização incremental
          let countInsertedProducts = 0;
          let countUpdatedProducts = 0;
          let countSkippedProducts = 0;
          let countInsertedVariants = 0;
          let countInsertedStocks = 0;
          let countInsertedPrices = 0;
          let countInsertedImages = 0;
          
          // 1. Processar categorias - primeira etapa essencial
          console.log(`Processando ${transformedData.categories.length} categorias...`);
          if (transformedData.categories.length > 0) {
            // Obter categorias existentes para verificar quais precisam ser inseridas ou atualizadas
            const existingCategories = await Category.findAll({
              attributes: ['id', 'name', 'path', 'parent_id'],
              transaction
            });
            
            // Criar mapa de categorias existentes para verificação rápida
            const existingCategoryMap = new Map();
            for (const cat of existingCategories) {
              existingCategoryMap.set(cat.id, cat);
            }
            
            // Separar categorias a serem inseridas ou atualizadas
            const categoriesToInsert = [];
            const categoriesToUpdate = [];
            
            // Ordenar categorias para garantir que pais sejam processados antes dos filhos
            const categoriasOrdenadas = [...transformedData.categories].sort((a, b) => {
              // Se a é pai de b, a deve vir primeiro
              if (b.parent_id === a.id) return -1;
              // Se b é pai de a, b deve vir primeiro
              if (a.parent_id === b.id) return 1;
              // Se nenhum é pai do outro, manter ordem original
              return 0;
            });
            
            for (const category of categoriasOrdenadas) {
              if (existingCategoryMap.has(category.id)) {
                // Se existe, verificar se precisa atualizar
                const existingCategory = existingCategoryMap.get(category.id);
                if (
                  existingCategory.name !== category.name || 
                  existingCategory.path !== category.path || 
                  existingCategory.parent_id !== category.parent_id
                ) {
                  categoriesToUpdate.push(category);
                }
              } else {
                // Se não existe, inserir
                categoriesToInsert.push(category);
              }
            }
            
            // Inserir novas categorias em lotes
            if (categoriesToInsert.length > 0) {
              console.log(`Inserindo ${categoriesToInsert.length} novas categorias...`);
              
              for (let i = 0; i < categoriesToInsert.length; i += BATCH_SIZE) {
                const batchStart = new Date();
                const batch = categoriesToInsert.slice(i, i + BATCH_SIZE);
                
                try {
                  await Category.bulkCreate(batch, { transaction });
                  
                  const batchEnd = new Date();
                  if (tracking) {
                    SyncHealthService.recordBatchOperation(tracking, 'INSERT_CATEGORIES', batch.length, batchStart, batchEnd);
                  }
                  
                  console.log(`  Lote de ${batch.length} novas categorias processado em ${((batchEnd - batchStart) / 1000).toFixed(2)}s`);
                } catch (error) {
                  SyncHealthService.recordError(tracking, 'CATEGORY_INSERT_ERROR', 
                    `Erro ao inserir lote de categorias: ${error.message}`,
                    { batchSize: batch.length }
                  );
                  console.error(`  Erro ao inserir lote de categorias:`, error.message);
                  
                  // Tentar inserir uma por uma para identificar problemas específicos
                  console.log('  Tentando inserir categorias individualmente...');
                  for (const category of batch) {
                    try {
                      await Category.create(category, { transaction });
                    } catch (err) {
                      console.error(`  Erro ao inserir categoria ${category.id}: ${err.message}`);
                    }
                  }
                }
              }
            }
            
            // Atualizar categorias existentes em lotes
            if (categoriesToUpdate.length > 0) {
              console.log(`Atualizando ${categoriesToUpdate.length} categorias existentes...`);
              
              // Fazer atualizações em paralelo, mas em lotes para não sobrecarregar
              for (let i = 0; i < categoriesToUpdate.length; i += BATCH_SIZE) {
                const batchStart = new Date();
                const batch = categoriesToUpdate.slice(i, i + BATCH_SIZE);
                
                try {
                  await Promise.all(batch.map(category => 
                    Category.update(
                      {
                        name: category.name,
                        path: category.path,
                        parent_id: category.parent_id,
                        updated_at: new Date()
                      },
                      {
                        where: { id: category.id },
                        transaction
                      }
                    )
                  ));
                  
                  const batchEnd = new Date();
                  if (tracking) {
                    SyncHealthService.recordBatchOperation(tracking, 'UPDATE_CATEGORIES', batch.length, batchStart, batchEnd);
                  }
                  
                  console.log(`  Lote de ${batch.length} categorias atualizadas em ${((batchEnd - batchStart) / 1000).toFixed(2)}s`);
                } catch (error) {
                  SyncHealthService.recordError(tracking, 'CATEGORY_UPDATE_ERROR', 
                    `Erro ao atualizar lote de categorias: ${error.message}`,
                    { batchSize: batch.length }
                  );
                  console.error(`  Erro ao atualizar lote de categorias:`, error.message);
                }
              }
            }
            
            console.log(`Processamento de categorias concluído. ${categoriesToInsert.length} inseridas, ${categoriesToUpdate.length} atualizadas.`);
          }
          
          // 2. Processar produtores
          console.log(`Processando ${transformedData.producers.length} produtores...`);
          // Mapa para armazenar a relação entre nome do produtor e ID no banco
          const producerIdMap = new Map();
          
          if (transformedData.producers.length > 0) {
            // Obter produtores existentes
            const existingProducers = await Producer.findAll({
              attributes: ['id', 'name'],
              transaction
            });
            
            // Criar mapa de nomes para IDs
            existingProducers.forEach(producer => {
              producerIdMap.set(producer.name, producer.id);
            });
            
            // Identificar quais produtores já existem
            const existingProducerNames = new Set(existingProducers.map(p => p.name));
            const newProducers = transformedData.producers.filter(
              p => !existingProducerNames.has(p.name)
            );
            
            console.log(`  ${existingProducers.length} produtores já existem no banco`);
            console.log(`  ${newProducers.length} novos produtores serão inseridos`);
            
            // Inserir novos produtores
            if (newProducers.length > 0) {
              try {
                const createdProducers = await Producer.bulkCreate(newProducers, { 
                  transaction,
                  returning: true
                });
                
                // Adicionar novos produtores ao mapa
                createdProducers.forEach(producer => {
                  producerIdMap.set(producer.name, producer.id);
                });
              } catch (error) {
                console.error(`[PRODUCER_ERROR] Erro ao inserir produtores: ${error.message}`);
                if (tracking) {
                  SyncHealthService.recordError(tracking, 'PRODUCER_ERROR', error.message);
                }
              }
            }
          }
          
          // 3. Atualizar os IDs de produtores nos produtos
          console.log(`Atualizando referências de produtores em produtos...`);
          transformedData.products.forEach(product => {
            if (product.producer_name && producerIdMap.has(product.producer_name)) {
              product.producer_id = producerIdMap.get(product.producer_name);
              delete product.producer_name; // Remover campo temporário
            } else if (product.producer_name) {
              // Se temos um nome de produtor mas não encontramos no mapa, registrar o problema
              console.warn(`Produtor não encontrado: ${product.producer_name}`);
              delete product.producer_name; // Remover o campo temporário pois não é aceito no modelo
            }
          });
          
          // 4. Processar unidades
          console.log(`Processando ${transformedData.units.length} unidades...`);
          if (transformedData.units.length > 0) {
            // Obter unidades existentes
            const existingUnits = await Unit.findAll({
              attributes: ['id', 'name'],
              transaction
            });
            
            // Criar mapa de nomes para IDs
            const unitIdMap = new Map();
            existingUnits.forEach(unit => {
              unitIdMap.set(unit.name, unit.id);
            });
            
            // Atualizar unidades existentes
            console.log(`Atualizando ${transformedData.units.length} unidades existentes...`);
            try {
              const startTimeUnits = new Date();
              await Unit.bulkCreate(transformedData.units, {
                updateOnDuplicate: ['name', 'updated_at'],
                transaction
              });
              console.log(`  Lote de ${transformedData.units.length} unidades atualizadas em ${((new Date() - startTimeUnits) / 1000).toFixed(2)}s`);
            } catch (error) {
              console.error(`[UNIT_ERROR] Erro ao atualizar unidades: ${error.message}`);
              if (tracking) {
                SyncHealthService.recordError(tracking, 'UNIT_ERROR', error.message);
              }
            }
          }
          
          // 5. Processar produtos
          // Mapa para armazenar relação entre código do produto e ID no banco
          const productIdMap = new Map();
          
          console.log(`Processando ${transformedData.products.length} produtos...`);
          if (transformedData.products.length > 0) {
            // Obter produtos existentes
            const existingProducts = await Product.findAll({
              attributes: ['id', 'code'],
              where: {
                code: transformedData.products.map(p => p.code)
              },
              transaction
            });
            
            // Criar mapa de códigos para IDs
            existingProducts.forEach(product => {
              productIdMap.set(product.code, product.id);
            });
            
            // Dividir produtos em lotes para inserção
            const productBatches = chunkArray(transformedData.products, BATCH_SIZE);
            
            // Inserir produtos em lotes
            for (const batch of productBatches) {
              console.log(`Inserindo ${batch.length} produtos...`);
              try {
                const startTime = new Date();
                const createdProducts = await Product.bulkCreate(batch, {
                  updateOnDuplicate: ['name', 'description', 'ean', 'vat', 'updated_at'],
                  returning: true,
                  transaction
                });
                
                // Adicionar produtos ao mapa de IDs
                createdProducts.forEach(product => {
                  productIdMap.set(product.code, product.id);
                });
                
                console.log(`  Lote de ${batch.length} produtos processado em ${((new Date() - startTime) / 1000).toFixed(2)}s`);
                countInsertedProducts += batch.length;
              } catch (error) {
                console.error(`[PRODUCT_ERROR] Erro ao inserir lote de produtos: ${error.message}`);
                if (tracking) {
                  SyncHealthService.recordError(tracking, 'PRODUCT_ERROR', error.message);
                }
              }
            }
          }
          
          // 6. Processar variantes
          // Mapa para armazenar relação entre código da variante e ID no banco
          const variantIdMap = new Map(); // Mapear ID da variante pelo ID do produto e código da variante
          const variantCodeToId = new Map(); // Mapear diretamente código da variante para ID da variante
          
          console.log(`Processando ${transformedData.variants.length} variantes...`);
          if (transformedData.variants.length > 0) {
            // Preparar variantes com product_id correto
            const preparedVariants = transformedData.variants.map(variant => {
              const productId = productIdMap.get(variant.product_code);
              if (productId) {
                return {
                  ...variant,
                  product_id: productId
                };
              }
              return null;
            }).filter(Boolean); // Remover entradas nulas (sem product_id)
            
            if (preparedVariants.length === 0) {
              console.warn('Nenhuma variante válida para inserção (sem product_id)');
            } else {
              // Dividir variantes em lotes para inserção
              const variantBatches = chunkArray(preparedVariants, BATCH_SIZE);
              
              // Inserir variantes em lotes
              for (const batch of variantBatches) {
                try {
                  console.log(`Inserindo ${batch.length} variantes...`);
                  const batchStart = new Date();
                  
                  // Remover product_code antes da inserção no banco (já foi convertido para product_id)
                  const cleanBatch = batch.map(({ product_code, ...rest }) => rest);
                  
                  // Criar variantes em lote
                  const createdVariants = await Variant.bulkCreate(cleanBatch, { transaction });
                  
                  // Mapear variantes criadas por código e product_id para uso posterior
                  createdVariants.forEach(variant => {
                    variantIdMap.set(`${variant.code}:${variant.product_id}`, variant.id);
                    variantCodeToId.set(variant.code, variant.id); // Mapeamento direto por código
                  });
                  
                  const batchEnd = new Date();
                  if (tracking) {
                    SyncHealthService.recordBatchOperation(tracking, 'INSERT_VARIANTS', batch.length, batchStart, batchEnd);
                  }
                  
                  console.log(`  Lote de ${batch.length} variantes processado em ${((batchEnd - batchStart) / 1000).toFixed(2)}s`);
                  countInsertedVariants += batch.length;
                } catch (error) {
                  SyncHealthService.recordError(tracking, 'VARIANT_INSERT_ERROR', 
                    `Erro ao inserir lote de variantes: ${error.message}`,
                    { batchSize: batch.length }
                  );
                  console.error(`  Erro ao inserir lote de variantes:`, error.message);
                }
              }
            }
          }
          
          // 7. Processar estoques
          console.log(`Processando ${transformedData.stocks.length} estoques...`);
          if (transformedData.stocks.length > 0) {
            // Preparar estoques com variant_id correto
            const preparedStocks = transformedData.stocks.map(stock => {
              // Encontrar o ID da variante usando variant_code e product_code
              const variantKeys = Array.from(variantIdMap.keys()).filter(key => 
                key.startsWith(`${stock.variant_code}:`)
              );
              
              if (variantKeys.length > 0) {
                const variantId = variantIdMap.get(variantKeys[0]);
                
                if (variantId) {
                  return {
                    ...stock,
                    variant_id: variantId
                  };
                }
              }
              return null;
            }).filter(Boolean); // Remover entradas nulas (sem variant_id)
            
            if (preparedStocks.length === 0) {
              console.warn('Nenhum estoque válido para inserção (sem variant_id)');
            } else {
              // Dividir estoques em lotes para inserção
              const stockBatches = chunkArray(preparedStocks, BATCH_SIZE);
              
              // Inserir estoques em lotes
              for (const batch of stockBatches) {
                try {
                  console.log(`Inserindo ${batch.length} estoques...`);
                  const startTime = new Date();
                  
                  // Remover variant_code antes da inserção no banco
                  const cleanBatch = batch.map(({ variant_code, ...rest }) => rest);
                  
                  const createdStocks = await Stock.bulkCreate(cleanBatch, {
                    updateOnDuplicate: ['quantity', 'available', 'updated_at'],
                    transaction
                  });
                  
                  console.log(`  Lote de ${batch.length} estoques processado em ${((new Date() - startTime) / 1000).toFixed(2)}s`);
                  countInsertedStocks += batch.length;
                } catch (error) {
                  console.error(`[STOCK_ERROR] Erro ao inserir lote de estoques: ${error.message}`);
                  if (tracking) {
                    SyncHealthService.recordError(tracking, 'STOCK_ERROR', error.message);
                  }
                }
              }
            }
          }
          
          // 8. Processar preços
          console.log(`Processando ${transformedData.prices.length} preços...`);
          if (transformedData.prices.length > 0) {
            const preparedPrices = transformedData.prices.map(price => {
              const variantId = variantCodeToId.get(price.variant_code);
              
              if (variantId) {
                // Obter o tipo do preço (retail, wholesale, srp)
                // e mapear os campos apropriadamente para o modelo de preços
                const mappedPrice = {
                  variant_id: variantId,
                  gross_price: 0, // Valor padrão para garantir que nunca seja NULL
                  net_price: 0, // Valor padrão para garantir que nunca seja NULL
                  srp_gross: null,
                  srp_net: null,
                  created_at: new Date(),
                  updated_at: new Date()
                };
                
                // Definir campos de preço com base no tipo
                if (price.type === 'retail' || price.type === undefined) {
                  mappedPrice.gross_price = price.amount || 0;
                  // Calcular preço líquido baseado no VAT, se existir
                  if (price.vat !== undefined) {
                    mappedPrice.net_price = ((price.amount || 0) / (1 + (price.vat / 100))).toFixed(2);
                  } else {
                    mappedPrice.net_price = price.amount || 0; // Sem VAT, preço líquido = preço bruto
                  }
                } else if (price.type === 'srp') {
                  mappedPrice.srp_gross = price.amount || 0;
                  // Calcular preço sugerido líquido baseado no VAT, se existir
                  if (price.vat !== undefined) {
                    mappedPrice.srp_net = ((price.amount || 0) / (1 + (price.vat / 100))).toFixed(2);
                  } else {
                    mappedPrice.srp_net = price.amount || 0; // Sem VAT, preço líquido = preço bruto
                  }
                }
                
                return mappedPrice;
              }
              return null;
            }).filter(Boolean); // Remover entradas nulas (sem variant_id)
            
            if (preparedPrices.length === 0) {
              console.warn('Nenhum preço válido para inserção (sem variant_id ou tipo não reconhecido)');
            } else {
              // Dividir preços em lotes para inserção
              const priceBatches = chunkArray(preparedPrices, BATCH_SIZE);
              
              // Inserir preços em lotes
              for (const batch of priceBatches) {
                try {
                  console.log(`Inserindo ${batch.length} preços...`);
                  const startTime = new Date();
                  
                  const createdPrices = await Price.bulkCreate(batch, {
                    updateOnDuplicate: ['gross_price', 'net_price', 'srp_gross', 'srp_net', 'updated_at'],
                    transaction
                  });
                  
                  console.log(`  Lote de ${batch.length} preços processado em ${((new Date() - startTime) / 1000).toFixed(2)}s`);
                  countInsertedPrices += batch.length;
                } catch (error) {
                  console.error(`[PRICE_ERROR] Erro ao inserir lote de preços: ${error.message}`);
                  if (tracking) {
                    SyncHealthService.recordError(tracking, 'PRICE_ERROR', error.message);
                  }
                }
              }
            }
          }
          
          // 9. Processar imagens
          console.log(`Processando ${transformedData.images.length} imagens...`);
          if (transformedData.images.length > 0) {
            // Preparar imagens com product_id correto
            const preparedImages = transformedData.images.map(image => {
              const productId = productIdMap.get(image.product_code);
              if (productId) {
                // Return ONLY the fields that exist in the database model
                return {
                  product_id: productId,
                  url: image.url,
                  created_at: image.created_at || new Date(),
                  updated_at: image.updated_at || new Date()
                };
              }
              return null;
            }).filter(Boolean); // Remover entradas nulas (sem product_id)
            
            if (preparedImages.length === 0) {
              console.warn('Nenhuma imagem válida para inserção (sem product_id)');
            } else {
              console.log(`Inserindo ${preparedImages.length} imagens...`);
              
              // Inserir imagens em lotes
              for (let i = 0; i < preparedImages.length; i += BATCH_SIZE) {
                const batchStart = new Date();
                const batch = preparedImages.slice(i, i + BATCH_SIZE);
                
                try {
                  await Image.bulkCreate(batch, { transaction });
                  
                  const batchEnd = new Date();
                  if (tracking) {
                    SyncHealthService.recordBatchOperation(tracking, 'INSERT_IMAGES', batch.length, batchStart, batchEnd);
                  }
                  
                  console.log(`  Lote de ${batch.length} imagens processado em ${((batchEnd - batchStart) / 1000).toFixed(2)}s`);
                  countInsertedImages += batch.length;
                } catch (error) {
                  SyncHealthService.recordError(tracking, 'IMAGE_INSERT_ERROR', 
                    `Erro ao inserir lote de imagens: ${error.message}`,
                    { batchSize: batch.length }
                  );
                  console.error(`  Erro ao inserir lote de imagens:`, error.message);
                }
              }
            }
          }
          
          // Finalizar transação
          await transaction.commit();
          transactionSuccess = true;
          
          const endTime = new Date();
          const duracao = (endTime - startTime) / 1000;
          
          console.log(`Inserção concluída em ${duracao.toFixed(2)} segundos`);
          console.log(`Total inserido: ${countInsertedProducts} produtos, ${countUpdatedProducts} atualizados, ${countSkippedProducts} ignorados`);
          
          if (tracking) {
            await SyncHealthService.finishSyncTracking(tracking, 'succeeded', countInsertedProducts + countUpdatedProducts);
          }
          
          return true;
        } catch (error) {
          await transaction.rollback();
          transactionRetryCount++;
          
          if (transactionRetryCount <= maxRetries) {
            console.warn(`Transação falhou. Tentando novamente em ${transactionRetryCount}/${maxRetries}...`);
            await new Promise(resolve => setTimeout(resolve, 2 ** transactionRetryCount * 1000));
          } else {
            console.error(`Todas as ${maxRetries} tentativas de inserção falharam:`, error);
            
            if (tracking) {
              SyncHealthService.recordError(tracking, 'TRANSACTION_ERROR', 
                `Falha ao inserir dados no banco de dados após ${maxRetries} tentativas: ${error.message}`,
                { maxRetries }
              );
            }
            
            await SyncHealthService.finishSyncTracking(tracking, 'failed', 0);
            return false;
          }
        }
      }
    } catch (error) {
      console.error('Erro ao processar dados do XML:', error);
      
      if (tracking) {
        SyncHealthService.recordError(tracking, 'XML_PROCESSING_ERROR', 
          `Erro ao processar dados do XML: ${error.message}`,
          { maxRetries }
        );
      }
      
      await SyncHealthService.finishSyncTracking(tracking, 'failed', 0);
      return false;
    }
  } catch (error) {
    console.error('Erro ao importar dados:', error);
    
    if (tracking) {
      SyncHealthService.recordError(tracking, 'IMPORT_ERROR', 
        `Erro ao importar dados: ${error.message}`,
        { maxRetries }
      );
    }
    
    await SyncHealthService.finishSyncTracking(tracking, 'failed', 0);
    return false;
  }
}

// Função para purgar dados de produtos existentes
async function purgeExistingData() {
  try {
    console.log('\n=== PURGA DE DADOS ===');
    console.log('ATENÇÃO: Esta operação excluirá TODOS os dados de produtos e entidades relacionadas!');
    const confirmacao = await pergunta('Tem certeza que deseja continuar? (sim/não): ');
    
    if (confirmacao.toLowerCase() !== 'sim') {
      console.log('Operação cancelada.');
      return false;
    }
    
    console.log('Iniciando exclusão de dados...');
    const transaction = await sequelize.transaction();
    
    try {
      // Excluir na ordem correta para evitar problemas de chaves estrangeiras
      console.log('Excluindo imagens...');
      await Image.destroy({ where: {}, transaction });
      
      console.log('Excluindo preços...');
      await Price.destroy({ where: {}, transaction });
      
      console.log('Excluindo estoques...');
      await Stock.destroy({ where: {}, transaction });
      
      console.log('Excluindo variantes...');
      await Variant.destroy({ where: {}, transaction });
      
      console.log('Excluindo produtos...');
      await Product.destroy({ where: {}, transaction });
      
      // Manter unidades, produtores e categorias por segurança
      // mas oferecer opção para excluir
      const excluirCategorias = await pergunta('Deseja excluir também as categorias? (sim/não): ');
      if (excluirCategorias.toLowerCase() === 'sim') {
        console.log('Excluindo categorias...');
        await Category.destroy({ where: {}, transaction });
      }
      
      const excluirProdutores = await pergunta('Deseja excluir também os produtores? (sim/não): ');
      if (excluirProdutores.toLowerCase() === 'sim') {
        console.log('Excluindo produtores...');
        await Producer.destroy({ where: {}, transaction });
      }
      
      const excluirUnidades = await pergunta('Deseja excluir também as unidades? (sim/não): ');
      if (excluirUnidades.toLowerCase() === 'sim') {
        console.log('Excluindo unidades...');
        await Unit.destroy({ where: {}, transaction });
      }
      
      // Confirmar transação
      await transaction.commit();
      console.log('\nDados excluídos com sucesso!');
      return true;
      
    } catch (error) {
      // Reverter transação em caso de erro
      await transaction.rollback();
      console.error('Erro durante a exclusão de dados:', error);
      return false;
    }
  } catch (error) {
    console.error('Erro fatal durante a exclusão de dados:', error);
    return false;
  }
}

// Função para analisar uso do banco de dados
async function analisarBancoDados() {
  try {
    console.log('\n=== ANÁLISE DO BANCO DE DADOS ===');
    
    // Verificar contagem de registros em cada tabela
    console.log('Contagem de registros:');
    
    const tabelasPrincipais = [
      { model: Category, nome: 'Categorias' },
      { model: Producer, nome: 'Produtores' },
      { model: Unit, nome: 'Unidades' },
      { model: Product, nome: 'Produtos' },
      { model: Variant, nome: 'Variantes' },
      { model: Stock, nome: 'Estoques' },
      { model: Price, nome: 'Preços' },
      { model: Image, nome: 'Imagens' }
    ];
    
    for (const tabela of tabelasPrincipais) {
      const count = await tabela.model.count();
      console.log(`- ${tabela.nome}: ${count} registros`);
    }
    
    // Consultar tamanho das tabelas no PostgreSQL
    console.log('\nTamanho das tabelas:');
    
    try {
      const result = await sequelize.query(`
        SELECT
          table_name,
          pg_size_pretty(pg_total_relation_size(quote_ident(table_name))) AS total_size,
          pg_size_pretty(pg_relation_size(quote_ident(table_name))) AS table_size,
          pg_size_pretty(pg_total_relation_size(quote_ident(table_name)) - pg_relation_size(quote_ident(table_name))) AS index_size
        FROM
          information_schema.tables
        WHERE
          table_schema = 'public'
        ORDER BY
          pg_total_relation_size(quote_ident(table_name)) DESC
      `, { type: QueryTypes.SELECT });
      
      for (const row of result) {
        console.log(`- ${row.table_name}: Total ${row.total_size} (Tabela: ${row.table_size}, Índices: ${row.index_size})`);
      }
    } catch (error) {
      console.warn('Não foi possível obter informações de tamanho das tabelas:', error.message);
    }
    
    // Verificar índices importantes
    console.log('\nVerificando índices importantes:');
    
    try {
      const indices = await sequelize.query(`
        SELECT
          t.relname AS table_name,
          i.relname AS index_name,
          a.attname AS column_name
        FROM
          pg_class t,
          pg_class i,
          pg_index ix,
          pg_attribute a
        WHERE
          t.oid = ix.indrelid
          AND i.oid = ix.indexrelid
          AND a.attrelid = t.oid
          AND a.attnum = ANY(ix.indkey)
          AND t.relkind = 'r'
          AND t.relname IN ('products', 'variants', 'categories')
        ORDER BY
          t.relname,
          i.relname
      `, { type: QueryTypes.SELECT });
      
      // Agrupar por tabela
      const indicesPorTabela = {};
      for (const indice of indices) {
        if (!indicesPorTabela[indice.table_name]) {
          indicesPorTabela[indice.table_name] = [];
        }
        indicesPorTabela[indice.table_name].push(
          `${indice.index_name} (${indice.column_name})`
        );
      }
      
      // Exibir índices por tabela
      for (const tabela in indicesPorTabela) {
        console.log(`- ${tabela}:`);
        for (const indice of indicesPorTabela[tabela]) {
          console.log(`  - ${indice}`);
        }
      }
      
      // Sugerir índices importantes que podem estar faltando
      const indicesImportantes = [
        { tabela: 'products', coluna: 'code', encontrado: false },
        { tabela: 'products', coluna: 'ean', encontrado: false },
        { tabela: 'variants', coluna: 'code', encontrado: false },
        { tabela: 'variants', coluna: 'product_id', encontrado: false }
      ];
      
      for (const indice of indices) {
        for (const idx of indicesImportantes) {
          if (indice.table_name === idx.tabela && indice.column_name === idx.coluna) {
            idx.encontrado = true;
          }
        }
      }
      
      const indicesFaltantes = indicesImportantes.filter(idx => !idx.encontrado);
      
      if (indicesFaltantes.length > 0) {
        console.log('\nÍndices importantes que podem estar faltando:');
        for (const idx of indicesFaltantes) {
          console.log(`- ${idx.tabela}.${idx.coluna}`);
        }
        
        const criarIndices = await pergunta('Deseja criar os índices faltantes? (sim/não): ');
        if (criarIndices.toLowerCase() === 'sim') {
          const transaction = await sequelize.transaction();
          
          try {
            for (const idx of indicesFaltantes) {
              console.log(`Criando índice em ${idx.tabela}.${idx.coluna}...`);
              await sequelize.query(
                `CREATE INDEX IF NOT EXISTS idx_${idx.tabela}_${idx.coluna} ON ${idx.tabela} (${idx.coluna})`,
                { transaction }
              );
            }
            
            await transaction.commit();
            console.log('Índices criados com sucesso!');
          } catch (error) {
            await transaction.rollback();
            console.error('Erro ao criar índices:', error);
          }
        }
      } else {
        console.log('\nTodos os índices importantes estão presentes.');
      }
      
    } catch (error) {
      console.warn('Não foi possível verificar índices:', error.message);
    }
    
    console.log('\nAnálise concluída.');
    return true;
  } catch (error) {
    console.error('Erro durante análise do banco de dados:', error);
    return false;
  }
}

// Função para exibir histórico de sincronizações
async function exibirHistoricoSincronizacoes() {
  try {
    console.log('\n===== HISTÓRICO DE SINCRONIZAÇÕES =====');
    
    // Testar conexão
    const connectionOk = await testConnection();
    if (!connectionOk) {
      console.error('Não foi possível conectar ao banco de dados.');
      return;
    }
    
    // Obter histórico recente (últimas 10 sincronizações)
    const historico = await SyncHealthService.getRecentSyncs(10);
    
    if (historico.length === 0) {
      console.log('Nenhum registro de sincronização encontrado.');
      return;
    }
    
    console.log(`\nÚltimas ${historico.length} sincronizações:\n`);
    console.log('ID | Tipo | Origem | Status | Início | Duração | Registros | Erros');
    console.log('-'.repeat(90));
    
    for (const sync of historico) {
      const dataInicio = new Date(sync.start_time).toLocaleString();
      const duracao = sync.duration_seconds ? `${sync.duration_seconds.toFixed(2)}s` : 'N/A';
      const registros = sync.records_processed || 0;
      const erros = sync.error_count || 0;
      
      console.log(`${sync.id} | ${sync.sync_type} | ${sync.source_file.slice(0, 20)}... | ${sync.status} | ${dataInicio} | ${duracao} | ${registros} | ${erros}`);
    }
    
    // Perguntar se deseja ver detalhes de alguma sincronização específica
    const idDetalhes = await pergunta('\nDeseja ver detalhes de alguma sincronização? (ID ou 0 para sair): ');
    
    if (idDetalhes !== '0') {
      const id = parseInt(idDetalhes);
      if (!isNaN(id)) {
        const detalhes = historico.find(s => s.id === id);
        if (detalhes) {
          console.log('\n===== DETALHES DA SINCRONIZAÇÃO =====');
          console.log(`ID: ${detalhes.id}`);
          console.log(`Tipo: ${detalhes.sync_type}`);
          console.log(`Origem: ${detalhes.source_file}`);
          console.log(`Status: ${detalhes.status}`);
          console.log(`Início: ${new Date(detalhes.start_time).toLocaleString()}`);
          console.log(`Fim: ${detalhes.end_time ? new Date(detalhes.end_time).toLocaleString() : 'N/A'}`);
          console.log(`Duração: ${detalhes.duration_seconds ? `${detalhes.duration_seconds.toFixed(2)}s` : 'N/A'}`);
          console.log(`Registros processados: ${detalhes.records_processed || 0}`);
          console.log(`Total de erros: ${detalhes.error_count || 0}`);
          
          if (detalhes.details) {
            console.log('\nErros encontrados:');
            try {
              const detalhesObj = JSON.parse(detalhes.details);
              
              if (detalhesObj.errors && detalhesObj.errors.length > 0) {
                detalhesObj.errors.forEach((erro, i) => {
                  console.log(`\n- Erro ${i + 1}:`);
                  console.log(`  Tipo: ${erro.type}`);
                  console.log(`  Mensagem: ${erro.message}`);
                  console.log(`  Timestamp: ${new Date(erro.timestamp).toLocaleString()}`);
                });
              }
              
              if (detalhesObj.performance) {
                console.log('\nMetricas de Performance:');
                const perf = detalhesObj.performance;
                
                if (perf.xmlParseDuration) {
                  console.log(`Análise XML: ${perf.xmlParseDuration.toFixed(2)}s`);
                }
                
                if (perf.transformDuration) {
                  console.log(`Transformação: ${perf.transformDuration.toFixed(2)}s`);
                }
                
                if (perf.dbOperationsDuration) {
                  console.log(`Operações BD: ${perf.dbOperationsDuration.toFixed(2)}s`);
                }
                
                if (perf.batchStatistics) {
                  console.log('\nEstatísticas por operação:');
                  
                  for (const operation in perf.batchStatistics) {
                    const stats = perf.batchStatistics[operation];
                    console.log(`- ${operation}:`);
                    console.log(`  Total de lotes: ${stats.totalBatches}`);
                    console.log(`  Total de itens: ${stats.totalItems}`);
                    console.log(`  Duração total: ${stats.totalDuration.toFixed(2)}s`);
                    console.log(`  Média por lote: ${stats.avgDuration.toFixed(2)}s`);
                    console.log(`  Itens/segundo: ${stats.itemsPerSecond.toFixed(2)}`);
                  }
                }
              }
              
            } catch (e) {
              console.log(detalhes.details);
            }
          }
        } else {
          console.log(`Sincronização com ID ${id} não encontrada.`);
        }
      } else {
        console.log('ID inválido.');
      }
    }
  } catch (error) {
    console.error('Erro ao exibir histórico de sincronizações:', error);
  }
}

// Função para executar sincronização incremental
async function executarSincronizacaoIncremental() {
  try {
    console.log('\n===== SINCRONIZAÇÃO INCREMENTAL =====');
    console.log('Este modo irá atualizar apenas produtos novos ou modificados.');
    
    console.log('\n1. Definir caminho do arquivo XML');
    console.log('2. Usar caminho predefinido (C:\\Users\\Pixie\\OneDrive\\Desktop\\aligekow\\produkty_xml_3_26-04-2025_12_51_02_en.xml)');
    const opcao = await pergunta('Escolha uma opção: ');
    
    let xmlPath = '';
    if (opcao === '1') {
      xmlPath = await pergunta('Informe o caminho completo do arquivo XML: ');
    } else if (opcao === '2') {
      xmlPath = 'C:\\Users\\Pixie\\OneDrive\\Desktop\\aligekow\\produkty_xml_3_26-04-2025_12_51_02_en.xml';
      console.log(`Usando caminho predefinido: ${xmlPath}`);
    } else {
      console.log('Opção inválida!');
      return;
    }
    
    console.log('\nIniciando sincronização incremental...');
    
    // Último parâmetro true indica sincronização incremental
    const resultado = await importData(xmlPath, null, true);
    
    if (resultado) {
      console.log('Sincronização incremental concluída com sucesso!');
    } else {
      console.log('Sincronização incremental falhou. Verifique os logs para mais detalhes.');
    }
  } catch (error) {
    console.error('Erro durante sincronização incremental:', error);
  }
}

// Função para exibir o menu interativo
async function exibirMenu() {
  try {
    while (true) {
      console.log('\n===== MENU DE IMPORTAÇÃO XML (OTIMIZADO) =====');
      console.log('1. Importar todos os produtos de um arquivo XML');
      console.log('2. Importar um número limitado de produtos');
      console.log('3. Purgar dados existentes');
      console.log('4. Analisar uso do banco de dados');
      console.log('5. Visualizar histórico de sincronizações');
      console.log('6. Sincronização incremental');
      console.log('0. Sair');
      
      const opcao = await pergunta('\nEscolha uma opção: ');
      
      switch (opcao) {
        case '1':
          const xmlPath = await pergunta('Informe o caminho completo do arquivo XML: ');
          await importData(xmlPath);
          break;
          
        case '2':
          console.log('\n--- Importação limitada ---');
          console.log('1. Definir caminho do arquivo XML');
          console.log('2. Usar caminho predefinido (C:\\Users\\Pixie\\OneDrive\\Desktop\\aligekow\\produkty_xml_3_26-04-2025_12_51_02_en.xml)');
          const subOpcao = await pergunta('Escolha uma opção: ');
          
          let caminhoXML = '';
          if (subOpcao === '1') {
            caminhoXML = await pergunta('Informe o caminho completo do arquivo XML: ');
          } else if (subOpcao === '2') {
            caminhoXML = 'C:\\Users\\Pixie\\OneDrive\\Desktop\\aligekow\\produkty_xml_3_26-04-2025_12_51_02_en.xml';
            console.log(`Usando caminho predefinido: ${caminhoXML}`);
          } else {
            console.log('Opção inválida!');
            break;
          }
          
          const limite = await pergunta('Informe o número máximo de produtos a importar: ');
          const limiteNum = parseInt(limite);
          
          if (isNaN(limiteNum) || limiteNum <= 0) {
            console.log('Número inválido! Use um valor positivo.');
            break;
          }
          
          await importData(caminhoXML, limiteNum);
          break;
          
        case '3':
          const confirmacao = await pergunta('ATENÇÃO: Esta operação apagará TODOS os dados existentes! Confirma? (sim/não): ');
          if (confirmacao.toLowerCase() === 'sim') {
            await purgeExistingData();
          } else {
            console.log('Operação cancelada.');
          }
          break;
          
        case '4':
          await analisarBancoDados();
          break;
          
        case '5':
          await exibirHistoricoSincronizacoes();
          break;
          
        case '6':
          await executarSincronizacaoIncremental();
          break;
          
        case '0':
          console.log('Saindo do programa...');
          // Fechar conexão antes de sair
          await sequelize.close();
          rl.close();
          return;
          
        default:
          console.log('Opção inválida!');
      }
      
      await pergunta('\nPressione Enter para continuar...');
    }
  } catch (error) {
    console.error('Erro durante execução do menu:', error);
  }
}

// Processamento de argumentos da linha de comando
async function processarArgumentos(args) {
  // Processar aqui argumentos se o script for chamado com parâmetros
  // Por exemplo, para automação via cron/scheduler
  console.log('Argumentos recebidos:', args);
  
  // Exemplo de opções de linha de comando
  // --file=caminho/do/arquivo.xml: Importar arquivo XML específico
  // --limit=100: Limitar a 100 produtos
  // --incremental: Modo incremental
  // --purge: Purgar dados antes de importar
  
  let xmlPath = null;
  let limit = null;
  let incremental = false;
  let purge = false;
  
  for (const arg of args) {
    if (arg.startsWith('--file=')) {
      xmlPath = arg.substring(7);
    } else if (arg.startsWith('--limit=')) {
      limit = parseInt(arg.substring(8));
    } else if (arg === '--incremental') {
      incremental = true;
    } else if (arg === '--purge') {
      purge = true;
    }
  }
  
  if (purge) {
    console.log('Executando purga de dados...');
    await purgeExistingData();
  }
  
  if (xmlPath) {
    console.log(`Importando arquivo XML: ${xmlPath}`);
    console.log(`Modo: ${incremental ? 'incremental' : 'completo'}`);
    if (limit) {
      console.log(`Limite de produtos: ${limit}`);
    }
    
    await importData(xmlPath, limit, incremental);
  } else {
    console.log('Nenhum arquivo XML especificado. Executando menu interativo...');
    await exibirMenu();
  }
}

// Ponto de entrada principal
async function inicializar() {
  try {
    console.log('================================');
    console.log('IMPORTADOR XML OTIMIZADO');
    console.log('Versão: 1.1.0');
    console.log('================================');
    
    // Verificar e atualizar estrutura da tabela sync_health
    await verificarEAtualizarSyncHealth();
    
    // Verificar se o script foi chamado com argumentos
    const args = process.argv.slice(2);
    if (args.length > 0) {
      await processarArgumentos(args);
    } else {
      // Exibir menu interativo
      await exibirMenu();
    }
    
  } catch (error) {
    console.error('Erro durante inicialização:', error);
    process.exit(1);
  } finally {
    // Fechar conexão e readline, caso ainda não tenha sido fechado
    try {
      await sequelize.close();
    } catch (e) {
      // Ignorar erro se já estiver fechado
    }
    
    if (rl.close) {
      rl.close();
    }
  }
}

// Iniciar a aplicação
inicializar().catch(error => {
  console.error('Erro fatal na execução:', error);
  process.exit(1);
}); 