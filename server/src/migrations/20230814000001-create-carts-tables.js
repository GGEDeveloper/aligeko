'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create carts table
    await queryInterface.createTable('carts', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        unique: true
      },
      last_modified: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      guest_cart_id: {
        type: Sequelize.STRING,
        allowNull: true
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Create indexes on carts table
    await queryInterface.addIndex('carts', ['user_id'], {
      name: 'idx_carts_user_id'
    });

    await queryInterface.addIndex('carts', ['guest_cart_id'], {
      name: 'idx_carts_guest_cart_id'
    });

    // Create cart_items table
    await queryInterface.createTable('cart_items', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      cart_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'carts',
          key: 'id'
        }
      },
      variant_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'variants',
          key: 'id'
        }
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      added_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      custom_data: {
        type: Sequelize.JSON,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Create indexes on cart_items table
    await queryInterface.addIndex('cart_items', ['cart_id'], {
      name: 'idx_cart_items_cart_id'
    });

    await queryInterface.addIndex('cart_items', ['variant_id'], {
      name: 'idx_cart_items_variant_id'
    });

    await queryInterface.addIndex('cart_items', ['added_at'], {
      name: 'idx_cart_items_added_at'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Drop tables in reverse order
    await queryInterface.dropTable('cart_items');
    await queryInterface.dropTable('carts');
  }
}; 