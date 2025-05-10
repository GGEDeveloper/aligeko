/**
 * Product Model
 * 
 * This model represents a product in the database.
 * It has been enhanced to include all fields from the GEKO XML format.
 */

import { DataTypes } from 'sequelize';

/**
 * Define the Product model
 * @param {Sequelize} sequelize - Sequelize instance
 * @returns {Model} Product model
 */
const Product = (sequelize) => {
  const Product = sequelize.define('Product', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: 'Product code from GEKO'
    },
    code_on_card: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Product code displayed on product card'
    },
    ean: {
      type: DataTypes.STRING(13),
      allowNull: true,
      comment: 'EAN barcode'
    },
    producer_code: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Producer/manufacturer product code'
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Product name'
    },
    short_description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Short product description'
    },
    long_description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Detailed product description'
    },
    technical_description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Technical specifications'
    },
    url: {
      type: DataTypes.STRING(512),
      allowNull: true,
      comment: 'URL to product page'
    },
    vat: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      defaultValue: 23.00,
      comment: 'VAT rate in percentage (e.g., 23.00)'
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: true,
      defaultValue: 'active',
      comment: 'Product status (active, inactive, discontinued)'
    },
    delivery_time: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Expected delivery time in days'
    },
    delivery_date: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Expected delivery date'
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
    tableName: 'products',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        name: 'idx_product_code',
        fields: ['code']
      },
      {
        name: 'idx_product_ean',
        fields: ['ean']
      },
      {
        name: 'idx_product_producer_code',
        fields: ['producer_code']
      }
    ]
  });

  /**
   * Associate the Product model with other models
   * @param {Object} models - All defined models
   */
  Product.associate = function(models) {
    // Product belongs to a Category
    Product.belongsTo(models.Category, {
      foreignKey: 'category_id',
      as: 'category'
    });

    // Product belongs to a Producer
    Product.belongsTo(models.Producer, {
      foreignKey: 'producer_id',
      as: 'producer'
    });

    // Product belongs to a Unit
    Product.belongsTo(models.Unit, {
      foreignKey: 'unit_id',
      as: 'unit'
    });

    // Product has many Variants
    Product.hasMany(models.Variant, {
      foreignKey: 'product_id',
      as: 'variants'
    });

    // Product has many Images
    Product.hasMany(models.Image, {
      foreignKey: 'product_id',
      as: 'images'
    });

    // Product has many Documents
    Product.hasMany(models.Document, {
      foreignKey: 'product_id',
      as: 'documents'
    });

    // Product has many Properties
    Product.hasMany(models.ProductProperty, {
      foreignKey: 'product_id',
      as: 'properties'
    });
  };

  return Product;
};

export default Product; 