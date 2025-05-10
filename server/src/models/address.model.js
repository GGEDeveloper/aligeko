import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

class Address extends Model {}

Address.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  customer_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'customers',
      key: 'id'
    }
  },
  type: {
    type: DataTypes.ENUM('billing', 'shipping'),
    allowNull: false
  },
  is_default: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  street_address: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  city: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  state: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  postal_code: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  country: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  contact_name: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  contact_phone: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'Address',
  tableName: 'addresses',
  timestamps: true,
  underscored: true // Ensure column names use snake_case
});

export default Address; 