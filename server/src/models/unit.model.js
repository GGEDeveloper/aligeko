import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class Unit extends Model {}

Unit.init({
  id: {
    type: DataTypes.TEXT,
    primaryKey: true
  },
  name: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  moq: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'Unit',
  tableName: 'units',
  timestamps: true,
  underscored: true // Ensure column names use snake_case
});

export default Unit; 