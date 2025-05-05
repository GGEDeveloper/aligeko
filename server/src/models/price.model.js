import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

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
  gross_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  net_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  srp_gross: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  srp_net: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'Price',
  tableName: 'prices',
  timestamps: true,
  underscored: true // Ensure column names use snake_case
});

export default Price; 