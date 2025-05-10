import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

async function main() {
  let sequelize = null;
  
  try {
    // Create a connection to the database
    sequelize = new Sequelize(process.env.NEON_DB_URL, {
      dialect: 'postgres',
      logging: false,
      ssl: true,
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      }
    });

    // Test the connection
    await sequelize.authenticate();
    console.log('Connected to database.');

    // Check counts
    const tables = ['products', 'variants', 'prices', 'images', 'categories', 'producers', 'units'];
    
    for (const table of tables) {
      const [result] = await sequelize.query(`SELECT COUNT(*) FROM ${table}`);
      console.log(`${table.charAt(0).toUpperCase() + table.slice(1)} count: ${result[0].count}`);
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    if (sequelize) {
      await sequelize.close();
    }
  }
}

main(); 