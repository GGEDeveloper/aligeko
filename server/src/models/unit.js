/**
 * Unit Model
 * 
 * This model represents a unit of measure for products in the database.
 */

import { DataTypes } from 'sequelize';

/**
 * Define the Unit model
 * @param {Sequelize} sequelize - Sequelize instance
 * @returns {Model} Unit model
 */
const Unit = (sequelize) => {
  const Unit = sequelize.define('Unit', {
    id: {
      type: DataTypes.STRING(50),
      primaryKey: true,
      allowNull: false,
      comment: 'Unit ID from GEKO'
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'Unit name (e.g., piece, kg, m)'
    },
    moq: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1,
      comment: 'Minimum order quantity'
    },
    symbol: {
      type: DataTypes.STRING(10),
      allowNull: true,
      comment: 'Unit symbol (e.g., pcs, kg, m)'
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Unit description'
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
    tableName: 'units',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        name: 'idx_unit_name',
        fields: ['name']
      }
    ]
  });

  /**
   * Associate the Unit model with other models
   * @param {Object} models - All defined models
   */
  Unit.associate = function(models) {
    // Unit has many Products
    Unit.hasMany(models.Product, {
      foreignKey: 'unit_id',
      as: 'products'
    });
  };

  return Unit;
};

export default Unit; 