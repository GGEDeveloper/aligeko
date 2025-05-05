import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class Producer extends Model {}

Producer.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.TEXT,
    allowNull: false,
    unique: true
  }
}, {
  sequelize,
  modelName: 'Producer',
  tableName: 'producers',
  timestamps: true,
  underscored: true,
  freezeTableName: true
});

export default Producer; 