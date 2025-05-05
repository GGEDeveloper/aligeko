'use strict';
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add demo admin user
    await queryInterface.bulkInsert('users', [
      {
        id: 'e9a15907-72f3-4f7e-8d20-4b9a40e3783a',
        name: 'Admin User',
        email: 'admin@alitools.com.br',
        password: await bcrypt.hash('Admin@123', 10),
        role: 'admin',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '7c40eff3-476c-4b57-bd0d-1d73ab1745d3',
        name: 'Manager User',
        email: 'manager@alitools.com.br',
        password: await bcrypt.hash('Manager@123', 10),
        role: 'manager',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '4f9b6c15-d910-4f9b-9d2c-cf7a1d378d9e',
        name: 'Sales User',
        email: 'sales@alitools.com.br',
        password: await bcrypt.hash('Sales@123', 10),
        role: 'sales',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 'a52e09c6-71e8-4911-af83-8b6dbb0ef9b7',
        name: 'Customer 1',
        email: 'customer1@example.com',
        password: await bcrypt.hash('Customer@123', 10),
        role: 'customer',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 'f7b67c3a-5a9d-4f7e-8d5c-9a1b0c3d2e5f',
        name: 'Customer 2',
        email: 'customer2@example.com',
        password: await bcrypt.hash('Customer@123', 10),
        role: 'customer',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', null, {});
  }
}; 