import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class CartItem extends Model {}

CartItem.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  cart_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'carts',
      key: 'id'
    }
  },
  variant_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'variants',
      key: 'id'
    }
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1
    }
  },
  added_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Price at the time of adding to cart'
  },
  custom_data: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'For any additional item metadata'
  }
}, {
  sequelize,
  modelName: 'CartItem',
  tableName: 'cart_items',
  timestamps: true,
  underscored: true, // Ensure column names use snake_case
  indexes: [
    {
      name: 'idx_cart_items_cart_id',
      fields: ['cart_id']
    },
    {
      name: 'idx_cart_items_variant_id',
      fields: ['variant_id']
    },
    {
      name: 'idx_cart_items_added_at',
      fields: ['added_at']
    }
  ]
});

export default CartItem; 