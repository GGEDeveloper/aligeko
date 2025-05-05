export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('categories', {
    id: {
      type: Sequelize.TEXT,
      primaryKey: true
    },
    name: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    path: {
      type: Sequelize.TEXT,
      allowNull: true
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
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable('categories');
} 