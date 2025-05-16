import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

const DB_URL = process.env.POSTGRES_URL || process.env.DATABASE_URL || process.env.NEON_DB_URL;

const sequelize = new Sequelize(DB_URL, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: { require: true, rejectUnauthorized: false }
  },
  logging: false
});

async function inspect() {
  try {
    await sequelize.authenticate();
    console.log('Conexão com o banco estabelecida.');

    try {
      const [products] = await sequelize.query('SELECT * FROM products LIMIT 10');
      console.log('\nTabela products:');
      console.table(products);
    } catch (e) {
      console.error('Erro ao consultar tabela products:', e.message);
    }

    try {
      const [users] = await sequelize.query('SELECT id, email, role, status, first_name, last_name FROM users');
      console.log('\nTabela users:');
      console.table(users);
    } catch (e) {
      console.error('Erro ao consultar tabela users:', e.message);
    }
  } catch (err) {
    console.error('Erro ao conectar ao banco:', err);
  } finally {
    await sequelize.close();
  }
}

inspect();
