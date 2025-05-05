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
    allowNull: false,
    validate: {
      min: 1
    }
  }
}, {
  sequelize,
  modelName: 'Unit',
  tableName: 'units',
  timestamps: true,
  underscored: true,
  freezeTableName: true
});

export default Unit; 