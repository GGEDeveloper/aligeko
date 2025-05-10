/**
 * Stock Model
 * 
 * This model represents stock/inventory information for a product variant.
 */

import { DataTypes } from 'sequelize';

/**
 * Define the Stock model
 * @param {Sequelize} sequelize - Sequelize instance
 * @returns {Model} Stock model
 */
const Stock = (sequelize) => {
  const Stock = sequelize.define('Stock', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Current stock quantity'
    },
    available: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Whether the item is available for purchase'
    },
    min_order_quantity: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1,
      comment: 'Minimum order quantity'
    },
    max_order_quantity: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Maximum order quantity'
    },
    warehouse: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Warehouse identifier'
    },
    availability_date: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Date when item will be available if not in stock'
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
    tableName: 'stocks',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        name: 'idx_stock_variant_id',
        fields: ['variant_id']
      }
    ]
  });

  /**
   * Associate the Stock model with other models
   * @param {Object} models - All defined models
   */
  Stock.associate = function(models) {
    // Stock belongs to a Variant
    Stock.belongsTo(models.Variant, {
      foreignKey: 'variant_id',
      as: 'variant'
    });
  };

  return Stock;
};

export default Stock; 