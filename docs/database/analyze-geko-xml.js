/**
 * GEKO XML Analyzer
 * 
 * Este script analisa o arquivo XML da GEKO e gera estatísticas sobre os dados,
 * identificando a estrutura e os elementos presentes no arquivo.
 * 
 * Uso: node docs/database/analyze-geko-xml.js
 */

import fs from 'fs';
import path from 'path';
import { XMLParser } from 'fast-xml-parser';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// ES Module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Arquivo XML baixado
const XML_FILE_PATH = path.join(process.cwd(), 'geko_products_en.xml');

// Configuração do parser XML
const parserOptions = {
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  parseAttributeValue: true,
  allowBooleanAttributes: true,
  trimValues: true,
  isArray: (name, jpath, isLeafNode, isAttribute) => {
    // Tratar certos elementos como arrays mesmo quando há apenas um
    const arrayElements = ['product', 'variant', 'image', 'price', 'size'];
    return arrayElements.includes(name);
  }
};

// Função para analisar o arquivo XML
async function analyzeXml() {
  console.log('Analisando o arquivo XML da GEKO...');
  console.log(`Caminho do arquivo: ${XML_FILE_PATH}`);

  try {
    // Verificar se o arquivo existe
    if (!fs.existsSync(XML_FILE_PATH)) {
      console.error(`Erro: Arquivo ${XML_FILE_PATH} não encontrado.`);
      return;
    }

    // Obter informações sobre o arquivo
    const fileStats = fs.statSync(XML_FILE_PATH);
    const fileSizeMB = (fileStats.size / (1024 * 1024)).toFixed(2);
    console.log(`Tamanho do arquivo: ${fileSizeMB} MB`);
    console.log(`Última modificação: ${fileStats.mtime}`);

    // Ler os primeiros 5000 caracteres para análise inicial
    console.log('\n== Amostra dos primeiros 500 caracteres ==');
    const sampleBuffer = Buffer.alloc(500);
    const sampleFd = fs.openSync(XML_FILE_PATH, 'r');
    fs.readSync(sampleFd, sampleBuffer, 0, 500, 0);
    fs.closeSync(sampleFd);
    const sampleData = sampleBuffer.toString('utf8');
    console.log(sampleData);

    // Realizar uma busca de padrão para encontrar a estrutura do XML
    console.log('\n== Analisando estrutura básica do XML ==');
    
    // Ler os primeiros 10.000 caracteres para análise das tags principais
    const headerData = fs.readFileSync(XML_FILE_PATH, 'utf8', { length: 10000 });
    
    // Encontrar as tags principais
    const tagMatches = headerData.match(/<([a-zA-Z0-9_]+)[^>]*>/g);
    const mainTags = new Set();
    if (tagMatches) {
      tagMatches.forEach(tag => {
        const tagName = tag.match(/<([a-zA-Z0-9_]+)/)[1];
        mainTags.add(tagName);
      });
      console.log('Tags principais encontradas:');
      console.log(Array.from(mainTags).join(', '));
    }
    
    // Identificar a tag de produtos (product)
    const productTagPosition = headerData.indexOf('<product ');
    console.log(`Posição da primeira tag <product>: ${productTagPosition}`);
    
    // Buscar um produto completo
    console.log('\n== Procurando um produto completo para análise ==');
    
    // Ler o arquivo em chunks para extrair um produto de exemplo para análise
    // Encontrar onde começa o primeiro produto e termina
    const searchData = fs.readFileSync(XML_FILE_PATH, 'utf8', { length: 20000 });
    let productStartIndex = searchData.indexOf('<product ');
    
    if (productStartIndex > -1) {
      // Procurar a próxima tag <product> ou </products> para determinar o fim do primeiro produto
      let nextProductIndex = searchData.indexOf('<product ', productStartIndex + 8);
      let productsEndIndex = searchData.indexOf('</products>', productStartIndex);
      
      let productEndIndex = nextProductIndex > -1 ? nextProductIndex : productsEndIndex;
      if (productEndIndex === -1) {
        productEndIndex = searchData.length;
      }
      
      const productSample = searchData.substring(productStartIndex, productEndIndex);
      console.log('Produto encontrado! Tamanho da amostra:', productSample.length, 'bytes');
      console.log('\n== Conteúdo de exemplo de um produto (primeiros 500 caracteres) ==');
      console.log(productSample.substring(0, 500));
      
      // Analisar elementos e atributos presentes no produto
      console.log('\n== Estrutura de um produto (encontrando elementos) ==');
      
      // Identificar os principais elementos e atributos dentro do produto
      const productElementMatches = productSample.match(/<([a-zA-Z0-9_]+)[^>]*>/g);
      const productElements = new Set();
      
      if (productElementMatches) {
        productElementMatches.forEach(tag => {
          const tagName = tag.match(/<([a-zA-Z0-9_]+)/)[1];
          productElements.add(tagName);
        });
        console.log('Elementos dentro de um produto:');
        console.log(Array.from(productElements).join(', '));
      }
      
      // Identificar atributos da tag product
      const productAttributesMatch = productSample.match(/<product ([^>]+)>/);
      if (productAttributesMatch) {
        const attributesStr = productAttributesMatch[1];
        console.log('\nAtributos de um produto:');
        console.log(attributesStr);
        
        // Extrair pares de atributo=valor
        const attributePairs = attributesStr.match(/([a-zA-Z0-9_]+)="([^"]*)"/g);
        if (attributePairs) {
          attributePairs.forEach(pair => {
            const [name, value] = pair.replace(/"/g, '').split('=');
            console.log(`- ${name}: ${value}`);
          });
        }
      }
      
      // Verificar elementos específicos dentro do produto (producer, category, price, etc.)
      console.log('\n== Verificando elementos específicos ==');
      
      // Producer
      const producerMatch = productSample.match(/<producer([^>]+)>/);
      if (producerMatch) {
        console.log('\nElemento producer:');
        console.log(producerMatch[0]);
      }
      
      // Category
      const categoryMatch = productSample.match(/<category([^>]+)>/);
      if (categoryMatch) {
        console.log('\nElemento category:');
        console.log(categoryMatch[0]);
      }
      
      // Unit
      const unitMatch = productSample.match(/<unit([^>]+)>/);
      if (unitMatch) {
        console.log('\nElemento unit:');
        console.log(unitMatch[0]);
      }
      
      // Description
      const descriptionMatch = productSample.match(/<description>([\s\S]*?)<\/description>/);
      if (descriptionMatch) {
        console.log('\nElemento description (estrutura):');
        const descContent = descriptionMatch[1].trim();
        const descElements = descContent.match(/<([a-zA-Z0-9_]+)[^>]*>/g);
        if (descElements) {
          const descSet = new Set();
          descElements.forEach(tag => {
            const tagName = tag.match(/<([a-zA-Z0-9_]+)/)[1];
            descSet.add(tagName);
          });
          console.log('Elementos dentro de description:');
          console.log(Array.from(descSet).join(', '));
        }
      }
      
      // Price
      const priceMatch = productSample.match(/<price([^>]+)>/);
      if (priceMatch) {
        console.log('\nElemento price:');
        console.log(priceMatch[0]);
      }
      
      // Size/Variant
      const sizeMatch = productSample.match(/<size([^>]+)>([\s\S]*?)<\/size>/);
      if (sizeMatch) {
        console.log('\nElemento size (variante):');
        console.log('Atributos: ' + sizeMatch[1].trim());
        
        // Elementos dentro de size
        const sizeContent = sizeMatch[0];
        const sizeElements = sizeContent.match(/<([a-zA-Z0-9_]+)[^>]*>/g);
        if (sizeElements) {
          const sizeSet = new Set();
          sizeElements.forEach(tag => {
            const tagName = tag.match(/<([a-zA-Z0-9_]+)/)[1];
            if (tagName !== 'size') {
              sizeSet.add(tagName);
            }
          });
          console.log('Elementos dentro de size:');
          console.log(Array.from(sizeSet).join(', '));
        }
      }
    } else {
      console.log('Não foi possível encontrar um produto no arquivo XML.');
    }
    
    // Agora, analisar o arquivo completo para estatísticas básicas
    console.log('\n== Analisando o arquivo completo para estatísticas ==');
    
    // Abrir o arquivo para leitura linha por linha para evitar carregar todo o conteúdo na memória
    const fullFileContents = fs.readFileSync(XML_FILE_PATH, 'utf8');
    const stats = {
      products: 0,
      categories: 0,
      producers: 0,
      units: 0,
      sizes: 0,
      prices: 0,
      images: 0,
      stocks: 0
    };
    
    // Contar ocorrências usando expressões regulares
    stats.products = (fullFileContents.match(/<product /g) || []).length;
    stats.categories = (fullFileContents.match(/<category /g) || []).length;
    stats.producers = (fullFileContents.match(/<producer /g) || []).length;
    stats.units = (fullFileContents.match(/<unit /g) || []).length;
    stats.sizes = (fullFileContents.match(/<size /g) || []).length;
    stats.prices = (fullFileContents.match(/<price /g) || []).length;
    stats.images = (fullFileContents.match(/<image /g) || []).length;
    stats.stocks = (fullFileContents.match(/<stock /g) || []).length;
    
    console.log('\n== Estatísticas gerais ==');
    console.log(`Total de produtos: ${stats.products}`);
    console.log(`Total de categorias: ${stats.categories}`);
    console.log(`Total de produtores: ${stats.producers}`);
    console.log(`Total de unidades: ${stats.units}`);
    console.log(`Total de tamanhos/variantes: ${stats.sizes}`);
    console.log(`Total de preços: ${stats.prices}`);
    console.log(`Total de imagens: ${stats.images}`);
    console.log(`Total de registros de estoque: ${stats.stocks}`);
    
    // Calcular médias
    if (stats.products > 0) {
      console.log(`\n== Médias por produto ==`);
      console.log(`Média de variantes por produto: ${(stats.sizes / stats.products).toFixed(2)}`);
      console.log(`Média de preços por produto: ${(stats.prices / stats.products).toFixed(2)}`);
      console.log(`Média de imagens por produto: ${(stats.images / stats.products).toFixed(2)}`);
    }
    
    console.log('\n== Análise concluída com sucesso ==');
    
  } catch (error) {
    console.error('Erro ao analisar o arquivo XML:', error);
  }
}

// Executar a análise
analyzeXml().catch(error => {
  console.error('Erro ao executar análise:', error);
}); 