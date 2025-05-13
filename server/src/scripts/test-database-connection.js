/**
 * Script para testar a conexão com o banco de dados
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { Sequelize } from 'sequelize';

// ES Module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Carregar variáveis de ambiente (a partir do diretório raiz)
const envPath = path.resolve(__dirname, '../../../.env');
console.log(`Carregando variáveis de ambiente de: ${envPath}`);
dotenv.config({ path: envPath });

console.log('\n=== CONFIGURAÇÃO DE AMBIENTE ===');
console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`NEON_DB_URL existe: ${Boolean(process.env.NEON_DB_URL)}`);
console.log(`POSTGRES_URL existe: ${Boolean(process.env.POSTGRES_URL)}`);
console.log(`DB_HOST: ${process.env.DB_HOST}`);
console.log(`DB_PORT: ${process.env.DB_PORT}`);
console.log(`DB_USER: ${process.env.DB_USER}`);
console.log(`DB_NAME: ${process.env.DB_NAME}`);
console.log(`DB_SSL: ${process.env.DB_SSL}`);

// Teste 1: Usar diretamente a connection string
async function testDirectConnection() {
  console.log('\n=== TESTE 1: Conexão Direta ===');
  let sequelize = null;
  
  try {
    // Priorizar POSTGRES_URL (Vercel) sobre NEON_DB_URL
    const connectionString = process.env.POSTGRES_URL || process.env.NEON_DB_URL;
    
    if (!connectionString) {
      throw new Error('Nenhuma connection string encontrada (POSTGRES_URL ou NEON_DB_URL)');
    }
    
    console.log(`Usando connection string: ${connectionString.substring(0, 25)}...`);
    
    // Criar conexão
    sequelize = new Sequelize(connectionString, {
      dialect: 'postgres',
      logging: console.log,
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      }
    });
    
    // Testar conexão
    await sequelize.authenticate();
    console.log('✅ Conexão direta estabelecida com sucesso!');
    
    // Testar query simples
    const [result] = await sequelize.query('SELECT current_database() as db, current_user as user');
    console.log('Resultado da query:', result[0]);
    
    return true;
  } catch (error) {
    console.error('❌ Erro na conexão direta:', error.message);
    return false;
  } finally {
    if (sequelize) {
      await sequelize.close();
      console.log('Conexão fechada');
    }
  }
}

// Teste 2: Importar e usar a conexão de database.js
async function testImportedConnection() {
  console.log('\n=== TESTE 2: Conexão via database.js ===');
  
  try {
    // Importar sequelize configurado
    const { default: configuredSequelize } = await import('../config/database.js');
    
    // Testar conexão
    await configuredSequelize.authenticate();
    console.log('✅ Conexão via import estabelecida com sucesso!');
    
    // Testar query simples
    const [result] = await configuredSequelize.query('SELECT current_database() as db, current_user as user');
    console.log('Resultado da query:', result[0]);
    
    return true;
  } catch (error) {
    console.error('❌ Erro na conexão via import:', error.message);
    return false;
  }
}

// Teste 3: Importar models/index.js
async function testModelsConnection() {
  console.log('\n=== TESTE 3: Conexão via models/index.js ===');
  
  try {
    // Importar models
    const { models, sequelize } = await import('../models/index.js');
    
    // Verificar se models foram carregados
    console.log('Models disponíveis:', Object.keys(models).join(', '));
    
    // Testar conexão
    await sequelize.authenticate();
    console.log('✅ Conexão via models estabelecida com sucesso!');
    
    // Testar acesso a um modelo
    if (models.Product) {
      const count = await models.Product.count();
      console.log(`Total de produtos no banco: ${count}`);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Erro na conexão via models:', error.message);
    return false;
  }
}

// Executar testes
async function runTests() {
  console.log('🔍 INICIANDO TESTES DE CONEXÃO COM O BANCO DE DADOS\n');
  
  const test1Result = await testDirectConnection();
  const test2Result = await testImportedConnection();
  const test3Result = await testModelsConnection();
  
  console.log('\n=== RESUMO DOS TESTES ===');
  console.log(`Teste 1 (Conexão Direta): ${test1Result ? '✅ SUCESSO' : '❌ FALHA'}`);
  console.log(`Teste 2 (Via database.js): ${test2Result ? '✅ SUCESSO' : '❌ FALHA'}`);
  console.log(`Teste 3 (Via models/index.js): ${test3Result ? '✅ SUCESSO' : '❌ FALHA'}`);
  
  if (test1Result && !test2Result) {
    console.log('\n⚠️ DIAGNÓSTICO: A conexão direta funciona, mas há um problema com o database.js');
  } else if (!test1Result && !test2Result) {
    console.log('\n⚠️ DIAGNÓSTICO: Problema nas credenciais de conexão ou servidor de banco de dados inacessível');
  } else if (test2Result && !test3Result) {
    console.log('\n⚠️ DIAGNÓSTICO: O database.js está correto, mas há um problema no models/index.js');
  }
}

// Executar
runTests()
  .then(() => {
    console.log('\nTestes concluídos!');
  })
  .catch(error => {
    console.error('\nErro ao executar testes:', error);
  }); 