import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class Order extends Model {}

Order.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  customer_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'customers',
      key: 'id'
    }
  },
  order_number: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  status: {
    type: DataTypes.ENUM(
      'pending_approval', 
      'approved', 
      'processing', 
      'shipped', 
      'delivered', 
      'cancelled'
    ),
    defaultValue: 'pending_approval'
  },
  shipping_address_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'addresses',
      key: 'id'
    }
  },
  billing_address_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'addresses',
      key: 'id'
    }
  },
  total_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  tax_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  shipping_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  approved_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  approved_by: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  cancelled_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  cancelled_by: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  cancellation_reason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  payment_terms: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  payment_status: {
    type: DataTypes.ENUM('pending', 'paid', 'partial', 'failed', 'refunded'),
    defaultValue: 'pending'
  }
}, {
  sequelize,
  modelName: 'Order',
  tableName: 'orders',
  timestamps: true,
  underscored: true, // Ensure column names use snake_case
  indexes: [
    {
      name: 'idx_orders_customer_id',
      fields: ['customer_id']
    },
    {
      name: 'idx_orders_order_number',
      fields: ['order_number']
    }
  ]
});

export default Order; 