import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class Variant extends Model {}

Variant.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'products',
      key: 'id'
    }
  },
  code: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  weight: {
    type: DataTypes.DECIMAL,
    allowNull: true
  },
  gross_weight: {
    type: DataTypes.DECIMAL,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'Variant',
  tableName: 'variants',
  timestamps: true,
  underscored: true, // Ensure column names use snake_case
  indexes: [
    {
      name: 'idx_variants_product_id_code',
      fields: ['product_id', 'code']
    }
  ]
});

export default Variant; 