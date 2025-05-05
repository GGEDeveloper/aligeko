'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Seed products
    await queryInterface.bulkInsert('products', [
      {
        id: 1,
        name: 'Furadeira de Impacto 750W',
        description: 'Furadeira de impacto profissional com 750W de potência, 2 velocidades e mandril de 13mm',
        code: 'FI750',
        ean: '7891234567890',
        category_id: 4,
        producer_id: 3,
        unit_id: 1,
        technical_details: JSON.stringify({
          potencia: '750W',
          tensao: '220V',
          mandril: '13mm',
          velocidades: 2,
          rpm: '0-3000',
          peso: '2.1kg'
        }),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 2,
        name: 'Serra Circular 7.1/4" 1800W',
        description: 'Serra circular potente com disco de 7.1/4 polegadas e 1800W de potência, ideal para cortes em madeira',
        code: 'SC1800',
        ean: '7891234567891',
        category_id: 5,
        producer_id: 4,
        unit_id: 1,
        technical_details: JSON.stringify({
          potencia: '1800W',
          tensao: '220V',
          disco: '7.1/4"',
          rpm: '5800',
          profundidade_corte: '65mm',
          peso: '4.2kg'
        }),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 3,
        name: 'Conjunto de Chaves de Fenda 6 peças',
        description: 'Kit com 6 chaves de fenda em diferentes tamanhos, com cabo emborrachado ergonômico',
        code: 'KCF6',
        ean: '7891234567892',
        category_id: 8,
        producer_id: 1,
        unit_id: 5,
        technical_details: JSON.stringify({
          material_cabo: 'Polipropileno',
          material_haste: 'Aço cromo-vanádio',
          tamanhos: [
            'Phillips #0 x 75mm',
            'Phillips #1 x 100mm',
            'Phillips #2 x 150mm',
            'Fenda 3mm x 75mm',
            'Fenda 5mm x 100mm',
            'Fenda 6mm x 150mm'
          ],
          isolamento: 'Não'
        }),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 4,
        name: 'Martelo de Unha 27mm',
        description: 'Martelo de unha com cabeça em aço forjado e cabo em fibra de vidro, resistente e durável',
        code: 'MU27',
        ean: '7891234567893',
        category_id: 7,
        producer_id: 2,
        unit_id: 1,
        technical_details: JSON.stringify({
          peso_cabeca: '500g',
          material_cabeca: 'Aço forjado',
          material_cabo: 'Fibra de vidro',
          comprimento: '330mm',
          tipo: 'Unha'
        }),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 5,
        name: 'Parafusos Phillips 4.5x40mm',
        description: 'Caixa com 100 parafusos Phillips para madeira, 4.5x40mm, aço bicromatizado',
        code: 'PP4540',
        ean: '7891234567894',
        category_id: 10,
        producer_id: 1,
        unit_id: 2,
        technical_details: JSON.stringify({
          tipo: 'Phillips',
          medida: '4.5x40mm',
          material: 'Aço bicromatizado',
          quantidade: 100,
          aplicacao: 'Madeira'
        }),
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    // Seed variants
    await queryInterface.bulkInsert('variants', [
      {
        id: 1,
        product_id: 1,
        code: 'FI750-220V',
        weight: 2.1,
        gross_weight: 2.5,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 2,
        product_id: 1,
        code: 'FI750-110V',
        weight: 2.1,
        gross_weight: 2.5,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 3,
        product_id: 2,
        code: 'SC1800-220V',
        weight: 4.2,
        gross_weight: 4.8,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 4,
        product_id: 2,
        code: 'SC1800-110V',
        weight: 4.2,
        gross_weight: 4.8,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 5,
        product_id: 3,
        code: 'KCF6-STD',
        weight: 0.6,
        gross_weight: 0.7,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 6,
        product_id: 4,
        code: 'MU27-STD',
        weight: 0.65,
        gross_weight: 0.75,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 7,
        product_id: 5,
        code: 'PP4540-CX100',
        weight: 0.45,
        gross_weight: 0.5,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    // Seed stock
    await queryInterface.bulkInsert('stock', [
      {
        id: 1,
        variant_id: 1,
        warehouse_id: 'MAIN',
        quantity: 50,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 2,
        variant_id: 2,
        warehouse_id: 'MAIN',
        quantity: 35,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 3,
        variant_id: 3,
        warehouse_id: 'MAIN',
        quantity: 28,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 4,
        variant_id: 4,
        warehouse_id: 'MAIN',
        quantity: 22,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 5,
        variant_id: 5,
        warehouse_id: 'MAIN',
        quantity: 120,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 6,
        variant_id: 6,
        warehouse_id: 'MAIN',
        quantity: 85,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 7,
        variant_id: 7,
        warehouse_id: 'MAIN',
        quantity: 200,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 8,
        variant_id: 1,
        warehouse_id: 'SP-ZS',
        quantity: 25,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 9,
        variant_id: 3,
        warehouse_id: 'SP-ZS',
        quantity: 15,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    // Seed prices
    await queryInterface.bulkInsert('prices', [
      {
        id: 1,
        variant_id: 1,
        gross_price: 429.90,
        net_price: 368.70,
        srp_gross: 499.90,
        srp_net: 429.92,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 2,
        variant_id: 2,
        gross_price: 429.90,
        net_price: 368.70,
        srp_gross: 499.90,
        srp_net: 429.92,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 3,
        variant_id: 3,
        gross_price: 689.90,
        net_price: 592.31,
        srp_gross: 799.90,
        srp_net: 687.92,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 4,
        variant_id: 4,
        gross_price: 689.90,
        net_price: 592.31,
        srp_gross: 799.90,
        srp_net: 687.92,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 5,
        variant_id: 5,
        gross_price: 89.90,
        net_price: 77.20,
        srp_gross: 119.90,
        srp_net: 103.10,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 6,
        variant_id: 6,
        gross_price: 59.90,
        net_price: 51.50,
        srp_gross: 79.90,
        srp_net: 68.70,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 7,
        variant_id: 7,
        gross_price: 28.90,
        net_price: 24.80,
        srp_gross: 34.90,
        srp_net: 30.00,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    // Seed images
    await queryInterface.bulkInsert('images', [
      {
        id: 1,
        product_id: 1,
        url: 'https://alitools-assets.vercel.app/images/products/furadeira-impacto-750w-1.jpg',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 2,
        product_id: 1,
        url: 'https://alitools-assets.vercel.app/images/products/furadeira-impacto-750w-2.jpg',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 3,
        product_id: 2,
        url: 'https://alitools-assets.vercel.app/images/products/serra-circular-1800w-1.jpg',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 4,
        product_id: 3,
        url: 'https://alitools-assets.vercel.app/images/products/kit-chaves-fenda-1.jpg',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 5,
        product_id: 4,
        url: 'https://alitools-assets.vercel.app/images/products/martelo-unha-1.jpg',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 6,
        product_id: 5,
        url: 'https://alitools-assets.vercel.app/images/products/parafusos-1.jpg',
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('images', null, {});
    await queryInterface.bulkDelete('prices', null, {});
    await queryInterface.bulkDelete('stock', null, {});
    await queryInterface.bulkDelete('variants', null, {});
    await queryInterface.bulkDelete('products', null, {});
  }
}; 