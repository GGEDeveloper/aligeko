import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class OrderItem extends Model {}

OrderItem.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  order_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'orders',
      key: 'id'
    }
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
    validate: {
      min: 1
    }
  },
  unit_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  total_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  tax_rate: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false
  },
  tax_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  discount_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'OrderItem',
  tableName: 'order_items',
  timestamps: true,
  underscored: true, // Ensure column names use snake_case
  indexes: [
    {
      name: 'idx_order_items_order_id',
      fields: ['order_id']
    },
    {
      name: 'idx_order_items_variant_id',
      fields: ['variant_id']
    }
  ]
});

export default OrderItem; 