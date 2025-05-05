'use strict';

/**
 * Migration to add additional performance indexes to the database.
 * This complements the indexes already created in the base tables migration.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Additional indexes for prices table (frequent price lookups)
    await queryInterface.addIndex('prices', ['variant_id'], {
      name: 'idx_prices_variant_id'
    });

    // Index for images lookups
    await queryInterface.addIndex('images', ['product_id'], {
      name: 'idx_images_product_id'
    });

    // Index for customer lookups
    await queryInterface.addIndex('customers', ['user_id'], {
      name: 'idx_customers_user_id'
    });
    
    await queryInterface.addIndex('customers', ['tax_id'], {
      name: 'idx_customers_tax_id'
    });

    // Index for addresses (useful for finding a customer's addresses quickly)
    await queryInterface.addIndex('addresses', ['customer_id'], {
      name: 'idx_addresses_customer_id'
    });

    // Useful compound index for addresses (find default shipping/billing address)
    await queryInterface.addIndex('addresses', ['customer_id', 'type', 'is_default'], {
      name: 'idx_addresses_customer_defaults'
    });

    // Add indexes for product code and EAN (frequently used in searches)
    await queryInterface.addIndex('products', ['code'], {
      name: 'idx_products_code'
    });
    
    await queryInterface.addIndex('products', ['ean'], {
      name: 'idx_products_ean'
    });

    // Index for warehouse stock (finding all stock in a specific warehouse)
    await queryInterface.addIndex('stock', ['warehouse_id'], {
      name: 'idx_stock_warehouse_id'
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove the indexes in reverse order
    await queryInterface.removeIndex('stock', 'idx_stock_warehouse_id');
    await queryInterface.removeIndex('products', 'idx_products_ean');
    await queryInterface.removeIndex('products', 'idx_products_code');
    await queryInterface.removeIndex('addresses', 'idx_addresses_customer_defaults');
    await queryInterface.removeIndex('addresses', 'idx_addresses_customer_id');
    await queryInterface.removeIndex('customers', 'idx_customers_tax_id');
    await queryInterface.removeIndex('customers', 'idx_customers_user_id');
    await queryInterface.removeIndex('images', 'idx_images_product_id');
    await queryInterface.removeIndex('prices', 'idx_prices_variant_id');
  }
}; 