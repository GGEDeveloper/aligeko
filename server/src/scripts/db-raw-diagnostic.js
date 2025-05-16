import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

const POSTGRES_URL = process.env.POSTGRES_URL || process.env.NEON_DB_URL || process.env.DATABASE_URL;
const sequelize = new Sequelize(POSTGRES_URL, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: { ssl: { require: true, rejectUnauthorized: false } }
});

async function getTableInfo(tableName) {
  try {
    const [columns] = await sequelize.query(
      `SELECT column_name, data_type, is_nullable 
       FROM information_schema.columns 
       WHERE table_name = '${tableName}'`
    );
    return columns;
  } catch (error) {
    console.error(`Erro ao obter informações da tabela ${tableName}:`, error.message);
    return [];
  }
}

async function getRecordCount(tableName) {
  try {
    const [result] = await sequelize.query(`SELECT COUNT(*) as count FROM ${tableName}`);
    return result[0]?.count || 0;
  } catch (error) {
    console.error(`Erro ao contar registros da tabela ${tableName}:`, error.message);
    return -1;
  }
}

async function checkRelationships() {
  const relationships = [
    {
      name: 'Produtos sem categoria válida',
      query: `SELECT COUNT(*) as count FROM products p 
              LEFT JOIN categories c ON p.category_id = c.id 
              WHERE p.category_id IS NULL OR c.id IS NULL`
    },
    {
      name: 'Produtos sem fabricante válido',
      query: `SELECT COUNT(*) as count FROM products p 
              LEFT JOIN producers pr ON p.producer_id = pr.id 
              WHERE p.producer_id IS NULL OR pr.id IS NULL`
    },
    {
      name: 'Produtos sem unidade válida',
      query: `SELECT COUNT(*) as count FROM products p 
              LEFT JOIN units u ON p.unit_id = u.id 
              WHERE p.unit_id IS NULL OR u.id IS NULL`
    },
    {
      name: 'Produtos sem imagens',
      query: `SELECT COUNT(DISTINCT p.id) as count 
              FROM products p 
              LEFT JOIN images i ON p.id = i.product_id 
              WHERE i.id IS NULL`
    }
  ];

  const results = [];
  for (const rel of relationships) {
    try {
      const [result] = await sequelize.query(rel.query);
      results.push({
        name: rel.name,
        count: result[0]?.count || 0
      });
    } catch (error) {
      console.error(`Erro ao verificar relação: ${rel.name}`, error.message);
      results.push({
        name: rel.name,
        count: -1,
        error: error.message
      });
    }
  }
  return results;
}

async function getTopCategories() {
  try {
    const [categories] = await sequelize.query(`
      SELECT c.id, c.name, COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id
      GROUP BY c.id, c.name
      ORDER BY product_count DESC
      LIMIT 10
    `);
    return categories;
  } catch (error) {
    console.error('Erro ao buscar categorias:', error.message);
    return [];
  }
}

async function generateReport() {
  console.log('🔍 Iniciando diagnóstico detalhado do banco de dados...\n');
  
  // 1. Listar todas as tabelas
  const [tables] = await sequelize.query(
    "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
  );
  
  console.log('📋 TABELAS NO BANCO DE DADOS');
  console.log('----------------------------');
  for (const table of tables) {
    console.log(`- ${table.table_name}`);
  }
  console.log('');

  // 2. Coletar informações detalhadas das tabelas principais
  const mainTables = ['products', 'categories', 'producers', 'units', 'images'];
  for (const table of mainTables) {
    if (!tables.some(t => t.table_name === table)) {
      console.log(`⚠️  Tabela ${table} não encontrada no banco de dados!`);
      continue;
    }
    
    const columns = await getTableInfo(table);
    const count = await getRecordCount(table);
    
    console.log(`\n📊 TABELA: ${table.toUpperCase()} (${count} registros)`);
    console.log('----------------------------');
    console.table(columns);
  }

  // 3. Verificar relacionamentos
  console.log('\n🔗 VERIFICAÇÃO DE RELACIONAMENTOS');
  console.log('--------------------------------');
  const relationships = await checkRelationships();
  console.table(relationships);

  // 4. Top categorias
  console.log('\n🏆 TOP 10 CATEGORIAS MAIS UTILIZADAS');
  console.log('----------------------------------');
  const topCategories = await getTopCategories();
  console.table(topCategories);

  // 5. Exemplo de produtos problemáticos
  console.log('\n🔍 EXEMPLO DE PRODUTOS SEM CATEGORIA VÁLIDA');
  console.log('-----------------------------------------');
  const [problematicProducts] = await sequelize.query(`
    SELECT p.id, p.name, p.category_id 
    FROM products p 
    LEFT JOIN categories c ON p.category_id = c.id 
    WHERE p.category_id IS NULL OR c.id IS NULL
    LIMIT 5
  `);
  console.table(problematicProducts);

  console.log('\n✅ Diagnóstico concluído!');
}

generateReport()
  .catch(console.error)
  .finally(() => sequelize.close());
