'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('sync_health', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      sync_type: {
        type: Sequelize.STRING(20),
        allowNull: false
      },
      status: {
        type: Sequelize.STRING(20),
        allowNull: false
      },
      start_time: {
        type: Sequelize.DATE,
        allowNull: false
      },
      end_time: {
        type: Sequelize.DATE,
        allowNull: false
      },
      duration_seconds: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      api_url: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      request_size_bytes: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      items_processed: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: {}
      },
      error_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      error_details: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      memory_usage_mb: {
        type: Sequelize.FLOAT,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Add indexes
    await queryInterface.addIndex('sync_health', ['start_time'], {
      name: 'sync_health_start_time_idx'
    });
    await queryInterface.addIndex('sync_health', ['status'], {
      name: 'sync_health_status_idx'
    });
    await queryInterface.addIndex('sync_health', ['sync_type'], {
      name: 'sync_health_sync_type_idx'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('sync_health');
  }
}; 