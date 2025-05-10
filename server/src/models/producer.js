/**
 * Producer Model
 * 
 * This model represents a product manufacturer/producer in the database.
 */

import { DataTypes } from 'sequelize';

/**
 * Define the Producer model
 * @param {Sequelize} sequelize - Sequelize instance
 * @returns {Model} Producer model
 */
const Producer = (sequelize) => {
  const Producer = sequelize.define('Producer', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      comment: 'Producer/manufacturer name'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Producer description'
    },
    website: {
      type: DataTypes.STRING(512),
      allowNull: true,
      comment: 'Producer website URL'
    },
    logo_url: {
      type: DataTypes.STRING(512),
      allowNull: true,
      comment: 'Producer logo URL'
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Whether the producer is active'
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
    tableName: 'producers',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        name: 'idx_producer_name',
        fields: ['name']
      }
    ]
  });

  /**
   * Associate the Producer model with other models
   * @param {Object} models - All defined models
   */
  Producer.associate = function(models) {
    // Producer has many Products
    Producer.hasMany(models.Product, {
      foreignKey: 'producer_id',
      as: 'products'
    });
  };

  return Producer;
};

export default Producer; 