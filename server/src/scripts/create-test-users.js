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

const users = [
  {
    id: 'e9a15907-72f3-4f7e-8d20-4b9a40e3783a',
    name: 'Admin User',
    email: 'admin@alitools.com.br',
    password: 'Admin@123',
    role: 'admin',
    is_active: true
  },
  {
    id: 'a52e09c6-71e8-4911-af83-8b6dbb0ef9b7',
    name: 'Customer 1',
    email: 'customer1@example.com',
    password: 'Customer@123',
    role: 'customer',
    is_active: true
  },
  {
    id: 'f7b67c3a-5a9d-4f7e-8d5c-9a1b0c3d2e5f',
    name: 'Customer 2',
    email: 'customer2@example.com',
    password: 'Customer@123',
    role: 'customer',
    is_active: true
  }
];

async function main() {
  try {
    await sequelize.authenticate();
    for (const user of users) {
      const hash = await bcrypt.hash(user.password, 10);
      await sequelize.query(
        `INSERT INTO users (id, name, email, password, role, is_active, created_at, updated_at)
         VALUES (:id, :name, :email, :password, :role, :is_active, NOW(), NOW())
         ON CONFLICT (email) DO NOTHING`,
        { replacements: { ...user, password: hash } }
      );
      console.log(`User ${user.email} created (or already exists)`);
    }
    await sequelize.close();
    console.log('Done.');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

main();
