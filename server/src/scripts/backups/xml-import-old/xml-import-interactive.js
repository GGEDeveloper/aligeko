/**
 * XML Import Interactive Script (Enhanced)
 * 
 * Um script interativo melhorado para importar dados XML da GEKO para o banco de dados PostgreSQL.
 * Inclui correção automática das descrições de produtos, otimização de performance,
 * normalização de valores numéricos e tratamento avançado de erros.
 * 
 * Versão: 2.0.0
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';
import { Sequelize, DataTypes, Model, QueryTypes } from 'sequelize';
import xml2js from 'xml2js';
import readline from 'readline';
import util from 'util';

// ES Module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file
const envPath = path.resolve(__dirname, '../../../.env');
console.log(`Carregando variáveis de ambiente de: ${envPath}`);
dotenv.config({ path: envPath });

// Criar interface readline para input do usuário
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

// Database connection parameters
const dbParams = {
  host: process.env.DB_HOST || process.env.PGHOST,
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || process.env.PGDATABASE,
  username: process.env.DB_USER || process.env.PGUSER,
  password: process.env.DB_PASSWORD || process.env.PGPASSWORD,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
};

// Connection URL (use the URL directly if available)
const neonUrl = process.env.NEON_DB_URL || process.env.DATABASE_URL || process.env.POSTGRES_URL;

// Create Sequelize instance
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
    }
  });
} else {
  console.log('Usando parâmetros individuais para conexão...');
  sequelize = new Sequelize(dbParams.database, dbParams.username, dbParams.password, {
    host: dbParams.host,
    port: dbParams.port,
    dialect: 'postgres',
    logging: false,
    ssl: true,
    dialectOptions: dbParams.dialectOptions
  });
}

// Definir modelos diretamente (sem importar dos arquivos de modelo)
// Product Model
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

// Definir modelo para Category
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
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
  }
}, {
  sequelize,
  modelName: 'category',
  tableName: 'categories',
  timestamps: false
});

// Producer Model
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

// Unit Model
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

// Variant Model
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

// Stock Model
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

// Price Model - Ajustado para usar as colunas corretas
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

// Image Model
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

// Função assíncrona para testar a conexão
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

// Função para analisar o arquivo XML
async function parseXML(xmlFilePath, limit = null) {
  try {
    if (!fs.existsSync(xmlFilePath)) {
      console.error(`Arquivo XML não encontrado: ${xmlFilePath}`);
      return null;
    }
    
    console.log(`Analisando arquivo XML: ${xmlFilePath}`);
    const startTime = new Date();
    
    const xmlData = fs.readFileSync(xmlFilePath, 'utf8');
    const tamanhoMB = (Buffer.byteLength(xmlData, 'utf8') / (1024 * 1024)).toFixed(2);
    console.log(`Tamanho do arquivo: ${tamanhoMB} MB`);
    
    const parser = new xml2js.Parser({
      explicitArray: false,
      mergeAttrs: true,
      normalizeTags: true
    });
    
    const result = await parser.parseStringPromise(xmlData);
    
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
    
    return products;
  } catch (error) {
    console.error('Erro ao analisar o XML:', error);
    return null;
  }
}

// Função para normalizar valores numéricos do XML
// Converte strings com vírgula para números com ponto decimal
function normalizarNumero(valor) {
  if (valor === null || valor === undefined) {
    return null;
  }
  
  // Se já for um número, retorna diretamente
  if (typeof valor === 'number') {
    return valor;
  }
  
  // Converte para string para garantir
  const str = String(valor).trim();
  
  // Se estiver vazio, retorna null
  if (str === '') {
    return null;
  }
  
  // Substitui vírgula por ponto e converte para número
  return parseFloat(str.replace(',', '.'));
}

// Função para extrair texto de campos que podem estar em diferentes formatos
function extrairTexto(campo) {
  if (!campo) return '';
  
  // Se for uma string simples
  if (typeof campo === 'string') {
    return campo;
  }
  
  // Se for um objeto com atributos xml:lang
  if (typeof campo === 'object') {
    // Tenta obter o texto do objeto
    if (campo['#text']) {
      return campo['#text'];
    }
    
    // Tenta obter o texto diretamente
    if (campo._) {
      return campo._;
    }
    
    // Verifica se tem conteúdo textual
    if (campo['$'] && campo['$']['xml:lang']) {
      const conteudo = Object.keys(campo)
        .filter(key => key !== '$')
        .map(key => campo[key])
        .join(' ');
      
      return conteudo || '';
    }
    
    // Se for um objeto vazio ou apenas com atributos
    return '';
  }
  
  // Fallback para outros casos
  return String(campo);
}

// Função para processar categorias com suporte a hierarquia
function processarCategorias(product, transformedData) {
  const categoryData = product.category || {};
  
  // Extrair dados da categoria
  const categoryId = categoryData.id || null;
  const categoryName = extrairTexto(categoryData.name) || 'Sem Categoria';
  const categoryPath = extrairTexto(categoryData.path) || '';
  
  // Processar caminho da categoria para extrair hierarquia
  const pathParts = categoryPath.split('/').filter(part => part.trim() !== '');
  
  // Rastrear IDs de categorias pai para criar hierarquia
  let parentId = null;
  let currentPath = '';
  
  // Processar cada nível da hierarquia
  for (let i = 0; i < pathParts.length; i++) {
    const part = pathParts[i].trim();
    if (part === '') continue;
    
    // Construir caminho atual
    currentPath = currentPath ? `${currentPath}/${part}` : part;
    
    // Criar ID único para esta subcategoria
    const subCategoryId = `${currentPath.replace(/\//g, '_')}`;
    
    // Verificar se a categoria já existe no mapa
    if (!transformedData.categories.has(subCategoryId)) {
      transformedData.categories.set(subCategoryId, {
        name: part,
        path: currentPath,
        parent_id: parentId,
        created_at: new Date(),
        updated_at: new Date()
      });
    }
    
    // Esta categoria se torna a pai para o próximo nível
    parentId = subCategoryId;
  }
  
  // Se não havia path ou estava vazio, usar o ID/nome direto da categoria
  if (pathParts.length === 0) {
    const simpleCategoryId = categoryId || `cat_${categoryName.replace(/\s+/g, '_').toLowerCase()}`;
    
    if (!transformedData.categories.has(simpleCategoryId)) {
      transformedData.categories.set(simpleCategoryId, {
        name: categoryName,
        path: categoryName,
        parent_id: null,
        created_at: new Date(),
        updated_at: new Date()
      });
    }
    
    return simpleCategoryId;
  }
  
  // Retornar o ID da categoria mais profunda (última na hierarquia)
  return parentId;
}

function transformProducts(products, estruturaXML = 'geko') {
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
  
  // Contadores para estatísticas
  let countProducts = 0;
  let countVariants = 0;
  let countStocks = 0;
  let countPrices = 0;
  let countImages = 0;
  
  // Processar cada produto
  for (const product of products) {
    try {
      // Extrair dados do produto do XML
      const productCode = product.code || '';
      if (!productCode) {
        console.warn('Produto sem código encontrado. Pulando...');
        continue;
      }
      
      // Processar categoria com suporte a hierarquia
      const transformedData = { categories };
      const categoryId = processarCategorias(product, transformedData);
      
      // Atualizar o mapa de categorias com os resultados
      categories.clear();
      for (const [key, value] of transformedData.categories.entries()) {
        categories.set(key, value);
      }
      
      // Processar produtor
      let producerName = null;
      
      if (product.producer) {
        const producer = product.producer;
        producerName = producer.name || 'Unknown';
        
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
      
      // Usar código como nome se não tiver nome
      if (!name) {
        name = productCode;
      }
      
      // Processar outros atributos do produto
      const ean = product.ean || null;
      const producerCode = product.producer_code || null;
      const vat = product.vat ? normalizarNumero(product.vat) : null;
      const url = product.url || null;
      
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
          const variantEan = variant.ean || null;
          
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
          const url = image.url || '';
          
          if (url) {
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
              url,
              is_main: isMain,
              order,
              created_at: new Date(),
              updated_at: new Date()
            });
            
            countImages++;
          }
        }
      }
    } catch (error) {
      console.error(`Erro ao transformar o produto ${product.code || 'sem código'}: ${error.message}`);
    }
  }
  
  const endTime = new Date();
  const duracao = (endTime - startTime) / 1000;
  
  console.log(`Transformação concluída em ${duracao.toFixed(2)} segundos`);
  console.log(`Total transformado: ${countProducts} produtos, ${countVariants} variantes, ${countStocks} estoques, ${countPrices} preços, ${countImages} imagens`);
  
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
      duracao
    }
  };
}

// Função para verificar e modificar a estrutura da tabela categories para suportar hierarquia
async function adicionarSuporteHierarquiaCategorias() {
  console.log('\n=== ADICIONANDO SUPORTE HIERARQUIA DE CATEGORIAS ===');
  
  try {
    // Verificar se a coluna parent_id já existe
    const [resultCheck] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'categories' AND column_name = 'parent_id'
    `);
    
    if (resultCheck.length > 0) {
      console.log('A coluna parent_id já existe na tabela categories.');
      return true;
    }
    
    // Adicionar coluna parent_id
    console.log('Adicionando coluna parent_id à tabela categories...');
    await sequelize.query(`
      ALTER TABLE categories 
      ADD COLUMN parent_id TEXT NULL REFERENCES categories(id)
    `);
    
    console.log('Coluna parent_id adicionada com sucesso!');
    
    // Verificar novamente
    const [resultAfter] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'categories' AND column_name = 'parent_id'
    `);
    
    if (resultAfter.length > 0) {
      console.log('Verificação confirmou que a coluna parent_id foi adicionada.');
      return true;
    } else {
      console.error('Erro: Não foi possível encontrar a coluna parent_id após adicioná-la.');
      return false;
    }
  } catch (error) {
    console.error(`Erro ao adicionar suporte a hierarquia: ${error.message}`);
    return false;
  }
}

// Função para verificar a estrutura das tabelas no banco
async function verificarEstruturaTabelas() {
  try {
    console.log('\n=== VERIFICAÇÃO DE ESTRUTURA DO BANCO DE DADOS ===');
    
    // Estrutura para armazenar resultados
    const estrutura = {
      categories: { existe: false, colunas: [], temParentId: false },
      producers: { existe: false, colunas: [] },
      units: { existe: false, colunas: [], temMoq: false },
      products: { existe: false, colunas: [] },
      variants: { existe: false, colunas: [] },
      stocks: { existe: false, colunas: [] },
      prices: { existe: false, colunas: [] },
      images: { existe: false, colunas: [] }
    };
    
    // Verificar existência das tabelas
    const tabelas = await sequelize.getQueryInterface().showAllTables();
    console.log('Tabelas encontradas:', tabelas);
    
    // Verificar estrutura de cada tabela
    for (const tabela of Object.keys(estrutura)) {
      // Verificar se a tabela existe
      if (tabelas.includes(tabela)) {
        estrutura[tabela].existe = true;
        
        // Verificar colunas da tabela
        try {
          const colunas = await sequelize.getQueryInterface().describeTable(tabela);
          estrutura[tabela].colunas = Object.keys(colunas);
          
          // Verificações específicas por tabela
          if (tabela === 'categories') {
            estrutura[tabela].temParentId = estrutura[tabela].colunas.includes('parent_id');
          } else if (tabela === 'units') {
            estrutura[tabela].temMoq = estrutura[tabela].colunas.includes('moq');
          }
          
          console.log(`Tabela ${tabela}: OK (${estrutura[tabela].colunas.length} colunas)`);
          console.log(`  Colunas: ${estrutura[tabela].colunas.join(', ')}`);
        } catch (error) {
          console.error(`Erro ao verificar colunas da tabela ${tabela}:`, error.message);
        }
      } else {
        console.error(`Tabela ${tabela}: NÃO ENCONTRADA`);
      }
    }
    
    // Resumo da verificação
    console.log('\n=== RESUMO DA VERIFICAÇÃO ===');
    
    const tabelasOk = Object.values(estrutura).filter(t => t.existe).length;
    const totalTabelas = Object.keys(estrutura).length;
    
    console.log(`Total de tabelas verificadas: ${totalTabelas}`);
    console.log(`Tabelas encontradas: ${tabelasOk}`);
    console.log(`Tabelas ausentes: ${totalTabelas - tabelasOk}`);
    
    // Verificar suporte a hierarquia de categorias
    if (estrutura.categories.existe) {
      estrutura.categories.temParentId = estrutura.categories.colunas.includes('parent_id');
    }
    
    console.log(`Suporte a hierarquia de categorias: ${estrutura.categories.temParentId ? 'SIM' : 'NÃO'}`);
    
    return estrutura;
  } catch (error) {
    console.error('Erro ao verificar estrutura do banco:', error);
    return null;
  }
}

// Função para adaptar dados baseado na estrutura do banco
function adaptarDadosParaEstrutura(dados, estrutura) {
  if (!estrutura) return;
  
  console.log('Adaptando dados para estrutura do banco...');
  
  // Adaptar categorias
  if (!estrutura.categories.temParentId) {
    console.log('- Removendo parent_id das categorias (não suportado pelo banco)');
    for (const categoria of dados.categories) {
      delete categoria.parent_id;
    }
  }
  
  // Outras adaptações podem ser adicionadas aqui conforme necessário
  
  console.log('Adaptação concluída!');
}

// Função para backup do banco antes de purgar
async function fazerBackupBanco() {
  try {
    console.log('Iniciando backup do banco de dados...');
    
    // Criar diretório de backup se não existir
    const backupDir = path.join(__dirname, 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir);
    }
    
    // Nome do arquivo de backup com timestamp
    const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
    const backupFile = path.join(backupDir, `db_backup_${timestamp}.json`);
    
    // Obter dados de todas as tabelas
    const backup = {};
    
    backup.categories = await Category.findAll();
    backup.producers = await Producer.findAll();
    backup.units = await Unit.findAll();
    backup.products = await Product.findAll();
    backup.variants = await Variant.findAll();
    backup.stocks = await Stock.findAll();
    backup.prices = await Price.findAll();
    backup.images = await Image.findAll();
    
    // Salvar backup em arquivo JSON
    fs.writeFileSync(backupFile, JSON.stringify(backup, null, 2));
    
    console.log(`Backup concluído com sucesso: ${backupFile}`);
    return true;
  } catch (error) {
    console.error('Erro ao fazer backup do banco:', error);
    return false;
  }
}

// Função para purgar dados existentes
async function purgarDados() {
  try {
    console.log('\n=== ATENÇÃO: OPERAÇÃO DESTRUTIVA ===');
    console.log('Esta operação irá APAGAR TODOS OS DADOS das tabelas:');
    console.log('- products');
    console.log('- variants');
    console.log('- stocks');
    console.log('- prices');
    console.log('- images');
    console.log('- categories');
    console.log('- producers');
    console.log('- units');
    
    const confirmar = await pergunta('\nTem certeza que deseja continuar? (sim/não): ');
    
    if (confirmar.toLowerCase() !== 'sim') {
      console.log('Operação cancelada pelo usuário.');
      return false;
    }
    
    // Fazer backup antes de apagar
    console.log('\nRealizando backup antes de apagar dados...');
    const backupOk = await fazerBackupBanco();
    
    if (!backupOk) {
      const prosseguir = await pergunta('Backup falhou. Deseja prosseguir mesmo assim? (sim/não): ');
      if (prosseguir.toLowerCase() !== 'sim') {
        console.log('Operação cancelada pelo usuário.');
        return false;
      }
    }
    
    // Iniciar transação
    const transaction = await sequelize.transaction();
    
    try {
      console.log('\nApagando dados...');
      
      // Apagar dados em ordem para respeitar chaves estrangeiras
      await sequelize.query('DELETE FROM images', { transaction });
      await sequelize.query('DELETE FROM prices', { transaction });
      await sequelize.query('DELETE FROM stocks', { transaction });
      await sequelize.query('DELETE FROM variants', { transaction });
      await sequelize.query('DELETE FROM products', { transaction });
      await sequelize.query('DELETE FROM categories', { transaction });
      await sequelize.query('DELETE FROM producers', { transaction });
      await sequelize.query('DELETE FROM units', { transaction });
      
      // Confirmar transação
      await transaction.commit();
      
      console.log('Dados apagados com sucesso!');
      return true;
    } catch (error) {
      // Reverter transação em caso de erro
      await transaction.rollback();
      console.error('Erro ao apagar dados:', error);
      return false;
    }
  } catch (error) {
    console.error('Erro ao purgar dados:', error);
    return false;
  }
}

// Função para analisar uso de espaço no banco
async function analisarEspacoBanco() {
  try {
    console.log('\n=== ANÁLISE DE USO DE ESPAÇO ===');
    
    // Obter contagem de registros em cada tabela
    const counts = {};
    counts.products = await Product.count();
    counts.variants = await Variant.count();
    counts.stocks = await Stock.count();
    counts.prices = await Price.count();
    counts.images = await Image.count();
    counts.categories = await Category.count();
    counts.producers = await Producer.count();
    counts.units = await Unit.count();
    
    console.log('\nNúmero de registros por tabela:');
    for (const [table, count] of Object.entries(counts)) {
      console.log(`- ${table}: ${count} registros`);
    }
    
    // Analisar tamanho aproximado dos dados
    console.log('\nTamanho aproximado de alguns dados:');
    
    // Analisar descrições longas
    const descLongSizes = await sequelize.query(
      'SELECT AVG(LENGTH(description_long)) as avg_size, MAX(LENGTH(description_long)) as max_size FROM products WHERE description_long IS NOT NULL',
      { type: QueryTypes.SELECT }
    );
    
    if (descLongSizes[0].avg_size) {
      console.log(`- Tamanho médio das descrições longas: ${Math.round(descLongSizes[0].avg_size)} bytes`);
      console.log(`- Tamanho máximo das descrições longas: ${descLongSizes[0].max_size} bytes`);
    }
    
    // Analisar URLs de imagens
    const imageSizes = await sequelize.query(
      'SELECT AVG(LENGTH(url)) as avg_size, MAX(LENGTH(url)) as max_size FROM images WHERE url IS NOT NULL',
      { type: QueryTypes.SELECT }
    );
    
    if (imageSizes[0].avg_size) {
      console.log(`- Tamanho médio das URLs de imagens: ${Math.round(imageSizes[0].avg_size)} bytes`);
      console.log(`- Tamanho máximo das URLs de imagens: ${imageSizes[0].max_size} bytes`);
    }
    
    console.log('\nAnálise de espaço concluída!');
    return true;
  } catch (error) {
    console.error('Erro ao analisar espaço do banco:', error);
    return false;
  }
}

// Função para corrigir descrições de produtos
async function corrigirDescricoesProdutos(xmlFilePath) {
  try {
    console.log('Iniciando correção de descrições de produtos...');
    
    // Analisar arquivo XML
    const produtos = await parseXML(xmlFilePath);
    if (!produtos || produtos.length === 0) {
      console.error('Não foi possível carregar os dados do XML para correção.');
      return false;
    }
    
    // Criar um mapa de produtos por código
    const produtosXML = new Map();
    
    for (const product of produtos) {
      const code = product.code || '';
      if (code) {
        // Extrair descrições
        const description = product.description || {};
        
        // Extrair description_long
        let descriptionLong = '';
        if (description.long) {
          descriptionLong = extrairTexto(description.long);
        } else if (description.long_desc) {
          descriptionLong = extrairTexto(description.long_desc);
        }
        
        // Extrair description_short
        let descriptionShort = '';
        if (description.short) {
          descriptionShort = extrairTexto(description.short);
        } else if (description.short_desc) {
          descriptionShort = extrairTexto(description.short_desc);
        }
        
        // Extrair name
        let name = '';
        if (description.name) {
          name = extrairTexto(description.name);
        }
        
        // Armazenar no mapa
        produtosXML.set(code, {
          name,
          description_long: descriptionLong,
          description_short: descriptionShort
        });
      }
    }
    
    console.log(`Extraídas descrições de ${produtosXML.size} produtos do XML.`);
    
    // Iniciar transação
    const transaction = await sequelize.transaction();
    
    try {
      console.log('Buscando produtos no banco de dados...');
      
      // Obter todos os produtos do banco
      const produtosBD = await Product.findAll({
        attributes: ['id', 'code', 'name', 'description_long', 'description_short']
      });
      
      console.log(`Encontrados ${produtosBD.length} produtos no banco de dados.`);
      
      // Contadores para estatísticas
      let totalAtualizados = 0;
      let totalNaoEncontrados = 0;
      let totalSemMudancas = 0;
      
      // Processar cada produto do banco
      for (const produtoBD of produtosBD) {
        const code = produtoBD.code;
        
        // Verificar se o produto existe no XML
        if (produtosXML.has(code)) {
          const produtoXML = produtosXML.get(code);
          
          // Verificar se é necessário atualizar as descrições
          const needsUpdate = (
            (produtoXML.description_long && produtoBD.description_long !== produtoXML.description_long) ||
            (produtoXML.description_short && produtoBD.description_short !== produtoXML.description_short) ||
            (produtoXML.name && produtoBD.name !== produtoXML.name)
          );
          
          if (needsUpdate) {
            // Verificar cada campo individualmente
            const updateData = {};
            
            if (produtoXML.description_long && produtoBD.description_long !== produtoXML.description_long) {
              updateData.description_long = produtoXML.description_long;
            }
            
            if (produtoXML.description_short && produtoBD.description_short !== produtoXML.description_short) {
              updateData.description_short = produtoXML.description_short;
            }
            
            if (produtoXML.name && produtoBD.name !== produtoXML.name) {
              updateData.name = produtoXML.name;
            }
            
            if (Object.keys(updateData).length > 0) {
              // Atualizar o produto no banco
              await produtoBD.update(updateData, { transaction });
              totalAtualizados++;
              
              // Log detalhado (apenas para os primeiros 5 produtos)
              if (totalAtualizados <= 5) {
                console.log(`Produto atualizado: ${code}`);
                for (const [campo, valor] of Object.entries(updateData)) {
                  console.log(`  - ${campo}: "${valor.substring(0, 50)}${valor.length > 50 ? '...' : ''}"`);
                }
              }
            } else {
              totalSemMudancas++;
            }
          } else {
            totalSemMudancas++;
          }
        } else {
          totalNaoEncontrados++;
        }
      }
      
      // Confirmar transação
      await transaction.commit();
      
      console.log('\n=== RESUMO DA CORREÇÃO ===');
      console.log(`Total de produtos no banco: ${produtosBD.length}`);
      console.log(`Total de produtos no XML: ${produtosXML.size}`);
      console.log(`Produtos atualizados: ${totalAtualizados}`);
      console.log(`Produtos sem mudanças: ${totalSemMudancas}`);
      console.log(`Produtos não encontrados no XML: ${totalNaoEncontrados}`);
      
      return true;
    } catch (error) {
      // Reverter transação em caso de erro
      await transaction.rollback();
      console.error('Erro ao atualizar descrições:', error);
      return false;
    }
  } catch (error) {
    console.error('Erro ao corrigir descrições:', error);
    return false;
  }
}

// Função principal para importar dados
async function importData(xmlFilePath, limit = null) {
  console.time('Tempo total de importação');
  
  try {
    // Testar conexão com o banco antes de prosseguir
    const connectionOk = await testConnection();
    if (!connectionOk) {
      console.error('Falha ao conectar com o banco de dados. Abortando.');
      return false;
    }
    
    // Verificar estrutura das tabelas
    const estrutura = await verificarEstruturaTabelas();
    
    // Analisar o arquivo XML
    console.log(`Analisando arquivo XML: ${xmlFilePath}`);
    const products = await parseXML(xmlFilePath, limit);
    
    if (!products || products.length === 0) {
      console.error('Nenhum produto encontrado no XML ou falha na análise.');
      return false;
    }
    
    console.log(`Processando ${products.length} produtos...`);
    
    // Determinar a estrutura do XML
    let estruturaXML = 'geko';
    if (xmlFilePath.toLowerCase().includes('offer')) {
      estruturaXML = 'offer';
    }
    
    // Transformar os dados do XML para o formato do banco
    const transformedData = transformProducts(products, estruturaXML);
    
    if (!transformedData) {
      console.error('Falha ao transformar dados do XML.');
      return false;
    }
    
    // Adaptar dados para a estrutura do banco, se necessário
    adaptarDadosParaEstrutura(transformedData, estrutura);
    
    // Iniciar transação
    const transaction = await sequelize.transaction();
    
    try {
      console.log('Iniciando inserção no banco de dados...');
      const startTime = new Date();
      
      // Batch size para operações em lote
      const BATCH_SIZE = 500;
      
      // 1. Inserir categorias
      console.log(`Inserindo ${transformedData.categories.length} categorias...`);
      if (transformedData.categories.length > 0) {
        for (let i = 0; i < transformedData.categories.length; i += BATCH_SIZE) {
          const batch = transformedData.categories.slice(i, i + BATCH_SIZE);
          try {
            await Category.bulkCreate(batch, { 
              updateOnDuplicate: Object.keys(Category.rawAttributes),
              transaction 
            });
          } catch (error) {
            console.error(`Erro ao inserir lote de categorias (${i+1}-${i+Math.min(BATCH_SIZE, transformedData.categories.length)}):`, error.message);
          }
        }
      }
      
      // 2. Inserir produtores
      console.log(`Inserindo ${transformedData.producers.length} produtores...`);
      if (transformedData.producers.length > 0) {
        const producerMap = new Map();
        
        for (let i = 0; i < transformedData.producers.length; i += BATCH_SIZE) {
          const batch = transformedData.producers.slice(i, i + BATCH_SIZE);
          try {
            const createdProducers = await Producer.bulkCreate(batch, { 
              transaction,
              returning: true // Obter IDs gerados
            });
            
            // Mapear nome do produtor para ID
            for (const producer of createdProducers) {
              producerMap.set(producer.name, producer.id);
            }
          } catch (error) {
            console.error(`Erro ao inserir lote de produtores (${i+1}-${i+Math.min(BATCH_SIZE, transformedData.producers.length)}):`, error.message);
          }
        }
        
        // Atualizar IDs de produtores nos produtos
        for (const product of transformedData.products) {
          if (typeof product.producer_id === 'string' && producerMap.has(product.producer_id)) {
            product.producer_id = producerMap.get(product.producer_id);
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
              updateOnDuplicate: Object.keys(Unit.rawAttributes),
              transaction 
            });
          } catch (error) {
            console.error(`Erro ao inserir lote de unidades (${i+1}-${i+Math.min(BATCH_SIZE, transformedData.units.length)}):`, error.message);
          }
        }
      }
      
      // 4. Inserir produtos
      console.log(`Inserindo ${transformedData.products.length} produtos...`);
      const productCodeToId = new Map();
      
      if (transformedData.products.length > 0) {
        for (let i = 0; i < transformedData.products.length; i += BATCH_SIZE) {
          const batch = transformedData.products.slice(i, i + BATCH_SIZE);
          try {
            const createdProducts = await Product.bulkCreate(batch, { 
              transaction,
              returning: true // Obter IDs gerados
            });
            
            // Mapear código do produto para ID
            for (const product of createdProducts) {
              productCodeToId.set(product.code, product.id);
            }
          } catch (error) {
            console.error(`Erro ao inserir lote de produtos (${i+1}-${i+Math.min(BATCH_SIZE, transformedData.products.length)}):`, error.message);
          }
        }
      }
      
      // 5. Inserir variantes
      console.log(`Inserindo ${transformedData.variants.length} variantes...`);
      const variantCodeToId = new Map();
      
      if (transformedData.variants.length > 0) {
        for (let i = 0; i < transformedData.variants.length; i += BATCH_SIZE) {
          const batch = transformedData.variants.slice(i, i + BATCH_SIZE);
          
          // Atualizar product_id baseado no mapeamento product_code -> id
          for (const variant of batch) {
            if (variant.product_code && productCodeToId.has(variant.product_code)) {
              variant.product_id = productCodeToId.get(variant.product_code);
              delete variant.product_code; // Remover campo temporário
            }
          }
          
          try {
            const createdVariants = await Variant.bulkCreate(batch, { 
              transaction,
              returning: true // Obter IDs gerados
            });
            
            // Mapear código da variante para ID
            for (const variant of createdVariants) {
              variantCodeToId.set(variant.code, variant.id);
            }
          } catch (error) {
            console.error(`Erro ao inserir lote de variantes (${i+1}-${i+Math.min(BATCH_SIZE, transformedData.variants.length)}):`, error.message);
          }
        }
      }
      
      // 6. Inserir estoques
      console.log(`Inserindo ${transformedData.stocks.length} estoques...`);
      
      if (transformedData.stocks.length > 0) {
        for (let i = 0; i < transformedData.stocks.length; i += BATCH_SIZE) {
          const batch = transformedData.stocks.slice(i, i + BATCH_SIZE);
          
          // Atualizar variant_id baseado no mapeamento variant_code -> id
          for (const stock of batch) {
            if (stock.variant_code && variantCodeToId.has(stock.variant_code)) {
              stock.variant_id = variantCodeToId.get(stock.variant_code);
              delete stock.variant_code; // Remover campo temporário
            }
          }
          
          try {
            await Stock.bulkCreate(batch, { transaction });
          } catch (error) {
            console.error(`Erro ao inserir lote de estoques (${i+1}-${i+Math.min(BATCH_SIZE, transformedData.stocks.length)}):`, error.message);
          }
        }
      }
      
      // 7. Inserir preços
      console.log(`Inserindo ${transformedData.prices.length} preços...`);
      
      if (transformedData.prices.length > 0) {
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
            }
          }
          
          try {
            await Price.bulkCreate(batch, { transaction });
          } catch (error) {
            console.error(`Erro ao inserir lote de preços (${i+1}-${i+Math.min(BATCH_SIZE, transformedData.prices.length)}):`, error.message);
          }
        }
      }
      
      // 8. Inserir imagens
      console.log(`Inserindo ${transformedData.images.length} imagens...`);
      
      if (transformedData.images.length > 0) {
        for (let i = 0; i < transformedData.images.length; i += BATCH_SIZE) {
          const batch = transformedData.images.slice(i, i + BATCH_SIZE);
          
          // Atualizar product_id baseado no mapeamento product_code -> id
          for (const image of batch) {
            if (image.product_code && productCodeToId.has(image.product_code)) {
              image.product_id = productCodeToId.get(image.product_code);
              delete image.product_code; // Remover campo temporário
            }
          }
          
          try {
            await Image.bulkCreate(batch, { transaction });
          } catch (error) {
            console.error(`Erro ao inserir lote de imagens (${i+1}-${i+Math.min(BATCH_SIZE, transformedData.images.length)}):`, error.message);
          }
        }
      }
      
      // Confirmar transação
      await transaction.commit();
      
      const endTime = new Date();
      const duracaoSegundos = (endTime - startTime) / 1000;
      
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
      
      console.timeEnd('Tempo total de importação');
      return true;
    } catch (error) {
      // Reverter transação em caso de erro
      await transaction.rollback();
      console.error('Erro durante importação:', error);
      console.timeEnd('Tempo total de importação');
      return false;
    }
  } catch (error) {
    console.error('Erro fatal durante importação:', error);
    console.timeEnd('Tempo total de importação');
    return false;
  }
}

// Menu principal
async function menuPrincipal() {
  let sair = false;
  
  // Definir caminho padrão para o arquivo XML
  const xmlFilePathPadrao = 'C:\\Users\\Pixie\\OneDrive\\Desktop\\aligekow\\produkty_xml_3_26-04-2025_12_51_02_en.xml';
  
  while (!sair) {
    console.log('\n===============================================');
    console.log('  IMPORTADOR XML INTERATIVO MELHORADO V2.0.0   ');
    console.log('===============================================');
    console.log('1. Importar todos os produtos do XML');
    console.log('2. Importar número limitado de produtos');
    console.log('3. Purgar dados existentes (com backup)');
    console.log('4. Analisar uso de espaço no banco');
    console.log('5. Verificar estrutura das tabelas');
    console.log('6. Corrigir descrições de produtos');
    console.log('7. Adicionar suporte a hierarquia de categorias');
    console.log('8. Sair');
    console.log('===============================================');
    
    const opcao = await pergunta('Escolha uma opção (1-8): ');
    
    switch (opcao) {
      case '1':
        // Importar todos os produtos
        let xmlFilePath = await pergunta(`Digite o caminho para o arquivo XML (ou Enter para usar ${xmlFilePathPadrao}): `);
        if (xmlFilePath.trim() === '') {
          xmlFilePath = xmlFilePathPadrao;
          console.log(`Usando arquivo padrão: ${xmlFilePathPadrao}`);
        }
        
        if (fs.existsSync(xmlFilePath)) {
          await importData(xmlFilePath);
        } else {
          console.error(`Arquivo não encontrado: ${xmlFilePath}`);
        }
        break;
        
      case '2':
        // Importar número limitado de produtos
        let xmlFileLimited = await pergunta(`Digite o caminho para o arquivo XML (ou Enter para usar ${xmlFilePathPadrao}): `);
        if (xmlFileLimited.trim() === '') {
          xmlFileLimited = xmlFilePathPadrao;
          console.log(`Usando arquivo padrão: ${xmlFilePathPadrao}`);
        }
        
        if (fs.existsSync(xmlFileLimited)) {
          const limitStr = await pergunta('Digite o número máximo de produtos a importar: ');
          const limit = parseInt(limitStr, 10);
          
          if (isNaN(limit) || limit <= 0) {
            console.error('Número inválido. Use um número inteiro positivo.');
          } else {
            await importData(xmlFileLimited, limit);
          }
        } else {
          console.error(`Arquivo não encontrado: ${xmlFileLimited}`);
        }
        break;
        
      case '3':
        // Purgar dados existentes
        await purgarDados();
        break;
        
      case '4':
        // Analisar uso de espaço
        await analisarEspacoBanco();
        break;
        
      case '5':
        // Verificar estrutura das tabelas
        await verificarEstruturaTabelas();
        break;
        
      case '6':
        // Corrigir descrições de produtos
        let xmlFileCorrecao = await pergunta(`Digite o caminho para o arquivo XML (ou Enter para usar ${xmlFilePathPadrao}): `);
        if (xmlFileCorrecao.trim() === '') {
          xmlFileCorrecao = xmlFilePathPadrao;
          console.log(`Usando arquivo padrão: ${xmlFilePathPadrao}`);
        }
        
        if (fs.existsSync(xmlFileCorrecao)) {
          await corrigirDescricoesProdutos(xmlFileCorrecao);
        } else {
          console.error(`Arquivo não encontrado: ${xmlFileCorrecao}`);
        }
        break;
        
      case '7':
        // Adicionar suporte a hierarquia de categorias
        const confirmacao = await pergunta('Esta operação irá modificar a estrutura da tabela categories. Deseja continuar? (sim/não): ');
        if (confirmacao.toLowerCase() === 'sim') {
          await adicionarSuporteHierarquiaCategorias();
        }
        break;
        
      case '8':
        // Sair
        sair = true;
        console.log('Saindo do programa. Obrigado por usar o Importador XML Interativo!');
        await sequelize.close();
        break;
        
      default:
        console.log('Opção inválida. Por favor, tente novamente.');
    }
    
    if (!sair) {
      await pergunta('\nPressione Enter para continuar...');
    }
  }
}

// Função para inicializar o banco de dados
async function initializeDatabase() {
  try {
    // Testar conexão
    console.log('Inicializando conexão com banco de dados...');
    const connectionOk = await testConnection();
    
    if (!connectionOk) {
      throw new Error('Falha ao conectar com o banco de dados.');
    }
    
    console.log('Definindo modelos e suas associações...');
    
    // Definir os modelos aqui já está feito na parte inicial do script
    // As classes Product, Category, etc. já foram definidas
    
    // Verificar estrutura opcional
    await verificarEstruturaTabelas();
    
    return true;
  } catch (error) {
    console.error('Erro ao inicializar banco de dados:', error);
    throw error;
  }
}

// Função principal
async function main() {
  try {
    // Inicializar conexão e definir modelos
    await initializeDatabase();
    
    // Iniciar menu interativo
    await menuPrincipal();
  } catch (error) {
    console.error('Erro fatal no programa:', error);
    process.exit(1);
  }
}

// Executar a função principal
main(); 