require('dotenv').config();
const { Sequelize } = require('sequelize');

console.log('Checking migration status in Neon PostgreSQL database...');
console.log('NEON_DB_URL:', process.env.NEON_DB_URL);

const sequelize = new Sequelize(process.env.NEON_DB_URL, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
});

async function checkMigrations() {
  try {
    await sequelize.authenticate();
    console.log('Connection to Neon DB has been established successfully!');
    
    // Check if SequelizeMeta table exists
    try {
      const [results] = await sequelize.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'SequelizeMeta'
        );
      `);
      
      if (results[0].exists) {
        console.log('SequelizeMeta table exists. Checking executed migrations...');
        
        const [migrations] = await sequelize.query('SELECT * FROM "SequelizeMeta" ORDER BY name');
        console.log('Executed migrations:');
        migrations.forEach(migration => {
          console.log(`- ${migration.name}`);
        });
      } else {
        console.log('SequelizeMeta table does not exist. No migrations have been executed.');
      }
      
      // Check all tables in the database
      const [tables] = await sequelize.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name;
      `);
      
      console.log('\nExisting tables in the database:');
      if (tables.length === 0) {
        console.log('No tables found.');
      } else {
        tables.forEach(table => {
          console.log(`- ${table.table_name}`);
        });
      }
    } catch (error) {
      console.error('Error checking migrations:', error);
    }
    
    // Close connection
    await sequelize.close();
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

checkMigrations(); 