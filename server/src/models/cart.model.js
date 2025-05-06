import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class Cart extends Model {}

Cart.init({
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
    },
    unique: true // One user has one cart
  },
  last_modified: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  guest_cart_id: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Used to track guest carts during migration'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'Cart',
  tableName: 'carts',
  timestamps: true,
  underscored: true, // Ensure column names use snake_case
  indexes: [
    {
      name: 'idx_carts_user_id',
      fields: ['user_id']
    },
    {
      name: 'idx_carts_guest_cart_id',
      fields: ['guest_cart_id']
    }
  ]
});

export default Cart; 