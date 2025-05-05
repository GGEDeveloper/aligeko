'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Seed images for products
    await queryInterface.bulkInsert('images', [
      {
        id: 1,
        product_id: 1, // Furadeira de Impacto 750W
        url: 'https://alitools-assets.s3.amazonaws.com/products/furadeira-impacto-750w-main.jpg',
        alt: 'Furadeira de Impacto 750W - Vista principal',
        order: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 2,
        product_id: 1,
        url: 'https://alitools-assets.s3.amazonaws.com/products/furadeira-impacto-750w-detail.jpg',
        alt: 'Furadeira de Impacto 750W - Detalhes',
        order: 2,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 3,
        product_id: 2, // Serra Circular
        url: 'https://alitools-assets.s3.amazonaws.com/products/serra-circular-main.jpg',
        alt: 'Serra Circular 7.1/4" 1800W - Vista principal',
        order: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 4,
        product_id: 2,
        url: 'https://alitools-assets.s3.amazonaws.com/products/serra-circular-angle.jpg',
        alt: 'Serra Circular 7.1/4" 1800W - Vista lateral',
        order: 2,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 5,
        product_id: 3, // Conjunto de Chaves de Fenda
        url: 'https://alitools-assets.s3.amazonaws.com/products/kit-chaves-fenda-main.jpg',
        alt: 'Conjunto de Chaves de Fenda 6 peças - Vista principal',
        order: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 6,
        product_id: 4, // Martelo
        url: 'https://alitools-assets.s3.amazonaws.com/products/martelo-unha-main.jpg',
        alt: 'Martelo de Unha 27mm - Vista principal',
        order: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 7,
        product_id: 5, // Parafusos
        url: 'https://alitools-assets.s3.amazonaws.com/products/parafusos-phillips-main.jpg',
        alt: 'Parafusos Phillips 4.5x40mm - Vista principal',
        order: 1,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('images', null, {});
  }
}; 