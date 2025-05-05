export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn('users', 'twoFactorEnabled', {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
    allowNull: false
  });
  
  await queryInterface.addColumn('users', 'twoFactorSecret', {
    type: Sequelize.STRING,
    allowNull: true
  });
  
  await queryInterface.addColumn('users', 'twoFactorBackupCodes', {
    type: Sequelize.JSON,
    allowNull: true
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.removeColumn('users', 'twoFactorEnabled');
  await queryInterface.removeColumn('users', 'twoFactorSecret');
  await queryInterface.removeColumn('users', 'twoFactorBackupCodes');
} 