import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class Customer extends Model {}

Customer.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  company_name: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  tax_id: {
    type: DataTypes.TEXT,
    allowNull: false,
    unique: true
  },
  business_phone: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  business_address: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  contact_person: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  approval_status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending'
  },
  approved_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  approved_by: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  customer_group: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  credit_limit: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  payment_terms: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'Customer',
  tableName: 'customers',
  timestamps: true,
  underscored: true // Ensure column names use snake_case
});

export default Customer; 