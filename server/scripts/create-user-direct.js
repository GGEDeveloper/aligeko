// This script creates a user directly in the database
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Database connection configuration
const pool = new Pool({
  connectionString: process.env.NEON_DB_URL || process.env.DATABASE_URL || process.env.POSTGRES_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function createUser() {
  const client = await pool.connect();
  
  try {
    // Start transaction
    await client.query('BEGIN');
    
    // Check if user already exists
    const checkUser = await client.query(
      'SELECT id FROM users WHERE email = $1', 
      ['mike@mike.mike']
    );
    
    if (checkUser.rows.length > 0) {
      console.log('User with email mike@mike.mike already exists');
      return;
    }
    
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('mikemeu', salt);
    
    // Insert the user
    const result = await client.query(
      `INSERT INTO users (
        email, 
        password, 
        first_name, 
        last_name, 
        role, 
        status, 
        two_factor_enabled,
        created_at,
        updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW()) RETURNING id, email`,
      [
        'mike@mike.mike',
        hashedPassword,
        'Mike',
        'User',
        'admin',
        'active',
        false
      ]
    );
    
    await client.query('COMMIT');
    console.log('User created successfully:', result.rows[0]);
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating user:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the function
createUser();
