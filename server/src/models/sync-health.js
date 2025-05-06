import { DataTypes } from 'sequelize';
import sequelize from '../config/database';

const SyncHealth = sequelize.define('SyncHealth', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  sync_type: {
    type: DataTypes.STRING(20), // 'scheduled' or 'manual'
    allowNull: false
  },
  status: {
    type: DataTypes.STRING(20), // 'success', 'partial_success', 'failed'
    allowNull: false
  },
  start_time: {
    type: DataTypes.DATE,
    allowNull: false
  },
  end_time: {
    type: DataTypes.DATE,
    allowNull: false
  },
  duration_seconds: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  api_url: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  request_size_bytes: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  items_processed: {
    type: DataTypes.JSONB, // Stores counts of various item types processed
    allowNull: false,
    defaultValue: {}
  },
  error_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  error_details: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  memory_usage_mb: {
    type: DataTypes.FLOAT,
    allowNull: true
  }
}, {
  tableName: 'sync_health',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      name: 'sync_health_start_time_idx',
      fields: ['start_time']
    },
    {
      name: 'sync_health_status_idx',
      fields: ['status']
    },
    {
      name: 'sync_health_sync_type_idx',
      fields: ['sync_type']
    }
  ]
});

export default SyncHealth; 