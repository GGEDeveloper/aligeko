'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Seed orders
    await queryInterface.bulkInsert('orders', [
      {
        id: 'd1e2f3a4-5b6c-7d8e-9f0a-1b2c3d4e5f6a',
        customer_id: 'c5a8f94d-5eb6-4e94-a08d-9a9f68c6c19d', // Ferramentas Express
        order_number: 'PED-2025-0001',
        status: 'completed',
        total_amount: 459.60,
        discount_amount: 0,
        shipping_amount: 30.00,
        tax_amount: 41.78,
        net_amount: 387.82,
        payment_method: 'credit_card',
        payment_status: 'paid',
        shipping_address_id: 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e', // Shipping address
        billing_address_id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', // Billing address
        notes: 'Pedido urgente para obra',
        created_at: new Date('2025-05-10T14:30:00Z'),
        updated_at: new Date('2025-05-10T14:45:00Z')
      },
      {
        id: 'e2f3a4b5-6c7d-8e9f-0a1b-2c3d4e5f6a7b',
        customer_id: 'd2e7f8a9-b0c1-4d2e-8f3d-9a7b6c5d4e3f', // Construções e Reformas
        order_number: 'PED-2025-0002',
        status: 'processing',
        total_amount: 2159.70,
        discount_amount: 215.97,
        shipping_amount: 0,
        tax_amount: 176.76,
        net_amount: 1766.97,
        payment_method: 'bank_transfer',
        payment_status: 'pending',
        shipping_address_id: 'd4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a', // Shipping address
        billing_address_id: 'c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f', // Billing address
        notes: 'Desconto de 10% conforme negociado com gerente de vendas',
        created_at: new Date('2025-05-15T10:15:00Z'),
        updated_at: new Date('2025-05-15T10:15:00Z')
      }
    ]);

    // Seed order items
    await queryInterface.bulkInsert('order_items', [
      {
        id: 1,
        order_id: 'd1e2f3a4-5b6c-7d8e-9f0a-1b2c3d4e5f6a', // First order
        variant_id: 6, // Martelo de Unha
        quantity: 2,
        unit_price: 59.90,
        total_price: 119.80,
        discount: 0,
        tax_rate: 10,
        tax_amount: 11.98,
        created_at: new Date('2025-05-10T14:30:00Z'),
        updated_at: new Date('2025-05-10T14:30:00Z')
      },
      {
        id: 2,
        order_id: 'd1e2f3a4-5b6c-7d8e-9f0a-1b2c3d4e5f6a', // First order
        variant_id: 7, // Parafusos
        quantity: 5,
        unit_price: 28.90,
        total_price: 144.50,
        discount: 0,
        tax_rate: 10,
        tax_amount: 14.45,
        created_at: new Date('2025-05-10T14:30:00Z'),
        updated_at: new Date('2025-05-10T14:30:00Z')
      },
      {
        id: 3,
        order_id: 'd1e2f3a4-5b6c-7d8e-9f0a-1b2c3d4e5f6a', // First order
        variant_id: 5, // Kit chaves de fenda
        quantity: 1,
        unit_price: 89.90,
        total_price: 89.90,
        discount: 0,
        tax_rate: 10,
        tax_amount: 8.99,
        created_at: new Date('2025-05-10T14:30:00Z'),
        updated_at: new Date('2025-05-10T14:30:00Z')
      },
      {
        id: 4,
        order_id: 'e2f3a4b5-6c7d-8e9f-0a1b-2c3d4e5f6a7b', // Second order
        variant_id: 1, // Furadeira 220V
        quantity: 3,
        unit_price: 429.90,
        total_price: 1289.70,
        discount: 128.97,
        tax_rate: 10,
        tax_amount: 116.07,
        created_at: new Date('2025-05-15T10:15:00Z'),
        updated_at: new Date('2025-05-15T10:15:00Z')
      },
      {
        id: 5,
        order_id: 'e2f3a4b5-6c7d-8e9f-0a1b-2c3d4e5f6a7b', // Second order
        variant_id: 3, // Serra Circular 220V
        quantity: 1,
        unit_price: 689.90,
        total_price: 689.90,
        discount: 68.99,
        tax_rate: 10,
        tax_amount: 62.09,
        created_at: new Date('2025-05-15T10:15:00Z'),
        updated_at: new Date('2025-05-15T10:15:00Z')
      },
      {
        id: 6,
        order_id: 'e2f3a4b5-6c7d-8e9f-0a1b-2c3d4e5f6a7b', // Second order
        variant_id: 5, // Kit chaves de fenda
        quantity: 2,
        unit_price: 89.90,
        total_price: 179.80,
        discount: 17.98,
        tax_rate: 10,
        tax_amount: 16.18,
        created_at: new Date('2025-05-15T10:15:00Z'),
        updated_at: new Date('2025-05-15T10:15:00Z')
      }
    ]);

    // Seed shipments
    await queryInterface.bulkInsert('shipments', [
      {
        id: 'f3a4b5c6-d7e8-f9a0-b1c2-d3e4f5a6b7c8',
        order_id: 'd1e2f3a4-5b6c-7d8e-9f0a-1b2c3d4e5f6a', // First order
        tracking_number: 'TR123456789BR',
        carrier: 'Transportadora Express',
        shipping_method: 'standard',
        status: 'delivered',
        shipped_date: new Date('2025-05-11T09:00:00Z'),
        estimated_delivery: new Date('2025-05-14T00:00:00Z'),
        delivered_date: new Date('2025-05-13T14:25:00Z'),
        notes: 'Entregue no endereço comercial',
        created_at: new Date('2025-05-11T09:00:00Z'),
        updated_at: new Date('2025-05-13T14:25:00Z')
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('shipments', null, {});
    await queryInterface.bulkDelete('order_items', null, {});
    await queryInterface.bulkDelete('orders', null, {});
  }
}; 