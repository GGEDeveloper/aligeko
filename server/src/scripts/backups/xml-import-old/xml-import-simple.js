/**
 * XML Import Simple Script
 * 
 * Um script simples e direto para importar dados XML da GEKO para o banco de dados PostgreSQL.
 * Este script importa os dados do arquivo XML diretamente para o banco sem dependências externas.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';
import { Sequelize, DataTypes, Model } from 'sequelize';
import xml2js from 'xml2js';

// ES Module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file
const envPath = path.resolve(__dirname, '../../../.env');
console.log(`Carregando variáveis de ambiente de: ${envPath}`);
dotenv.config({ path: envPath });

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

console.log('Parâmetros de conexão:');
console.log('- Host:', dbParams.host);
console.log('- Port:', dbParams.port);
console.log('- Database:', dbParams.database);
console.log('- Username exists:', !!dbParams.username);
console.log('- Dialect Options:', JSON.stringify(dbParams.dialectOptions));

// Connection URL (use the URL directly if available)
const neonUrl = process.env.NEON_DB_URL || process.env.DATABASE_URL || process.env.POSTGRES_URL;

// Create Sequelize instance
let sequelize;
if (neonUrl) {
  console.log('Usando URL de conexão do banco de dados...');
  sequelize = new Sequelize(neonUrl, {
    dialect: 'postgres',
    logging: console.log,
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
    logging: console.log,
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

// Category Model
class Category extends Model {}
Category.init({
  id: {
    type: DataTypes.TEXT,
    primaryKey: true
  },
  name: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  path: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  parent_id: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'Category',
  tableName: 'categories',
  timestamps: true,
  underscored: true
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

// Price Model
class Price extends Model {}
Price.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  variant_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL,
    allowNull: false
  },
  currency: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: 'EUR'
  },
  type: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: 'retail'
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
    allowNull: false
  },
  url: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  is_main: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false
  },
  order: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0
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

// Função para analisar o XML
async function parseXML(xmlFilePath) {
  try {
    const xmlData = fs.readFileSync(xmlFilePath, 'utf8');
    const parser = new xml2js.Parser({
      explicitArray: false,
      mergeAttrs: true,
      normalizeTags: true
    });
    
    const result = await parser.parseStringPromise(xmlData);
    
    // Verificar se está no formato esperado (offer ou geko)
    let productsNode;
    
    if (result.offer && result.offer.products && result.offer.products.product) {
      console.log('Formato do XML detectado: "offer"');
      productsNode = result.offer.products;
    } else if (result.geko && result.geko.products && result.geko.products.product) {
      console.log('Formato do XML detectado: "geko"');
      productsNode = result.geko.products;
    } else {
      throw new Error('Estrutura XML inválida: dados de produto ausentes. Era esperado estrutura offer.products.product ou geko.products.product');
    }
    
    // Converter em array se for um único produto
    const products = Array.isArray(productsNode.product) 
      ? productsNode.product 
      : [productsNode.product];
    
    console.log(`Analisados ${products.length} produtos do XML`);
    
    return products;
  } catch (error) {
    console.error(`Erro ao analisar o XML: ${error.message}`);
    throw error;
  }
}

// Função para transformar dados XML em objetos para o banco de dados
function transformProducts(products) {
  try {
    // Mapas para rastrear entidades únicas
    const categoryMap = new Map();
    const producerMap = new Map();
    const unitMap = new Map();
    const productMap = new Map();
    
    // Arrays para as entidades do banco de dados
    const categories = [];
    const producers = [];
    const units = [];
    const productsData = [];
    const variants = [];
    const stocks = [];
    const prices = [];
    const images = [];
    
    // Processar cada produto
    products.forEach(product => {
      try {
        // Processar categoria
        if (product.category) {
          const categoryId = product.category.id || 'uncategorized';
          const categoryName = product.category.name || 'Uncategorized';
          const categoryPath = product.category.path || '';
          
          if (!categoryMap.has(categoryId)) {
            categoryMap.set(categoryId, {
              id: categoryId,
              name: categoryName,
              path: categoryPath,
              parent_id: null
            });
            categories.push(categoryMap.get(categoryId));
          }
        }
        
        // Processar produtor
        if (product.producer) {
          const producerName = product.producer.name || 'Unknown';
          
          if (!producerMap.has(producerName)) {
            producerMap.set(producerName, {
              name: producerName
            });
            producers.push(producerMap.get(producerName));
          }
        }
        
        // Processar unidade
        if (product.unit) {
          const unitId = product.unit.id || product.unit;
          const unitName = product.unit.name || 'pcs';
          const unitMoq = product.unit.moq || 1;
          
          if (!unitMap.has(unitId)) {
            unitMap.set(unitId, {
              id: unitId,
              name: unitName,
              moq: unitMoq
            });
            units.push(unitMap.get(unitId));
          }
        }
        
        // Extrair dados do produto
        const code = product.code || '';
        if (!code) {
          console.warn('Produto sem código encontrado, pulando...');
          return;
        }
        
        const description = product.description || {};
        const name = description.n || code;
        const description_long = description.long_desc || '';
        const description_short = description.short_desc || '';
        
        // Criar objeto de produto
        const productData = {
          code: code,
          name: name,
          description_long: description_long,
          description_short: description_short,
          ean: product.ean || null,
          producer_code: product.code_producer || null,
          category_id: product.category ? product.category.id : null,
          producer_id: null, // Será preenchido após inserir o produtor
          unit_id: product.unit ? (product.unit.id || product.unit) : null,
          vat: product.vat || 0,
          url: product.card ? product.card.url : null
        };
        
        productMap.set(code, productData);
        productsData.push(productData);
        
        // Processar variantes
        if (product.sizes && product.sizes.size) {
          // Tratar caso de única variante ou múltiplas
          const sizesArray = Array.isArray(product.sizes.size) 
            ? product.sizes.size 
            : [product.sizes.size];
          
          sizesArray.forEach(size => {
            // Criar variante
            const variantData = {
              product_code: code,
              code: size.code || code,
              weight: size.weight || 0,
              gross_weight: size.grossWeight || 0
            };
            
            variants.push(variantData);
            
            // Processar estoque
            if (size.stock) {
              // Tratar caso de único estoque ou múltiplos
              const stockArray = Array.isArray(size.stock) 
                ? size.stock 
                : [size.stock];
              
              stockArray.forEach(stock => {
                const stockData = {
                  variant_code: variantData.code,
                  quantity: stock.quantity || 0,
                  available: stock.quantity > 0
                };
                
                stocks.push(stockData);
              });
            }
            
            // Processar preços
            if (size.price) {
              // Tratar caso de único preço ou múltiplos
              const priceArray = Array.isArray(size.price) 
                ? size.price 
                : [size.price];
              
              priceArray.forEach(price => {
                const priceData = {
                  variant_code: variantData.code,
                  amount: price.gross || price.net || 0,
                  currency: 'EUR',
                  type: 'retail'
                };
                
                prices.push(priceData);
              });
            }
          });
        }
        
        // Processar imagens
        if (product.images) {
          // Pode haver imagens em diferentes seções (large, medium, etc.)
          const imageSections = ['large', 'medium', 'small', 'image'];
          
          imageSections.forEach(section => {
            if (product.images[section]) {
              const imagesArray = Array.isArray(product.images[section]) 
                ? product.images[section] 
                : [product.images[section]];
              
              imagesArray.forEach((image, index) => {
                // Verificar se a imagem é uma string (URL) ou objeto
                const imageUrl = typeof image === 'string' ? image : image.url || image.src || '';
                
                if (imageUrl) {
                  const imageData = {
                    product_code: code,
                    url: imageUrl,
                    is_main: index === 0, // Primeira imagem é a principal
                    order: index
                  };
                  
                  images.push(imageData);
                }
              });
            }
          });
        }
      } catch (productError) {
        console.error(`Erro ao processar produto: ${productError.message}`);
      }
    });
    
    return {
      categories,
      producers,
      units,
      products: productsData,
      variants,
      stocks,
      prices,
      images
    };
  } catch (error) {
    console.error(`Erro ao transformar produtos: ${error.message}`);
    throw error;
  }
}

// Função principal para importar dados
async function importData(xmlFilePath) {
  console.time('Tempo total de importação');
  
  try {
    // Testar conexão com o banco antes de prosseguir
    const connectionOk = await testConnection();
    if (!connectionOk) {
      console.error('Falha ao conectar com o banco de dados. Abortando.');
      return false;
    }
    
    console.log(`Analisando arquivo XML: ${xmlFilePath}`);
    const products = await parseXML(xmlFilePath);
    
    console.log('Transformando dados...');
    const transformedData = transformProducts(products);
    
    console.log('=== Resumo dos dados transformados ===');
    console.log(`Categorias: ${transformedData.categories.length}`);
    console.log(`Produtores: ${transformedData.producers.length}`);
    console.log(`Unidades: ${transformedData.units.length}`);
    console.log(`Produtos: ${transformedData.products.length}`);
    console.log(`Variantes: ${transformedData.variants.length}`);
    console.log(`Estoques: ${transformedData.stocks.length}`);
    console.log(`Preços: ${transformedData.prices.length}`);
    console.log(`Imagens: ${transformedData.images.length}`);
    
    // Iniciar a transação
    const transaction = await sequelize.transaction();
    
    try {
      console.log('Iniciando importação para o banco de dados...');
      
      // Inserir categorias
      if (transformedData.categories.length > 0) {
        console.log(`Importando ${transformedData.categories.length} categorias...`);
        await Category.bulkCreate(transformedData.categories, {
          updateOnDuplicate: ['name', 'path', 'parent_id'],
          transaction
        });
      }
      
      // Inserir produtores e mapear IDs
      const producerMap = new Map();
      if (transformedData.producers.length > 0) {
        console.log(`Importando ${transformedData.producers.length} produtores...`);
        for (const producer of transformedData.producers) {
          try {
            const [producerRecord] = await Producer.findOrCreate({
              where: { name: producer.name },
              defaults: producer,
              transaction
            });
            producerMap.set(producer.name, producerRecord.id);
          } catch (err) {
            console.error(`Erro ao importar produtor ${producer.name}: ${err.message}`);
          }
        }
      }
      
      // Atualizar IDs de produtor nos produtos
      transformedData.products.forEach(product => {
        if (product.producer_id && producerMap.has(product.producer_id)) {
          product.producer_id = producerMap.get(product.producer_id);
        } else {
          product.producer_id = null;
        }
      });
      
      // Inserir unidades
      if (transformedData.units.length > 0) {
        console.log(`Importando ${transformedData.units.length} unidades...`);
        await Unit.bulkCreate(transformedData.units, {
          updateOnDuplicate: ['name', 'moq'],
          transaction
        });
      }
      
      // Inserir produtos e mapear IDs
      const productMap = new Map();
      if (transformedData.products.length > 0) {
        console.log(`Importando ${transformedData.products.length} produtos...`);
        
        // Usar batchSize para evitar problemas de memória com grandes conjuntos de dados
        const BATCH_SIZE = 100;
        for (let i = 0; i < transformedData.products.length; i += BATCH_SIZE) {
          const batch = transformedData.products.slice(i, i + BATCH_SIZE);
          
          try {
            for (const product of batch) {
              try {
                const [productRecord] = await Product.findOrCreate({
                  where: { code: product.code },
                  defaults: product,
                  transaction
                });
                productMap.set(product.code, productRecord.id);
              } catch (err) {
                console.error(`Erro ao importar produto ${product.code}: ${err.message}`);
              }
            }
            
            console.log(`Processados ${Math.min(i + BATCH_SIZE, transformedData.products.length)} de ${transformedData.products.length} produtos`);
          } catch (batchError) {
            console.error(`Erro no lote de produtos ${i}-${i+BATCH_SIZE}: ${batchError.message}`);
          }
        }
      }
      
      // Atualizar IDs de produto nas variantes e imagens
      transformedData.variants.forEach(variant => {
        if (variant.product_code && productMap.has(variant.product_code)) {
          variant.product_id = productMap.get(variant.product_code);
          delete variant.product_code;
        } else {
          console.warn(`Produto não encontrado para variante: ${variant.code}`);
        }
      });
      
      transformedData.images.forEach(image => {
        if (image.product_code && productMap.has(image.product_code)) {
          image.product_id = productMap.get(image.product_code);
          delete image.product_code;
        } else {
          console.warn(`Produto não encontrado para imagem: ${image.url}`);
        }
      });
      
      // Inserir variantes e mapear IDs
      const variantMap = new Map();
      if (transformedData.variants.length > 0) {
        console.log(`Importando ${transformedData.variants.length} variantes...`);
        
        // Filtrar variantes sem product_id
        const validVariants = transformedData.variants.filter(v => v.product_id);
        
        // Importar em lotes
        const BATCH_SIZE = 100;
        for (let i = 0; i < validVariants.length; i += BATCH_SIZE) {
          const batch = validVariants.slice(i, i + BATCH_SIZE);
          
          try {
            for (const variant of batch) {
              try {
                const [variantRecord] = await Variant.findOrCreate({
                  where: { 
                    code: variant.code,
                    product_id: variant.product_id
                  },
                  defaults: variant,
                  transaction
                });
                variantMap.set(variant.code, variantRecord.id);
              } catch (err) {
                console.error(`Erro ao importar variante ${variant.code}: ${err.message}`);
              }
            }
            
            console.log(`Processadas ${Math.min(i + BATCH_SIZE, validVariants.length)} de ${validVariants.length} variantes`);
          } catch (batchError) {
            console.error(`Erro no lote de variantes ${i}-${i+BATCH_SIZE}: ${batchError.message}`);
          }
        }
      }
      
      // Atualizar IDs de variante nos estoques e preços
      transformedData.stocks.forEach(stock => {
        if (stock.variant_code && variantMap.has(stock.variant_code)) {
          stock.variant_id = variantMap.get(stock.variant_code);
          delete stock.variant_code;
        } else {
          console.warn(`Variante não encontrada para estoque: ${stock.variant_code}`);
        }
      });
      
      transformedData.prices.forEach(price => {
        if (price.variant_code && variantMap.has(price.variant_code)) {
          price.variant_id = variantMap.get(price.variant_code);
          delete price.variant_code;
        } else {
          console.warn(`Variante não encontrada para preço: ${price.variant_code}`);
        }
      });
      
      // Inserir estoque
      if (transformedData.stocks.length > 0) {
        console.log(`Importando ${transformedData.stocks.length} registros de estoque...`);
        
        // Filtrar estoques sem variant_id
        const validStocks = transformedData.stocks.filter(s => s.variant_id);
        
        if (validStocks.length > 0) {
          await Stock.bulkCreate(validStocks, {
            updateOnDuplicate: ['quantity', 'available'],
            transaction
          });
        }
      }
      
      // Inserir preços
      if (transformedData.prices.length > 0) {
        console.log(`Importando ${transformedData.prices.length} preços...`);
        
        // Filtrar preços sem variant_id
        const validPrices = transformedData.prices.filter(p => p.variant_id);
        
        if (validPrices.length > 0) {
          await Price.bulkCreate(validPrices, {
            updateOnDuplicate: ['amount', 'currency', 'type'],
            transaction
          });
        }
      }
      
      // Inserir imagens
      if (transformedData.images.length > 0) {
        console.log(`Importando ${transformedData.images.length} imagens...`);
        
        // Filtrar imagens sem product_id
        const validImages = transformedData.images.filter(i => i.product_id);
        
        if (validImages.length > 0) {
          await Image.bulkCreate(validImages, {
            updateOnDuplicate: ['url', 'is_main', 'order'],
            transaction
          });
        }
      }
      
      // Commit transaction
      await transaction.commit();
      console.log('Importação concluída com sucesso!');
      
      return true;
    } catch (error) {
      // Rollback transaction em caso de erro
      await transaction.rollback();
      console.error(`Erro durante a importação: ${error.message}`);
      
      // Registrar detalhes do erro
      console.error('========================================');
      console.error(`IMPORTAÇÃO FALHOU: ${error.message}`);
      console.error('========================================');
      console.error(error.stack);
      
      return false;
    }
  } catch (error) {
    console.error(`Erro geral: ${error.message}`);
    return false;
  } finally {
    console.timeEnd('Tempo total de importação');
    
    // Fechar conexão
    await sequelize.close();
    console.log('Conexão com banco de dados fechada.');
  }
}

// Função principal
async function main() {
  // Definir o caminho do arquivo XML
  const xmlFilePath = process.argv[2] || path.resolve(__dirname, '../../../produkty_xml_3_26-04-2025_12_51_02_en.xml');
  
  console.log(`Iniciando importação do arquivo: ${xmlFilePath}`);
  
  // Verificar se o arquivo existe
  if (!fs.existsSync(xmlFilePath)) {
    console.error(`ERRO: Arquivo XML não encontrado: ${xmlFilePath}`);
    console.log('Uso: node xml-import-simple.js [caminho-para-xml]');
    process.exit(1);
  }
  
  // Iniciar importação
  const success = await importData(xmlFilePath);
  
  if (success) {
    console.log('Importação concluída com sucesso!');
    process.exit(0);
  } else {
    console.error('Importação falhou!');
    process.exit(1);
  }
}

// Executar o script
main().catch(err => {
  console.error('Erro fatal:', err);
  process.exit(1);
}); 