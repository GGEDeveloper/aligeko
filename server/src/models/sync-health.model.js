import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

class SyncHealth extends Model {}

SyncHealth.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  sync_type: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  status: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  start_time: {
    type: DataTypes.DATE,
    allowNull: false
  },
  end_time: {
    type: DataTypes.DATE,
    allowNull: true
  },
  duration_seconds: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  api_url: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  request_size_bytes: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  items_processed: {
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      const value = this.getDataValue('items_processed');
      return value ? JSON.parse(value) : null;
    },
    set(value) {
      this.setDataValue('items_processed', value ? JSON.stringify(value) : null);
    }
  },
  error_count: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0
  },
  errors: {
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      const value = this.getDataValue('errors');
      return value ? JSON.parse(value) : null;
    },
    set(value) {
      this.setDataValue('errors', value ? JSON.stringify(value) : null);
    }
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
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
  sequelize,
  modelName: 'SyncHealth',
  tableName: 'sync_health',
  timestamps: true,
  underscored: true
});

export { SyncHealth };
export default SyncHealth; 