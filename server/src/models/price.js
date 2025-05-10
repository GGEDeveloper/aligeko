/**
 * Price Model
 * 
 * This model represents price information for a product variant.
 * Supports different price types (retail, wholesale, special) and currencies.
 */

import { DataTypes } from 'sequelize';

/**
 * Define the Price model
 * @param {Sequelize} sequelize - Sequelize instance
 * @returns {Model} Price model
 */
const Price = (sequelize) => {
  const Price = sequelize.define('Price', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    price_type: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'retail',
      comment: 'Price type (retail, wholesale, special, etc.)'
    },
    currency: {
      type: DataTypes.STRING(3),
      allowNull: false,
      defaultValue: 'EUR',
      comment: 'Currency code (EUR, USD, etc.)'
    },
    gross_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: 'Gross price (including VAT)'
    },
    net_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Net price (excluding VAT)'
    },
    min_quantity: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1,
      comment: 'Minimum quantity for this price'
    },
    valid_from: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Price valid from date'
    },
    valid_to: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Price valid to date'
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Whether the price is active'
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'prices',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        name: 'idx_price_variant_id',
        fields: ['variant_id']
      },
      {
        name: 'idx_price_type_currency',
        fields: ['price_type', 'currency']
      }
    ]
  });

  /**
   * Associate the Price model with other models
   * @param {Object} models - All defined models
   */
  Price.associate = function(models) {
    // Price belongs to a Variant
    Price.belongsTo(models.Variant, {
      foreignKey: 'variant_id',
      as: 'variant'
    });
  };

  return Price;
};

export default Price; 