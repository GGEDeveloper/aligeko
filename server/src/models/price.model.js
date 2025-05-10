import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

class Price extends Model {}

Price.init({
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
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  currency: {
    type: DataTypes.STRING(3),
    allowNull: false,
    defaultValue: 'EUR'
  },
  type: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'retail'
  },
  gross_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  net_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  srp_gross: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  srp_net: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  discount_percentage: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true
  },
  valid_from: {
    type: DataTypes.DATE,
    allowNull: true
  },
  valid_to: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'Price',
  tableName: 'prices',
  timestamps: true,
  underscored: true, // Ensure column names use snake_case
  indexes: [
    {
      name: 'idx_price_variant_id',
      fields: ['variant_id']
    },
    {
      name: 'idx_price_type',
      fields: ['type']
    },
    {
      name: 'idx_prices_currency',
      fields: ['currency']
    }
  ]
});

export default Price; 