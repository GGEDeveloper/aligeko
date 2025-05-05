import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class Image extends Model {}

Image.init({
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
  url: {
    type: DataTypes.TEXT,
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'Image',
  tableName: 'images',
  timestamps: true,
  underscored: true // Ensure column names use snake_case
});

export default Image; 