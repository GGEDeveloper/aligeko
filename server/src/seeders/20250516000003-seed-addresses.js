'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('addresses', [
      {
        id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
        customer_id: 'c5a8f94d-5eb6-4e94-a08d-9a9f68c6c19d', // Ferramentas Express
        type: 'billing',
        is_default: true,
        street: 'Avenida Paulista',
        number: '1000',
        complement: 'Sala 301',
        district: 'Bela Vista',
        city: 'São Paulo',
        state: 'SP',
        postal_code: '01310-100',
        country: 'Brasil',
        notes: 'Entrada pela lateral do prédio',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e',
        customer_id: 'c5a8f94d-5eb6-4e94-a08d-9a9f68c6c19d', // Ferramentas Express
        type: 'shipping',
        is_default: true,
        street: 'Rua Teodoro Sampaio',
        number: '550',
        complement: 'Galpão 3',
        district: 'Pinheiros',
        city: 'São Paulo',
        state: 'SP',
        postal_code: '05406-000',
        country: 'Brasil',
        notes: 'Recebe entregas das 8h às 17h',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 'c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f',
        customer_id: 'd2e7f8a9-b0c1-4d2e-8f3d-9a7b6c5d4e3f', // Construções e Reformas
        type: 'billing',
        is_default: true,
        street: 'Avenida Rio Branco',
        number: '103',
        complement: '10º andar',
        district: 'Centro',
        city: 'Rio de Janeiro',
        state: 'RJ',
        postal_code: '20040-002',
        country: 'Brasil',
        notes: 'Departamento financeiro',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 'd4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a',
        customer_id: 'd2e7f8a9-b0c1-4d2e-8f3d-9a7b6c5d4e3f', // Construções e Reformas
        type: 'shipping',
        is_default: true,
        street: 'Rodovia Presidente Dutra',
        number: 'KM 207',
        complement: 'Armazém 12',
        district: 'Cumbica',
        city: 'Guarulhos',
        state: 'SP',
        postal_code: '07034-000',
        country: 'Brasil',
        notes: 'Centro de distribuição. Agendar entregas com 24h de antecedência.',
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('addresses', null, {});
  }
}; 