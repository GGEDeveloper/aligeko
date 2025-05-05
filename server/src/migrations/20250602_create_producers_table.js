export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('producers', {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: Sequelize.TEXT,
      allowNull: false,
      unique: true
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
  await queryInterface.dropTable('producers');
} 