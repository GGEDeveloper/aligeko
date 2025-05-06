require('dotenv').config();
const { Sequelize } = require('sequelize');

console.log('Testing connection to Neon PostgreSQL database...');
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

// Test database connection
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('Connection to Neon DB has been established successfully!');
    
    // Check tables
    try {
      const [results] = await sequelize.query('SELECT table_name FROM information_schema.tables WHERE table_schema = \'public\'');
      console.log('Existing tables:', results);
      
      if (results && results.length === 0) {
        console.log('No tables found. Database is empty.');
      } else if (!results) {
        console.log('No results returned. Database may be empty.');
      } else {
        console.log(`Found ${results.length} tables in the database.`);
      }
    } catch (error) {
      console.error('Error querying tables:', error);
    }
    
    // Close connection
    await sequelize.close();
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

testConnection(); 