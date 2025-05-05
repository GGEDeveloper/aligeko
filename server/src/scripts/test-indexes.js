/**
 * Script to test database indexes by querying data with EXPLAIN ANALYZE
 * This helps verify that indexes are being used properly
 */

import sequelize from '../config/database';
import '../models'; // Import models to register them with Sequelize

const testQueries = async () => {
  try {
    // Connect to database
    await sequelize.authenticate();
    console.log('Database connection successful');

    // Test product name index
    console.log('\n--- Testing product name index ---');
    const productNameQuery = await sequelize.query(
      "EXPLAIN ANALYZE SELECT * FROM products WHERE name LIKE '%tool%'",
      { type: sequelize.QueryTypes.SELECT }
    );
    console.log(productNameQuery);

    // Test variant composite index
    console.log('\n--- Testing variant composite index ---');
    const variantCompositeQuery = await sequelize.query(
      'EXPLAIN ANALYZE SELECT * FROM variants WHERE product_id = 1 AND code = \'ABC123\'',
      { type: sequelize.QueryTypes.SELECT }
    );
    console.log(variantCompositeQuery);

    // Test stock variant_id index
    console.log('\n--- Testing stock variant_id index ---');
    const stockVariantQuery = await sequelize.query(
      'EXPLAIN ANALYZE SELECT * FROM stock WHERE variant_id = 1',
      { type: sequelize.QueryTypes.SELECT }
    );
    console.log(stockVariantQuery);

    // Test warehouse_id index
    console.log('\n--- Testing warehouse_id index ---');
    const warehouseQuery = await sequelize.query(
      'EXPLAIN ANALYZE SELECT * FROM stock WHERE warehouse_id = \'MAIN\'',
      { type: sequelize.QueryTypes.SELECT }
    );
    console.log(warehouseQuery);

    // Test customer tax_id index
    console.log('\n--- Testing customer tax_id index ---');
    const customerTaxIdQuery = await sequelize.query(
      'EXPLAIN ANALYZE SELECT * FROM customers WHERE tax_id = \'123456789\'',
      { type: sequelize.QueryTypes.SELECT }
    );
    console.log(customerTaxIdQuery);

    // Test address compound index
    console.log('\n--- Testing address compound index ---');
    const addressCompoundQuery = await sequelize.query(
      'EXPLAIN ANALYZE SELECT * FROM addresses WHERE customer_id = \'123e4567-e89b-12d3-a456-426614174000\' AND type = \'shipping\' AND is_default = true',
      { type: sequelize.QueryTypes.SELECT }
    );
    console.log(addressCompoundQuery);

    console.log('\nAll index tests completed');
  } catch (error) {
    console.error('Error testing indexes:', error);
  } finally {
    await sequelize.close();
  }
};

// Run the test
testQueries(); 