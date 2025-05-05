'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('customers', [
      {
        id: 'c5a8f94d-5eb6-4e94-a08d-9a9f68c6c19d',
        user_id: 'a52e09c6-71e8-4911-af83-8b6dbb0ef9b7', // Customer 1 from users seed
        company_name: 'Ferramentas Express Ltda.',
        tax_id: '12345678901234',
        state_tax_id: 'ISENTO',
        business_phone: '11987654321',
        business_type: 'retail',
        credit_limit: 5000.00,
        payment_terms: 'net30',
        notes: 'Preferred customer, fast payments.',
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 'd2e7f8a9-b0c1-4d2e-8f3d-9a7b6c5d4e3f',
        user_id: 'f7b67c3a-5a9d-4f7e-8d5c-9a1b0c3d2e5f', // Customer 2 from users seed
        company_name: 'Construções e Reformas SA',
        tax_id: '98765432109876',
        state_tax_id: '987654321',
        business_phone: '11976543210',
        business_type: 'construction',
        credit_limit: 10000.00,
        payment_terms: 'net45',
        notes: 'Large orders, seasonal purchases.',
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('customers', null, {});
  }
}; 