// Test if pg dependency is properly installed
console.log('Starting PG dependency test...');

try {
  console.log('Attempting to import pg...');
  const pg = await import('pg');
  console.log('PG dependency test:');
  console.log('pg package version:', pg.version);
  console.log('pg package successfully imported');

  // Test creating a client
  try {
    console.log('Testing Client creation from pg...');
    const { Client } = pg;
    const client = new Client({
      connectionString: process.env.NEON_DB_URL || 'postgresql://user:password@localhost:5432/dbname',
      ssl: {
        rejectUnauthorized: false
      }
    });
    console.log('Client instance created successfully');
    console.log('Client prototype methods available:', Object.getOwnPropertyNames(Client.prototype));
  } catch (error) {
    console.error('Error creating pg Client:', error);
  }
} catch (error) {
  console.error('Error importing pg package:', error);
  
  // Check if pg is in node_modules
  try {
    const fs = await import('fs');
    const path = await import('path');
    const pgPath = path.resolve('./node_modules/pg');
    
    console.log('Checking if pg package exists in node_modules...');
    if (fs.existsSync(pgPath)) {
      console.log('pg package directory exists at:', pgPath);
      
      // List contents of pg directory
      const files = fs.readdirSync(pgPath);
      console.log('Files in pg package directory:', files);
      
      // Check package.json
      if (fs.existsSync(path.join(pgPath, 'package.json'))) {
        const pgPackageJson = JSON.parse(fs.readFileSync(path.join(pgPath, 'package.json'), 'utf8'));
        console.log('pg package.json version:', pgPackageJson.version);
      } else {
        console.log('pg package.json not found');
      }
    } else {
      console.log('pg package not found in node_modules');
    }
  } catch (fsError) {
    console.error('Error checking pg in node_modules:', fsError);
  }
}

// Check environment config
console.log('\nEnvironment configuration:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('NEON_DB_URL exists:', !!process.env.NEON_DB_URL);
console.log('POSTGRES_URL exists:', !!process.env.POSTGRES_URL);
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL); 