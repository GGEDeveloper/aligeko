import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

class Shipment extends Model {}

Shipment.init({
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
  tracking_number: {
    type: DataTypes.STRING,
    allowNull: true
  },
  carrier: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('processing', 'shipped', 'in_transit', 'delivered', 'returned'),
    defaultValue: 'processing'
  },
  shipped_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  estimated_delivery: {
    type: DataTypes.DATE,
    allowNull: true
  },
  delivered_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'Shipment',
  tableName: 'shipments',
  timestamps: true,
  underscored: true, // Ensure column names use snake_case
  indexes: [
    {
      name: 'idx_shipments_order_id',
      fields: ['order_id']
    },
    {
      name: 'idx_shipments_tracking_number',
      fields: ['tracking_number']
    }
  ]
});

export default Shipment; 