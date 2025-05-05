export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('products', {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    code: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    code_on_card: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    ean: {
      type: Sequelize.TEXT,
      allowNull: true,
      unique: true
    },
    producer_code: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    name: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    description_long: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    description_short: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    description_html: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    vat: {
      type: Sequelize.DECIMAL(5, 2),
      allowNull: true
    },
    delivery_date: {
      type: Sequelize.DATE,
      allowNull: true
    },
    url: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    producer_id: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'producers',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    unit_id: {
      type: Sequelize.TEXT,
      allowNull: true,
      references: {
        model: 'units',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    created_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.fn('NOW')
    },
    updated_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.fn('NOW')
    }
  });

  // Add index on name for faster searching
  await queryInterface.addIndex('products', ['name'], {
    name: 'idx_products_name'
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable('products');
} 