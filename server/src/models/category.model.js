import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class Category extends Model {}

Category.init({
  id: {
    type: DataTypes.TEXT,
    primaryKey: true
  },
  name: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  path: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'Category',
  tableName: 'categories',
  timestamps: true,
  underscored: true, // Use snake_case for table fields
  freezeTableName: true
});

export default Category; 