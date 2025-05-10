/**
 * Category Model
 * 
 * This model represents a product category in the database.
 */

import { DataTypes } from 'sequelize';

/**
 * Define the Category model
 * @param {Sequelize} sequelize - Sequelize instance
 * @returns {Model} Category model
 */
const Category = (sequelize) => {
  const Category = sequelize.define('Category', {
    id: {
      type: DataTypes.STRING(100),
      primaryKey: true,
      allowNull: false,
      comment: 'Category ID from GEKO'
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Category name'
    },
    path: {
      type: DataTypes.STRING(512),
      allowNull: true,
      comment: 'Full category path (e.g., Home/Tools/Power Tools)'
    },
    parent_id: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Parent category ID'
    },
    level: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: 'Category level in hierarchy'
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Whether the category is active'
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
    tableName: 'categories',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        name: 'idx_category_parent_id',
        fields: ['parent_id']
      },
      {
        name: 'idx_category_path',
        fields: ['path']
      }
    ]
  });

  /**
   * Associate the Category model with other models
   * @param {Object} models - All defined models
   */
  Category.associate = function(models) {
    // Category has many Products
    Category.hasMany(models.Product, {
      foreignKey: 'category_id',
      as: 'products'
    });

    // Category has many child Categories
    Category.hasMany(models.Category, {
      foreignKey: 'parent_id',
      as: 'children'
    });

    // Category belongs to a parent Category
    Category.belongsTo(models.Category, {
      foreignKey: 'parent_id',
      as: 'parent'
    });
  };

  return Category;
};

export default Category; 