import { Sequelize } from 'sequelize';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

const POSTGRES_URL = process.env.POSTGRES_URL || process.env.DATABASE_URL;

const sequelize = new Sequelize(POSTGRES_URL, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: { require: true, rejectUnauthorized: false }
  }
});

async function showTables() {
  const [results] = await sequelize.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
  console.log('Tabelas no schema public:');
  results.forEach(r => console.log('- ' + r.table_name));
}

async function describeUsers() {
  const [results] = await sequelize.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users'");
  if (results.length === 0) {
    console.log('Tabela users não existe.');
    return [];
  }
  console.log('\nSchema da tabela users:');
  results.forEach(r => console.log(`- ${r.column_name} (${r.data_type})`));
  return results.map(r => r.column_name);
}

async function createTestUsers(existingColumns) {
  const baseUsers = [
    {
      id: 'e9a15907-72f3-4f7e-8d20-4b9a40e3783a',
      email: 'admin@alitools.com.br',
      password: 'Admin@123',
      role: 'admin'
    },
    {
      id: 'a52e09c6-71e8-4911-af83-8b6dbb0ef9b7',
      email: 'customer1@example.com',
      password: 'Customer@123',
      role: 'customer'
    },
    {
      id: 'f7b67c3a-5a9d-4f7e-8d5c-9a1b0c3d2e5f',
      email: 'customer2@example.com',
      password: 'Customer@123',
      role: 'customer'
    }
  ];
  for (const user of baseUsers) {
    const hash = await bcrypt.hash(user.password, 10);
    let insertCols = ['id','email','password','role'];
    let insertVals = [user.id, user.email, hash, user.role];
    if (existingColumns.includes('first_name')) {
      insertCols.push('first_name');
      insertVals.push(user.role === 'admin' ? 'Admin' : 'Customer');
    }
    if (existingColumns.includes('last_name')) {
      insertCols.push('last_name');
      insertVals.push(user.role === 'admin' ? 'User' : user.email.split('@')[0]);
    }
    if (existingColumns.includes('status')) {
      insertCols.push('status');
      insertVals.push('active');
    }
    if (existingColumns.includes('created_at')) {
      insertCols.push('created_at');
      insertVals.push(new Date());
    }
    if (existingColumns.includes('updated_at')) {
      insertCols.push('updated_at');
      insertVals.push(new Date());
    }
    const colSql = insertCols.map(col => `"${col}"`).join(', ');
    const valSql = insertVals.map((_,i) => `$${i+1}`).join(', ');
    const sql = `INSERT INTO users (${colSql}) VALUES (${valSql}) ON CONFLICT (email) DO NOTHING`;
    await sequelize.query(sql, { bind: insertVals });
    console.log(`User ${user.email} criado (ou já existe)`);
  }
}

async function inspectTables() {
  try {
    const [products] = await sequelize.query('SELECT * FROM products LIMIT 5');
    console.log('\nProdutos (até 5):');
    console.table(products);
  } catch (e) {
    console.error('Erro ao consultar tabela products:', e.message);
  }
  try {
    const [users] = await sequelize.query("SELECT id, email, role, status, first_name, last_name FROM users");
    console.log('\nUsuários:');
    console.table(users);
  } catch (e) {
    console.error('Erro ao consultar tabela users:', e.message);
  }
}

async function main() {
  try {
    await sequelize.authenticate();
    await showTables();
    const columns = await describeUsers();
    if (columns.length > 0) {
      await createTestUsers(columns);
    }
    await sequelize.close();
    console.log('\nPronto.');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

main();
