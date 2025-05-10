/**
 * Image Model
 * 
 * This model represents a product image in the database.
 */

import { DataTypes } from 'sequelize';

/**
 * Define the Image model
 * @param {Sequelize} sequelize - Sequelize instance
 * @returns {Model} Image model
 */
const Image = (sequelize) => {
  const Image = sequelize.define('Image', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    url: {
      type: DataTypes.STRING(512),
      allowNull: false,
      comment: 'Image URL'
    },
    is_main: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Whether this is the main product image'
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: 'Display order of the image'
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Image title/alt text'
    },
    width: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Image width in pixels'
    },
    height: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Image height in pixels'
    },
    file_name: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Original file name'
    },
    file_size: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'File size in bytes'
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
    tableName: 'images',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        name: 'idx_image_product_id',
        fields: ['product_id']
      },
      {
        name: 'idx_image_is_main',
        fields: ['is_main']
      }
    ]
  });

  /**
   * Associate the Image model with other models
   * @param {Object} models - All defined models
   */
  Image.associate = function(models) {
    // Image belongs to a Product
    Image.belongsTo(models.Product, {
      foreignKey: 'product_id',
      as: 'product'
    });
  };

  return Image;
};

export default Image; 