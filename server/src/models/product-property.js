/**
 * ProductProperty Model
 * 
 * This model represents a product property (key-value pair) in the database.
 * Properties can include various technical specifications and attributes.
 */

import { DataTypes } from 'sequelize';

/**
 * Define the ProductProperty model
 * @param {Sequelize} sequelize - Sequelize instance
 * @returns {Model} ProductProperty model
 */
const ProductProperty = (sequelize) => {
  const ProductProperty = sequelize.define('ProductProperty', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Products',
        key: 'id'
      }
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    value: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    group: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    language: {
      type: DataTypes.STRING(10),
      allowNull: true,
      defaultValue: 'en'
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    is_filterable: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    is_public: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'product_properties',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['product_id', 'name', 'language']
      },
      {
        fields: ['is_filterable']
      },
      {
        fields: ['group']
      }
    ]
  });

  /**
   * Associate the ProductProperty model with other models
   * @param {Object} models - All defined models
   */
  ProductProperty.associate = function(models) {
    // ProductProperty belongs to a Product
    ProductProperty.belongsTo(models.Product, {
      foreignKey: 'product_id',
      as: 'product'
    });
  };

  return ProductProperty;
};

export default ProductProperty; 