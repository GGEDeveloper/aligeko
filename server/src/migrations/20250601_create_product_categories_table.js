export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('product_categories', {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
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
    category_id: {
      type: Sequelize.TEXT,
      allowNull: false,
      references: {
        model: 'categories',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
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

  // Add composite index for product_id and category_id
  await queryInterface.addIndex('product_categories', ['product_id', 'category_id'], {
    name: 'idx_product_categories_product_category',
    unique: true
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable('product_categories');
} 