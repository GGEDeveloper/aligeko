import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

const POSTGRES_URL = process.env.POSTGRES_URL || process.env.NEON_DB_URL || process.env.DATABASE_URL;
const sequelize = new Sequelize(POSTGRES_URL, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: { ssl: { require: true, rejectUnauthorized: false } }
});

async function checkIntegrity() {
  // 1. List all foreign keys in products
  const [products] = await sequelize.query('SELECT id, category_id, producer_id, unit_id FROM products');
  const categoryIds = [...new Set(products.map(p => p.category_id).filter(Boolean))];
  const producerIds = [...new Set(products.map(p => p.producer_id).filter(Boolean))];
  const unitIds = [...new Set(products.map(p => p.unit_id).filter(Boolean))];

  // 2. Check which exist in categories
  const [categories] = await sequelize.query('SELECT id FROM categories');
  const [producers] = await sequelize.query('SELECT id FROM producers');
  const [units] = await sequelize.query('SELECT id FROM units');

  const missingCategories = categoryIds.filter(id => !categories.some(c => c.id == id));
  const missingProducers = producerIds.filter(id => !producers.some(p => p.id == id));
  const missingUnits = unitIds.filter(id => !units.some(u => u.id == id));

  if (missingCategories.length === 0 && missingProducers.length === 0 && missingUnits.length === 0) {
    console.log('Todas as referências de category_id, producer_id e unit_id em products são válidas.');
  } else {
    if (missingCategories.length > 0) {
      console.log('category_id inválidos encontrados em products:', missingCategories);
    }
    if (missingProducers.length > 0) {
      console.log('producer_id inválidos encontrados em products:', missingProducers);
    }
    if (missingUnits.length > 0) {
      console.log('unit_id inválidos encontrados em products:', missingUnits);
    }
  }

  await sequelize.close();
}

checkIntegrity().catch(e => {
  console.error('Erro ao checar integridade:', e.message);
  process.exit(1);
});
