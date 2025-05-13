// Script para testar a conexão com o banco de dados Neon PostgreSQL
import { Sequelize } from 'sequelize';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// ES Module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Carregar variáveis de ambiente
dotenv.config({ path: join(__dirname, '.env') });
dotenv.config({ path: join(__dirname, '.env.local') });

// Imprimir informações de conexão (sem senhas)
console.log('Testando conexão com o banco de dados...');
console.log('URL do banco de dados:', process.env.NEON_DB_URL?.replace(/:[^:]*@/, ':****@'));
console.log('Host:', process.env.DB_HOST);
console.log('Porta:', process.env.DB_PORT);
console.log('Usuário:', process.env.DB_USER);
console.log('Banco de dados:', process.env.DB_NAME);
console.log('SSL habilitado:', process.env.DB_SSL);

// Configurar conexão com o banco de dados
const sequelize = new Sequelize(process.env.NEON_DB_URL, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
  logging: console.log
});

// Função para testar a conexão
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexão com o banco de dados estabelecida com sucesso.');
    
    // Tentar fazer uma query simples
    const result = await sequelize.query('SELECT NOW() as now');
    console.log('Query teste executada com sucesso:', result[0][0].now);
    
    // Listar as tabelas existentes
    console.log('Verificando tabelas existentes...');
    const tables = await sequelize.query(
      `SELECT table_name 
       FROM information_schema.tables 
       WHERE table_schema = 'public'
       ORDER BY table_name;`
    );
    
    console.log('Tabelas encontradas:', tables[0].map(t => t.table_name).join(', '));
    
    // Verificar se existem produtos
    console.log('Verificando quantidade de produtos...');
    try {
      const products = await sequelize.query('SELECT COUNT(*) FROM products');
      console.log(`Total de produtos: ${products[0][0].count}`);
    } catch (err) {
      console.error('Erro ao contar produtos:', err.message);
    }
    
    // Query product count
    const [productCountResult] = await sequelize.query('SELECT COUNT(*) FROM products');
    const productCount = parseInt(productCountResult[0].count, 10);
    console.log(`Total products in database: ${productCount}`);
    
    if (productCount > 0) {
      // Query sample products
      const [products] = await sequelize.query(
        'SELECT id, code, name, producer_id, category_id FROM products LIMIT 5'
      );
      console.log('Sample products:', JSON.stringify(products, null, 2));
      
      // Query product relationships
      console.log('\nChecking relationships...');
      const productId = products[0]?.id;
      
      if (productId) {
        // Check if product has images
        const [images] = await sequelize.query(
          `SELECT COUNT(*) FROM images WHERE product_id = ${productId}`
        );
        console.log(`Product #${productId} has ${images[0].count} images`);
        
        // Check if product has variants
        const [variants] = await sequelize.query(
          `SELECT COUNT(*) FROM variants WHERE product_id = ${productId}`
        );
        console.log(`Product #${productId} has ${variants[0].count} variants`);
      }
    }

    // Check product table schema
    console.log('\nChecking product table schema...');
    const [columns] = await sequelize.query(
      `SELECT column_name, data_type, is_nullable
       FROM information_schema.columns
       WHERE table_name = 'products'
       ORDER BY ordinal_position;`
    );
    console.log('Product table columns:', JSON.stringify(columns, null, 2));

    // After checking product table schema
    // Check categories table schema
    console.log('\nChecking categories table schema...');
    const [categoryColumns] = await sequelize.query(
      `SELECT column_name, data_type, is_nullable
       FROM information_schema.columns
       WHERE table_name = 'categories'
       ORDER BY ordinal_position;`
    );
    console.log('Categories table columns:', JSON.stringify(categoryColumns, null, 2));

    // Check prices table schema
    console.log('\nChecking prices table schema...');
    const [priceColumns] = await sequelize.query(
      `SELECT column_name, data_type, is_nullable
       FROM information_schema.columns
       WHERE table_name = 'prices'
       ORDER BY ordinal_position;`
    );
    console.log('Prices table columns:', JSON.stringify(priceColumns, null, 2));

    // Check variants table schema
    console.log('\nChecking variants table schema...');
    const [variantColumns] = await sequelize.query(
      `SELECT column_name, data_type, is_nullable
       FROM information_schema.columns
       WHERE table_name = 'variants'
       ORDER BY ordinal_position;`
    );
    console.log('Variants table columns:', JSON.stringify(variantColumns, null, 2));
  } catch (error) {
    console.error('❌ Erro ao conectar ao banco de dados:', error);
  } finally {
    // Fechar a conexão
    await sequelize.close();
    console.log('Conexão fechada.');
  }
}

// Executar o teste
testConnection(); 