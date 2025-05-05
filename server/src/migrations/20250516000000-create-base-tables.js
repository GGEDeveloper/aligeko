'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Users table (já deve existir)
    
    // Producers table
    await queryInterface.createTable('producers', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.TEXT,
        allowNull: false,
        unique: true
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now')
      }
    });

    // Categories table
    await queryInterface.createTable('categories', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.TEXT
      },
      name: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      path: {
        type: Sequelize.TEXT
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now')
      }
    });

    // Units table
    await queryInterface.createTable('units', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.TEXT
      },
      name: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      moq: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now')
      }
    });

    // Products table
    await queryInterface.createTable('products', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      code: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      code_on_card: {
        type: Sequelize.TEXT
      },
      ean: {
        type: Sequelize.TEXT,
        unique: true
      },
      producer_code: {
        type: Sequelize.TEXT
      },
      name: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      description_long: {
        type: Sequelize.TEXT
      },
      description_short: {
        type: Sequelize.TEXT
      },
      description_html: {
        type: Sequelize.TEXT
      },
      vat: {
        type: Sequelize.DECIMAL(5, 2)
      },
      delivery_date: {
        type: Sequelize.DATE
      },
      url: {
        type: Sequelize.TEXT
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now')
      }
    });

    // Add index on products.name for faster searches
    await queryInterface.addIndex('products', ['name'], {
      name: 'idx_products_name'
    });

    // Variants table
    await queryInterface.createTable('variants', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      product_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'products',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      code: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      weight: {
        type: Sequelize.DECIMAL
      },
      gross_weight: {
        type: Sequelize.DECIMAL
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now')
      }
    });

    // Add composite index on variants(product_id, code)
    await queryInterface.addIndex('variants', ['product_id', 'code'], {
      name: 'idx_variants_product_id_code'
    });

    // Stock table
    await queryInterface.createTable('stock', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      variant_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'variants',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      warehouse_id: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now')
      }
    });

    // Add index on stock(variant_id)
    await queryInterface.addIndex('stock', ['variant_id'], {
      name: 'idx_stock_variant_id'
    });

    // Prices table
    await queryInterface.createTable('prices', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      variant_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'variants',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      gross_price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      net_price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      srp_gross: {
        type: Sequelize.DECIMAL(10, 2)
      },
      srp_net: {
        type: Sequelize.DECIMAL(10, 2)
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now')
      }
    });

    // Images table
    await queryInterface.createTable('images', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      product_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'products',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      url: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now')
      }
    });

    // Customers table
    await queryInterface.createTable('customers', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      company_name: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      tax_id: {
        type: Sequelize.TEXT,
        allowNull: false,
        unique: true
      },
      business_phone: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      business_address: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      contact_person: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      approval_status: {
        type: Sequelize.ENUM('pending', 'approved', 'rejected'),
        defaultValue: 'pending'
      },
      approved_at: {
        type: Sequelize.DATE
      },
      approved_by: {
        type: Sequelize.UUID,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      customer_group: {
        type: Sequelize.TEXT
      },
      credit_limit: {
        type: Sequelize.DECIMAL(10, 2)
      },
      payment_terms: {
        type: Sequelize.TEXT
      },
      notes: {
        type: Sequelize.TEXT
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now')
      }
    });

    // Addresses table
    await queryInterface.createTable('addresses', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      customer_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'customers',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      type: {
        type: Sequelize.ENUM('billing', 'shipping'),
        allowNull: false
      },
      is_default: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      street_address: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      city: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      state: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      postal_code: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      country: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      contact_name: {
        type: Sequelize.TEXT
      },
      contact_phone: {
        type: Sequelize.TEXT
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now')
      }
    });

    // Orders table
    await queryInterface.createTable('orders', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      customer_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'customers',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      order_number: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      status: {
        type: Sequelize.ENUM(
          'pending_approval', 
          'approved', 
          'processing', 
          'shipped', 
          'delivered', 
          'cancelled'
        ),
        defaultValue: 'pending_approval'
      },
      shipping_address_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'addresses',
          key: 'id'
        }
      },
      billing_address_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'addresses',
          key: 'id'
        }
      },
      total_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      tax_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      shipping_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      notes: {
        type: Sequelize.TEXT
      },
      approved_at: {
        type: Sequelize.DATE
      },
      approved_by: {
        type: Sequelize.UUID,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      cancelled_at: {
        type: Sequelize.DATE
      },
      cancelled_by: {
        type: Sequelize.UUID,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      cancellation_reason: {
        type: Sequelize.TEXT
      },
      payment_terms: {
        type: Sequelize.TEXT
      },
      payment_status: {
        type: Sequelize.ENUM('pending', 'paid', 'partial', 'failed', 'refunded'),
        defaultValue: 'pending'
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now')
      }
    });

    // Add indexes for orders
    await queryInterface.addIndex('orders', ['customer_id'], {
      name: 'idx_orders_customer_id'
    });
    await queryInterface.addIndex('orders', ['order_number'], {
      name: 'idx_orders_order_number'
    });

    // Order Items table
    await queryInterface.createTable('order_items', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      order_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'orders',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
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
      unit_price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      total_price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      tax_rate: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false
      },
      tax_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      discount_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00
      },
      notes: {
        type: Sequelize.TEXT
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now')
      }
    });

    // Add indexes for order items
    await queryInterface.addIndex('order_items', ['order_id'], {
      name: 'idx_order_items_order_id'
    });
    await queryInterface.addIndex('order_items', ['variant_id'], {
      name: 'idx_order_items_variant_id'
    });

    // Shipments table
    await queryInterface.createTable('shipments', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      order_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'orders',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      tracking_number: {
        type: Sequelize.STRING
      },
      carrier: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.ENUM('processing', 'shipped', 'in_transit', 'delivered', 'returned'),
        defaultValue: 'processing'
      },
      shipped_at: {
        type: Sequelize.DATE
      },
      estimated_delivery: {
        type: Sequelize.DATE
      },
      delivered_at: {
        type: Sequelize.DATE
      },
      notes: {
        type: Sequelize.TEXT
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now')
      }
    });

    // Add indexes for shipments
    await queryInterface.addIndex('shipments', ['order_id'], {
      name: 'idx_shipments_order_id'
    });
    await queryInterface.addIndex('shipments', ['tracking_number'], {
      name: 'idx_shipments_tracking_number'
    });
  },

  async down(queryInterface, Sequelize) {
    // Remover tabelas na ordem inversa à criação para evitar violações de chaves estrangeiras
    await queryInterface.dropTable('shipments');
    await queryInterface.dropTable('order_items');
    await queryInterface.dropTable('orders');
    await queryInterface.dropTable('addresses');
    await queryInterface.dropTable('customers');
    await queryInterface.dropTable('images');
    await queryInterface.dropTable('prices');
    await queryInterface.dropTable('stock');
    await queryInterface.dropTable('variants');
    await queryInterface.dropTable('products');
    await queryInterface.dropTable('units');
    await queryInterface.dropTable('categories');
    await queryInterface.dropTable('producers');
  }
}; 