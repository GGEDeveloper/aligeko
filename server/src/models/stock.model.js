import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

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
  warehouse_id: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'Stock',
  tableName: 'stock',
  timestamps: true,
  underscored: true, // Ensure column names use snake_case
  indexes: [
    {
      name: 'idx_stock_variant_id',
      fields: ['variant_id']
    }
  ]
});

export default Stock; 