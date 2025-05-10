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
  try {
    // Create a connection to the database
    const sequelize = new Sequelize(process.env.NEON_DB_URL, {
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

    // Get existing producers
    const [producers] = await sequelize.query(`
      SELECT * FROM producers ORDER BY id
    `);
    
    console.log('Existing producers:');
    producers.forEach(producer => {
      console.log(`- ID: ${producer.id}, Name: ${producer.name}, Created at: ${producer.created_at}`);
    });

    // Close the connection
    await sequelize.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

main(); 