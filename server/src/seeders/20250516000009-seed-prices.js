'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Seed prices for product variants
    await queryInterface.bulkInsert('prices', [
      {
        id: 1,
        variant_id: 1, // Furadeira 220V
        price: 349.90,
        discount_price: 299.90,
        discount_start_date: new Date(2025, 5, 1),
        discount_end_date: new Date(2025, 5, 30),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 2,
        variant_id: 2, // Furadeira 110V
        price: 349.90,
        discount_price: 299.90,
        discount_start_date: new Date(2025, 5, 1),
        discount_end_date: new Date(2025, 5, 30),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 3,
        variant_id: 3, // Serra Circular 220V
        price: 599.90,
        discount_price: 549.90,
        discount_start_date: new Date(2025, 5, 1),
        discount_end_date: new Date(2025, 5, 30),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 4,
        variant_id: 4, // Serra Circular 110V
        price: 599.90,
        discount_price: null,
        discount_start_date: null,
        discount_end_date: null,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 5,
        variant_id: 5, // Conjunto de Chaves
        price: 89.90,
        discount_price: 79.90,
        discount_start_date: new Date(2025, 5, 1),
        discount_end_date: new Date(2025, 5, 30),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 6,
        variant_id: 6, // Martelo
        price: 45.90,
        discount_price: null,
        discount_start_date: null,
        discount_end_date: null,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 7,
        variant_id: 7, // Parafusos
        price: 18.90,
        discount_price: 15.90,
        discount_start_date: new Date(2025, 5, 1),
        discount_end_date: new Date(2025, 5, 30),
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('prices', null, {});
  }
}; 