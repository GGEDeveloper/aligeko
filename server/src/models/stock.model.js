import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

class Stock extends Model {}

Stock.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  variant_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'variants',
      key: 'id'
    }
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  available: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  min_order_quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  restock_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  warehouse_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  warehouse_location: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  last_updated: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'Stock',
  tableName: 'stocks',
  timestamps: true,
  underscored: true, // Ensure column names use snake_case
  indexes: [
    {
      name: 'idx_stock_variant_id',
      fields: ['variant_id']
    },
    {
      name: 'idx_stock_available',
      fields: ['available']
    }
  ]
});

export default Stock; 