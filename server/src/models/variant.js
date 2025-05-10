/**
 * Variant Model
 * 
 * This model represents a product variant in the database.
 * A variant can include different sizes, colors, or other product variants.
 */

import { DataTypes } from 'sequelize';

/**
 * Define the Variant model
 * @param {Sequelize} sequelize - Sequelize instance
 * @returns {Model} Variant model
 */
const Variant = (sequelize) => {
  const Variant = sequelize.define('Variant', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    code: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      comment: 'Variant code from GEKO (usually product code + variant suffix)'
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Variant name'
    },
    size: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Size descriptor (S, M, L, XL, etc.)'
    },
    color: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Color descriptor'
    },
    weight: {
      type: DataTypes.DECIMAL(10, 3),
      allowNull: true,
      comment: 'Weight in kg'
    },
    gross_weight: {
      type: DataTypes.DECIMAL(10, 3),
      allowNull: true,
      comment: 'Gross weight including packaging in kg'
    },
    length: {
      type: DataTypes.DECIMAL(10, 3),
      allowNull: true,
      comment: 'Length in cm'
    },
    width: {
      type: DataTypes.DECIMAL(10, 3),
      allowNull: true,
      comment: 'Width in cm'
    },
    height: {
      type: DataTypes.DECIMAL(10, 3),
      allowNull: true,
      comment: 'Height in cm'
    },
    ean: {
      type: DataTypes.STRING(13),
      allowNull: true,
      comment: 'Variant-specific EAN barcode'
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: true,
      defaultValue: 'active',
      comment: 'Variant status (active, inactive, discontinued)'
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
    tableName: 'variants',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        name: 'idx_variant_code',
        fields: ['code']
      },
      {
        name: 'idx_variant_product_id',
        fields: ['product_id']
      }
    ]
  });

  /**
   * Associate the Variant model with other models
   * @param {Object} models - All defined models
   */
  Variant.associate = function(models) {
    // Variant belongs to a Product
    Variant.belongsTo(models.Product, {
      foreignKey: 'product_id',
      as: 'product'
    });

    // Variant has one Stock
    Variant.hasOne(models.Stock, {
      foreignKey: 'variant_id',
      as: 'stock'
    });

    // Variant has many Prices
    Variant.hasMany(models.Price, {
      foreignKey: 'variant_id',
      as: 'prices'
    });
  };

  return Variant;
};

export default Variant; 