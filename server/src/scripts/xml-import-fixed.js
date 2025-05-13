/**
 * XML Import Script (Versão Corrigida)
 * 
 * Versão: 1.0.0
 * 
 * Correções implementadas:
 * 1. Resolução do problema de chave estrangeira para categorias
 * 2. Validação melhorada de dados (EAN, URLs)
 * 3. Implementação de retentativas com backoff exponencial
 * 4. Tratamento de erros mais robusto para não abortar todo o processo
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';
import { Sequelize, DataTypes, Model, QueryTypes, Op } from 'sequelize';
import xml2js from 'xml2js';
import readline from 'readline';
import util from 'util';

// ES Module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Carregar variáveis de ambiente
const envPath = path.resolve(__dirname, '../../../.env');
console.log(`Carregando variáveis de ambiente de: ${envPath}`);
dotenv.config({ path: envPath });

// Interface readline para input do usuário
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Função para perguntar ao usuário
function pergunta(texto) {
  return new Promise((resolve) => {
    rl.question(texto, (resposta) => {
      resolve(resposta);
    });
  });
}

// Configurar conexão com banco de dados
const neonUrl = process.env.NEON_DB_URL || process.env.DATABASE_URL || process.env.POSTGRES_URL;
let sequelize;

if (neonUrl) {
  console.log('Usando URL de conexão do banco de dados...');
  sequelize = new Sequelize(neonUrl, {
    dialect: 'postgres',
    logging: false,
    ssl: true,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    // Configurações de pool para melhor desempenho
    pool: {
      max: 10,
      min: 0,
      idle: 20000,
      acquire: 120000 // Timeout maior para operações em lote
    }
  });
} else {
  console.error('URL de conexão não encontrada nas variáveis de ambiente!');
  process.exit(1);
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
      recordsProcessed: 0
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
  
  // Finalizar rastreamento e salvar no banco
  finishSyncTracking: async function(tracking, status, recordsProcessed = 0) {
    if (!tracking) return null;
    
    const endTime = new Date();
    const durationSeconds = (endTime - tracking.startTime) / 1000;
    
    tracking.endTime = endTime;
    tracking.status = status;
    tracking.durationSeconds = durationSeconds;
    tracking.recordsProcessed = recordsProcessed;
    
    try {
      // Salvar informações no banco de dados
      const syncHealth = await SyncHealth.create({
        sync_type: tracking.syncType,
        source_file: tracking.source,
        status: status,
        start_time: tracking.startTime,
        end_time: endTime,
        duration_seconds: durationSeconds,
        records_processed: recordsProcessed,
        error_count: tracking.errors.length,
        details: tracking.errors.length > 0 ? JSON.stringify(tracking.errors) : null,
        memory_usage_mb: tracking.memoryUsageMb
      });
      
      console.log(`Sincronização ${tracking.syncType} de ${tracking.source} finalizada: ${status} em ${durationSeconds.toFixed(2)}s`);
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

// Adicionar uma função para verificar e atualizar a estrutura da tabela sync_health
// Adicionar após a função verificarEstruturaTabelas

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
async function parseXML(xmlFilePath, limit = null, maxRetries = 3) {
  let retryCount = 0;
  let lastError = null;
  
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
      let clearXmlString = null;
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
function transformProducts(xmlData) {
  if (!xmlData || !xmlData.products) {
    console.error('Dados XML inválidos ou vazios');
    return null;
  }
  
  const { products, estrutura } = xmlData;
  console.log(`Transformando ${products.length} produtos para o formato do banco de dados...`);
  const startTime = new Date();
  
  // Mapas para evitar duplicações
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
  for (const product of products) {
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
        producer_id: producerName, // Será substituído pelo ID real após inserção dos produtores
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
      
      // Processar imagens
      if (product.images && product.images.image) {
        // Converter para array se for um único item
        const images = Array.isArray(product.images.image) 
          ? product.images.image 
          : [product.images.image];
        
        for (const [index, image] of images.entries()) {
          // Validar URL da imagem
          const urlValidada = validarURL(image.url || '');
          if (!urlValidada.valido) continue;
          
          // Determinar se é a imagem principal
          let isMain = false;
          
          if (image.is_main !== undefined) {
            isMain = image.is_main === 'true' || image.is_main === true;
          } else {
            // Considerar a primeira imagem como principal se não especificado
            isMain = index === 0;
          }
          
          // Determinar a ordem
          const order = image.order ? parseInt(image.order, 10) : index;
          
          transformedImages.push({
            product_code: productCode,
            url: urlValidada.valor,
            is_main: isMain,
            order,
            created_at: new Date(),
            updated_at: new Date()
          });
          
          countImages++;
        }
      }
    } catch (error) {
      countErrors++;
      const errorMsg = `Erro ao transformar o produto ${product.code || 'sem código'}: ${error.message}`;
      errors.push(errorMsg);
      console.error(errorMsg);
      
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

// Função principal para importar dados com retentativas
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
      const xmlData = await parseXML(xmlFilePath, limit, maxRetries);
      
      if (!xmlData || !xmlData.products || xmlData.products.length === 0) {
        console.error('Nenhum produto encontrado no XML ou falha na análise.');
        await SyncHealthService.finishSyncTracking(tracking, 'failed', 0);
        return false;
      }
      
      console.log(`Processando ${xmlData.products.length} produtos...`);
      
      // Transformar os dados do XML para o formato do banco
      const transformedData = transformProducts(xmlData);
      
      if (!transformedData) {
        console.error('Falha ao transformar dados do XML.');
        await SyncHealthService.finishSyncTracking(tracking, 'failed', 0);
        return false;
      }
      
      // Se for sincronização incremental, vamos obter os itens já existentes
      // para determinar o que deve ser inserido ou atualizado
      let existingProducts = [];
      let existingProductCodes = new Set();
      
      if (incremental) {
        console.log('Modo de sincronização incremental. Verificando produtos existentes...');
        existingProducts = await Product.findAll({
          attributes: ['id', 'code', 'updated_at'],
          transaction: null // Sem transação para consultas de leitura
        });
        
        existingProductCodes = new Set(existingProducts.map(p => p.code));
        console.log(`Encontrados ${existingProducts.length} produtos existentes no banco de dados.`);
      }
      
      // Iniciar transação
      // Vamos implementar um mecanismo de retentativa para a transação também
      let transactionSuccess = false;
      let transactionRetryCount = 0;
      
      while (!transactionSuccess && transactionRetryCount <= maxRetries) {
        const transaction = await sequelize.transaction();
        
        try {
          console.log('Iniciando inserção no banco de dados...');
          const startTime = new Date();
          
          // Batch size para operações em lote (aumentado para melhor desempenho)
          const BATCH_SIZE = 500;
          
          // Contadores para estatísticas de sincronização incremental
          let totalInserted = 0;
          let totalUpdated = 0;
          let totalSkipped = 0;
          
          // CORREÇÃO PRINCIPAL: Categorias devem ser inseridas PRIMEIRO e com IDs explícitos
          // 1. Inserir categorias
          console.log(`Inserindo ${transformedData.categories.length} categorias...`);
          if (transformedData.categories.length > 0) {
            // Ordenar categorias para garantir que pais sejam inseridos antes dos filhos
            const categoriasOrdenadas = transformedData.categories.sort((a, b) => {
              // Se a é pai de b, a deve vir primeiro
              if (b.parent_id === a.id) return -1;
              // Se b é pai de a, b deve vir primeiro
              if (a.parent_id === b.id) return 1;
              // Se nenhum é pai do outro, manter ordem original
              return 0;
            });
            
            // Processar em lotes para melhor desempenho
            for (let i = 0; i < categoriasOrdenadas.length; i += BATCH_SIZE) {
              const batch = categoriasOrdenadas.slice(i, i + BATCH_SIZE);
              try {
                // Usar bulkCreate com updateOnDuplicate para inserir ou atualizar
                await Category.bulkCreate(batch, { 
                  updateOnDuplicate: ['name', 'path', 'parent_id', 'updated_at'],
                  transaction 
                });
                console.log(`  Lote de categorias ${i+1}-${Math.min(i+BATCH_SIZE, categoriasOrdenadas.length)} processado`);
              } catch (error) {
                SyncHealthService.recordError(tracking, 'CATEGORY_INSERT', 
                  `Erro ao inserir lote de categorias (${i+1}-${i+Math.min(BATCH_SIZE, categoriasOrdenadas.length)}): ${error.message}`,
                  { batch: batch.length }
                );
                console.error(`  Erro ao inserir lote de categorias (${i+1}-${i+Math.min(BATCH_SIZE, categoriasOrdenadas.length)}):`, error.message);
                // Continuar com próximo lote, não abortar toda a importação
              }
            }
          }
          
          // 2. Inserir produtores e obter IDs
          console.log(`Inserindo ${transformedData.producers.length} produtores...`);
          const producerMap = new Map();
          
          if (transformedData.producers.length > 0) {
            // Primeiro, verificar produtores existentes
            const existingProducers = await Producer.findAll({
              attributes: ['id', 'name'],
              transaction
            });
            
            // Mapear produtores existentes para evitar duplicação
            for (const producer of existingProducers) {
              producerMap.set(producer.name, producer.id);
            }
            
            // Filtrar apenas produtores que não existem ainda
            const novosProducers = transformedData.producers.filter(
              p => !producerMap.has(p.name)
            );
            
            console.log(`  ${existingProducers.length} produtores já existem no banco`);
            console.log(`  ${novosProducers.length} novos produtores serão inseridos`);
            
            // Inserir novos produtores em lotes
            if (novosProducers.length > 0) {
              for (let i = 0; i < novosProducers.length; i += BATCH_SIZE) {
                const batch = novosProducers.slice(i, i + BATCH_SIZE);
                try {
                  const createdProducers = await Producer.bulkCreate(batch, { 
                    transaction,
                    returning: true // Obter IDs gerados
                  });
                  
                  // Mapear nome do produtor para ID
                  for (const producer of createdProducers) {
                    producerMap.set(producer.name, producer.id);
                  }
                  
                  console.log(`  Lote de produtores ${i+1}-${Math.min(i+BATCH_SIZE, novosProducers.length)} processado`);
                } catch (error) {
                  SyncHealthService.recordError(tracking, 'PRODUCER_INSERT', 
                    `Erro ao inserir lote de produtores (${i+1}-${i+Math.min(BATCH_SIZE, novosProducers.length)}): ${error.message}`,
                    { batch: batch.length }
                  );
                  console.error(`  Erro ao inserir lote de produtores (${i+1}-${i+Math.min(BATCH_SIZE, novosProducers.length)}):`, error.message);
                  // Continuar com próximo lote
                }
              }
            }
            
            // Atualizar IDs de produtores nos produtos
            for (const product of transformedData.products) {
              if (typeof product.producer_id === 'string' && producerMap.has(product.producer_id)) {
                product.producer_id = producerMap.get(product.producer_id);
              } else if (typeof product.producer_id === 'string') {
                // Se não encontrou o produtor no mapa, definir como null
                product.producer_id = null;
              }
            }
          }
          
          // 3. Inserir unidades
          console.log(`Inserindo ${transformedData.units.length} unidades...`);
          if (transformedData.units.length > 0) {
            for (let i = 0; i < transformedData.units.length; i += BATCH_SIZE) {
              const batch = transformedData.units.slice(i, i + BATCH_SIZE);
              try {
                await Unit.bulkCreate(batch, { 
                  updateOnDuplicate: ['name', 'moq', 'updated_at'],
                  transaction 
                });
                console.log(`  Lote de unidades ${i+1}-${Math.min(i+BATCH_SIZE, transformedData.units.length)} processado`);
              } catch (error) {
                SyncHealthService.recordError(tracking, 'UNIT_INSERT', 
                  `Erro ao inserir lote de unidades (${i+1}-${i+Math.min(BATCH_SIZE, transformedData.units.length)}): ${error.message}`,
                  { batch: batch.length }
                );
                console.error(`  Erro ao inserir lote de unidades (${i+1}-${i+Math.min(BATCH_SIZE, transformedData.units.length)}):`, error.message);
                // Continuar com próximo lote
              }
            }
          }
          
          // 4. Inserir ou atualizar produtos
          console.log(`Processando ${transformedData.products.length} produtos...`);
          const productCodeToId = new Map();
          
          if (transformedData.products.length > 0) {
            // Primeiro, verificar produtos existentes pelo código
            const existingProducts = await Product.findAll({
              attributes: ['id', 'code'],
              transaction
            });
            
            // Mapear produtos existentes
            for (const product of existingProducts) {
              productCodeToId.set(product.code, product.id);
            }
            
            // Processar produtos em lotes
            for (let i = 0; i < transformedData.products.length; i += BATCH_SIZE) {
              const batch = transformedData.products.slice(i, i + BATCH_SIZE);
              
              // Se for sincronização incremental, separamos produtos novos e existentes
              if (incremental) {
                const newProducts = [];
                const updatedProducts = [];
                
                for (const product of batch) {
                  if (existingProductCodes.has(product.code)) {
                    updatedProducts.push(product);
                    totalUpdated++;
                  } else {
                    newProducts.push(product);
                    totalInserted++;
                  }
                }
                
                // Inserir produtos novos
                if (newProducts.length > 0) {
                  try {
                    const createdProducts = await Product.bulkCreate(newProducts, { 
                      transaction,
                      returning: true
                    });
                    
                    // Mapear código do produto para ID
                    for (const product of createdProducts) {
                      productCodeToId.set(product.code, product.id);
                    }
                    
                    console.log(`  Lote de ${newProducts.length} NOVOS produtos processado`);
                  } catch (error) {
                    SyncHealthService.recordError(tracking, 'PRODUCT_INSERT', 
                      `Erro ao inserir lote de NOVOS produtos: ${error.message}`,
                      { batch: newProducts.length }
                    );
                    console.error(`  Erro ao inserir lote de NOVOS produtos:`, error.message);
                    // Continuar com próximos produtos
                  }
                }
                
                // Atualizar produtos existentes
                if (updatedProducts.length > 0) {
                  try {
                    // Para atualização, precisamos incluir IDs dos produtos
                    for (const product of updatedProducts) {
                      if (productCodeToId.has(product.code)) {
                        product.id = productCodeToId.get(product.code);
                      }
                    }
                    
                    // Filtrar produtos com ID válido
                    const validUpdates = updatedProducts.filter(p => p.id);
                    
                    if (validUpdates.length > 0) {
                      await Promise.all(validUpdates.map(product => 
                        Product.update(product, {
                          where: { id: product.id },
                          transaction
                        })
                      ));
                      
                      console.log(`  Lote de ${validUpdates.length} produtos ATUALIZADOS processado`);
                    }
                  } catch (error) {
                    SyncHealthService.recordError(tracking, 'PRODUCT_UPDATE', 
                      `Erro ao atualizar lote de produtos existentes: ${error.message}`,
                      { batch: updatedProducts.length }
                    );
                    console.error(`  Erro ao atualizar lote de produtos existentes:`, error.message);
                    // Continuar com próximos produtos
                  }
                }
                
              } else {
                // No modo não-incremental, usamos upsert para tudo
                try {
                  const createdProducts = await Product.bulkCreate(batch, { 
                    updateOnDuplicate: [
                      'name', 'description_long', 'description_short', 
                      'ean', 'producer_code', 'category_id', 'producer_id', 
                      'unit_id', 'vat', 'url', 'updated_at'
                    ],
                    transaction,
                    returning: true
                  });
                  
                  // Mapear código do produto para ID
                  for (const product of createdProducts) {
                    productCodeToId.set(product.code, product.id);
                  }
                  
                  console.log(`  Lote de produtos ${i+1}-${Math.min(i+BATCH_SIZE, transformedData.products.length)} processado`);
                } catch (error) {
                  SyncHealthService.recordError(tracking, 'PRODUCT_UPSERT', 
                    `Erro ao inserir lote de produtos (${i+1}-${i+Math.min(BATCH_SIZE, transformedData.products.length)}): ${error.message}`,
                    { batch: batch.length }
                  );
                  console.error(`  Erro ao inserir lote de produtos (${i+1}-${i+Math.min(BATCH_SIZE, transformedData.products.length)}):`, error.message);
                  // Continuar com próximo lote
                }
              }
            }
          }
          
          // 5. Inserir variantes
          console.log(`Inserindo ${transformedData.variants.length} variantes...`);
          const variantCodeToId = new Map();
          
          if (transformedData.variants.length > 0) {
            // Verificar variantes existentes
            const existingVariants = await Variant.findAll({
              attributes: ['id', 'code'],
              transaction
            });
            
            // Mapear variantes existentes
            for (const variant of existingVariants) {
              variantCodeToId.set(variant.code, variant.id);
            }
            
            // Processar variantes em lotes
            for (let i = 0; i < transformedData.variants.length; i += BATCH_SIZE) {
              const batch = transformedData.variants.slice(i, i + BATCH_SIZE);
              
              // Atualizar product_id baseado no mapeamento product_code -> id
              for (const variant of batch) {
                if (variant.product_code && productCodeToId.has(variant.product_code)) {
                  variant.product_id = productCodeToId.get(variant.product_code);
                  delete variant.product_code; // Remover campo temporário
                } else if (variant.product_code) {
                  // Se não encontrou o produto, pular esta variante
                  console.warn(`  Produto com código ${variant.product_code} não encontrado para variante ${variant.code}`);
                  continue;
                }
              }
              
              // Filtrar apenas variantes com product_id válido
              const validBatch = batch.filter(v => v.product_id);
              
              if (validBatch.length === 0) {
                console.warn(`  Nenhuma variante válida no lote ${i+1}-${Math.min(i+BATCH_SIZE, transformedData.variants.length)}`);
                continue;
              }
              
              try {
                const createdVariants = await Variant.bulkCreate(validBatch, { 
                  updateOnDuplicate: ['product_id', 'weight', 'gross_weight', 'updated_at'],
                  transaction,
                  returning: true
                });
                
                // Mapear código da variante para ID
                for (const variant of createdVariants) {
                  variantCodeToId.set(variant.code, variant.id);
                }
                
                console.log(`  Lote de variantes ${i+1}-${Math.min(i+BATCH_SIZE, transformedData.variants.length)} processado`);
              } catch (error) {
                console.error(`  Erro ao inserir lote de variantes (${i+1}-${i+Math.min(BATCH_SIZE, transformedData.variants.length)}):`, error.message);
                // Continuar com próximo lote
              }
            }
          }
          
          // 6. Inserir estoques
          console.log(`Inserindo ${transformedData.stocks.length} estoques...`);
          
          if (transformedData.stocks.length > 0) {
            // Excluir estoques existentes para evitar duplicação
            await Stock.destroy({
              where: {},
              transaction
            });
            
            // Processar estoques em lotes
            for (let i = 0; i < transformedData.stocks.length; i += BATCH_SIZE) {
              const batch = transformedData.stocks.slice(i, i + BATCH_SIZE);
              
              // Atualizar variant_id baseado no mapeamento variant_code -> id
              for (const stock of batch) {
                if (stock.variant_code && variantCodeToId.has(stock.variant_code)) {
                  stock.variant_id = variantCodeToId.get(stock.variant_code);
                  delete stock.variant_code; // Remover campo temporário
                } else if (stock.variant_code) {
                  // Se não encontrou a variante, pular este estoque
                  console.warn(`  Variante com código ${stock.variant_code} não encontrada para estoque`);
                  continue;
                }
              }
              
              // Filtrar apenas estoques com variant_id válido
              const validBatch = batch.filter(s => s.variant_id);
              
              if (validBatch.length === 0) {
                console.warn(`  Nenhum estoque válido no lote ${i+1}-${Math.min(i+BATCH_SIZE, transformedData.stocks.length)}`);
                continue;
              }
              
              try {
                await Stock.bulkCreate(validBatch, { transaction });
                console.log(`  Lote de estoques ${i+1}-${Math.min(i+BATCH_SIZE, transformedData.stocks.length)} processado`);
              } catch (error) {
                console.error(`  Erro ao inserir lote de estoques (${i+1}-${i+Math.min(BATCH_SIZE, transformedData.stocks.length)}):`, error.message);
                // Continuar com próximo lote
              }
            }
          }
          
          // 7. Inserir preços
          console.log(`Inserindo ${transformedData.prices.length} preços...`);
          
          if (transformedData.prices.length > 0) {
            // Excluir preços existentes para evitar duplicação
            await Price.destroy({
              where: {},
              transaction
            });
            
            // Processar preços em lotes
            for (let i = 0; i < transformedData.prices.length; i += BATCH_SIZE) {
              const batch = transformedData.prices.slice(i, i + BATCH_SIZE);
              
              // Atualizar variant_id baseado no mapeamento variant_code -> id
              for (const price of batch) {
                if (price.variant_code && variantCodeToId.has(price.variant_code)) {
                  price.variant_id = variantCodeToId.get(price.variant_code);
                  delete price.variant_code; // Remover campo temporário
                  
                  // Transformar valores para colunas do modelo Price
                  if (price.type === 'retail') {
                    if (price.amount) {
                      // Para preços de varejo
                      price.srp_gross = price.amount;
                      // Calcular preço líquido se tiver o VAT (IVA)
                      if (price.vat) {
                        price.srp_net = price.amount / (1 + (price.vat / 100));
                      }
                    }
                  } else if (price.type === 'wholesale') {
                    if (price.amount) {
                      // Para preços de atacado
                      price.gross_price = price.amount;
                      // Calcular preço líquido se tiver o VAT (IVA)
                      if (price.vat) {
                        price.net_price = price.amount / (1 + (price.vat / 100));
                      }
                    }
                  }
                  
                  // Remover campos temporários
                  delete price.amount;
                  delete price.currency;
                  delete price.type;
                  delete price.vat;
                  
                } else if (price.variant_code) {
                  // Se não encontrou a variante, pular este preço
                  console.warn(`  Variante com código ${price.variant_code} não encontrada para preço`);
                  continue;
                }
              }
              
              // Filtrar apenas preços com variant_id válido
              const validBatch = batch.filter(p => p.variant_id);
              
              if (validBatch.length === 0) {
                console.warn(`  Nenhum preço válido no lote ${i+1}-${Math.min(i+BATCH_SIZE, transformedData.prices.length)}`);
                continue;
              }
              
              try {
                await Price.bulkCreate(validBatch, { transaction });
                console.log(`  Lote de preços ${i+1}-${Math.min(i+BATCH_SIZE, transformedData.prices.length)} processado`);
              } catch (error) {
                console.error(`  Erro ao inserir lote de preços (${i+1}-${i+Math.min(BATCH_SIZE, transformedData.prices.length)}):`, error.message);
                // Continuar com próximo lote
              }
            }
          }
          
          // 8. Inserir imagens
          console.log(`Inserindo ${transformedData.images.length} imagens...`);
          
          if (transformedData.images.length > 0) {
            // Excluir imagens existentes para evitar duplicação
            await Image.destroy({
              where: {},
              transaction
            });
            
            // Processar imagens em lotes
            for (let i = 0; i < transformedData.images.length; i += BATCH_SIZE) {
              const batch = transformedData.images.slice(i, i + BATCH_SIZE);
              
              // Atualizar product_id baseado no mapeamento product_code -> id
              for (const image of batch) {
                if (image.product_code && productCodeToId.has(image.product_code)) {
                  image.product_id = productCodeToId.get(image.product_code);
                  delete image.product_code; // Remover campo temporário
                } else if (image.product_code) {
                  // Se não encontrou o produto, pular esta imagem
                  console.warn(`  Produto com código ${image.product_code} não encontrado para imagem`);
                  continue;
                }
              }
              
              // Filtrar apenas imagens com product_id válido
              const validBatch = batch.filter(i => i.product_id);
              
              if (validBatch.length === 0) {
                console.warn(`  Nenhuma imagem válida no lote ${i+1}-${Math.min(i+BATCH_SIZE, transformedData.images.length)}`);
                continue;
              }
              
              try {
                await Image.bulkCreate(validBatch, { transaction });
                console.log(`  Lote de imagens ${i+1}-${Math.min(i+BATCH_SIZE, transformedData.images.length)} processado`);
              } catch (error) {
                console.error(`  Erro ao inserir lote de imagens (${i+1}-${i+Math.min(BATCH_SIZE, transformedData.images.length)}):`, error.message);
                // Continuar com próximo lote
              }
            }
          }
          
          // Confirmar transação
          await transaction.commit();
          transactionSuccess = true;
          
          const endTime = new Date();
          const duracaoSegundos = (endTime - startTime) / 1000;
          
          // Finalizar monitoramento de saúde
          const totalRecords = transformedData.stats.products + 
                             transformedData.stats.variants +
                             transformedData.stats.stocks +
                             transformedData.stats.prices +
                             transformedData.stats.images;
          
          await SyncHealthService.finishSyncTracking(tracking, 'success', totalRecords);
          
          // Resumo da sincronização
          console.log('\n=== RESUMO DA IMPORTAÇÃO ===');
          console.log(`Dados importados com sucesso em ${duracaoSegundos.toFixed(2)} segundos.`);
          console.log(`Total de registros importados:`);
          console.log(`- ${transformedData.categories.length} categorias`);
          console.log(`- ${transformedData.producers.length} produtores`);
          console.log(`- ${transformedData.units.length} unidades`);
          console.log(`- ${transformedData.products.length} produtos`);
          console.log(`- ${transformedData.variants.length} variantes`);
          console.log(`- ${transformedData.stocks.length} estoques`);
          console.log(`- ${transformedData.prices.length} preços`);
          console.log(`- ${transformedData.images.length} imagens`);
          
          if (incremental) {
            console.log('\n=== DETALHES DA SINCRONIZAÇÃO INCREMENTAL ===');
            console.log(`- ${totalInserted} produtos novos inseridos`);
            console.log(`- ${totalUpdated} produtos existentes atualizados`);
            console.log(`- ${totalSkipped} produtos ignorados (sem alterações)`);
          }
          
          if (transformedData.stats.errors > 0) {
            console.warn(`Ocorreram ${transformedData.stats.errors} erros durante o processamento. Verifique o log para detalhes.`);
          }
          
          console.timeEnd('Tempo total de importação');
          return true;
        } catch (error) {
          // Reverter transação em caso de erro
          await transaction.rollback();
          transactionRetryCount++;
          
          SyncHealthService.recordError(tracking, 'TRANSACTION_ERROR', 
            `Erro durante importação (tentativa ${transactionRetryCount}/${maxRetries}): ${error.message}`
          );
          
          if (transactionRetryCount <= maxRetries) {
            console.error(`Erro durante importação (tentativa ${transactionRetryCount}/${maxRetries}):`, error.message);
            console.log(`Tentando novamente em ${Math.pow(2, transactionRetryCount)} segundos...`);
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, transactionRetryCount) * 1000));
          } else {
            console.error('Todas as tentativas de importação falharam:', error);
            await SyncHealthService.finishSyncTracking(tracking, 'failed', 0);
            console.timeEnd('Tempo total de importação');
            return false;
          }
        }
      }
      
      return transactionSuccess;
    } catch (error) {
      SyncHealthService.recordError(tracking, 'XML_PROCESSING_ERROR', 
        `Erro durante processamento do XML: ${error.message}`
      );
      console.error('Erro durante processamento do XML:', error);
      await SyncHealthService.finishSyncTracking(tracking, 'failed', 0);
      console.timeEnd('Tempo total de importação');
      return false;
    }
  } catch (error) {
    console.error('Erro fatal durante importação:', error);
    console.timeEnd('Tempo total de importação');
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
    
    // Também pode-se adicionar outras análises, como:
    // - Integridade referencial
    // - Performance de consultas específicas
    // - Fragmentação de tabelas
    
    console.log('\nAnálise concluída.');
    return true;
  } catch (error) {
    console.error('Erro durante análise do banco de dados:', error);
    return false;
  }
}

// Função para exibir o menu interativo
async function exibirMenu() {
  try {
    while (true) {
      console.log('\n===== MENU DE IMPORTAÇÃO XML =====');
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

// Adicionar funções para novas opções de menu

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
              const erros = JSON.parse(detalhes.details);
              erros.forEach((erro, i) => {
                console.log(`\n- Erro ${i + 1}:`);
                console.log(`  Tipo: ${erro.type}`);
                console.log(`  Mensagem: ${erro.message}`);
                console.log(`  Timestamp: ${new Date(erro.timestamp).toLocaleString()}`);
              });
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

// Atualizar a função principal / inicialização

// Ponto de entrada principal
async function inicializar() {
  try {
    // Já temos código para inicializar o banco de dados no início do script
    console.log('=======================');
    console.log('IMPORTADOR XML CORRIGIDO');
    console.log('Versão: 1.0.0');
    console.log('=======================');
    
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
    
    // Fechar conexão com o banco de dados
    await sequelize.close();
    
  } catch (error) {
    console.error('Erro durante inicialização:', error);
    process.exit(1);
  }
}

// Iniciar a aplicação
inicializar().catch(error => {
  console.error('Erro fatal na execução:', error);
  process.exit(1);
}); 