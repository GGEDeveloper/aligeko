/**
 * Product Property Model
 * 
 * This model represents additional product properties in a key-value format
 * that are extracted from the GEKO XML import but don't have dedicated fields
 * in the Product model. This allows storing arbitrary product specifications.
 */

import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

class ProductProperty extends Model {}

ProductProperty.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'products',
      key: 'id'
    }
  },
  name: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  value: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  sequelize,
  modelName: 'ProductProperty',
  tableName: 'product_properties',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['product_id'] },
    { fields: ['name'] }
  ]
});

export default ProductProperty; 