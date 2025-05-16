import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

const POSTGRES_URL = process.env.POSTGRES_URL || process.env.NEON_DB_URL || process.env.DATABASE_URL;
const sequelize = new Sequelize(POSTGRES_URL, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: { ssl: { require: true, rejectUnauthorized: false } }
});

async function diagnoseProducts() {
  // 1. Produtos sem categoria
  const [noCategory] = await sequelize.query(`SELECT id, name FROM products WHERE category_id IS NULL OR TRIM(category_id::text) = ''`);
  // 2. Produtos sem produtor
  const [noProducer] = await sequelize.query(`SELECT id, name FROM products WHERE producer_id IS NULL OR TRIM(producer_id::text) = ''`);
  // 3. Produtos sem unidade
  const [noUnit] = await sequelize.query(`SELECT id, name FROM products WHERE unit_id IS NULL OR TRIM(unit_id::text) = ''`);

  // 4. Produtos com status diferente de active
  const [notActive] = await sequelize.query("SELECT id, name, status FROM products WHERE status IS DISTINCT FROM 'active'");

  // 5. Produtos sem imagens
  const [noImage] = await sequelize.query('SELECT p.id, p.name FROM products p LEFT JOIN images i ON i.product_id = p.id WHERE i.id IS NULL');

  // 6. Contagem total
  const [[{ count }]] = await sequelize.query('SELECT COUNT(*)::int as count FROM products');

  console.log('==== Diagnóstico dos Produtos ====');
  console.log(`Total de produtos: ${count}`);
  console.log('----------------------------------');
  if (noCategory.length > 0) {
    console.log(`Produtos sem categoria (${noCategory.length}):`);
    noCategory.forEach(p => console.log(`- [${p.id}] ${p.name}`));
  } else {
    console.log('Todos os produtos têm categoria.');
  }
  console.log('----------------------------------');
  if (noProducer.length > 0) {
    console.log(`Produtos sem produtor (${noProducer.length}):`);
    noProducer.forEach(p => console.log(`- [${p.id}] ${p.name}`));
  } else {
    console.log('Todos os produtos têm produtor.');
  }
  console.log('----------------------------------');
  if (noUnit.length > 0) {
    console.log(`Produtos sem unidade (${noUnit.length}):`);
    noUnit.forEach(p => console.log(`- [${p.id}] ${p.name}`));
  } else {
    console.log('Todos os produtos têm unidade.');
  }
  console.log('----------------------------------');
  if (notActive.length > 0) {
    console.log(`Produtos com status diferente de active (${notActive.length}):`);
    notActive.forEach(p => console.log(`- [${p.id}] ${p.name} (status: ${p.status})`));
  } else {
    console.log('Todos os produtos têm status active.');
  }
  console.log('----------------------------------');
  if (noImage.length > 0) {
    console.log(`Produtos sem imagem (${noImage.length}):`);
    noImage.forEach(p => console.log(`- [${p.id}] ${p.name}`));
  } else {
    console.log('Todos os produtos têm pelo menos uma imagem.');
  }
  console.log('==== Fim do Diagnóstico ====');

  await sequelize.close();
}

diagnoseProducts().catch(e => {
  console.error('Erro ao diagnosticar produtos:', e.message);
  process.exit(1);
});
