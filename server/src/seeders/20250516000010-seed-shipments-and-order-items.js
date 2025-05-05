'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Seed shipments
    await queryInterface.bulkInsert('shipments', [
      {
        id: 1,
        order_id: 1,
        tracking_number: 'SP12345678BR',
        carrier: 'Correios',
        shipping_method: 'PAC',
        status: 'delivered',
        shipped_at: new Date(2025, 4, 18),
        estimated_delivery: new Date(2025, 4, 25),
        delivered_at: new Date(2025, 4, 24),
        shipping_cost: 35.50,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 2,
        order_id: 2,
        tracking_number: 'SP87654321BR',
        carrier: 'Correios',
        shipping_method: 'SEDEX',
        status: 'in_transit',
        shipped_at: new Date(2025, 4, 20),
        estimated_delivery: new Date(2025, 4, 23),
        delivered_at: null,
        shipping_cost: 48.90,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 3,
        order_id: 3,
        tracking_number: 'SP11223344BR',
        carrier: 'Transportadora Nacional',
        shipping_method: 'Standard',
        status: 'processing',
        shipped_at: null,
        estimated_delivery: new Date(2025, 4, 30),
        delivered_at: null,
        shipping_cost: 79.90,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    // Seed order items
    await queryInterface.bulkInsert('order_items', [
      {
        id: 1,
        order_id: 1,
        variant_id: 1, // Furadeira 220V
        quantity: 1,
        unit_price: 299.90, // Discounted price
        total_price: 299.90,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 2,
        order_id: 1,
        variant_id: 5, // Conjunto de Chaves
        quantity: 2,
        unit_price: 79.90, // Discounted price
        total_price: 159.80,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 3,
        order_id: 2,
        variant_id: 3, // Serra Circular 220V
        quantity: 1,
        unit_price: 549.90, // Discounted price
        total_price: 549.90,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 4,
        order_id: 2,
        variant_id: 6, // Martelo
        quantity: 1,
        unit_price: 45.90,
        total_price: 45.90,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 5,
        order_id: 3,
        variant_id: 4, // Serra Circular 110V
        quantity: 2,
        unit_price: 599.90,
        total_price: 1199.80,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 6,
        order_id: 3,
        variant_id: 7, // Parafusos
        quantity: 5,
        unit_price: 15.90, // Discounted price
        total_price: 79.50,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('order_items', null, {});
    await queryInterface.bulkDelete('shipments', null, {});
  }
}; 