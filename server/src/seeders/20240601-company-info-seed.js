'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('company_info', [
      {
        address: 'Rua Exemplo, 123, Lisboa, Portugal',
        phone: '(+351) 96 396 59 03',
        email: 'alimamedetools@gmail.com',
        businessHours: 'Segunda a Sexta: 9:00 às 12:30 - 14:00 às 18:30',
        facebook: 'https://facebook.com/alimamedetools',
        instagram: 'https://instagram.com/alimamedetools',
        linkedin: '',
        whatsapp: '',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('company_info', null, {});
  }
}; 