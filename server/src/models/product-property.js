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
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Property name/key'
    },
    value: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Property value'
    },
    language: {
      type: DataTypes.STRING(5),
      allowNull: true,
      defaultValue: 'en',
      comment: 'Property language code (en, pt, etc.)'
    },
    group: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Property group/category'
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: 'Display order of the property'
    },
    is_filterable: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Whether this property can be used for filtering'
    },
    is_public: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Whether this property is visible to customers'
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
    tableName: 'product_properties',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        name: 'idx_property_product_id',
        fields: ['product_id']
      },
      {
        name: 'idx_property_name',
        fields: ['name']
      },
      {
        name: 'idx_property_group',
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