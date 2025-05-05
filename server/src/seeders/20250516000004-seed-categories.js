'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('categories', [
      {
        id: 1,
        name: 'Ferramentas Elétricas',
        description: 'Ferramentas movidas a eletricidade para serviços profissionais e domésticos',
        parent_id: null,
        image_url: 'https://alitools-assets.vercel.app/images/categories/ferramentas-eletricas.jpg',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 2,
        name: 'Ferramentas Manuais',
        description: 'Ferramentas não-elétricas para serviços variados',
        parent_id: null,
        image_url: 'https://alitools-assets.vercel.app/images/categories/ferramentas-manuais.jpg',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 3,
        name: 'Fixação',
        description: 'Itens para fixação e montagem de estruturas',
        parent_id: null,
        image_url: 'https://alitools-assets.vercel.app/images/categories/fixacao.jpg',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 4,
        name: 'Furadeiras',
        description: 'Furadeiras e parafusadeiras elétricas',
        parent_id: 1,
        image_url: 'https://alitools-assets.vercel.app/images/categories/furadeiras.jpg',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 5,
        name: 'Serras',
        description: 'Serras elétricas circulares, tico-tico e de esquadria',
        parent_id: 1,
        image_url: 'https://alitools-assets.vercel.app/images/categories/serras.jpg',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 6,
        name: 'Lixadeiras',
        description: 'Lixadeiras elétricas para madeira, metal e outros materiais',
        parent_id: 1,
        image_url: 'https://alitools-assets.vercel.app/images/categories/lixadeiras.jpg',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 7,
        name: 'Martelos',
        description: 'Martelos diversos para aplicações específicas',
        parent_id: 2,
        image_url: 'https://alitools-assets.vercel.app/images/categories/martelos.jpg',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 8,
        name: 'Chaves de Fenda',
        description: 'Chaves de fenda e phillips de diversos tamanhos',
        parent_id: 2,
        image_url: 'https://alitools-assets.vercel.app/images/categories/chaves-fenda.jpg',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 9,
        name: 'Alicates',
        description: 'Alicates para diversos usos em instalações e reparos',
        parent_id: 2,
        image_url: 'https://alitools-assets.vercel.app/images/categories/alicates.jpg',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 10,
        name: 'Parafusos',
        description: 'Parafusos para madeira, metal, drywall e outros materiais',
        parent_id: 3,
        image_url: 'https://alitools-assets.vercel.app/images/categories/parafusos.jpg',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 11,
        name: 'Buchas',
        description: 'Buchas para fixação em paredes e estruturas',
        parent_id: 3,
        image_url: 'https://alitools-assets.vercel.app/images/categories/buchas.jpg',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 12,
        name: 'Pregos',
        description: 'Pregos para madeira e aplicações diversas',
        parent_id: 3,
        image_url: 'https://alitools-assets.vercel.app/images/categories/pregos.jpg',
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('categories', null, {});
  }
}; 