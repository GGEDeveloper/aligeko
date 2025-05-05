'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Seed producers
    await queryInterface.bulkInsert('producers', [
      {
        id: 1,
        name: 'TechTools',
        code: 'TECH',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 2,
        name: 'ProBuilder',
        code: 'PROB',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 3,
        name: 'Bosch',
        code: 'BOSCH',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 4,
        name: 'DeWalt',
        code: 'DEWALT',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 5,
        name: 'Makita',
        code: 'MAKITA',
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    // Seed units
    await queryInterface.bulkInsert('units', [
      {
        id: 1,
        name: 'Unidade',
        code: 'UN',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 2,
        name: 'Caixa',
        code: 'CX',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 3,
        name: 'Pacote',
        code: 'PCT',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 4,
        name: 'Par',
        code: 'PAR',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 5,
        name: 'Conjunto',
        code: 'CONJ',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 6,
        name: 'Metro',
        code: 'M',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 7,
        name: 'Quilograma',
        code: 'KG',
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('units', null, {});
    await queryInterface.bulkDelete('producers', null, {});
  }
}; 