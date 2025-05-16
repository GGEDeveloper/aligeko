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
      autoIncrement: true,
      field: 'id'
    },
    vat: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      field: 'vat'
    },
    delivery_date: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'delivery_date'
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'created_at'
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'updated_at'
    },
    producer_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'producer_id'
    },
    description_long: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'description_long'
    },
    description_short: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'description_short'
    },
    description_html: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'description_html'
    },
    unit_id: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'unit_id'
    },
    category_id: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'category_id'
    },
    url: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'url'
    },
    status: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'status'
    },
    code: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'code'
    },
    code_on_card: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'code_on_card'
    },
    ean: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'ean'
    },
    producer_code: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'producer_code'
    },
    name: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'name'
    }
  }, {
    tableName: 'products',
    timestamps: false, // Desativar timestamps automáticos já que temos as colunas manualmente
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