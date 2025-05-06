require('dotenv').config();
const { Sequelize } = require('sequelize');

console.log('Connecting to Neon PostgreSQL database to drop carts table...');

const sequelize = new Sequelize(process.env.NEON_DB_URL, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
});

async function dropCartsTables() {
  try {
    await sequelize.authenticate();
    console.log('Connection to Neon DB has been established successfully!');
    
    // First check if tables exist
    const [tables] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      AND table_name IN ('carts', 'cart_items')
      ORDER BY table_name;
    `);
    
    console.log('Tables to be dropped:', tables.map(t => t.table_name).join(', '));
    
    // Drop tables in the correct order (cart_items first if it exists)
    if (tables.some(t => t.table_name === 'cart_items')) {
      console.log('Dropping cart_items table...');
      await sequelize.query('DROP TABLE IF EXISTS "cart_items" CASCADE;');
      console.log('cart_items table dropped successfully.');
    }
    
    if (tables.some(t => t.table_name === 'carts')) {
      console.log('Dropping carts table...');
      await sequelize.query('DROP TABLE IF EXISTS "carts" CASCADE;');
      console.log('carts table dropped successfully.');
    }
    
    console.log('Tables dropped successfully.');
    
    // Close connection
    await sequelize.close();
  } catch (error) {
    console.error('Error dropping tables:', error);
  }
}

dropCartsTables(); 