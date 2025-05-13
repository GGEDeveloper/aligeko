/**
 * XML Validation Script
 * 
 * Este script valida o arquivo XML da GEKO e fornece informações
 * sobre sua estrutura, contagens de entidades e amostras de dados.
 * Útil para verificar o XML antes de importar.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import xml2js from 'xml2js';
import colors from 'colors';

// ES Module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configure colors
colors.setTheme({
  info: 'blue',
  warn: 'yellow',
  error: 'red',
  success: 'green',
  data: 'grey',
  highlight: 'cyan',
  bold: 'bold'
});

/**
 * Analisa um arquivo XML e retorna estatísticas sobre sua estrutura
 * @param {string} xmlFilePath - Caminho do arquivo XML
 */
async function validateXmlFile(xmlFilePath) {
  console.log('='.repeat(80).bold);
  console.log('VALIDAÇÃO DE ARQUIVO XML GEKO'.bold);
  console.log('='.repeat(80).bold);
  
  try {
    // Verificar se o arquivo existe
    if (!fs.existsSync(xmlFilePath)) {
      console.error(`❌ ERRO: Arquivo não encontrado: ${xmlFilePath}`.error);
      process.exit(1);
    }
    
    // Obter tamanho do arquivo
    const fileStats = fs.statSync(xmlFilePath);
    const fileSizeMB = (fileStats.size / (1024 * 1024)).toFixed(2);
    console.log(`📂 Arquivo: ${xmlFilePath}`.info);
    console.log(`📊 Tamanho: ${fileSizeMB} MB`.info);
    
    // Ler o conteúdo do arquivo
    console.log('\n🔍 Lendo arquivo XML...'.info);
    const xmlData = fs.readFileSync(xmlFilePath, 'utf8');
    console.log(`   Leitura concluída: ${(xmlData.length / (1024 * 1024)).toFixed(2)} MB lidos`.success);
    
    // Configurar parser
    const parserOptions = {
      trim: true,
      explicitArray: false,
      mergeAttrs: true,
      normalizeTags: true
    };
    
    // Analisar XML
    console.log('\n🔍 Analisando estrutura XML...'.info);
    const parser = new xml2js.Parser(parserOptions);
    const result = await parser.parseStringPromise(xmlData);
    
    // Determinar estrutura base (geko ou offer)
    let rootNode = null;
    let productsNode = null;
    let structureType = '';
    
    if (result.offer && result.offer.products) {
      rootNode = result.offer;
      productsNode = result.offer.products;
      structureType = 'offer';
      console.log('   Estrutura XML: formato "offer"'.success);
    } else if (result.geko && result.geko.products) {
      rootNode = result.geko;
      productsNode = result.geko.products;
      structureType = 'geko';
      console.log('   Estrutura XML: formato "geko"'.success);
    } else {
      throw new Error('Estrutura XML inválida: não foi encontrado products em offer ou geko');
    }
    
    // Transformar produtos em array se for objeto único
    const products = Array.isArray(productsNode.product) 
      ? productsNode.product 
      : [productsNode.product];
    
    console.log(`   Total de produtos: ${products.length}`.success);
    
    // Coletar estatísticas
    const productStats = analyzeProducts(products);
    
    // Exibir estatísticas
    console.log('\n📊 ESTATÍSTICAS:'.info.bold);
    console.log(`   Produtos: ${productStats.productCount}`.data);
    console.log(`   Categorias únicas: ${productStats.uniqueCategories.size}`.data);
    console.log(`   Produtores únicos: ${productStats.uniqueProducers.size}`.data);
    console.log(`   Unidades únicas: ${productStats.uniqueUnits.size}`.data);
    console.log(`   Variantes totais: ${productStats.variantCount}`.data);
    console.log(`   Média de variantes por produto: ${(productStats.variantCount / productStats.productCount).toFixed(2)}`.data);
    console.log(`   Imagens totais: ${productStats.imageCount}`.data);
    console.log(`   Média de imagens por produto: ${(productStats.imageCount / productStats.productCount).toFixed(2)}`.data);
    
    // Exibir amostra do primeiro produto
    if (products.length > 0) {
      console.log('\n📋 AMOSTRA DO PRIMEIRO PRODUTO:'.info.bold);
      displayProductSample(products[0]);
    }
    
    // Validar campos essenciais
    console.log('\n✅ VALIDAÇÃO DE CAMPOS:'.info.bold);
    const validationResults = validateRequiredFields(products);
    Object.entries(validationResults).forEach(([field, { count, percentage }]) => {
      const color = percentage > 95 ? 'success' : (percentage > 70 ? 'warn' : 'error');
      console.log(`   ${field}: ${count}/${products.length} (${percentage.toFixed(1)}%)`[color]);
    });
    
    // Sugerir próximos passos
    console.log('\n📝 PRÓXIMOS PASSOS:'.info.bold);
    console.log('   1. Verifique se as estatísticas correspondem às expectativas'.data);
    console.log('   2. Confira a amostra do primeiro produto para garantir mapeamento correto'.data);
    console.log('   3. Prossiga com a importação usando o script direct-import-xml.js:'.data);
    console.log(`      node direct-import-xml.js "${xmlFilePath}"`.highlight);
    console.log('      Para otimizar a importação, considere as seguintes opções:'.data);
    console.log('      --limit=500         Limita o número de produtos importados'.data);
    console.log('      --skip-images       Pula importação de imagens para economizar espaço'.data);
    console.log('      --truncate=200      Trunca descrições longas para economizar espaço'.data);
    
    return { success: true, stats: productStats };
  } catch (error) {
    console.error(`\n❌ ERRO: ${error.message}`.error);
    console.error(error.stack);
    return { success: false, error: error.message };
  }
}

/**
 * Analisa os produtos e coleta estatísticas
 * @param {Array} products - Array de produtos do XML
 * @returns {Object} Estatísticas coletadas
 */
function analyzeProducts(products) {
  const stats = {
    productCount: products.length,
    uniqueCategories: new Set(),
    uniqueProducers: new Set(),
    uniqueUnits: new Set(),
    variantCount: 0,
    imageCount: 0,
    emptyFields: {}
  };
  
  products.forEach(product => {
    // Categorias
    if (product.category && product.category.id) {
      stats.uniqueCategories.add(product.category.id);
    }
    
    // Produtores
    if (product.producer && product.producer.name) {
      stats.uniqueProducers.add(product.producer.name);
    }
    
    // Unidades
    if (product.unit) {
      const unitId = typeof product.unit === 'object' ? (product.unit.id || product.unit.name) : product.unit;
      if (unitId) {
        stats.uniqueUnits.add(unitId);
      }
    }
    
    // Variantes
    let variantCount = 0;
    if (product.variants && product.variants.variant) {
      const variants = Array.isArray(product.variants.variant) 
        ? product.variants.variant 
        : [product.variants.variant];
      
      variantCount = variants.length;
      stats.variantCount += variantCount;
    } else if (product.sizes && product.sizes.size) {
      const sizes = Array.isArray(product.sizes.size) 
        ? product.sizes.size 
        : [product.sizes.size];
      
      variantCount = sizes.length;
      stats.variantCount += variantCount;
    } else {
      // Se não tem variantes, considerar que tem uma variante padrão
      stats.variantCount += 1;
    }
    
    // Imagens
    let imageCount = 0;
    if (product.images) {
      // Verificar imagem principal
      if (product.images.large) {
        imageCount++;
      }
      
      // Verificar imagens adicionais
      if (product.images.image) {
        const images = Array.isArray(product.images.image) 
          ? product.images.image 
          : [product.images.image];
        
        imageCount += images.length;
      }
    }
    
    stats.imageCount += imageCount;
  });
  
  return stats;
}

/**
 * Exibe uma amostra formatada de um produto
 * @param {Object} product - Produto a mostrar
 */
function displayProductSample(product) {
  const fields = [
    { name: 'código', value: product.code },
    { name: 'EAN', value: product.ean },
    { name: 'nome', value: product.description?.name || product.description?.n },
    { name: 'categoria', value: product.category?.name },
    { name: 'produtor', value: product.producer?.name },
    { name: 'unidade', value: typeof product.unit === 'object' ? product.unit.name : product.unit },
    { name: 'VAT', value: product.vat }
  ];
  
  fields.forEach(field => {
    console.log(`   ${field.name}: ${field.value || '(vazio)'}`.data);
  });
  
  // Descrição curta (truncada)
  const shortDesc = product.description?.short_desc || product.description?.short;
  if (shortDesc && shortDesc.length > 100) {
    console.log(`   descrição curta: ${shortDesc.substring(0, 100)}...`.data);
  } else {
    console.log(`   descrição curta: ${shortDesc || '(vazio)'}`.data);
  }
  
  // Contar variantes
  let variantCount = 0;
  if (product.variants && product.variants.variant) {
    variantCount = Array.isArray(product.variants.variant) 
      ? product.variants.variant.length 
      : 1;
  } else if (product.sizes && product.sizes.size) {
    variantCount = Array.isArray(product.sizes.size) 
      ? product.sizes.size.length 
      : 1;
  }
  console.log(`   variantes: ${variantCount}`.data);
  
  // Contar imagens
  let imageCount = 0;
  if (product.images) {
    if (product.images.large) imageCount++;
    if (product.images.image) {
      imageCount += Array.isArray(product.images.image) 
        ? product.images.image.length 
        : 1;
    }
  }
  console.log(`   imagens: ${imageCount}`.data);
}

/**
 * Valida campos obrigatórios em todos os produtos
 * @param {Array} products - Array de produtos do XML
 * @returns {Object} Resultados da validação
 */
function validateRequiredFields(products) {
  const requiredFields = [
    'code',
    'ean',
    ['description.name', 'description.n'],
    'category.id',
    'category.name',
    'producer.name',
    'unit'
  ];
  
  const validationResults = {};
  
  requiredFields.forEach(fieldSpec => {
    const fields = Array.isArray(fieldSpec) ? fieldSpec : [fieldSpec];
    let count = 0;
    
    products.forEach(product => {
      // Verificar se pelo menos um dos campos alternativos está presente
      const hasField = fields.some(field => {
        const parts = field.split('.');
        let value = product;
        for (const part of parts) {
          if (!value || !value[part]) return false;
          value = value[part];
        }
        return value !== undefined && value !== null && value !== '';
      });
      
      if (hasField) count++;
    });
    
    const fieldName = Array.isArray(fieldSpec) ? fieldSpec.join(' ou ') : fieldSpec;
    validationResults[fieldName] = {
      count,
      percentage: (count / products.length) * 100
    };
  });
  
  return validationResults;
}

// Se executado diretamente, validar arquivo passado como argumento
if (process.argv[2]) {
  validateXmlFile(process.argv[2]);
} else {
  // Tentar arquivo padrão
  const defaultFile = path.resolve(__dirname, '../../../geko_products_en.xml');
  if (fs.existsSync(defaultFile)) {
    console.log(`\n⚠️ Arquivo não especificado, usando padrão: ${defaultFile}`.warn);
    validateXmlFile(defaultFile);
  } else {
    console.error('\n❌ ERRO: Nenhum arquivo XML fornecido'.error);
    console.log('Uso: node validate-xml.js [caminho-do-arquivo.xml]'.info);
    process.exit(1);
  }
} 